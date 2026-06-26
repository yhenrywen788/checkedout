// Hand-rolled Google OAuth 2.0 (authorization-code flow). Deliberately no
// third-party auth dependency: we use Google only to identify the person, then
// issue our OWN cookie session (see createSessionToken in lib/auth.ts).
//
// Required env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET. APP_URL pins the public
// origin in production (so the redirect_uri matches what's registered in Google
// Cloud); locally it falls back to the request origin.

import { prisma } from "@/lib/prisma";
import { swatchFor } from "@/lib/format";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://openidconnect.googleapis.com/v1/userinfo";

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** The redirect_uri must byte-for-byte match one registered in Google Cloud. */
export function googleRedirectUri(origin: string): string {
  const base = process.env.APP_URL || origin;
  return `${base.replace(/\/$/, "")}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(opts: { state: string; redirectUri: string }): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: opts.state,
    access_type: "online",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH}?${params.toString()}`;
}

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
};

export async function exchangeCodeForProfile(opts: {
  code: string;
  redirectUri: string;
}): Promise<GoogleProfile> {
  const tokenRes = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: opts.code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: opts.redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Google token exchange failed: ${tokenRes.status}`);
  }
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("Google token exchange: no access_token");

  const userRes = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) throw new Error(`Google userinfo failed: ${userRes.status}`);
  const u = (await userRes.json()) as Record<string, unknown>;

  const email = String(u.email ?? "").toLowerCase();
  return {
    sub: String(u.sub ?? ""),
    email,
    emailVerified: u.email_verified === true || u.email_verified === "true",
    name: String(u.name || email.split("@")[0] || "New member"),
    picture: typeof u.picture === "string" ? u.picture : undefined,
  };
}

function sanitizeHandle(base: string): string {
  const h = base.toLowerCase().replace(/[^a-z0-9_]+/g, "").slice(0, 24);
  return h.length >= 2 ? h : "member";
}

/** A handle that doesn't collide: root, root2, root3, … then a random suffix. */
async function uniqueHandle(base: string): Promise<string> {
  const root = sanitizeHandle(base);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}${i + 1}`;
    const taken = await prisma.user.findUnique({
      where: { handle: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  return `${root}_${randomSuffix()}`;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

/**
 * Resolve a Google profile to a user id, in order of safety:
 *  1. already linked by googleId,
 *  2. an existing account with the SAME VERIFIED email (link Google to it),
 *  3. otherwise create a new OAuth-only account (no passwordHash).
 */
export async function findOrCreateGoogleUser(p: GoogleProfile): Promise<string> {
  if (!p.sub) throw new Error("Google profile missing sub");
  if (!p.email) throw new Error("Google profile missing email");

  const linked = await prisma.user.findUnique({
    where: { googleId: p.sub },
    select: { id: true },
  });
  if (linked) return linked.id;

  if (p.emailVerified) {
    const byEmail = await prisma.user.findUnique({
      where: { email: p.email },
      select: { id: true, googleId: true },
    });
    if (byEmail) {
      if (!byEmail.googleId) {
        await prisma.user.update({
          where: { id: byEmail.id },
          data: { googleId: p.sub, image: p.picture ?? undefined },
        });
      }
      return byEmail.id;
    }
  }

  const handle = await uniqueHandle(p.email.split("@")[0] || p.name);
  const created = await prisma.user.create({
    data: {
      email: p.email,
      handle,
      name: p.name,
      googleId: p.sub,
      image: p.picture,
      avatarColor: swatchFor(handle),
      // passwordHash stays null — this is an OAuth-only account.
    },
    select: { id: true },
  });
  return created.id;
}
