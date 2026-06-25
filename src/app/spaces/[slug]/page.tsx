import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFeed } from "@/lib/queries";
import { PostCard } from "@/components/PostCard";
import { toggleMembership } from "@/lib/actions/space";
import { SubmitButton } from "@/components/SubmitButton";

const KIND_COPY: Record<string, { label: string; hint: string }> = {
  GENERAL: { label: "Community", hint: "" },
  PAPER_REVIEW: {
    label: "Crowd review",
    hint: "Post a paper here to put it up for open, community review.",
  },
  HELP_DESK: {
    label: "Help desk",
    hint: "Ask for real-time help — anonymous is fine, even across companies.",
  },
};

export default async function SpacePage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await getCurrentUser();
  const space = await prisma.space.findUnique({
    where: { slug: params.slug },
    include: { _count: { select: { memberships: true, posts: true } } },
  });
  if (!space) notFound();

  const isMember = user
    ? !!(await prisma.membership.findUnique({
        where: { userId_spaceId: { userId: user.id, spaceId: space.id } },
      }))
    : false;
  const posts = await getFeed({ spaceId: space.id });
  const kind = KIND_COPY[space.kind];
  const composeType =
    space.kind === "PAPER_REVIEW"
      ? "PAPER"
      : space.kind === "HELP_DESK"
        ? "HELP_REQUEST"
        : "REAL_TALK";

  return (
    <div className="container-feed space-y-4">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black">{space.name}</h1>
              <span className="pill bg-paper text-muted ring-1 ring-line">
                {kind.label}
              </span>
            </div>
            {space.tagline && <p className="mt-1 text-ink/80">{space.tagline}</p>}
          </div>
          {user && (
            <form
              action={toggleMembership.bind(
                null,
                space.id,
                `/spaces/${space.slug}`,
              )}
            >
              <SubmitButton
                className={isMember ? "btn-ghost" : "btn-primary"}
                pendingLabel="…"
              >
                {isMember ? "Leave" : "Join"}
              </SubmitButton>
            </form>
          )}
        </div>

        {space.description && (
          <p className="mt-3 text-sm text-ink/75">{space.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>{space._count.memberships} members</span>
          <span aria-hidden>·</span>
          <span>{space._count.posts} posts</span>
          <span aria-hidden>·</span>
          <span>
            {space.allowAnon ? "Anonymous posting allowed" : "Real names only"}
          </span>
        </div>

        {user && (
          <Link
            href={`/compose?space=${space.slug}&type=${composeType}`}
            className="btn-accent mt-4 inline-flex"
          >
            Post to {space.name}
          </Link>
        )}
        {kind.hint && <p className="mt-2 text-xs text-muted">{kind.hint}</p>}
      </div>

      {posts.length === 0 ? (
        <div className="card p-8 text-center text-muted">Nothing here yet.</div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} viewerId={user?.id ?? null} />
        ))
      )}
    </div>
  );
}
