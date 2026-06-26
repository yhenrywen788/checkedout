"use server";

import { revalidatePath } from "next/cache";
import { ReactionType, IdentityMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sealAuthor } from "@/lib/anon-escrow";

const REACTIONS = new Set(Object.values(ReactionType));

/** Reactions are a toggle: tap once to add, again to take it back. */
export async function toggleReaction(
  postId: string,
  type: ReactionType,
  path: string,
): Promise<void> {
  const user = await requireUser();
  if (!REACTIONS.has(type)) return;

  const existing = await prisma.reaction.findUnique({
    where: { postId_userId_type: { postId, userId: user.id, type } },
  });
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { postId, userId: user.id, type } });
  }
  revalidatePath(path || "/feed");
}

export type CommentState = { error?: string };

export async function addComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const user = await requireUser();
  const postId = formData.get("postId") as string;
  const body = ((formData.get("body") as string) || "").trim();
  const parentId = (formData.get("parentId") as string)?.trim() || null;
  const path = (formData.get("path") as string) || `/post/${postId}`;

  // Comments support REAL or ANON. The persona picker isn't wired here yet, so a
  // PSEUDONYM request fails to the MORE private mode (ANON) — never silently to
  // REAL, which would expose a name the commenter chose to hide.
  let identityMode = (formData.get("identityMode") as IdentityMode) ?? "REAL";
  if (identityMode === "PSEUDONYM") identityMode = "ANON";
  if (identityMode !== "REAL" && identityMode !== "ANON") identityMode = "REAL";

  if (!body) return { error: "Write something first." };

  // REAL links to the account; ANON seals the author (mock escrow) instead.
  await prisma.comment.create({
    data: {
      postId,
      body,
      identityMode,
      parentId,
      authorId: identityMode === "REAL" ? user.id : null,
      sealedAuthor: identityMode === "REAL" ? null : sealAuthor(user.id),
    },
  });
  revalidatePath(path);
  return {};
}
