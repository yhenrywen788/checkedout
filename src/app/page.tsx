import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PRINCIPLES = [
  {
    title: "Accomplishments, not activity",
    body: "Post the thing you actually got done — with the false starts, the cost, and the help it took. The messy middle is the point, not a thing to hide.",
  },
  {
    title: "Real talk, not a highlight reel",
    body: "Serious, funny, contrarian, half-baked, or fringe. Say the true thing. No “thrilled to announce,” no humble-brags engineered for reach.",
  },
  {
    title: "Speak freely — your name is optional",
    body: "Post as yourself, a persistent pseudonym, or fully anonymous. Honesty shouldn't cost you your job.",
  },
  {
    title: "Credit that means something",
    body: "You can't just name-drop. If you credit someone, you say what they specifically did.",
  },
];

export default async function Landing() {
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  const spaces = await prisma.space.findMany({
    where: { privacy: "PUBLIC" },
    orderBy: { createdAt: "asc" },
    take: 4,
    include: { _count: { select: { memberships: true, posts: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-4">
      <section className="py-10 text-center sm:py-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
          the anti-LinkedIn
        </p>
        <h1 className="text-balance text-4xl font-black leading-tight sm:text-5xl">
          Why link in when you can checkOut?
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-ink/75">
          LinkedIn could be so much more useful if people were honest about what
          it really takes to get something important done. checkedOut is that
          place — built around real accomplishments and real talk, not a curated
          image.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link href="/sign-up" className="btn-accent px-6 py-3 text-base">
            Join checkedOut
          </Link>
          <Link href="/sign-in" className="btn-ghost px-6 py-3 text-base">
            Sign in
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="card p-5">
            <h3 className="font-bold">{p.title}</h3>
            <p className="mt-1.5 text-sm text-ink/75">{p.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">What it's actually for</h2>
        <div className="mt-4 space-y-3">
          <div className="card p-5">
            <h3 className="font-bold">📄 Crowd-review real science</h3>
            <p className="mt-1 text-sm text-ink/75">
              Put a paper up for open review and let the people who know the work
              weigh in — rigor, novelty, and clarity scored in the open. Route
              around the publishing-industrial complex.
            </p>
          </div>
          <div className="card p-5">
            <h3 className="font-bold">🆘 Help across company lines</h3>
            <p className="mt-1 text-sm text-ink/75">
              Stuck on something gnarly? Ask for help in real time — even from
              people at competing companies, anonymously when it needs to be.
              The hard problems don't respect org charts.
            </p>
          </div>
        </div>
      </section>

      {spaces.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">Spaces to start in</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {spaces.map((s) => (
              <Link
                key={s.id}
                href={`/spaces/${s.slug}`}
                className="card block p-4 no-underline transition hover:border-ink/30"
              >
                <p className="font-semibold">{s.name}</p>
                {s.tagline && (
                  <p className="mt-0.5 text-sm text-muted">{s.tagline}</p>
                )}
                <p className="mt-2 text-xs text-muted">
                  {s._count.memberships} members · {s._count.posts} posts
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="my-14 text-center">
        <p className="text-lg font-semibold">
          Done is better than polished. Real is better than impressive.
        </p>
        <Link
          href="/sign-up"
          className="btn-accent mt-4 inline-flex px-6 py-3 text-base"
        >
          Get started
        </Link>
      </section>
    </div>
  );
}
