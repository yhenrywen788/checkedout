import Link from "next/link";
import { IdentityLine } from "@/components/IdentityLine";
import { ReactionBar } from "@/components/ReactionBar";
import {
  PostTypeBadge,
  HelpStatusBadge,
  PaperStatusBadge,
} from "@/components/Badges";
import { summarizeReactions, type FeedPost } from "@/lib/queries";

function Tags({ post }: { post: FeedPost }) {
  if (!post.tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {post.tags.map(({ tag }) => (
        <span key={tag.id} className="pill bg-paper text-muted ring-1 ring-line">
          {tag.kind === "SKILL" ? "★ " : "#"}
          {tag.name}
        </span>
      ))}
    </div>
  );
}

export function PostCard({
  post,
  viewerId,
}: {
  post: FeedPost;
  viewerId: string | null;
}) {
  const { counts, mine } = summarizeReactions(post, viewerId);
  const href = `/post/${post.id}`;

  return (
    <article className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <IdentityLine post={post} />
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <PostTypeBadge type={post.type} />
          {post.helpRequest && <HelpStatusBadge status={post.helpRequest.status} />}
          {post.paper && <PaperStatusBadge status={post.paper.status} />}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {post.title && (
          <Link href={href} className="no-underline">
            <h2 className="text-lg font-bold leading-snug hover:underline">
              {post.title}
            </h2>
          </Link>
        )}

        {/* Accomplishment teaser — lead with the real story, not the trophy. */}
        {post.accomplishment && (
          <div className="space-y-2">
            <p className="prose-real">{post.accomplishment.outcome}</p>
            <div className="rounded-xl bg-paper px-3 py-2">
              <span className="label mb-0.5">The messy middle</span>
              <p className="prose-real line-clamp-3 text-ink/75">
                {post.accomplishment.theMessyMiddle}
              </p>
            </div>
            <Link href={href} className="text-sm font-medium text-accent no-underline hover:underline">
              Read the full story →
            </Link>
          </div>
        )}

        {/* Paper teaser */}
        {post.paper && (
          <div className="space-y-1.5">
            <p className="text-sm text-muted">{post.paper.authorsText}</p>
            <p className="prose-real line-clamp-3 text-ink/80">
              {post.paper.abstract}
            </p>
            <Link href={href} className="text-sm font-medium text-accent no-underline hover:underline">
              {post.paper.reviews.length} review
              {post.paper.reviews.length === 1 ? "" : "s"} · Read & weigh in →
            </Link>
          </div>
        )}

        {/* Help / real-talk / discussion body */}
        {!post.accomplishment && !post.paper && post.body && (
          <p className="prose-real line-clamp-[8]">{post.body}</p>
        )}

        {post.helpRequest && post.helpRequest.status !== "RESOLVED" && (
          <Link href={href} className="text-sm font-medium text-accent no-underline hover:underline">
            {post.helpRequest.claimedBy
              ? "Follow the thread →"
              : "Jump in and help →"}
          </Link>
        )}
      </div>

      {(post.tags.length > 0 || post.credits.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Tags post={post} />
          {post.credits.length > 0 && (
            <span className="text-xs text-muted">
              credited {post.credits.length}{" "}
              {post.credits.length === 1 ? "person" : "people"}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <ReactionBar
          postId={post.id}
          counts={counts}
          mine={mine}
          canReact={!!viewerId}
        />
        <Link
          href={href}
          className="shrink-0 text-xs text-muted no-underline hover:text-ink hover:underline"
        >
          {post._count.comments} {post._count.comments === 1 ? "reply" : "replies"}
        </Link>
      </div>
    </article>
  );
}
