# Identity — the contract

checkedOut's most safety-critical property. A user who chooses to hide behind a
pseudonym or post anonymously must **never** be exposed by accident. This file is
the spec; the code enforces it.

## The three modes

| Mode | Shows | Links to | Stored author binding |
| --- | --- | --- | --- |
| **REAL** | real name + `@handle` | `/u/{handle}` (user namespace) | `authorId` (plain FK) |
| **PERSISTENT PSEUDONYM** | persona name + `@handle` | `/p/{handle}` (persona namespace) | `sealedAuthor` + `personaId` |
| **TRULY ANONYMOUS** | "Anonymous" | nothing | `sealedAuthor` only |

`authorId` is set **only for REAL content.** Anonymous and pseudonymous content
leaves it null and stores `sealedAuthor` instead — so a database breach or a
casual `SELECT` can't read who posted.

## Invariants (what the code guarantees)

- **I1 — Single resolver, FAIL CLOSED.** Every byline goes through
  `resolveIdentity` (`src/lib/identity.ts`). On any missing/ambiguous data
  (null persona on a pseudonym, null author on a "real" row) it returns the
  **Anonymous** shape. There is deliberately **no path** from PSEUDONYM or a
  null author to a real name. No component re-derives identity inline.
- **I2 — The sealed blob and raw author are server-only.** `sealedAuthor` and
  raw `author` rows must never be passed into a `"use client"` component or
  serialized into an RSC/HTML payload. (Today client components receive only
  scalars — e.g. `ReactionBar` gets `{postId, counts, mine}` — so this holds.)
- **I3 — Anti-correlation for ANON.** No per-user-stable value reaches the
  client for anonymous content: avatar seed is the constant `"anon"`, handle and
  href are null, reactor identities are summarized to counts server-side.
- **I5 — Per-space norms are server-authoritative.** `createPost` enforces
  `Space.allowAnon`; the client is untrusted.
- **I7 — Write-path identity is owned, never silently downgraded.** A persona is
  connected only after verifying `persona.userId === caller`. A pseudonymous post
  with no owned persona is **rejected**, never published under the real name.
  Comments fail to the *more* private mode (ANON), never to REAL.

(I4 — capped optional affiliation for ANON — and the I5/I6 composer UX are
designed but **not yet built**; see Deferred.)

## The anonymity escrow (mock today)

`src/lib/anon-escrow.ts` is the single seam where real cryptography goes later:

- `sealAuthor(userId)` — seal the real author into an opaque blob stored on
  non-REAL content instead of a foreign key.
- `openSealedAuthor(sealed)` — the **break-glass**: the only path back to the
  human, meant to be a deliberate, authorized, logged act (moderation/abuse).
- `sealedBelongsTo(sealed, userId)` — authorize owner-only actions on sealed
  content (used by the help flow) without exposing the author.

**⚠️ The current implementation is reversible obfuscation, NOT encryption.** It
exists so the rest of the app is wired against the final interface. Before real
users trust the word "anonymous," swap the three functions' internals for real
threshold encryption (e.g. Shamir 2-of-3 or a KMS with audit logging) so that
opening an identity requires a multi-party, auditable action. **Nothing outside
this module needs to change.**

## Honest limits (what "anonymous" does NOT cover yet)

- Encryption is mocked — see the warning above.
- **Metadata.** Sealing the author does nothing for IP + timestamp correlation
  at the Vercel/Postgres log layer. The anonymous write path already avoids the
  redirect-to-`/post/{id}` leak; still TODO: coarsen anon `createdAt`, short log
  retention. App-data blindness ≠ network anonymity.
- **Persona ↔ user** is linkable inside the DB via `Persona.userId` (inherent to
  persistent pseudonyms). It's never exposed to clients and pseudonymous posts
  never appear on the real profile, but it is not sealed.

## Deferred / hardening (designed, not built)

- Composer UX: persistent mode indicator, confirm-on-REAL, per-space default
  mode (server enforcement is done; the UI half isn't).
- ANON optional **affiliation tag** from a capped taxonomy (I4).
- Resolve-and-strip at the **query boundary** so I2 is structural, not a
  convention.
- Self-reaction correlation (`Reaction.userId` on your own anon post).
- `verifiedAt` / `bannedAt` gates + rate limiting (the abuse layer).
- Real threshold encryption in the escrow module.
- Account-deletion edge: `onDelete: Restrict` on persona FKs means deleting a
  user who owns a persona with posts will error until that's handled.
