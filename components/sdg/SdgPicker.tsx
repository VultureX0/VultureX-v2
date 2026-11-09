"use client";

import { SDG_GOALS, sdgColor, sdgName } from "@/features/sdg/taxonomy";

type Props = {
  value: number[];
  primary: number | null;
  onChange: (goals: number[], primary: number | null) => void;
  disabled?: boolean;
  /** Hide the explanatory copy when the picker sits inside a compact section. */
  hideHint?: boolean;
};

/**
 * Multi-select for the 17 official goals, plus an optional primary goal that
 * must belong to the selection. Used by startup onboarding/settings and by
 * investor settings so the same taxonomy and interaction appear everywhere.
 */
export function SdgPicker({ value, primary, onChange, disabled, hideHint }: Props) {
  function toggle(id: number) {
    if (disabled) return;
    const next = value.includes(id)
      ? value.filter((entry) => entry !== id)
      : [...value, id].sort((a, b) => a - b);
    // Removing the primary goal clears the designation instead of leaving a
    // primary that is not part of the selection.
    const nextPrimary = primary && next.includes(primary) ? primary : null;
    onChange(next, nextPrimary);
  }

  return (
    <div>
      {!hideHint && (
        <p className="text-[10px] text-[var(--text-muted)] mb-2">
          Optional. Choose the UN Sustainable Development Goals your business
          contributes to. Selecting a goal is a self-declared alignment, not a
          verified impact claim.
        </p>
      )}

      <div
        role="group"
        aria-label="Sustainable Development Goals"
        className="grid grid-cols-2 sm:grid-cols-3 gap-1.5"
      >
        {SDG_GOALS.map((goal) => {
          const selected = value.includes(goal.id);
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggle(goal.id)}
              aria-pressed={selected}
              disabled={disabled}
              title={sdgName(goal.id)}
              className={`flex items-center gap-2 px-2.5 py-2 text-left text-[11px] rounded-md border transition-colors disabled:opacity-50 ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--text)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <span
                aria-hidden
                className="w-4 h-4 shrink-0 rounded-[3px] text-[9px] font-bold text-[var(--accent-foreground)] flex items-center justify-center tabular-nums"
                style={{ backgroundColor: sdgColor(goal.id) }}
              >
                {goal.id}
              </span>
              <span className="leading-tight">{goal.shortName}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label
          htmlFor="sdg-primary"
          className="text-[10px] text-[var(--text-muted)]"
        >
          Primary goal (optional)
        </label>
        <select
          id="sdg-primary"
          value={primary ?? ""}
          disabled={disabled || value.length === 0}
          onChange={(event) => {
            const raw = event.target.value;
            const next = raw === "" ? null : Number(raw);
            onChange(value, next !== null && value.includes(next) ? next : null);
          }}
          className="px-2 py-1.5 text-[11px] rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-hover)] disabled:opacity-50"
        >
          <option value="">No primary goal</option>
          {value.map((id) => (
            <option key={id} value={id}>
              SDG {id} · {sdgName(id)}
            </option>
          ))}
        </select>
        {value.length === 0 && (
          <span className="text-[10px] text-[var(--text-muted)]">
            Select a goal first
          </span>
        )}
      </div>
    </div>
  );
}
