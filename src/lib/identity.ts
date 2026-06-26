import type { IdentityMode } from "@prisma/client";

type AuthorLike = {
  identityMode: IdentityMode;
  // Null for non-REAL content (the real author is sealed, not joined) or when a
  // REAL author row is gone. The resolver must treat null as "show Anonymous".
  author: { handle: string; name: string; avatarColor: string | null } | null;
  persona: { handle: string; displayName: string } | null;
};

export type DisplayIdentity = {
  label: string; // what to render as the name
  handle: string | null; // @handle, or null when anonymous
  href: string | null; // profile link, or null when not linkable
  mode: IdentityMode;
  avatarSeed: string; // stable seed for the avatar swatch
  badge: string | null; // small note next to the name, e.g. "pseudonym"
};

// The one shape every byline collapses to when identity must be hidden. Used
// directly for ANON, and as the FAIL-CLOSED fallback whenever the data needed to
// show a real/pseudonymous identity is missing — so the worst case is "shows
// Anonymous", never "leaks the real name".
const ANONYMOUS: DisplayIdentity = {
  label: "Anonymous",
  handle: null,
  href: null,
  mode: "ANON",
  avatarSeed: "anon",
  badge: "anonymous",
};

/**
 * The single source of truth for *who a piece of content appears to be from*.
 *
 * REAL      -> the user's real name + handle, links to /u/profile
 * PSEUDONYM -> the persona's display name + handle, links to /p/persona, badged
 * ANON      -> "Anonymous", no handle, no link
 *
 * Resolving identity in one place keeps the rest of the app from ever
 * accidentally leaking a real name behind an anonymous post. The cardinal rule
 * here is FAIL CLOSED: any missing/ambiguous data returns the ANONYMOUS shape.
 * There is deliberately no path from PSEUDONYM or a null author to a real name.
 */
export function resolveIdentity(item: AuthorLike): DisplayIdentity {
  switch (item.identityMode) {
    case "ANON":
      return ANONYMOUS;

    case "PSEUDONYM":
      // Fail closed: a pseudonymous item with no persona must NOT reveal the
      // real author. Show Anonymous (never fall through to the REAL branch).
      if (!item.persona) return { ...ANONYMOUS, badge: "pseudonym unavailable" };
      return {
        label: item.persona.displayName,
        handle: item.persona.handle,
        // Persona links live in their OWN namespace, never /u/ (the user
        // namespace), so a handle collision can't resolve to a real profile.
        href: `/p/${item.persona.handle}`,
        mode: "PSEUDONYM",
        avatarSeed: item.persona.handle,
        badge: "pseudonym",
      };

    case "REAL":
    default:
      // Fail closed: REAL content whose author row is gone (orphaned/deleted)
      // shows Anonymous rather than crashing or leaking a partial identity.
      if (!item.author) return ANONYMOUS;
      return {
        label: item.author.name,
        handle: item.author.handle,
        href: `/u/${item.author.handle}`,
        mode: "REAL",
        avatarSeed: item.author.avatarColor ?? item.author.handle,
        badge: null,
      };
  }
}
