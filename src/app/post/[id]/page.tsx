import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPost, getPostComments, summarizeReactions } from "@/lib/queries";
import { IdentityLine } from "@/components/IdentityLine";
import { ReactionBar } from "@/components/ReactionBar";
import {
  PostTypeBadge,
  HelpStatusBadge,
  PaperStatusBadge,
} from "@/components/Badges";
import { AccomplishmentStory } from "@/components/AccomplishmentStory";
import { PaperReviews } from "@/components/PaperReviews";
import { ReviewForm } from "@/components/ReviewForm";
import { HelpControls } from "@/components/HelpControls";
import { Comments } from "@/components/Comments";
import { CommentForm } from "@/components/CommentForm";

function SignInNote({ what }: { what: string }) {
  return (
    <p className="text-sm text-muted">
      <Link href="/sign-in" className="font-medium text-ink">
        Sign in
      </Link>{" "}
      to {what}.
    </p>
  );
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const post = await getPost(params.id);
  if (!post) notFound();

  const comments = await getPostComments(post.id);
  const { counts, mine } = summarizeReactions(post, user?.id ?? null);
  const path = `/post/${post.id}`;

  return (
    <div className="container-feed space-y-5">
      <article className="card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <IdentityLine post={post} size={44} />
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <PostTypeBadge type={post.type} />
            {post.helpRequest && (
              <HelpStatusBadge status={post.helpRequest.status} />
            )}
            {post.paper && <PaperStatusBadge status={post.paper.status} />}
          </div>
        </div>

        {post.title && (
          <h1 className="mt-4 text-2xl font-black leading-tight">{post.title}</h1>
        )}
        {post.body && <p className="prose-real mt-2">{post.body}</p>}

        {post.accomplishment && (
          <div className="mt-4">
            <AccomplishmentStory post={post} />
          </div>
        )}

        {post.paper && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted">{post.paper.authorsText}</p>
            <div>
              <h3 className="label">Abstract</h3>
              <p className="prose-real">{post.paper.abstract}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {post.paper.pdfUrl && (
                <a
                  href={post.paper.pdfUrl}
                  className="text-accent"
                  target="_blank"
                  rel="noreferrer"
                >
                  Read the PDF / preprint →
                </a>
              )}
              {post.paper.doi && (
                <span className="text-muted">DOI: {post.paper.doi}</span>
              )}
            </div>
          </div>
        )}

        {post.helpRequest && (
          <div className="mt-4 rounded-xl border border-line bg-paper p-3">
            {post.helpRequest.claimedBy &&
              post.helpRequest.status !== "RESOLVED" && (
                <p className="mb-2 text-sm text-muted">
                  {post.helpRequest.claimedBy.name} is on it.
                </p>
              )}
            <HelpControls
              helpRequestId={post.helpRequest.id}
              postId={post.id}
              status={post.helpRequest.status}
              signedIn={!!user}
            />
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="pill bg-paper text-muted ring-1 ring-line"
              >
                {tag.kind === "SKILL" ? "★ " : "#"}
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 border-t border-line pt-4">
          <ReactionBar
            postId={post.id}
            counts={counts}
            mine={mine}
            canReact={!!user}
          />
        </div>
      </article>

      {post.paper && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Open review</h2>
          <PaperReviews paper={post.paper} />
          {user ? (
            <div className="card p-5">
              <h3 className="mb-3 font-semibold">Add your review</h3>
              <ReviewForm paperId={post.paper.id} postId={post.id} />
            </div>
          ) : (
            <SignInNote what="review this paper" />
          )}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-bold">
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </h2>
        {user ? (
          <div className="card p-4">
            <CommentForm postId={post.id} path={path} />
          </div>
        ) : (
          <SignInNote what="reply" />
        )}
        <Comments comments={comments} />
      </section>
    </div>
  );
}
