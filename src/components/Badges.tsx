import {
  POST_TYPES,
  HELP_STATUS,
  PAPER_STATUS,
} from "@/lib/constants";
import type { PostType, HelpStatus, PaperStatus } from "@prisma/client";

export function PostTypeBadge({ type }: { type: PostType }) {
  const meta = POST_TYPES[type];
  return (
    <span className="pill bg-paper text-ink/70 ring-1 ring-line">
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}

export function HelpStatusBadge({ status }: { status: HelpStatus }) {
  const meta = HELP_STATUS[status];
  return <span className={`pill ${meta.tone}`}>{meta.label}</span>;
}

export function PaperStatusBadge({ status }: { status: PaperStatus }) {
  const meta = PAPER_STATUS[status];
  return <span className={`pill ${meta.tone}`}>{meta.label}</span>;
}
