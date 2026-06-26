# The Workshop — checkedOut's flagship room

> _Working name. Alternatives: **The Guild**, **Pay It Forward**, **The Trade**._
> The name is open; the three things below are not.

A pseudonymous room where people trade **craft** — _how_ to get hard things
done — under a code that lauds generosity and bans leaks. It's the sharpest
expression of checkedOut's thesis, and the cleanest place to point at when
someone asks "how is this different from Blind?"

---

## The door

On the door, one line:

> **"It is more blessed to give than to receive."** _(Acts 20:35)_

You don't enter The Workshop to extract. You enter to give craft, and you take
what others have given. The motto isn't decoration — it's the entry condition.

## Who's inside (identity norm)

- **Pseudonym by default.** Everyone wears a persistent persona. Not your legal
  name, not your employer — but _not_ throwaway-anonymous either.
- **No fully-anonymous posting here.** Full anonymity is for the rooms where
  someone needs to say a dangerous true thing once and vanish. The Workshop is
  the opposite: generosity has to **compound**. A persistent pseudonym means the
  person who's helped forty people carries forty people's worth of standing —
  and you can see it.
- **Real name optional.** If you want the credit attached to you, you can. Most
  won't, and that's fine. The reputation is real either way.

In the data model: `Space { kind: HELP_DESK, defaultIdentity: PSEUDONYM,
allowAnon: false }`.

## The Line — what gets you lauded vs. banned

This is the room's whole moral architecture, and the reason it isn't Blind.

**Lauded — _tricks of the trade_.** Transferable craft and judgment. The _how_.
Knowledge that helps anyone in the field do the work better, that costs you
nothing but time to give away:

- how to structure a migration so it's always reversible,
- the framing that gets a reluctant vendor to "yes,"
- the debugging heuristic that saves a day,
- how to run a postmortem people are actually honest in,
- how to get a skeptical team to adopt tests without a fight.

**Banned — _insider information_.** Confidential, company-specific, or
financially material facts. The _what_ that belongs to one company or one named
person:

- unreleased earnings, numbers, or metrics,
- a specific company's layoff list before it's public,
- a named client's confidential roadmap or contract terms,
- M&A rumors, anything that could move a stock,
- anything you signed an NDA over.

**The test, in one sentence:**

> Would this help _anyone_ do the work better (a gift), or does it just leak what
> one company or person is doing (a theft)?

Craft generalizes; secrets are extracted. The room rewards the first and removes
the second — **post insider information with financial consequences and you're
banned; share a real trick of the trade and you're lauded.**

### Why the Line is drawn exactly there

1. **It's the anti-Blind.** Blind's core content _is_ the banned column —
   comp leaks, layoff rumors, company-specific intel. We don't compete on that.
   We refuse it on purpose, and that refusal _is_ the product.
2. **It keeps us legally clean.** Hosting material non-public information, NDA
   breaches, and trade-secret leaks is a real liability (securities law,
   tortious interference, trade-secret misappropriation). The Line isn't only
   ethical — it's load-bearing for the company's survival.
3. **It keeps signal high.** Gift knowledge is durable and reusable. Leaked
   secrets are a dopamine hit that ages into a lawsuit. One builds a library;
   the other builds a liability.

## How it works on top of what exists

The Workshop is mostly a **configured Space + the existing help loop**, not a new
subsystem:

- **Posting** = a `HELP_REQUEST` ("here's where I'm stuck") _or_ an unprompted
  gift ("here's a trick I use"). Both are giving — one gives a problem worth
  solving, one gives the solution.
- **Helping** rides the existing `OPEN → CLAIMED → RESOLVED` lifecycle.
- **Lauding** = qualitative reactions (_Respect · This is real · Tell me more_)
  plus, over time, the persistent-pseudonym reputation those add up to. No
  vanity counts — standing, not likes.

## Net-new to build (it isn't free)

- **The door / charter UI.** Surface the motto and the Line prominently on entry
  — a real "code on the wall," not a buried description. (`tagline` +
  `description` fields exist; the presentation doesn't.)
- **Pseudonym-default enforcement** in the composer when posting into this space
  (and hiding the full-anon option here).
- **The laud → reputation signal.** Turn "this helped" into persistent
  pseudonymous standing. (Roadmap: _per-space anonymous reputation_.)
- **Moderation + the ban path.** Reports, a mod queue, and an explicit
  insider-information policy enforced by a human + prompts. This is the
  Trust & safety work the roadmap already anticipates — The Workshop gives it a
  concrete first rule to enforce.

## Open questions for the room

- **Who draws the Line in the gray cases?** "My company does X" can be craft
  ("here's a process that works") or a leak ("here's our confidential process").
  Mod judgment + a clear policy + a one-tap report.
- **Does lauding need to be more than a reaction?** A visible "helped N people"
  on the pseudonym, a periodic "most generous this week" — without turning it
  into a leaderboard that farms engagement.
- **Cold-start.** This may be _the_ room to seed deeply first (the PRODUCT.md
  cold-start question): it sets the cultural norm for the whole network.
