# checkedOut

**A work-focused network about real accomplishments and real talk — the anti-LinkedIn.**

LinkedIn could be so much more useful if people were honest about what it really
takes to get something important done. checkedOut is built for that: it
emphasizes **accomplishments over "productivity," and real talk over a curated
image**. The messy middle — the false starts, the cost, the help it took — is
the point, not something to hide.

> Done is better than polished. Real is better than impressive.

---

## What makes it different

- **The Accomplishment format.** Posts aren't résumé bullets. An accomplishment
  records the outcome _and_ the messy middle, what it actually took, and what
  you'd do differently — with **specific credit** to the people who helped (you
  have to say _what_ they did, not just name-drop).
- **Identity is a spectrum.** Post as yourself, under a persistent **pseudonym**,
  or fully **anonymous** — chosen per post. Honesty shouldn't cost you your job.
- **Reactions are qualitative.** No "like." You react with _Respect_,
  _Been there_, _Tell me more_, _This is real_, or _Changed my mind_.
- **Spaces with their own norms.** Communities spanning the whole tone spectrum —
  serious, funny, contrarian, fringe. Two built to make the point:
  - **Open Review** — put a paper up for open crowd review and route around the
    publishing-industrial complex.
  - **Cross-Company Help** — engineers helping engineers across company lines,
    anonymously when it needs to be.

See [`docs/PRODUCT.md`](docs/PRODUCT.md) for the full product scope and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how it's built.

---

## Tech stack

Next.js 14 (App Router, Server Components + Server Actions) · TypeScript ·
Tailwind CSS · Prisma · PostgreSQL. Lightweight cookie-based session auth (no
third-party dependency).

---

## Quickstart

Requires **Node 20+** and a **PostgreSQL** database.

```bash
# 1. Install dependencies
npm install

# 2. Start a local Postgres (uses Docker if available) and create .env
./scripts/setup-db.sh
#    …or set DATABASE_URL yourself in .env (Neon/Supabase/local Postgres)

# 3. Generate the client, create tables, and seed demo data
npm run setup

# 4. Run it
npm run dev
# open http://localhost:3000
```

**Demo logins** (after seeding) — password `checkedout` for all:
`maya@example.com`, `dario@example.com`, `lin@example.com`, `sam@example.com`,
`priya@example.com`. The sign-in page also has one-click demo buttons in dev.

> Set a real `AUTH_SECRET` in `.env` (run `openssl rand -base64 32`). The
> `.env.example` placeholder is fine for local dev only.

---

## Scripts

| Command            | What it does                                        |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | Start the dev server                                |
| `npm run build`    | Generate the Prisma client and build for production |
| `npm run start`    | Run the production build                            |
| `npm run setup`    | `prisma generate` + `db push` + seed                |
| `npm run db:seed`  | Re-seed demo data                                   |
| `npm run db:reset` | Drop, recreate, and re-seed (destructive)           |
| `npm run db:studio`| Open Prisma Studio to browse the data               |
| `npm run typecheck`| Type-check without emitting                         |

---

## Project structure

```
prisma/
  schema.prisma     # the data model — start here to understand the product
  seed.ts           # realistic demo content across every post type
src/
  app/              # routes (App Router): landing, auth, feed, compose,
                    #   spaces, post detail, profile
  components/       # UI: PostCard, Composer, ReactionBar, reviews, comments…
  lib/
    actions/        # server actions (auth, posting, reactions, reviews, help…)
    auth.ts         # session + password helpers
    identity.ts     # resolves how a post appears (real / pseudonym / anonymous)
    queries.ts      # shared Prisma query shapes
docs/               # product scope, architecture, roadmap
```

---

## Deploying

Any Node host works (Vercel is the easy path). You need:

- A managed **PostgreSQL** (Neon, Supabase, RDS…) → set `DATABASE_URL`.
- A strong **`AUTH_SECRET`**.
- Run `prisma migrate deploy` (or `prisma db push`) against the prod database.

## Status & security

This is an MVP foundation, not production-hardened. Auth is intentionally simple
(httpOnly cookie + hashed session token + bcrypt). Before real users: add rate
limiting, email verification, CSRF defense-in-depth, content moderation, and a
security review. See [`docs/ROADMAP.md`](docs/ROADMAP.md).
