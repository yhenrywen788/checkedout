import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * One canonical shape for a post and everything we render with it. Keeping it
 * in a single place means the feed, the profile, the space, and the detail
 * page all agree on what a post looks like.
 */
export const postInclude = {
  author: { select: { handle: true, name: true, avatarColor: true } },
  persona: { select: { handle: true, displayName: true } },
  space: { select: { slug: true, name: true, accent: true, kind: true } },
  accomplishment: true,
  helpRequest: {
    include: { claimedBy: { select: { handle: true, name: true } } },
  },
  paper: {
    include: {
      reviews: {
        orderBy: { createdAt: "asc" },
        include: {
          reviewer: { select: { handle: true, name: true, avatarColor: true } },
        },
      },
    },
  },
  credits: {
    include: {
      creditedUser: { select: { handle: true, name: true } },
    },
  },
  tags: { include: { tag: true } },
  reactions: { select: { type: true, userId: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.PostInclude;

export type FeedPost = Prisma.PostGetPayload<{ include: typeof postInclude }>;

export const commentInclude = {
  author: { select: { handle: true, name: true, avatarColor: true } },
  persona: { select: { handle: true, displayName: true } },
} satisfies Prisma.CommentInclude;

export type FeedComment = Prisma.CommentGetPayload<{
  include: typeof commentInclude;
}>;

export async function getFeed(opts?: { spaceId?: string; authorId?: string }) {
  return prisma.post.findMany({
    where: {
      spaceId: opts?.spaceId,
      authorId: opts?.authorId,
    },
    include: postInclude,
    orderBy: { createdAt: "desc" },
    take: 60,
  });
}

export async function getPost(id: string) {
  return prisma.post.findUnique({ where: { id }, include: postInclude });
}

export async function getPostComments(postId: string) {
  return prisma.comment.findMany({
    where: { postId },
    include: commentInclude,
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Collapse a post's reactions into per-type counts plus whether the viewer
 * has used each one. Reactions are never a single vanity number here.
 */
export function summarizeReactions(post: FeedPost, viewerId: string | null) {
  const counts: Record<string, number> = {};
  const mine = new Set<string>();
  for (const r of post.reactions) {
    counts[r.type] = (counts[r.type] ?? 0) + 1;
    if (viewerId && r.userId === viewerId) mine.add(r.type);
  }
  // Return a plain array so it serializes across the client boundary cleanly.
  return { counts, mine: Array.from(mine) };
}
