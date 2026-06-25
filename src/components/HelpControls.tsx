"use client";

import { useTransition } from "react";
import { claimHelp, resolveHelp, reopenHelp } from "@/lib/actions/help";
import type { HelpStatus } from "@prisma/client";

export function HelpControls({
  helpRequestId,
  postId,
  status,
  signedIn,
}: {
  helpRequestId: string;
  postId: string;
  status: HelpStatus;
  signedIn: boolean;
}) {
  const [pending, startTransition] = useTransition();
  if (!signedIn) {
    return (
      <p className="text-sm text-muted">Sign in to offer help on this.</p>
    );
  }

  const run = (fn: () => Promise<void>) => () => startTransition(fn);

  return (
    <div className="flex flex-wrap gap-2">
      {status === "OPEN" && (
        <button
          className="btn-accent"
          disabled={pending}
          onClick={run(() => claimHelp(helpRequestId, postId))}
        >
          I&apos;ll take this
        </button>
      )}
      {status === "CLAIMED" && (
        <button
          className="btn-primary"
          disabled={pending}
          onClick={run(() => resolveHelp(helpRequestId, postId))}
        >
          Mark resolved
        </button>
      )}
      {status === "RESOLVED" && (
        <button
          className="btn-ghost"
          disabled={pending}
          onClick={run(() => reopenHelp(helpRequestId, postId))}
        >
          Reopen
        </button>
      )}
    </div>
  );
}
