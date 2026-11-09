"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, X } from "lucide-react";

type Action = "verified" | "rejected" | "changes_requested";

export function ImpactReviewControls({
  claimId,
  currentStatus,
}: {
  claimId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function review(action: Action) {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/impact/${claimId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        setError(payload.error || "Could not save the review");
        return;
      }
      setNote("");
      startTransition(() => router.refresh());
    } catch {
      setError("Could not save the review");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/30 p-3">
      <label className="block text-[10px] text-[var(--text-muted)] mb-1">
        Reviewer note {currentStatus === "verified" ? "(optional)" : "(required for rejection / more info)"}
      </label>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={2}
        maxLength={2000}
        placeholder="What was reviewed, and why this decision?"
        className="w-full px-2.5 py-2 text-xs rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--border-hover)] resize-none"
      />

      <div className="flex flex-wrap gap-2 mt-2">
        <button
          type="button"
          onClick={() => review("verified")}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded-md bg-[var(--accent-fill)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
        >
          {busy === "verified" ? <Loader2 size={9} className="animate-spin" /> : <Check size={9} />}
          Verify impact
        </button>
        <button
          type="button"
          onClick={() => review("changes_requested")}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded-md border border-[var(--amber)]/40 text-[var(--amber)] hover:bg-[var(--amber-muted)] disabled:opacity-50 transition-colors"
        >
          {busy === "changes_requested" ? <Loader2 size={9} className="animate-spin" /> : <RotateCcw size={9} />}
          Request more info
        </button>
        <button
          type="button"
          onClick={() => review("rejected")}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded-md border border-[var(--red)]/40 text-[var(--red)] hover:bg-[var(--red-muted)] disabled:opacity-50 transition-colors"
        >
          {busy === "rejected" ? <Loader2 size={9} className="animate-spin" /> : <X size={9} />}
          Reject
        </button>
      </div>

      {error && <p className="mt-2 text-[10px] text-[var(--red)]">{error}</p>}
      <p className="mt-2 text-[9px] text-[var(--text-muted)]">
        Verification applies to the submitted claim snapshot. If the founder changes
        their goals or impact description afterwards, it stops counting as verified
        until reviewed again.
      </p>
    </div>
  );
}
