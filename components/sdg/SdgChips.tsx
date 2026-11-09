import {
  orderSdgGoals,
  sdgColor,
  sdgName,
  sdgShortName,
} from "@/features/sdg/taxonomy";

type Props = {
  goals: readonly number[] | null | undefined;
  primary?: number | null;
  /** Limit the number of chips (cards); the rest collapse into a "+N". */
  max?: number;
  showPrimaryLabel?: boolean;
  className?: string;
};

/**
 * Compact, read-only rendering of a startup's selected goals. The primary goal
 * is shown first and labelled, so declared alignment is always distinguishable
 * from the wider selection.
 */
export function SdgChips({
  goals,
  primary,
  max,
  showPrimaryLabel = true,
  className,
}: Props) {
  const list = orderSdgGoals(goals ?? [], primary ?? null);
  if (list.length === 0) return null;

  const shown = typeof max === "number" ? list.slice(0, max) : list;
  const hidden = list.length - shown.length;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className ?? ""}`}>
      {shown.map((id) => {
        const isPrimary = id === primary;
        return (
          <span
            key={id}
            title={sdgName(id)}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] ${
              isPrimary
                ? "border-[var(--accent)]/50 text-[var(--text)] bg-[var(--accent-muted)]"
                : "border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-elevated)]/40"
            }`}
          >
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: sdgColor(id) }}
            />
            <span className="tabular-nums">SDG {id}</span>
            <span className="hidden sm:inline text-[var(--text-secondary)]">
              {sdgShortName(id)}
            </span>
            {isPrimary && showPrimaryLabel && (
              <span className="text-[9px] uppercase tracking-wide text-[var(--accent)]">
                primary
              </span>
            )}
          </span>
        );
      })}
      {hidden > 0 && (
        <span className="text-[10px] text-[var(--text-muted)]">+{hidden}</span>
      )}
    </div>
  );
}
