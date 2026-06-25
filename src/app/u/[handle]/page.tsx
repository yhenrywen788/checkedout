import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postInclude } from "@/lib/queries";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import { SubmitButton } from "@/components/SubmitButton";
import { toggleFollow } from "@/lib/actions/follow";

function BioBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <h3 className="label">{label}</h3>
      <p className="prose-real">{value}</p>
    </div>
  );
}

export default async function ProfilePage({
  params,
}: {
  params: { handle: string };
}) {
  const viewer = await getCurrentUser();
  const user = await prisma.user.findUnique({
    where: { handle: params.handle.toLowerCase() },
    include: {
      _count: { select: { followers: true, following: true } },
    },
  });
  if (!user) notFound();

  // Privacy: a public profile shows only posts made under the user's REAL
  // identity. Anonymous and pseudonymous posts never surface here — listing
  // them would defeat the entire point of those modes.
  const posts = await prisma.post.findMany({
    where: { authorId: user.id, identityMode: "REAL" },
    include: postInclude,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const isSelf = viewer?.id === user.id;
  const isFollowing =
    viewer && !isSelf
      ? !!(await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewer.id,
              followingId: user.id,
            },
          },
        }))
      : false;

  const hasHonestBio =
    user.bio || user.goodAt || user.workingOn || user.lookingFor;

  return (
    <div className="container-feed space-y-5">
      <div className="card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <Avatar
            label={user.name}
            seed={user.avatarColor ?? user.handle}
            size={64}
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black leading-tight">{user.name}</h1>
            <p className="text-muted">@{user.handle}</p>
            {user.headline && <p className="mt-1 text-ink/85">{user.headline}</p>}
            {user.affiliation && (
              <p className="mt-0.5 text-sm text-muted">{user.affiliation}</p>
            )}
            <p className="mt-2 text-xs text-muted">
              {user._count.followers} followers · {user._count.following}{" "}
              following
            </p>
          </div>
          {viewer && !isSelf && (
            <form action={toggleFollow.bind(null, user.id, `/u/${user.handle}`)}>
              <SubmitButton
                className={isFollowing ? "btn-ghost" : "btn-primary"}
                pendingLabel="…"
              >
                {isFollowing ? "Following" : "Follow"}
              </SubmitButton>
            </form>
          )}
        </div>

        {hasHonestBio && (
          <div className="mt-5 space-y-4 border-t border-line pt-4">
            <BioBlock label="In their words" value={user.bio} />
            <BioBlock label="Genuinely good at" value={user.goodAt} />
            <BioBlock label="Still working on" value={user.workingOn} />
            <BioBlock label="Actually looking for" value={user.lookingFor} />
          </div>
        )}
      </div>

      <h2 className="text-lg font-bold">
        {isSelf ? "Your posts" : `${user.name.split(" ")[0]}'s posts`}
      </h2>
      {posts.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          Nothing posted under their real name yet.
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} viewerId={viewer?.id ?? null} />
        ))
      )}
    </div>
  );
}
