import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postInclude } from "@/lib/queries";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";

/**
 * Public page for a persistent pseudonym. It lives in its OWN namespace (/p),
 * separate from real users (/u), so a persona handle can never resolve to a real
 * profile. Critically, this page NEVER selects persona.userId / persona.user —
 * the whole point of a pseudonym is that it can't be linked back to the account.
 */
export default async function PersonaPage({
  params,
}: {
  params: { handle: string };
}) {
  const viewer = await getCurrentUser();

  const persona = await prisma.persona.findUnique({
    where: { handle: params.handle },
    // No userId / user here — by design.
    select: { id: true, handle: true, displayName: true, bio: true },
  });
  if (!persona) notFound();

  // Only this persona's pseudonymous posts. They carry personaId but no authorId
  // (the real author is sealed), so nothing here points back to a real account.
  const posts = await prisma.post.findMany({
    where: { personaId: persona.id, identityMode: "PSEUDONYM" },
    include: postInclude,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="container-feed space-y-5">
      <div className="card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <Avatar label={persona.displayName} seed={persona.handle} size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black leading-tight">
              {persona.displayName}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-muted">@{persona.handle}</p>
              <span className="pill bg-paper text-muted ring-1 ring-line">
                pseudonym
              </span>
            </div>
            {persona.bio && <p className="mt-2 text-ink/85">{persona.bio}</p>}
            <p className="mt-2 text-xs text-muted">
              A persistent pseudonym. Its reputation is its own — not linked to any
              real account.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold">Posts as {persona.displayName}</h2>
      {posts.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          Nothing posted under this pseudonym yet.
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} viewerId={viewer?.id ?? null} />
        ))
      )}
    </div>
  );
}
