# checkedOut — Roadmap

The MVP proves the thesis end-to-end. This is the path from "it works" to "it's
worth using daily," roughly in priority order.

## Next (make it usable for real)

- **Profile editing UI.** Settings page for the honest-bio fields, avatar, and
  persona management. (Schema already supports it.)
- **Notifications.** When someone reacts, replies, credits you, claims your help
  request, or reviews your paper.
- **First migration.** `prisma migrate dev --name init` to start tracking schema
  history instead of `db push`.
- **Rate limiting + abuse basics.** Per-IP and per-account limits on posting,
  reacting, and sign-up. Email verification.

## Real-time (the differentiator for help)

The Cross-Company Help desk is currently request → claim → resolve. The big
unlock is **live help**:

- Presence ("3 people who've shipped this are online now").
- Real-time threads via SSE or WebSockets (e.g. a small Node gateway, or a
  managed service like Pusher/Ably/Supabase Realtime).
- Optional ephemeral rooms that disappear when the problem is solved — lowering
  the cost of asking, and of helping a competitor.

## Trust & safety (this is what makes anonymity survivable)

- **Lightweight accountability under anonymity.** Per-space anonymous reputation
  so good-faith anon contributors build standing without de-anonymizing.
- **Moderation tooling.** Reports, mod queues, space-level moderators (the role
  already exists in `Membership`).
- **Norms as product.** Friction on low-effort negativity; prompts that reward
  specificity and vulnerability.

## Open Review, hardened

- **Reviewer eligibility & conflict-of-interest disclosure.**
- **Anti-brigading / anti-ring detection** for reviews and reactions.
- **Versioned papers** with author responses and a visible revision history.
- **Citable, permanent links** and optional DOI minting, so a checkedOut review
  history is portable evidence of rigor.

## Discovery

- Search across people, posts, papers, and skills.
- A real feed-ranking model that surfaces substance, explicitly tuned _against_
  engagement-bait signals.
- Skill/topic pages that aggregate the best accomplishments and discussions.

## Reputation & verification

- **Demonstrated-skill graph** built from accomplishments and credits rather
  than self-asserted endorsements.
- **Optional affiliation verification** (verify the employer without forcing you
  to show it) so cross-company help and reviews can carry weight when wanted.

## Bigger bets

- **DMs / small group rooms** for taking a help thread private.
- **Org accounts** that respect the anti-performative ethos (no recruiter spam).
- **Mobile apps.**
- **An API** for posting accomplishments from where the work happens (CI, PRs,
  lab notebooks).

## Engineering hygiene to add alongside

- Test suite (unit tests for identity resolution and actions; e2e for the core
  loops).
- CI: typecheck, build, and a smoke test on every PR.
- Error monitoring and structured logging.
- A security review before any public launch.
