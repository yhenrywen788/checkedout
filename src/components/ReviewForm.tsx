"use client";

import { useFormState } from "react-dom";
import { addReview, type ReviewState } from "@/lib/actions/review";
import { RECOMMENDATIONS } from "@/lib/constants";
import { SubmitButton } from "@/components/SubmitButton";

function ScoreInput({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <label className="label">{label} (1–5)</label>
      <input type="number" min={1} max={5} name={name} className="field" />
    </div>
  );
}

export function ReviewForm({
  paperId,
  postId,
}: {
  paperId: string;
  postId: string;
}) {
  const [state, formAction] = useFormState<ReviewState, FormData>(addReview, {});
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="paperId" value={paperId} />
      <input type="hidden" name="postId" value={postId} />
      <div>
        <label className="label">Recommendation</label>
        <select name="recommendation" className="field" defaultValue="MAJOR_REVISION">
          {Object.entries(RECOMMENDATIONS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Summary judgement</label>
        <textarea
          name="summary"
          rows={3}
          className="field"
          placeholder="Your honest read: does this hold up? What would it take to believe it?"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Strengths</label>
          <textarea name="strengths" rows={2} className="field" />
        </div>
        <div>
          <label className="label">Weaknesses</label>
          <textarea name="weaknesses" rows={2} className="field" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <ScoreInput name="scoreRigor" label="Rigor" />
        <ScoreInput name="scoreNovelty" label="Novelty" />
        <ScoreInput name="scoreClarity" label="Clarity" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" name="identityMode" value="REAL" className="h-4 w-4" />
          Sign this review with my name
        </label>
        <SubmitButton className="btn-accent" pendingLabel="Submitting…">
          Submit review
        </SubmitButton>
      </div>
      {state.error && <p className="text-sm text-contested">{state.error}</p>}
    </form>
  );
}
