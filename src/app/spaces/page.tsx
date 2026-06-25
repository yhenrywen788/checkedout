import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toggleMembership } from "@/lib/actions/space";
import { SubmitButton } from "@/components/SubmitButton";

const KIND: Record<string, string> = {
  GENERAL: "Community",
  PAPER_REVIEW: "Crowd review",
  HELP_DESK: "Help desk",
};

export default async function SpacesPage() {
  const user = await getCurrentUser();
  const spaces = await prisma.space.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { memberships: true, posts: true } } },
  });
  const mine = user
    ? new Set(
        (
          await prisma.membership.findMany({
            where: { userId: user.id },
            select: { spaceId: true },
          })
        ).map((m) => m.spaceId),
      )
    : new Set<string>();

  return (
    <div className="mx-auto max-w-3xl px-4">
      <h1 className="text-2xl font-black">Spaces</h1>
      <p className="mt-1 text-sm text-muted">
        Communities with their own norms — serious, fringe, and everything
        between. Each one sets its own rules about anonymity.
      </p>

      <div className="mt-5 space-y-3">
        {spaces.map((s) => {
          const isMember = mine.has(s.id);
          return (
            <div key={s.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/spaces/${s.slug}`}
                      className="text-lg font-bold no-underline hover:underline"
                    >
                      {s.name}
                    </Link>
                    <span className="pill bg-paper text-muted ring-1 ring-line">
                      {KIND[s.kind]}
                    </span>
                    {s.allowAnon && (
                      <span className="pill bg-paper text-muted ring-1 ring-line">
                        anon ok
                      </span>
                    )}
                  </div>
                  {s.tagline && (
                    <p className="mt-1 text-sm text-ink/75">{s.tagline}</p>
                  )}
                  <p className="mt-2 text-xs text-muted">
                    {s._count.memberships} members · {s._count.posts} posts
                  </p>
                </div>
                {user && (
                  <form action={toggleMembership.bind(null, s.id, "/spaces")}>
                    <SubmitButton
                      className={isMember ? "btn-ghost" : "btn-primary"}
                      pendingLabel="…"
                    >
                      {isMember ? "Leave" : "Join"}
                    </SubmitButton>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
