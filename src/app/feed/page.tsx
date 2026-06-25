import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getFeed } from "@/lib/queries";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";

export default async function FeedPage() {
  const user = await requireUser();
  const posts = await getFeed();

  return (
    <div className="container-feed space-y-4">
      <Link
        href="/compose"
        className="card flex items-center gap-3 p-4 no-underline transition hover:border-ink/30"
      >
        <Avatar label={user.name} seed={user.avatarColor ?? user.handle} />
        <span className="text-muted">
          Post an accomplishment, ask for help, or just say the true thing…
        </span>
      </Link>

      {posts.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          <p className="font-semibold text-ink">It&apos;s quiet in here.</p>
          <p className="mt-1 text-sm">
            Be the first to post something real.
          </p>
          <Link href="/compose" className="btn-accent mt-4 inline-flex">
            Post something
          </Link>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} viewerId={user.id} />
        ))
      )}
    </div>
  );
}
