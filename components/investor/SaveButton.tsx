"use client";

import { useState, useEffect } from "react";
import { Bookmark, Check, Loader2 } from "lucide-react";

export function SaveButton({ startupId }: { startupId: string }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if already bookmarked on mount
  useEffect(() => {
    fetch("/api/bookmarks")
      .then(r => r.json())
      .then(data => {
        const alreadySaved = (data.bookmarks || []).some(
          (b: { startupId?: string }) => b.startupId === startupId
        );
        if (alreadySaved) setSaved(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [startupId]);

  async function toggle() {
    setLoading(true);
    try {
      if (saved) {
        await fetch("/api/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startupId }),
        });
        setSaved(false);
      } else {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startupId }),
        });
        setSaved(true);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  if (checking) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--text-muted)] border border-[var(--border)] rounded-md">
        <Loader2 size={10} className="animate-spin" />
      </span>
    );
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50 ${
        saved
          ? "border-[var(--accent)]/20 bg-[var(--accent-muted)] text-[var(--accent)]"
          : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
      }`}>
      {loading ? <Loader2 size={11} className="animate-spin" /> : saved ? <Check size={11} /> : <Bookmark size={11} />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
