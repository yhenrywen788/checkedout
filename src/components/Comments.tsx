import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { timeAgo } from "@/lib/format";
import type { FeedComment } from "@/lib/queries";

export function Comments({ comments }: { comments: FeedComment[] }) {
  if (!comments.length) {
    return <p className="text-sm text-muted">No replies yet.</p>;
  }
  return (
    <ul className="space-y-4">
      {comments.map((c) => {
        const anon = c.identityMode === "ANON";
        const name = anon ? "Anonymous" : c.author.name;
        const handle = anon ? null : c.author.handle;
        return (
          <li key={c.id} className="flex gap-3">
            <Avatar
              label={name}
              seed={anon ? "anon" : c.author.avatarColor ?? c.author.handle}
              anon={anon}
              size={32}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm leading-tight">
                {handle ? (
                  <Link
                    href={`/u/${handle}`}
                    className="font-semibold no-underline hover:underline"
                  >
                    {name}
                  </Link>
                ) : (
                  <span className="font-semibold">{name}</span>
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
