import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  buildGoogleAuthUrl,
  googleConfigured,
  googleRedirectUri,
} from "@/lib/google-oauth";

// Start the Google sign-in flow: stash a CSRF `state` in an httpOnly cookie and
// redirect to Google's consent screen.
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  if (!googleConfigured()) {
    return NextResponse.redirect(
      new URL("/sign-in?error=google_unavailable", origin),
    );
  }

  const state = randomBytes(16).toString("hex");
  const url = buildGoogleAuthUrl({
    state,
    redirectUri: googleRedirectUri(origin),
  });

  const res = NextResponse.redirect(url);
  res.cookies.set("g_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes to complete the round-trip
  });
  return res;
}
