import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForProfile,
  findOrCreateGoogleUser,
  googleRedirectUri,
} from "@/lib/google-oauth";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

// Google redirects back here with `code` + `state`. Verify the CSRF state,
// exchange the code for the profile, resolve a user, and issue OUR session
// cookie on the redirect to /feed.
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const stateCookie = request.cookies.get("g_oauth_state")?.value;

  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/sign-in?error=${reason}`, origin));
    res.cookies.delete("g_oauth_state");
    return res;
  };

  if (params.get("error")) return fail("google_denied");
  if (!code || !state || !stateCookie || state !== stateCookie) {
    return fail("google_state");
  }

  try {
    const profile = await exchangeCodeForProfile({
      code,
      redirectUri: googleRedirectUri(origin),
    });
    const userId = await findOrCreateGoogleUser(profile);
    const { token, expiresAt } = await createSessionToken(userId);

    const res = NextResponse.redirect(new URL("/feed", origin));
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
    res.cookies.delete("g_oauth_state");
    return res;
  } catch {
    return fail("google_failed");
  }
}
