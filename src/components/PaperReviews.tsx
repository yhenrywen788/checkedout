import { RECOMMENDATIONS } from "@/lib/constants";
import type { FeedPost } from "@/lib/queries";

const TONE: Record<string, string> = {
  good: "bg-respect/10 text-respect",
  warn: "bg-amber-100 text-amber-900",
  bad: "bg-contested/10 text-contested",
};

function Score({ label, value }: { label: string; value: number | null }) {
  return (
    <span className="text-xs text-muted">
      {label}{" "}
      <span className="font-semibold text-ink/80 tabular-nums">
        {value ? `${value}/5` : "—"}
      </span>
    </span>
  );
}

export function PaperReviews({
  paper,
}: {
  paper: NonNullable<FeedPost["paper"]>;
}) {
  if (!paper.reviews.length) {
    return (
      <p className="text-sm text-muted">
        No reviews yet. If you know this area, be the first to weigh in.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {paper.reviews.map((r) => {
        const rec = RECOMMENDATIONS[r.recommendation];
        const who = r.identityMode === "REAL" ? r.reviewer.name : "Anonymous reviewer";
        return (
          <div key={r.id} className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{who}</span>
              <span className={`pill ${TONE[rec.tone]}`}>{rec.label}</span>
            </div>
            <p className="prose-real mt-2">{r.summary}</p>
            {r.strengths && (
              <p className="mt-2 text-sm">
                <span className="font-semibold text-respect">Strengths: </span>
                {r.strengths}
              </p>
            )}
            {r.weaknesses && (
              <p className="mt-1 text-sm">
                <span className="font-semibold text-contested">Weaknesses: </span>
                {r.weaknesses}
              </p>
            )}
            <div className="mt-3 flex gap-4">
              <Score label="Rigor" value={r.scoreRigor} />
              <Score label="Novelty" value={r.scoreNovelty} />
              <Score label="Clarity" value={r.scoreClarity} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
