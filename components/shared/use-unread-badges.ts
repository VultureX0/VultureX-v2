"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type BadgeCounts = {
  messages: number;
  notifications: number;
  pendingRequests: number;
};

const EMPTY: BadgeCounts = { messages: 0, notifications: 0, pendingRequests: 0 };

/** Broadcast after any action that changes unread state. */
export function refreshBadges() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vx:badges"));
  }
}

/**
 * Lightweight polling for sidebar badges. Refreshes every 20s, when the tab
 * regains focus and immediately after local actions (via `vx:badges`).
 */
export function useUnreadBadges(enabled = true) {
  const [counts, setCounts] = useState<BadgeCounts>(EMPTY);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (!enabled || inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetch("/api/messages/unread", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Partial<BadgeCounts>;
      setCounts({
        messages: Number(data.messages ?? 0),
        notifications: Number(data.notifications ?? 0),
        pendingRequests: Number(data.pendingRequests ?? 0),
      });
    } catch {
      /* keep the last known counts */
    } finally {
      inFlight.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/messages/unread", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Partial<BadgeCounts> | null) => {
        if (!cancelled && data) {
          setCounts({
            messages: Number(data.messages ?? 0),
            notifications: Number(data.notifications ?? 0),
            pendingRequests: Number(data.pendingRequests ?? 0),
          });
        }
      })
      .catch(() => {});
    const interval = window.setInterval(load, 20000);
    const onRefresh = () => void load();
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener("vx:badges", onRefresh);
    window.addEventListener("focus", onRefresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("vx:badges", onRefresh);
      window.removeEventListener("focus", onRefresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, load]);

  return counts;
}
