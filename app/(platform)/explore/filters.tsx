"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Globe2 } from "lucide-react";
import { SDG_GOALS, sanitizeSdgIds, sdgColor } from "@/features/sdg/taxonomy";
import type { SdgMatchMode } from "@/features/sdg/filters";

const SECTORS = ["all", "saas", "fintech", "ai/ml", "healthtech", "edtech", "climate", "e-commerce", "marketplace"];
const STAGES = ["all", "pre-seed", "seed", "series-a", "series-b", "growth"];

type Props = {
  currentSector?: string;
  currentStage?: string;
  currentQuery?: string;
  currentSdg: number[];
  currentSdgMode: SdgMatchMode;
  /** The signed-in investor's saved interests, when they have any. */
  preferredSdgs?: number[];
};

export function ExploreFilters({
  currentSector,
  currentStage,
  currentQuery,
  currentSdg,
  currentSdgMode,
  preferredSdgs = [],
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function push(params: URLSearchParams) {
    const query = params.toString();
    router.push(query ? `/explore?${query}` : "/explore");
  }

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") { params.set(key, value); } else { params.delete(key); }
    push(params);
  }

  function setSdg(ids: number[]) {
    const params = new URLSearchParams(searchParams.toString());
    const clean = sanitizeSdgIds(ids);
    if (clean.length > 0) {
      params.set("sdg", clean.join(","));
      if (clean.length < 2) params.delete("sdgMode");
    } else {
      params.delete("sdg");
      params.delete("sdgMode");
    }
    push(params);
  }

  function toggleSdg(id: number) {
    setSdg(
      currentSdg.includes(id)
        ? currentSdg.filter((entry) => entry !== id)
        : [...currentSdg, id]
    );
  }

  function setMode(mode: SdgMatchMode) {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === "all" && currentSdg.length > 1) params.set("sdgMode", "all");
    else params.delete("sdgMode");
    push(params);
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            defaultValue={currentQuery || ""}
            placeholder="Search startups..."
            aria-label="Search startups"
            onKeyDown={(e) => { if (e.key === "Enter") updateFilter("q", (e.target as HTMLInputElement).value); }}
            className="w-full pl-8 pr-4 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-hover)] transition-colors"
          />
        </div>
        <select aria-label="Filter by sector" value={currentSector || "all"} onChange={(e) => updateFilter("sector", e.target.value)}
          className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-[var(--border-hover)] transition-colors cursor-pointer">
          {SECTORS.map((s) => (<option key={s} value={s}>{s === "all" ? "All sectors" : s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
        </select>
        <select aria-label="Filter by stage" value={currentStage || "all"} onChange={(e) => updateFilter("stage", e.target.value)}
          className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-[var(--border-hover)] transition-colors cursor-pointer">
          {STAGES.map((s) => (<option key={s} value={s}>{s === "all" ? "All stages" : s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
        </select>
      </div>

      {/* SDG filter — independent of the other filters and fully clearable. */}
      <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]/40 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
            <Globe2 size={11} /> Impact goals
            {currentSdg.length > 0 && (
              <span className="text-[var(--text-secondary)]">· {currentSdg.length} selected</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            {preferredSdgs.length > 0 && (
              <button
                type="button"
                onClick={() => setSdg(preferredSdgs)}
                className="px-2 py-1 text-[10px] rounded border border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent-muted)] transition-colors"
              >
                My impact interests
              </button>
            )}
            {currentSdg.length > 0 && (
              <button
                type="button"
                onClick={() => setSdg([])}
                className="px-2 py-1 text-[10px] rounded border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
              >
                Clear goals
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {SDG_GOALS.map((goal) => {
            const selected = currentSdg.includes(goal.id);
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleSdg(goal.id)}
                aria-pressed={selected}
                title={goal.name}
                className={`inline-flex items-center gap-1 px-1.5 py-1 rounded border text-[10px] transition-colors ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--text)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <span
                  aria-hidden
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: sdgColor(goal.id) }}
                />
                <span className="tabular-nums">{goal.id}</span>
                <span className="hidden lg:inline">{goal.shortName}</span>
              </button>
            );
          })}
        </div>

        {currentSdg.length > 1 && (
          <label className="mt-2 inline-flex items-center gap-2 text-[10px] text-[var(--text-muted)] cursor-pointer">
            <input
              type="checkbox"
              checked={currentSdgMode === "all"}
              onChange={(e) => setMode(e.target.checked ? "all" : "any")}
              className="accent-[var(--accent)]"
            />
            Require all selected goals
          </label>
        )}
        {currentSdg.length === 0 && (
          <p className="mt-2 text-[10px] text-[var(--text-muted)]">
            No goal selected — all startups are shown. Selecting one or more narrows the list; by default a startup must match at least one.
          </p>
        )}
      </div>
    </div>
  );
}
