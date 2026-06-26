"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sealedBelongsTo } from "@/lib/anon-escrow";

/**
 * May this user resolve/reopen this help thread? Allowed for the helper who
 * claimed it or the original asker — including when the asker posted anonymously
 * or pseudonymously, resolved via the persona owner or the escrow break-glass.
 */
async function canModerateHelp(
  helpRequestId: string,
  userId: string,
): Promise<boolean> {
  const hr = await prisma.helpRequest.findUnique({
    where: { id: helpRequestId },
    select: {
      claimedById: true,
      post: {
        select: {
          authorId: true,
          sealedAuthor: true,
          persona: { select: { userId: true } },
        },
      },
    },
  });
  if (!hr) return false;
  if (hr.claimedById === userId) return true;
  if (hr.post.authorId === userId) return true;
  if (hr.post.persona?.userId === userId) return true;
  if (sealedBelongsTo(hr.post.sealedAuthor, userId)) return true;
  return false;
}

export async function claimHelp(
  helpRequestId: string,
  postId: string,
): Promise<void> {
  const user = await requireUser();
  await prisma.helpRequest.update({
    where: { id: helpRequestId },
    data: { status: "CLAIMED", claimedById: user.id },
  });
  revalidatePath(`/post/${postId}`);
}

export async function resolveHelp(
  helpRequestId: string,
  postId: string,
): Promise<void> {
  const user = await requireUser();
  if (!(await canModerateHelp(helpRequestId, user.id))) return;
  await prisma.helpRequest.update({
    where: { id: helpRequestId },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });
  revalidatePath(`/post/${postId}`);
}

export async function reopenHelp(
  helpRequestId: string,
  postId: string,
): Promise<void> {
  const user = await requireUser();
  if (!(await canModerateHelp(helpRequestId, user.id))) return;
  await prisma.helpRequest.update({
    where: { id: helpRequestId },
    data: { status: "OPEN", claimedById: null, resolvedAt: null },
  });
  revalidatePath(`/post/${postId}`);
}
