import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthForm } from "@/components/AuthForm";
import {
  GoogleSignInButton,
  OrDivider,
} from "@/components/GoogleSignInButton";
import { googleConfigured } from "@/lib/google-oauth";
import { demoSignIn } from "@/lib/actions/auth";
import { Avatar } from "@/components/Avatar";

const AUTH_ERRORS: Record<string, string> = {
  google_unavailable: "Google sign-in isn't configured yet.",
  google_denied: "Google sign-in was cancelled.",
  google_state: "That Google sign-in attempt expired. Please try again.",
  google_failed: "Couldn't complete Google sign-in. Please try again.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  if (await getCurrentUser()) redirect("/feed");

  const errorMessage = searchParams.error
    ? AUTH_ERRORS[searchParams.error] ?? "Something went wrong. Please try again."
    : null;

  const isDev = process.env.NODE_ENV !== "production";
  const demoUsers = isDev
    ? await prisma.user.findMany({ take: 4, orderBy: { createdAt: "asc" } })
    : [];

  return (
    <div className="mx-auto max-w-sm px-4">
      <h1 className="text-2xl font-black">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Real work, real talk.</p>

      {errorMessage && (
        <p className="mt-4 rounded-lg bg-contested/10 px-3 py-2 text-sm text-contested">
          {errorMessage}
        </p>
      )}

      <div className="card mt-5 p-5">
        {googleConfigured() && (
          <>
            <GoogleSignInButton />
            <OrDivider />
          </>
        )}
        <AuthForm mode="sign-in" />
      </div>

      <p className="mt-4 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/sign-up" className="font-medium text-ink">
          Create an account →
        </Link>
      </p>

      {demoUsers.length > 0 && (
        <div className="mt-8">
          <p className="mb-2 text-center text-xs uppercase tracking-wide text-muted">
            Or jump straight in as a demo user (dev only)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map((u) => (
              <form key={u.id} action={demoSignIn.bind(null, u.email)}>
                <button className="card flex w-full items-center gap-2 p-2 text-left text-sm transition hover:border-ink/30">
                  <Avatar
                    label={u.name}
                    seed={u.avatarColor ?? u.handle}
                    size={28}
                  />
                  <span className="truncate">{u.name}</span>
                </button>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
