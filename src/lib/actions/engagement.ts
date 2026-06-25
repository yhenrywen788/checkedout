"use server";

import { revalidatePath } from "next/cache";
import { ReactionType, IdentityMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

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

  // Comments support real or anonymous identity (pseudonyms post as real here
  // for now — the persona picker lives on the main composer).
  let identityMode = (formData.get("identityMode") as IdentityMode) ?? "REAL";
  if (identityMode === "PSEUDONYM") identityMode = "REAL";

  if (!body) return { error: "Write something first." };

  await prisma.comment.create({
    data: { postId, authorId: user.id, body, identityMode, parentId },
  });
  revalidatePath(path);
  return {};
}
