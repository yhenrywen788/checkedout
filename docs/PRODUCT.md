# checkedOut — Product Scope

## The thesis

LinkedIn optimizes for the _performance_ of professionalism. Its atomic units —
the résumé bullet and the announcement — reward polish, so the whole product
drifts toward a curated highlight reel. The result is a place where almost
nobody says the true, useful thing: what it actually took to get something hard
done.

**checkedOut inverts the incentive.** Its atomic unit is the
**Accomplishment-with-receipts**: a concrete thing you got done, plus the honest
story of the work behind it. Change that one object and a different product
falls out of it — one that's still work-focused, but optimized for substance,
candor, and mutual help instead of image.

> Accomplishments over "productivity." Real talk over a curated image.

### Not LinkedIn, and not Blind

Two failure modes to avoid, one on each side. **LinkedIn** is performance —
everyone's polished, nobody's honest. **Blind** is the equal-and-opposite
mistake: anonymity in service of _gossip_ — comp leaks, layoff rumors,
company-specific intel and venting. It's talk _about_ work, not work.

checkedOut is the third thing: **honest collaboration _at_ work**. Anonymity
exists to unlock candor and mutual help, not catharsis — and its sharpest
expression is a room built on the opposite of gossip. See
[`THE-WORKSHOP.md`](THE-WORKSHOP.md): a pseudonymous room where you trade
_tricks of the trade_ (lauded) and where posting _insider information with
financial consequences_ gets you banned. Craft is a gift; secrets are a leak.

## Who it's for

People who do the work and are tired of pretending it's clean: engineers,
founders, researchers, designers, operators, scientists. People who'd help a
stranger debug something gnarly, weigh in honestly on a paper, or admit they're
stuck — if there were a place built for it.

## Principles

1. **Lead with the truth, not the trophy.** The messy middle is the most useful
   part of any story. The product should make it _easier_ to share the mess than
   to hide it.
2. **Honesty shouldn't cost you your job.** Identity is a spectrum, chosen per
   post: real name, persistent pseudonym, or fully anonymous.
3. **No engagement farming.** No vanity "like" counts, no "🎉 thrilled to
   announce." Reactions are qualitative and human.
4. **Credit must mean something.** You can't just name-drop — you say what a
   person specifically did.
5. **Range is a feature.** Serious, funny, contrarian, boring, fringe. A healthy
   network holds all of it, organized by community norms rather than flattened
   into one feed-pleasing tone.

## Core objects

### Accomplishment

The signature object. Structured into:

- **What actually got done** — the concrete outcome (numbers if you have them).
- **The messy middle** — false starts, dead ends, the parts nobody puts on a
  résumé.
- **What it took** — time, money, the help you needed, what you gave up.
- **What you'd do differently** _(optional)_.
- **Specific credit** — named people _and what they did_.
- **Skills demonstrated** — tags derived from the work, not self-asserted.

### Profile (the honest résumé)

Not a list of titles. A truthful working bio:

- a one-line headline and optional affiliation (shown only if you choose),
- **what you're genuinely good at**,
- **what you're still bad at / actively working on**,
- **what you're actually looking for**,
- your accomplishments (only those posted under your real identity — see
  Identity).

### Post types

| Type             | Purpose                                                              |
| ---------------- | ------------------------------------------------------------------- |
| `ACCOMPLISHMENT` | The structured real-story-with-receipts.                            |
| `REAL_TALK`      | What you're actually thinking — stuck, frustrated, curious, spicy.  |
| `HELP_REQUEST`   | Ask for real-time help, with an open → claimed → resolved lifecycle.|
| `PAPER`          | Put work up for open crowd review.                                  |
| `DISCUSSION`     | Start a conversation; serious to fringe.                            |

### Reactions (qualitative, never a vanity count)

_Respect · Been there · Tell me more · This is real · Changed my mind._ Each
means a specific, human thing. There is intentionally no single "likes" number.

## Identity model

Every post, comment, and review carries an **identity mode**:

- **Real** — your name and handle, links to your profile.
- **Pseudonym** — a persistent persona you control; builds reputation without
  exposing your legal name or employer.
- **Anonymous** — no name, no link, not even to other members.

Identity is resolved in exactly one place in the code so a real name can never
leak behind an anonymous post (e.g. anonymous and pseudonymous posts never
appear on your public profile).

This is the key that unlocks the harder, more valuable behaviors: candid takes,
admitting failure, **cross-company help**, and **honest peer review**.

## Spaces

Communities, each with its own **kind** and **identity norms**, so very
different cultures can coexist:

- **The Grind** _(general)_ — real talk about doing the work.
- **Open Review** _(paper review)_ — crowd-reviewed science. Authors post a
  paper; the community reviews it in the open with scored, signed-or-anonymous
  critiques. The goal is to **route around the publishing-industrial complex**:
  faster, more transparent, reputation-building review.
- **Cross-Company Help** _(help desk)_ — engineers helping engineers across
  company lines, anonymously when needed. The hard problems don't respect org
  charts.
- **The Workshop** _(help desk, pseudonym-default)_ — the flagship room. "It is
  more blessed to give than to receive" on the door; trade craft, not secrets.
  Tricks of the trade are lauded; insider information with financial
  consequences gets you banned. The clearest answer to "why not Blind?" See
  [`THE-WORKSHOP.md`](THE-WORKSHOP.md).
- **Tin Foil** _(general, fringe)_ — half-baked and tin-hat theories, argued in
  good faith. The eclectic corner.

## What's built in this MVP

- Email/password auth with cookie sessions; one-click demo logins in dev.
- Honest profiles with the good-at / working-on / looking-for fields.
- Composer supporting all five post types, the full Accomplishment format,
  specific credit, tags, space targeting, and identity mode (real / pseudonym /
  anonymous).
- Feed and per-space feeds.
- Post detail with qualitative reactions and threaded-ready comments (real or
  anonymous).
- **Open crowd review**: papers with scored reviews (rigor / novelty / clarity)
  and accept→reject recommendations, signed or anonymous.
- **Help requests** with an open → claimed → resolved lifecycle.
- Spaces with join/leave and per-space identity norms.
- Follow/unfollow.
- Seed data demonstrating every feature across the tone spectrum.

## Deliberately not in the MVP (yet)

Real-time chat/presence, notifications, search/discovery ranking, profile
editing UI, moderation tooling, affiliation verification, reputation, DMs,
mobile apps. See [`ROADMAP.md`](ROADMAP.md).

## Open questions worth deciding early

- **Anti-abuse vs. anonymity.** Anonymity is core, but so is keeping the place
  good-faith. What's the lightest-weight accountability that preserves candor?
  (Per-space anon reputation? Rate limits? Trusted-member gating?)
- **Review integrity.** How do we prevent brigading or self-review rings in Open
  Review while keeping it open? (Reviewer eligibility, conflict-of-interest
  disclosure, weighting by track record.)
- **Cold-start.** The product is only as good as its candor. Which single
  community do we seed deeply first to set the cultural norm?
- **Norm enforcement.** How much is product mechanics vs. human moderation vs.
  community self-policing?
