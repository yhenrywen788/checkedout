import Link from "next/link";
import { resolveIdentity } from "@/lib/identity";
import { Avatar } from "@/components/Avatar";
import { timeAgo } from "@/lib/format";
import type { FeedPost } from "@/lib/queries";

export function IdentityLine({
  post,
  size = 40,
}: {
  post: FeedPost;
  size?: number;
}) {
  const id = resolveIdentity(post);
  return (
    <div className="flex items-center gap-3">
      <Avatar
        label={id.label}
        seed={id.avatarSeed}
        anon={id.mode === "ANON"}
        size={size}
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm leading-tight">
          {id.href ? (
            <Link href={id.href} className="font-semibold no-underline hover:underline">
              {id.label}
            </Link>
          ) : (
            <span className="font-semibold">{id.label}</span>
          )}
          {id.handle && <span className="text-muted">@{id.handle}</span>}
          {id.badge && (
            <span className="pill bg-paper text-muted ring-1 ring-line">
              {id.badge}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
          <span>{timeAgo(post.createdAt)}</span>
          {post.space && (
            <>
              <span aria-hidden>·</span>
              <Link
                href={`/spaces/${post.space.slug}`}
                className="no-underline hover:underline"
              >
                {post.space.name}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
