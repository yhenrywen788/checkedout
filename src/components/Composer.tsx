"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createPost, type PostState } from "@/lib/actions/post";
import { POST_TYPES } from "@/lib/constants";
import { SubmitButton } from "@/components/SubmitButton";
import type { PostType, IdentityMode } from "@prisma/client";

const TYPE_ORDER: PostType[] = [
  "ACCOMPLISHMENT",
  "REAL_TALK",
  "HELP_REQUEST",
  "PAPER",
  "DISCUSSION",
];

const TITLE_LABEL: Partial<Record<PostType, string>> = {
  ACCOMPLISHMENT: "The one-line headline",
  HELP_REQUEST: "What do you need help with?",
  PAPER: "Paper title",
  DISCUSSION: "Title (optional)",
};

const TITLE_PLACEHOLDER: Partial<Record<PostType, string>> = {
  ACCOMPLISHMENT: "Shipped X to Y users with a team of two",
  HELP_REQUEST: "Postgres replica keeps falling behind under write load",
  PAPER: "On the replicability of …",
  DISCUSSION: "An unpopular opinion about on-call",
};

const BODY_LABEL: Record<PostType, string> = {
  ACCOMPLISHMENT: "Set the scene (short)",
  REAL_TALK: "What's actually on your mind?",
  HELP_REQUEST: "The details — what you've tried, where you're stuck",
  PAPER: "A note to reviewers (optional)",
  DISCUSSION: "Kick it off",
};

function Block({
  name,
  label,
  rows = 2,
  placeholder = "",
}: {
  name: string;
  label: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea name={name} rows={rows} className="field" placeholder={placeholder} />
    </div>
  );
}

export function Composer({
  spaces,
  personas,
  defaultType = "REAL_TALK",
  defaultSpaceId = "",
}: {
  spaces: { id: string; name: string }[];
  personas: { id: string; displayName: string; handle: string }[];
  defaultType?: PostType;
  defaultSpaceId?: string;
}) {
  const [state, formAction] = useFormState<PostState, FormData>(createPost, {});
  const [type, setType] = useState<PostType>(defaultType);
  const [identity, setIdentity] = useState<IdentityMode>("REAL");

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {TYPE_ORDER.map((t) => (
          <label
            key={t}
            className={`cursor-pointer rounded-xl border p-2 text-center text-xs font-medium transition ${
              type === t
                ? "border-ink bg-ink text-paper"
                : "border-line bg-white hover:border-ink/30"
            }`}
          >
            <input
              type="radio"
              name="type"
              value={t}
              checked={type === t}
              onChange={() => setType(t)}
              className="sr-only"
            />
            <span className="block text-lg leading-none" aria-hidden>
              {POST_TYPES[t].emoji}
            </span>
            <span className="mt-1 block">{POST_TYPES[t].label}</span>
          </label>
        ))}
      </div>
      <p className="-mt-2 text-xs text-muted">{POST_TYPES[type].blurb}</p>

      {TITLE_LABEL[type] && (
        <div>
          <label className="label">{TITLE_LABEL[type]}</label>
          <input
            name="title"
            className="field"
            placeholder={TITLE_PLACEHOLDER[type] ?? ""}
          />
        </div>
      )}

      <Block
        name="body"
        label={BODY_LABEL[type]}
        rows={type === "ACCOMPLISHMENT" || type === "PAPER" ? 2 : 5}
      />

      {type === "ACCOMPLISHMENT" && (
        <div className="space-y-4 rounded-2xl border border-dashed border-line bg-paper/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            The real story
          </p>
          <Block
            name="outcome"
            label="What actually got done"
            rows={2}
            placeholder="The concrete outcome — numbers if you have them."
          />
          <Block
            name="theMessyMiddle"
            label="The messy middle"
            rows={3}
            placeholder="False starts, dead ends, the 2am parts nobody puts on a résumé."
          />
          <Block
            name="whatItTook"
            label="What it took"
            rows={2}
            placeholder="Time, money, the help you needed, what you gave up for it."
          />
          <Block
            name="whatIdDoDifferently"
            label="What you'd do differently (optional)"
            rows={2}
          />
          <div className="rounded-xl border border-line bg-white p-3">
            <span className="label">Give specific credit (optional)</span>
            <div className="grid gap-2 sm:grid-cols-2">
              <input name="creditName" className="field" placeholder="Who helped?" />
              <input
                name="creditContribution"
                className="field"
                placeholder="What did they specifically do?"
              />
            </div>
          </div>
        </div>
      )}

      {type === "HELP_REQUEST" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isUrgent" className="h-4 w-4" />
          This is time-sensitive
        </label>
      )}

      {type === "PAPER" && (
        <div className="space-y-4">
          <div>
            <label className="label">Authors (as they should be cited)</label>
            <input name="authorsText" className="field" placeholder="A. Researcher, B. Collaborator" />
          </div>
          <Block name="abstract" label="Abstract" rows={4} />
          <div className="grid gap-2 sm:grid-cols-2">
            <input name="pdfUrl" className="field" placeholder="Link to PDF / preprint (optional)" />
            <input name="doi" className="field" placeholder="DOI (optional)" />
          </div>
        </div>
      )}

      <div>
        <label className="label">Tags (comma-separated, optional)</label>
        <input
          name="tags"
          className="field"
          placeholder="distributed-systems, burnout, hiring"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Post to</label>
          <select name="spaceId" defaultValue={defaultSpaceId} className="field">
            <option value="">Your feed (no space)</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Post as</label>
          <select
            name="identityMode"
            value={identity}
            onChange={(e) => setIdentity(e.target.value as IdentityMode)}
            className="field"
          >
            <option value="REAL">Yourself</option>
            {personas.length > 0 && <option value="PSEUDONYM">A pseudonym</option>}
            <option value="ANON">Anonymous</option>
          </select>
        </div>
      </div>

      {identity === "PSEUDONYM" && personas.length > 0 && (
        <div>
          <label className="label">Which pseudonym</label>
          <select name="personaId" className="field">
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName} (@{p.handle})
              </option>
            ))}
          </select>
        </div>
      )}
      {identity === "ANON" && (
        <p className="text-xs text-muted">
          Anonymous hides your name from everyone, including other members. It
          exists so you can be honest — not so you can be cheap.
        </p>
      )}

      {state.error && (
        <p className="rounded-lg bg-contested/10 px-3 py-2 text-sm text-contested">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton className="btn-accent" pendingLabel="Posting…">
          Post it
        </SubmitButton>
      </div>
    </form>
  );
}
