"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

const SECTORS = ["all", "saas", "fintech", "ai/ml", "healthtech", "edtech", "climate", "e-commerce", "marketplace"];
const STAGES = ["all", "pre-seed", "seed", "series-a", "series-b", "growth"];

export function ExploreFilters({ currentSector, currentStage, currentQuery }: { currentSector?: string; currentStage?: string; currentQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") { params.set(key, value); } else { params.delete(key); }
    router.push(`/explore?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
        <input
          type="text"
          defaultValue={currentQuery || ""}
          placeholder="Search startups..."
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
  );
}
