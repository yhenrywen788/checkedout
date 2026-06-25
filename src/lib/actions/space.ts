"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/** Join or leave a space. */
export async function toggleMembership(
  spaceId: string,
  path: string,
): Promise<void> {
  const user = await requireUser();
  const existing = await prisma.membership.findUnique({
    where: { userId_spaceId: { userId: user.id, spaceId } },
  });
  if (existing) {
    await prisma.membership.delete({ where: { id: existing.id } });
  } else {
    await prisma.membership.create({ data: { userId: user.id, spaceId } });
  }
  revalidatePath(path || "/spaces");
}
