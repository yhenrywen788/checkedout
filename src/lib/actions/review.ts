"use server";

import { revalidatePath } from "next/cache";
import { ReviewRecommendation, IdentityMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sealAuthor } from "@/lib/anon-escrow";

export type ReviewState = { error?: string };

const RECS = new Set(Object.values(ReviewRecommendation));

function score(formData: FormData, key: string): number | null {
  const v = parseInt(formData.get(key) as string, 10);
  return Number.isFinite(v) ? Math.min(5, Math.max(1, v)) : null;
}

export async function addReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const user = await requireUser();
  const paperId = formData.get("paperId") as string;
  const postId = formData.get("postId") as string;
  const summary = ((formData.get("summary") as string) || "").trim();
  const strengths = ((formData.get("strengths") as string) || "").trim() || null;
  const weaknesses = ((formData.get("weaknesses") as string) || "").trim() || null;

  let recommendation = formData.get("recommendation") as ReviewRecommendation;
  if (!RECS.has(recommendation)) recommendation = "MAJOR_REVISION";

  // Open review: sign it, or stay anonymous. (Classic blind review is the
  // default to lower the cost of an honest critique.)
  let identityMode = (formData.get("identityMode") as IdentityMode) ?? "ANON";
  if (identityMode !== "REAL") identityMode = "ANON";

  if (!summary) return { error: "A review needs at least a summary judgement." };

  // A signed (REAL) review links to the reviewer; a blind (ANON) review — the
  // default — seals the reviewer instead of storing reviewerId, so a blind
  // review can't be joined back to its author in the database.
  await prisma.review.create({
    data: {
      paperId,
      recommendation,
      summary,
      strengths,
      weaknesses,
      identityMode,
      scoreRigor: score(formData, "scoreRigor"),
      scoreNovelty: score(formData, "scoreNovelty"),
      scoreClarity: score(formData, "scoreClarity"),
      reviewerId: identityMode === "REAL" ? user.id : null,
      sealedAuthor: identityMode === "REAL" ? null : sealAuthor(user.id),
    },
  });
  revalidatePath(`/post/${postId}`);
  return {};
}
