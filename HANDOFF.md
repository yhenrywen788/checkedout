# checkedOut — Handoff

_Last updated: 2026-06-25_

A snapshot of where this project stands and everything you need to pick it up —
whether that's you, or a local Claude Code session on your machine.

---

## TL;DR

- **What it is:** a work-focused network built around real accomplishments and
  honest conversation — the anti-LinkedIn. Full product rationale in
  [`PRODUCT.md`](PRODUCT.md).
- **State:** complete MVP, build-verified, and **running locally**.
- **Where the code is:** your Mac mini (extracted from `checkedout-source.tgz`).
  The git history is intact with one commit on branch
  `claude/intelligent-turing-e9rzs3`.
- **Biggest open item:** it is **not on GitHub yet** — see _Loose ends_ below.

---

## Status

| Area                     | State                                                          |
| ------------------------ | -------------------------------------------------------------- |
| Implementation           | ✅ Full MVP (all planned features)                             |
| Production build         | ✅ Passes — 10 routes compile, TypeScript clean                |
| Runtime smoke tests      | ✅ Pages render against seeded Postgres; auth-gating works     |
| Database                 | ✅ Schema valid; seed populates every feature                  |
| Local run                | ✅ Working (Homebrew Postgres on macOS)                        |
| Pushed to GitHub         | ⚠️ **No** — web session's GitHub integration was read-only     |
| Production hardening      | ⚠️ Not done (auth is MVP-grade; no rate limiting/moderation)  |

---

## Tech stack

Next.js 14 (App Router, Server Components + Server Actions) · TypeScript ·
Tailwind CSS · Prisma · PostgreSQL · lightweight cookie-session auth (bcrypt +
hashed session tokens, no third-party auth dependency).

---

## Running it locally

### Prerequisites

- Node 20+
- PostgreSQL (these notes use Homebrew, which is what's set up)

> **zsh gotcha:** macOS zsh does **not** treat `#` as a comment interactively.
> Paste **commands only** — never paste explanatory lines, or zsh will try to
> run them.

### Database (Homebrew — current setup)

```
brew install postgresql@16
brew services start postgresql@16
export PATH="$(brew --prefix postgresql@16)/bin:$PATH"
until pg_isready -q; do sleep 1; done
createuser -s checkedout
createdb -O checkedout checkedout
```

(`docker compose up -d db` is the alternative if you prefer Docker; a managed
Neon/Supabase URL also works — just set `DATABASE_URL` in `.env`.)

### App

```
cp .env.example .env
npm install
npm run setup
npm run dev
```

Open **http://localhost:3000**.

### Demo logins (password `checkedout` for all)

`maya@example.com` · `dario@example.com` · `lin@example.com` ·
`sam@example.com` · `priya@example.com`
(The sign-in page also has one-click demo buttons.) These are seeded fake
accounts — log in *as them* to see populated content. Use **Join** to make a
real (local-only) account.

### Day-to-day

- Just `npm run dev` — Postgres stays running as a brew service; data persists.
- `npm run db:reset` — wipe and re-seed (destructive).
- `npm run db:studio` — browse the database in Prisma Studio.

---

## What's built (feature checklist)

- Email/password auth with cookie sessions + dev one-click demo logins.
- Honest profiles: `goodAt` / `workingOn` / `lookingFor` instead of a résumé.
- Composer for all five post types, the full **Accomplishment** format
  (outcome → messy middle → what it took → what I'd do differently), specific
  credit, tags, space targeting, and identity mode.
- **Identity as a spectrum:** real / persistent pseudonym / anonymous, resolved
  in one place so real names never leak behind anonymous posts.
- Feed + per-space feeds; post detail with qualitative reactions (no "like")
  and comments (real or anonymous).
- **Open Review:** papers with scored reviews (rigor/novelty/clarity) and
  accept→reject recommendations, signed or anonymous.
- **Cross-Company Help:** help requests with open → claimed → resolved.
- Spaces with per-space identity norms; join/leave; follow/unfollow.
- Seed data across every feature and tone (serious → fringe).

---

## Loose ends & gotchas

1. **Not on GitHub yet.** The web session's GitHub app was read-only
   (`403 Resource not accessible by integration`), so neither `git push` nor the
   API could write. Push it from your machine, where you have full rights, from
   inside the project folder:
   ```
   git remote set-url origin https://github.com/yhenrywen788/checkedout.git
   git push -u origin claude/intelligent-turing-e9rzs3
   ```
   (Use a GitHub personal-access token as the password, or switch origin to SSH.)
2. **Auth is MVP-grade, not hardened.** Before real users: rate limiting, email
   verification, CSRF defense-in-depth, and a security review.
3. **No migrations yet.** Schema is applied with `prisma db push`. Generate the
   first tracked migration when ready: `prisma migrate dev --name init`.
4. **Profile editing is DB-only.** No settings UI yet (the fields exist; the
   form doesn't). First good task for continuing.
5. **`AUTH_SECRET`.** `.env.example` ships a placeholder — fine for local dev.
   Generate a real one for anything shared: `openssl rand -base64 32`.
6. **Prisma engine downloads** can be blocked behind restrictive corporate
   proxies (not an issue on a normal home network). If `npm install` ever fails
   on `@prisma/engines`, that's the cause.

---

## Where things live

```
prisma/schema.prisma   the data model — read this first to understand the product
prisma/seed.ts         demo content across every feature
src/lib/identity.ts    the single source of truth for how a post appears
src/lib/auth.ts        sessions + password helpers
src/lib/actions/       all mutations (auth, post, engagement, review, help, …)
src/lib/queries.ts     shared Prisma query shapes
src/app/               routes; src/components/ the UI
docs/                  PRODUCT (scope), ARCHITECTURE (how), ROADMAP (next)
```

---

## Recommended next steps

In rough priority order (full list in [`ROADMAP.md`](ROADMAP.md)):

1. **Push to GitHub** and add CI (typecheck + build on every PR).
2. **Profile-edit UI** for the honest-bio fields and persona management.
3. **First Prisma migration** to start tracking schema history.
4. **Notifications** (reactions, replies, credits, help claims, reviews).
5. **Real-time help** — presence + live threads (SSE/WebSockets). This is the
   differentiator for Cross-Company Help.
6. **Trust & safety** — reporting, moderation, lightweight anonymous reputation.

---

## Continuing with a local Claude Code session

Open Claude Code in the project folder on your Mac mini and paste something like:

> This is "checkedOut", a Next.js 14 + Prisma + Postgres app. Read
> `docs/HANDOFF.md`, `docs/PRODUCT.md`, and `prisma/schema.prisma` to get
> oriented. Confirm it runs (`npm run dev`), then let's start on the
> profile-edit UI from the roadmap. Before any feature work, push the current
> branch to GitHub so we have a backup.

A local session can run the app, create the first migration, and push to GitHub
as you — none of which the cloud session could do.
