"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw, Settings2, Sparkles } from "lucide-react";
import { RecommendationCard } from "@/components/matchmaking/RecommendationCard";
import type {
  RecommendationItem,
  RecommendationPage,
} from "@/features/matchmaking/service";
import {
  MATCH_RELATIONSHIP_LABELS,
  MATCH_STRENGTH_LABELS,
  type MatchRelationshipType,
  type MatchStrength,
} from "@/features/matchmaking/types";

type View = "all" | "saved" | "dismissed";

type Props = { initial: RecommendationPage };

const SELECT_CLASS =
  "px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[11px] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-hover)] transition-colors";

export function DiscoverClient({ initial }: Props) {
  const [items, setItems] = useState<RecommendationItem[]>(initial.items);
  const [page, setPage] = useState(initial.page);
  const [total, setTotal] = useState(initial.total);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [counts, setCounts] = useState(initial.counts);
  const [facets, setFacets] = useState(initial.facets);

  const [view, setView] = useState<View>("all");
  const [strength, setStrength] = useState<MatchStrength | "all">("all");
  const [relationshipType, setRelationshipType] = useState("all");
  const [sector, setSector] = useState("all");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const firstRender = useRef(true);

  const load = useCallback(
    async (targetPage: number, replace: boolean) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          view,
          strength,
          type: relationshipType,
          sector,
          page: String(targetPage),
          limit: "12",
        });
        const response = await fetch(`/api/recommendations?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load recommendations.");
        }
        const next = payload as RecommendationPage;
        setItems((previous) =>
          replace ? next.items : [...previous, ...next.items]
        );
        setPage(next.page);
        setTotal(next.total);
        setHasMore(next.hasMore);
        setCounts(next.counts);
        setFacets(next.facets);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load recommendations."
        );
      } finally {
        setLoading(false);
      }
    },
    [view, strength, relationshipType, sector]
  );

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    void load(1, true);
  }, [load]);

  async function act(item: RecommendationItem, action: "dismiss" | "restore" | "save" | "unsave") {
    if (busyId) return;
    setBusyId(item.id);
    setError("");
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStartupId: item.startup.id, action }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not update this recommendation.");
      }
      window.dispatchEvent(new Event("vx:badges"));
      await load(1, true);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Could not update this recommendation."
      );
    } finally {
      setBusyId(null);
    }
  }

  const views: { id: View; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.total },
    { id: "saved", label: "Saved", count: counts.saved },
    { id: "dismissed", label: "Dismissed", count: counts.dismissed },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex rounded-md border border-[var(--border)] p-0.5">
          {views.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setView(entry.id)}
              aria-pressed={view === entry.id}
              className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                view === entry.id
                  ? "bg-[var(--bg-elevated)] text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {entry.label}
              <span className="ml-1.5 text-[10px] tabular-nums text-[var(--text-muted)]">
                {entry.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="recommendation-strength">
            Match strength
          </label>
          <select
            id="recommendation-strength"
            value={strength}
            onChange={(event) =>
              setStrength(event.target.value as MatchStrength | "all")
            }
            className={SELECT_CLASS}
          >
            <option value="all">All match strengths</option>
            {(["high", "good", "possible"] as MatchStrength[]).map((tier) => (
              <option key={tier} value={tier}>
                {MATCH_STRENGTH_LABELS[tier]}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="recommendation-type">
            Relationship type
          </label>
          <select
            id="recommendation-type"
            value={relationshipType}
            onChange={(event) => setRelationshipType(event.target.value)}
            className={SELECT_CLASS}
            disabled={facets.relationshipTypes.length === 0}
          >
            <option value="all">All relationship types</option>
            {facets.relationshipTypes.map((value) => (
              <option key={value} value={value}>
                {MATCH_RELATIONSHIP_LABELS[value as MatchRelationshipType] ?? value}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="recommendation-sector">
            Industry
          </label>
          <select
            id="recommendation-sector"
            value={sector}
            onChange={(event) => setSector(event.target.value)}
            className={SELECT_CLASS}
            disabled={facets.sectors.length === 0}
          >
            <option value="all">All industries</option>
            {facets.sectors.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--red)]/30 bg-[var(--red-muted)] px-3 py-2">
          <p className="text-[11px] text-[var(--red)]">{error}</p>
          <button
            type="button"
            onClick={() => void load(1, true)}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--red)] hover:underline"
          >
            <RefreshCw size={10} /> Retry
          </button>
        </div>
      )}

      <p className="text-[10px] text-[var(--text-muted)]">
        {loading && items.length === 0
          ? "Finding relevant businesses…"
          : `${total} recommendation${total === 1 ? "" : "s"} based on the business details on your profile.`}
      </p>

      {loading && items.length === 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-52 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-14 text-center">
          <Sparkles size={20} className="mx-auto text-[var(--text-muted)] mb-3" />
          <p className="text-sm font-medium">
            {view === "saved"
              ? "Nothing saved yet"
              : view === "dismissed"
                ? "No dismissed recommendations"
                : "No recommendations right now"}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-sm mx-auto leading-relaxed">
            {view === "saved"
              ? "Save a recommendation to keep it here for later."
              : view === "dismissed"
                ? "Recommendations you dismiss will stay here, and you can restore them any time."
                : "Recommendations appear as relevant startups join or update their profiles. Adding what your business offers and needs helps us find better matches."}
          </p>
          {view === "all" && (
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 text-[11px] font-medium border border-[var(--border)] rounded-md text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text)] transition-colors"
            >
              <Settings2 size={11} /> Update business details
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                mode={view === "dismissed" ? "dismissed" : "default"}
                busy={busyId === item.id}
                onDismiss={(entry) => void act(entry, "dismiss")}
                onRestore={(entry) => void act(entry, "restore")}
                onToggleSave={(entry) =>
                  void act(entry, entry.savedAt ? "unsave" : "save")
                }
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex items-center justify-center pt-2">
              <button
                type="button"
                onClick={() => void load(page + 1, false)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-[var(--border)] rounded-md text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 size={11} className="animate-spin" />}
                {loading ? "Loading" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
