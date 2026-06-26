// Anonymity escrow — the single seam where real cryptography goes LATER.
//
// The promise: content posted anonymously or under a pseudonym is not linked to
// a real account in a way the everyday server can read. Accountability survives
// only through a deliberate "break-glass" — openSealedAuthor — which, in the
// real design, would require a threshold-held escrow key (e.g. Shamir 2-of-3 or
// a KMS with audit logging), so no single party can casually de-anonymize anyone.
//
// ┌───────────────────────────────────────────────────────────────────────────┐
// │  !!  MOCK — NOT ENCRYPTION  !!                                              │
// │  sealAuthor() here is trivially reversible obfuscation. It exists so the    │
// │  rest of the app can be wired against the FINAL interface today. Swap the   │
// │  internals of the three functions below for real threshold encryption       │
// │  before any real user trusts the word "anonymous". Nothing else changes.    │
// │  See docs/IDENTITY.md.                                                       │
// └───────────────────────────────────────────────────────────────────────────┘
//
// INVARIANT: a sealed blob is server-only. It must NEVER be passed to a Client
// Component, serialized into an RSC/HTML payload, or returned to the browser —
// because (mock today, and even with real crypto) it is the thing that, once
// opened, names the author.

const MOCK_PREFIX = "mock.v0:";

/**
 * Seal a real user id into an opaque blob, stored on anonymous/pseudonymous
 * content in place of a foreign key to the user. A database breach or a casual
 * `SELECT` then yields this blob, not an account.
 *
 * MOCK: base64url, reversible by anyone. Real impl: encrypt under the escrow key.
 */
export function sealAuthor(userId: string): string {
  return MOCK_PREFIX + Buffer.from(userId, "utf8").toString("base64url");
}

/**
 * Break-glass: recover the real author id from a sealed blob. This is the ONLY
 * path back to the human, and every call is meant to be a deliberate, logged,
 * authorized act (moderation / abuse response) — never part of normal rendering.
 *
 * MOCK: trivially decodes. Real impl: requires assembling the escrow key.
 */
export function openSealedAuthor(sealed: string | null | undefined): string | null {
  if (!sealed || !sealed.startsWith(MOCK_PREFIX)) return null;
  try {
    return Buffer.from(sealed.slice(MOCK_PREFIX.length), "base64url").toString("utf8");
  } catch {
    return null;
  }
}

/**
 * True when a sealed blob belongs to `userId`. Used to authorize owner-only
 * actions (edit/delete/moderate) on sealed content without exposing the author.
 * In the real design this is a controlled use of the escrow key; keep call sites
 * to genuine authorization checks only.
 */
export function sealedBelongsTo(
  sealed: string | null | undefined,
  userId: string,
): boolean {
  return openSealedAuthor(sealed) === userId;
}
