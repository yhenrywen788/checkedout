# checkedOut — Architecture

## Stack

| Layer    | Choice                                          | Why                                                         |
| -------- | ----------------------------------------------- | ---------------------------------------------------------- |
| Framework| Next.js 14 (App Router)                         | Server Components + Server Actions = one codebase, little glue |
| Language | TypeScript (strict)                             | Catch shape errors at the data boundary                    |
| UI       | Tailwind CSS                                     | Editorial, fast to iterate, no component-lib lock-in       |
| Data     | PostgreSQL via Prisma                            | Relational model fits the domain; great DX and type safety |
| Auth     | Hand-rolled cookie sessions + bcrypt            | No third-party dependency to fight; transparent and small  |

### Why Server Actions instead of a REST/GraphQL API

Every mutation (sign in, post, react, review, claim help, follow) is a
[Server Action](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
in `src/lib/actions/`. Pages are Server Components that query Prisma directly.
That removes an entire API layer and its client/server type duplication. If a
public/mobile API is needed later, these actions are thin wrappers over Prisma
and translate cleanly into route handlers.

## Data model

The model _is_ the product philosophy — read `prisma/schema.prisma` first.

```
User ──< Post >── Space
 │        │  ├─ Accomplishment (1:1)   structured "real story" + Credits
 │        │  ├─ HelpRequest    (1:1)   open → claimed → resolved
 │        │  ├─ Paper          (1:1) ──< Review        crowd peer review
 │        │  ├─ Reaction (qualitative, unique per user+type)
 │        │  ├─ Comment  (real or anonymous, self-referential threads)
 │        │  ├─ Credit   (named person + what they did)
 │        │  └─ PostTag >── Tag   (TOPIC or SKILL)
 │        └─ identityMode (REAL | PSEUDONYM | ANON) + optional Persona
 ├─ Persona      (persistent pseudonyms)
 ├─ Membership >── Space   (with per-space identity norms)
 ├─ Follow (self-relation)
 └─ Session
```

Key decisions:

- **Typed extensions over a JSON blob.** `Accomplishment`, `HelpRequest`, and
  `Paper` are 1:1 tables off `Post` rather than loose JSON, so the structure is
  enforced and queryable.
- **Identity on every authored row.** `Post`, `Comment`, and `Review` each carry
  an `identityMode`. Anonymity is a first-class data property, not a UI toggle.
- **Reactions are typed and de-duplicated.** `@@unique([postId, userId, type])`
  makes a reaction a qualitative statement, not a counter to game.

## Identity resolution (one source of truth)

`src/lib/identity.ts` is the _only_ place that turns a stored row into a display
identity (name, handle, link, avatar). Centralizing it means a real name can
never accidentally leak behind an anonymous post. Reinforced elsewhere:

- Public profiles query `where: { identityMode: "REAL" }`, so anonymous and
  pseudonymous posts never surface under your name.
- Anonymous content carries no link and no handle anywhere it renders.

## Auth design

- Passwords hashed with **bcrypt**.
- On sign-in we mint a random token, store **only its SHA-256 hash** in the
  `Session` table, and put the raw token in an **httpOnly, SameSite=Lax,
  Secure-in-prod** cookie. A database leak therefore doesn't hand out live
  sessions.
- `getCurrentUser()` / `requireUser()` (`src/lib/auth.ts`) are the helpers pages
  and actions use.

This is deliberately minimal and **not yet production-hardened** — see Roadmap
for what to add before real users (rate limiting, email verification, CSRF
defense-in-depth, etc.).

## Directory layout

```
src/
  app/                       routes
    page.tsx                 landing / manifesto
    sign-in, sign-up         auth
    feed                     main feed (auth-gated)
    compose                  the composer
    spaces, spaces/[slug]    communities
    post/[id]                post detail (reviews, help, comments)
    u/[handle]               honest profile
  components/                PostCard, Composer, ReactionBar, PaperReviews, …
  lib/
    actions/                 server actions (mutations)
    auth.ts, identity.ts     session + identity resolution
    queries.ts               shared Prisma include shapes + helpers
    constants.ts, format.ts  reaction/type metadata, formatting
prisma/
  schema.prisma, seed.ts
```

## Configuring the database

The schema targets PostgreSQL. Point `DATABASE_URL` at any Postgres:

- **Local (Docker):** `./scripts/setup-db.sh` (uses `docker-compose.yml`).
- **Managed:** a Neon/Supabase/RDS connection string.

Apply the schema with `prisma db push` (dev) or `prisma migrate deploy` (prod).
Migrations aren't committed yet — generate the first one with
`prisma migrate dev --name init` when you're ready to track schema history.

## Deployment notes

- Stateless app servers; all state is in Postgres → scales horizontally.
- Set `AUTH_SECRET` and `DATABASE_URL` in the host's environment.
- `npm run build` runs `prisma generate` then `next build`.
- Vercel + Neon is the lowest-friction path; any Node host works.

## Known limitations

- No real-time transport yet (the help desk is request/claim/resolve, not live
  chat). SSE/WebSockets are the planned next layer.
- No moderation, rate limiting, or abuse controls.
- Profile editing is via seed/DB for now (no settings UI).
