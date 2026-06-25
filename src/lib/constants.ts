import type {
  ReactionType,
  PostType,
  ReviewRecommendation,
  HelpStatus,
  PaperStatus,
} from "@prisma/client";

/**
 * Reactions are deliberately qualitative. There is no "like" — every reaction
 * says something specific and human about how the work landed.
 */
export const REACTIONS: Record<
  ReactionType,
  { emoji: string; label: string; help: string }
> = {
  RESPECT: { emoji: "🫡", label: "Respect", help: "That took something real." },
  BEEN_THERE: { emoji: "🩹", label: "Been there", help: "I've lived this too." },
  TELL_ME_MORE: {
    emoji: "👂",
    label: "Tell me more",
    help: "I want the rest of the story.",
  },
  THIS_IS_REAL: {
    emoji: "💯",
    label: "This is real",
    help: "No spin detected. Thank you.",
  },
  CHANGED_MY_MIND: {
    emoji: "🔁",
    label: "Changed my mind",
    help: "This moved my thinking.",
  },
};

export const REACTION_ORDER: ReactionType[] = [
  "RESPECT",
  "THIS_IS_REAL",
  "BEEN_THERE",
  "TELL_ME_MORE",
  "CHANGED_MY_MIND",
];

export const POST_TYPES: Record<
  PostType,
  { label: string; blurb: string; emoji: string }
> = {
  ACCOMPLISHMENT: {
    label: "Accomplishment",
    blurb: "Something real you got done — with the messy middle, not just the win.",
    emoji: "🏔️",
  },
  REAL_TALK: {
    label: "Real talk",
    blurb: "What you're actually thinking. Stuck, frustrated, curious, contrarian.",
    emoji: "🗣️",
  },
  HELP_REQUEST: {
    label: "Help request",
    blurb: "Ask for real-time help — even across company lines, anonymously if needed.",
    emoji: "🆘",
  },
  PAPER: {
    label: "Paper",
    blurb: "Put work up for open crowd review. Route around the journals.",
    emoji: "📄",
  },
  DISCUSSION: {
    label: "Discussion",
    blurb: "Start a conversation. Serious, fringe, funny, or boring — all welcome.",
    emoji: "💬",
  },
};

export const RECOMMENDATIONS: Record<
  ReviewRecommendation,
  { label: string; tone: "good" | "warn" | "bad" }
> = {
  ACCEPT: { label: "Accept", tone: "good" },
  MINOR_REVISION: { label: "Minor revision", tone: "good" },
  MAJOR_REVISION: { label: "Major revision", tone: "warn" },
  NEEDS_REPLICATION: { label: "Needs replication", tone: "warn" },
  REJECT: { label: "Reject", tone: "bad" },
};

export const HELP_STATUS: Record<HelpStatus, { label: string; tone: string }> = {
  OPEN: { label: "Open", tone: "bg-accent text-white" },
  CLAIMED: { label: "Someone's on it", tone: "bg-amber-100 text-amber-900" },
  RESOLVED: { label: "Resolved", tone: "bg-respect/10 text-respect" },
};

export const PAPER_STATUS: Record<PaperStatus, { label: string; tone: string }> = {
  UNDER_REVIEW: { label: "Under review", tone: "bg-amber-100 text-amber-900" },
  REVISION: { label: "In revision", tone: "bg-amber-100 text-amber-900" },
  ENDORSED: { label: "Community endorsed", tone: "bg-respect/10 text-respect" },
  CONTESTED: { label: "Contested", tone: "bg-contested/10 text-contested" },
};
