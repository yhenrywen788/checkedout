"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, PostType, IdentityMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type PostState = { error?: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

const POST_TYPES = new Set(Object.values(PostType));
const IDENTITY_MODES = new Set(Object.values(IdentityMode));

export async function createPost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const user = await requireUser();

  const type = formData.get("type") as PostType;
  if (!POST_TYPES.has(type)) return { error: "Pick a post type." };

  let identityMode = (formData.get("identityMode") as IdentityMode) ?? "REAL";
  if (!IDENTITY_MODES.has(identityMode)) identityMode = "REAL";

  const spaceId = (formData.get("spaceId") as string)?.trim() || null;
  let personaId =
    identityMode === "PSEUDONYM"
      ? (formData.get("personaId") as string)?.trim() || null
      : null;
  // No persona selected? Fall back to real identity rather than silently
  // posting under an empty pseudonym.
  if (identityMode === "PSEUDONYM" && !personaId) identityMode = "REAL";

  const title = (formData.get("title") as string)?.trim() || null;
  const body = (formData.get("body") as string)?.trim() || "";

  const needsBody = type === "REAL_TALK" || type === "DISCUSSION" || type === "HELP_REQUEST";
  if (needsBody && !body) return { error: "Say something first." };

  const data: Prisma.PostCreateInput = {
    type,
    identityMode,
    title,
    body,
    author: { connect: { id: user.id } },
    ...(spaceId ? { space: { connect: { id: spaceId } } } : {}),
    ...(personaId ? { persona: { connect: { id: personaId } } } : {}),
  };

  if (type === "ACCOMPLISHMENT") {
    const outcome = (formData.get("outcome") as string)?.trim();
    const messy = (formData.get("theMessyMiddle") as string)?.trim();
    const took = (formData.get("whatItTook") as string)?.trim();
    const diff = (formData.get("whatIdDoDifferently") as string)?.trim() || null;
    if (!title) return { error: "Give your accomplishment a one-line headline." };
    if (!outcome || !messy || !took) {
      return {
        error:
          "An accomplishment needs the outcome, the messy middle, and what it actually took.",
      };
    }
    data.accomplishment = {
      create: {
        outcome,
        theMessyMiddle: messy,
        whatItTook: took,
        whatIdDoDifferently: diff,
      },
    };

    const creditName = (formData.get("creditName") as string)?.trim();
    const creditWhat = (formData.get("creditContribution") as string)?.trim();
    if (creditName && creditWhat) {
      data.credits = {
        create: [{ creditedName: creditName, contribution: creditWhat }],
      };
    } else if (creditName && !creditWhat) {
      return { error: "If you credit someone, say what they actually did." };
    }
  }

  if (type === "HELP_REQUEST") {
    if (!title) return { error: "Summarize the ask in the title." };
    data.helpRequest = {
      create: { isUrgent: formData.get("isUrgent") === "on" },
    };
  }

  if (type === "PAPER") {
    const abstract = (formData.get("abstract") as string)?.trim();
    const authorsText = (formData.get("authorsText") as string)?.trim();
    if (!title || !abstract || !authorsText) {
      return { error: "A paper needs a title, its authors, and an abstract." };
    }
    data.paper = {
      create: {
        abstract,
        authorsText,
        pdfUrl: (formData.get("pdfUrl") as string)?.trim() || null,
        doi: (formData.get("doi") as string)?.trim() || null,
      },
    };
  }

  const tagNames = ((formData.get("tags") as string) || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6);
  if (tagNames.length) {
    data.tags = {
      create: tagNames.map((name) => ({
        tag: {
          connectOrCreate: {
            where: { slug: slugify(name) },
            create: { slug: slugify(name), name },
          },
        },
      })),
    };
  }

  const post = await prisma.post.create({ data });
  revalidatePath("/feed");
  if (spaceId) revalidatePath("/spaces");
  redirect(`/post/${post.id}`);
}
