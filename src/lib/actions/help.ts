"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

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
  await requireUser();
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
  await requireUser();
  await prisma.helpRequest.update({
    where: { id: helpRequestId },
    data: { status: "OPEN", claimedById: null, resolvedAt: null },
  });
  revalidatePath(`/post/${postId}`);
}
