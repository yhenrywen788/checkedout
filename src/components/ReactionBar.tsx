"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { toggleReaction } from "@/lib/actions/engagement";
import { REACTIONS, REACTION_ORDER } from "@/lib/constants";
import type { ReactionType } from "@prisma/client";

/**
 * Qualitative reactions, rendered as toggle chips. There is intentionally no
 * single "likes" number — each reaction means a specific, human thing.
 */
export function ReactionBar({
  postId,
  counts,
  mine,
  canReact,
}: {
  postId: string;
  counts: Record<string, number>;
  mine: string[];
  canReact: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  const mineSet = new Set(mine);

  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTION_ORDER.map((type) => {
        const meta = REACTIONS[type];
        const count = counts[type] ?? 0;
        const active = mineSet.has(type);
        return (
          <button
            key={type}
            type="button"
            title={canReact ? meta.help : "Sign in to react"}
            disabled={!canReact || pending}
            onClick={() =>
              startTransition(() =>
                toggleReaction(postId, type as ReactionType, pathname),
              )
            }
            className={`pill border transition ${
              active
                ? "border-ink bg-ink text-paper"
                : "border-line bg-white text-ink/70 hover:border-ink/40"
            } ${!canReact ? "cursor-default" : ""}`}
          >
            <span aria-hidden>{meta.emoji}</span>
            <span>{meta.label}</span>
            {count > 0 && <span className="tabular-nums opacity-70">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
