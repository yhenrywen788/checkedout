import type { IdentityMode } from "@prisma/client";

type AuthorLike = {
  identityMode: IdentityMode;
  author: { handle: string; name: string; avatarColor: string | null };
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

/**
 * The single source of truth for *who a piece of content appears to be from*.
 *
 * REAL      -> the user's real name + handle, links to profile
 * PSEUDONYM -> the persona's display name + handle, links to persona, badged
 * ANON      -> "Anonymous", no handle, no link
 *
 * Resolving identity in one place keeps the rest of the app from ever
 * accidentally leaking a real name behind an anonymous post.
 */
export function resolveIdentity(item: AuthorLike): DisplayIdentity {
  switch (item.identityMode) {
    case "ANON":
      return {
        label: "Anonymous",
        handle: null,
        href: null,
        mode: "ANON",
        avatarSeed: "anon",
        badge: "anonymous",
      };
    case "PSEUDONYM":
      if (item.persona) {
        return {
          label: item.persona.displayName,
          handle: item.persona.handle,
          href: `/u/${item.persona.handle}`,
          mode: "PSEUDONYM",
          avatarSeed: item.persona.handle,
          badge: "pseudonym",
        };
      }
    // fall through to REAL if a persona was somehow missing
    // eslint-disable-next-line no-fallthrough
    case "REAL":
    default:
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
