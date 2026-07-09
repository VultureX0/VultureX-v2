"use client";

import { useState, useEffect } from "react";
import { Heart, Check } from "lucide-react";

export function InterestButton({ startupId, startupName }: { startupId: string; startupName: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  // Check if already sent interest on mount
  useEffect(() => {
    fetch("/api/interest")
      .then(r => r.json())
      .then(data => {
        const alreadySent = (data.interests || []).some(
          (i: { startupId?: string }) => i.startupId === startupId
        );
        if (alreadySent) setSent(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [startupId]);

  async function handleInterest() {
    setLoading(true);
    try {
      const res = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId, message: message || null }),
      });
      if (res.ok) setSent(true);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  if (checking) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 text-xs text-[var(--text-muted)] border border-[var(--border)] rounded-md">
        Loading...
      </div>
    );
  }

  if (sent) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[var(--green-muted)] text-[var(--green)] rounded-md border border-[var(--green)]/20">
        <Check size={12} /> Interest sent
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => (showMessage ? handleInterest() : setShowMessage(true))}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[var(--accent)] text-[#171717] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
        >
          <Heart size={12} />
          {loading ? "Sending..." : "I'm Interested"}
        </button>
        {showMessage && !loading && (
          <button onClick={handleInterest} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
            Skip & send
          </button>
        )}
      </div>
      {showMessage && (
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional: Add a short note..."
          className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-hover)] transition-colors"
          onKeyDown={(e) => { if (e.key === "Enter") handleInterest(); }}
        />
      )}
    </div>
  );
}
