import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Composer } from "@/components/Composer";
import { PostType } from "@prisma/client";

const POST_TYPES = new Set(Object.values(PostType));

export default async function ComposePage({
  searchParams,
}: {
  searchParams: { space?: string; type?: string };
}) {
  const user = await requireUser();

  const [spaces, personas] = await Promise.all([
    prisma.space.findMany({
      where: { privacy: "PUBLIC" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.persona.findMany({
      where: { userId: user.id },
      select: { id: true, displayName: true, handle: true },
    }),
  ]);

  const defaultSpaceId =
    spaces.find((s) => s.slug === searchParams.space)?.id ?? "";
  const defaultType =
    searchParams.type && POST_TYPES.has(searchParams.type as PostType)
      ? (searchParams.type as PostType)
      : "REAL_TALK";

  return (
    <div className="container-feed">
      <h1 className="mb-1 text-2xl font-black">Post something real</h1>
      <p className="mb-5 text-sm text-muted">
        Lead with the truth, not the trophy. The messy middle is what helps
        someone else.
      </p>
      <div className="card p-5">
        <Composer
          spaces={spaces}
          personas={personas}
          defaultSpaceId={defaultSpaceId}
          defaultType={defaultType}
        />
      </div>
    </div>
  );
}
