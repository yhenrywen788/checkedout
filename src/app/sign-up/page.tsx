import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect("/feed");

  return (
    <div className="mx-auto max-w-sm px-4">
      <h1 className="text-2xl font-black">Join checkedOut</h1>
      <p className="mt-1 text-sm text-muted">
        Bring your real self — or don&apos;t. Pseudonyms and anonymity are
        first-class here.
      </p>

      <div className="card mt-5 p-5">
        <AuthForm mode="sign-up" />
      </div>

      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-ink">
          Sign in →
        </Link>
      </p>
    </div>
  );
}
