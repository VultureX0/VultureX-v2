export function ScoreBadge({ score, size = "sm" }: { score: number; size?: "sm" | "lg" }) {
  return (
    <span className={`tabular-nums font-semibold ${
      size === "lg" ? "text-2xl" : "text-sm"
    } ${score >= 70 ? "text-[var(--green)]" : score >= 40 ? "text-[var(--amber)]" : "text-[var(--text-muted)]"}`}>
      {Math.round(score)}
    </span>
  );
}
