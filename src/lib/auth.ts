import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "checkedout_session";
const SESSION_TTL_DAYS = 30;

/** Cookie options for the session cookie, shared by every place that sets it. */
export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * We store only a hash of the session token in the database, so a database
 * leak doesn't hand out live sessions. The raw token lives in an httpOnly
 * cookie on the client.
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Create a session row and return the raw cookie token + expiry, WITHOUT
 * setting the cookie. Use this where you control the response yourself (e.g. an
 * OAuth callback Route Handler that sets the cookie on its redirect response).
 */
export async function createSessionToken(
  userId: string,
): Promise<{ token: string; expiresAt: Date }> {
  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);
  await prisma.session.create({
    data: { token: hashToken(rawToken), userId, expiresAt },
  });
  return { token: rawToken, expiresAt };
}

export async function createSession(userId: string): Promise<void> {
  const { token, expiresAt } = await createSessionToken(userId);
  cookies().set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
}

export async function destroySession(): Promise<void> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (raw) {
    await prisma.session
      .deleteMany({ where: { token: hashToken(raw) } })
      .catch(() => {});
  }
  cookies().delete(SESSION_COOKIE);
}

/**
 * Resolve the currently signed-in user, or null. Safe to call from any
 * Server Component or Server Action.
 */
export async function getCurrentUser() {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const session = await prisma.session.findUnique({
    where: { token: hashToken(raw) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  return session.user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Use in pages/actions that require a signed-in user. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}
