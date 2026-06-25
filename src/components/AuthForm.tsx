"use client";

import { useFormState } from "react-dom";
import { signIn, signUp, type AuthState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

function Field({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="field"
      />
    </div>
  );
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const action = mode === "sign-in" ? signIn : signUp;
  const [state, formAction] = useFormState<AuthState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-3">
      {mode === "sign-up" && (
        <>
          <Field name="name" label="Your name" placeholder="Real or chosen — your call" />
          <Field name="handle" label="Handle" placeholder="lowercase_handle" />
        </>
      )}
      <Field
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Field
        name="password"
        type="password"
        label="Password"
        autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
      />
      {state.error && (
        <p className="rounded-lg bg-contested/10 px-3 py-2 text-sm text-contested">
          {state.error}
        </p>
      )}
      <SubmitButton className="btn-accent w-full" pendingLabel="One sec…">
        {mode === "sign-in" ? "Sign in" : "Create account"}
      </SubmitButton>
    </form>
  );
}
