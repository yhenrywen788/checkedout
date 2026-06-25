import { initials, swatchFor } from "@/lib/format";

export function Avatar({
  label,
  seed,
  anon = false,
  size = 40,
}: {
  label: string;
  seed: string;
  anon?: boolean;
  size?: number;
}) {
  const dimension = { width: size, height: size, fontSize: size * 0.4 };

  if (anon) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-ink/80 font-semibold text-paper"
        style={dimension}
        aria-label="Anonymous"
        title="Anonymous"
      >
        ?
      </span>
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ ...dimension, backgroundColor: swatchFor(seed) }}
      aria-hidden
    >
      {initials(label)}
    </span>
  );
}
