import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { resolveIdentity } from "@/lib/identity";
import { timeAgo } from "@/lib/format";
import type { FeedComment } from "@/lib/queries";

export function Comments({ comments }: { comments: FeedComment[] }) {
  if (!comments.length) {
    return <p className="text-sm text-muted">No replies yet.</p>;
  }
  return (
    <ul className="space-y-4">
      {comments.map((c) => {
        // Always go through the single resolver — never re-derive the name from
        // c.author inline (that bypasses the fail-closed identity rules).
        const id = resolveIdentity(c);
        return (
          <li key={c.id} className="flex gap-3">
            <Avatar
              label={id.label}
              seed={id.avatarSeed}
              anon={id.mode === "ANON"}
              size={32}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm leading-tight">
                {id.href ? (
                  <Link
                    href={id.href}
                    className="font-semibold no-underline hover:underline"
                  >
                    {id.label}
                  </Link>
                ) : (
                  <span className="font-semibold">{id.label}</span>
                )}
                <span className="text-xs text-muted">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="prose-real mt-0.5">{c.body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
