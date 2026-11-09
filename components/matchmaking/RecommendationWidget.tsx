"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { RecommendationCard } from "./RecommendationCard";
import type { RecommendationItem } from "@/features/matchmaking/service";

type Props = {
  items: RecommendationItem[];
  total: number;
};

/**
 * Dashboard surface for business matchmaking. The list is already
 * personalized on the server; this component only handles the two user actions
 * (dismiss / save) and keeps the visible cards in sync.
 */
export function RecommendationWidget({ items, total }: Props) {
  const [visible, setVisible] = useState(items);
  const [count, setCount] = useState(total);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function act(
    item: RecommendationItem,
    action: "dismiss" | "save" | "unsave"
  ) {
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

      if (action === "dismiss") {
        setVisible((previous) => previous.filter((entry) => entry.id !== item.id));
        setCount((previous) => Math.max(0, previous - 1));
      } else {
        setVisible((previous) =>
          previous.map((entry) =>
            entry.id === item.id
              ? { ...entry, savedAt: action === "save" ? new Date().toISOString() : null }
              : entry
          )
        );
      }
      window.dispatchEvent(new Event("vx:badges"));
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

  return (
    <section aria-labelledby="recommended-connections" className="shrink-0">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2
            id="recommended-connections"
            className="text-xs font-medium flex items-center gap-1.5"
          >
            <Sparkles size={12} className="text-[var(--accent)]" />
            Recommended Connections
          </h2>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
            Discover startups that could help your business grow.
          </p>
        </div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--accent)] hover:underline whitespace-nowrap"
        >
          View all recommendations <ArrowRight size={10} />
        </Link>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--red)]/30 bg-[var(--red-muted)] px-3 py-2 mb-3">
          <p className="text-[10px] text-[var(--red)]">{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--red)] hover:underline"
          >
            <RefreshCw size={9} /> Dismiss
          </button>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-6 text-center">
          <p className="text-xs font-medium">No recommendations yet</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1 max-w-md mx-auto leading-relaxed">
            Recommendations will appear here as relevant startups join or update
            their profiles. Adding what your business offers and needs helps us
            find better matches.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 mt-3 text-[10px] font-medium text-[var(--accent)] hover:underline"
          >
            Add business details <ArrowRight size={10} />
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {visible.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                variant="compact"
                busy={busyId === item.id}
                onDismiss={(entry) => void act(entry, "dismiss")}
                onToggleSave={(entry) =>
                  void act(entry, entry.savedAt ? "unsave" : "save")
                }
              />
            ))}
          </div>
          {count > visible.length && (
            <Link
              href="/discover"
              className="inline-flex items-center gap-1 mt-2 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              {count - visible.length} more recommendation
              {count - visible.length === 1 ? "" : "s"} on Discover Connections
              <ArrowRight size={9} />
            </Link>
          )}
        </>
      )}
    </section>
  );
}
