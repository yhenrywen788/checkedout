"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
} from "@/lib/auth";
import { swatchFor } from "@/lib/format";

export type AuthState = { error?: string };

const signUpSchema = z.object({
  name: z.string().min(1, "What should we call you?").max(80),
  handle: z
    .string()
    .min(2, "Handle is too short")
    .max(30)
    .regex(/^[a-z0-9_]+$/i, "Handle: letters, numbers, and underscores only"),
  email: z.string().email("That doesn't look like an email"),
  password: z.string().min(8, "Use at least 8 characters"),
});

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    name: (formData.get("name") as string)?.trim(),
    handle: (formData.get("handle") as string)?.toLowerCase().trim(),
    email: (formData.get("email") as string)?.toLowerCase().trim(),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, handle, email, password } = parsed.data;

  const clash = await prisma.user.findFirst({
    where: { OR: [{ email }, { handle }] },
  });
  if (clash) {
    return {
      error:
        clash.email === email
          ? "That email is already registered."
          : "That handle is taken.",
    };
  }

  const user = await prisma.user.create({
    data: {
      name,
      handle,
      email,
      passwordHash: await hashPassword(password),
      avatarColor: swatchFor(handle),
    },
  });
  await createSession(user.id);
  redirect("/feed");
}

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: (formData.get("email") as string)?.toLowerCase().trim(),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter your email and password." };

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  // No passwordHash => an OAuth-only account; it can't be logged into by password.
  if (
    !user ||
    !user.passwordHash ||
    !(await verifyPassword(parsed.data.password, user.passwordHash))
  ) {
    return { error: "Wrong email or password." };
  }
  await createSession(user.id);
  redirect("/feed");
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/");
}

/**
 * One-click login as a seeded demo account. Dev-only: refuses to run in
 * production so it can never become a backdoor.
 */
export async function demoSignIn(email: string): Promise<void> {
  if (process.env.NODE_ENV === "production") return;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await createSession(user.id);
    redirect("/feed");
  }
}
