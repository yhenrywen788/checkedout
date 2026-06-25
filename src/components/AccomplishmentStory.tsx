import Link from "next/link";
import type { FeedPost } from "@/lib/queries";

function StoryBlock({
  label,
  accent = false,
  children,
}: {
  label: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className={`label ${accent ? "text-accent" : ""}`}>{label}</h3>
      <p className="prose-real">{children}</p>
    </div>
  );
}

export function AccomplishmentStory({ post }: { post: FeedPost }) {
  const a = post.accomplishment;
  if (!a) return null;
  return (
    <div className="space-y-4">
      <StoryBlock label="What actually got done" accent>
        {a.outcome}
      </StoryBlock>
      <StoryBlock label="The messy middle">{a.theMessyMiddle}</StoryBlock>
      <StoryBlock label="What it took">{a.whatItTook}</StoryBlock>
      {a.whatIdDoDifferently && (
        <StoryBlock label="What I'd do differently">
          {a.whatIdDoDifferently}
        </StoryBlock>
      )}

      {post.credits.length > 0 && (
        <div className="rounded-xl border border-line bg-paper p-3">
          <h3 className="label">Credit where it&apos;s due</h3>
          <ul className="space-y-1.5">
            {post.credits.map((c) => (
              <li key={c.id} className="text-sm">
                <span className="font-semibold">
                  {c.creditedUser ? (
                    <Link
                      href={`/u/${c.creditedUser.handle}`}
                      className="no-underline hover:underline"
                    >
                      {c.creditedName}
                    </Link>
                  ) : (
                    c.creditedName
                  )}
                </span>
                <span className="text-muted"> — {c.contribution}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
