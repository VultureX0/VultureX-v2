"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Clock, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  IMPACT_METHODOLOGY_NOTE,
  IMPACT_STATUS_LABELS,
  impactStatusTone,
  type ImpactStatus,
} from "@/features/sdg/status";

type Props = {
  status: ImpactStatus;
  reviewNote: string | null;
  submittedAt: string | null;
  successFee: { eligible: boolean; label: string; reason: string };
  hasGoals: boolean;
  descriptionLength: number;
  /** Unsaved edits: review always reads the saved profile, so saving comes first. */
  dirty: boolean;
};

const TONE_CLASS: Record<string, string> = {
  green: "text-[var(--green)] border-[var(--green)]/40 bg-[var(--green-muted)]",
  accent: "text-[var(--accent)] border-[var(--accent)]/40 bg-[var(--accent-muted)]",
  amber: "text-[var(--amber)] border-[var(--amber)]/40 bg-[var(--amber-muted)]",
  red: "text-[var(--red)] border-[var(--red)]/40 bg-[var(--red-muted)]",
  default: "text-[var(--text-muted)] border-[var(--border)] bg-[var(--bg-elevated)]/40",
};

/**
 * Startup view of the impact verification lifecycle. Submit/withdraw call the
 * server route, which resolves the startup from the session — the client can
 * never mark a claim verified or act on another startup.
 */
export function ImpactVerificationCard({
  status,
  reviewNote,
  submittedAt,
  successFee,
  hasGoals,
  descriptionLength,
  dirty,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"submit" | "withdraw" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const canSubmit = status !== "verified" && hasGoals && descriptionLength >= 40 && !dirty;

  async function act(action: "submit" | "withdraw") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch("/api/impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        setError(payload.error || "Something went wrong");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  const tone = impactStatusTone(status);
  const Icon =
    status === "verified"
      ? ShieldCheck
      : status === "pending"
        ? Clock
        : status === "stale" || status === "rejected" || status === "changes_requested"
          ? ShieldAlert
          : BadgeCheck;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-[11px] font-medium">Impact verification</p>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] ${TONE_CLASS[tone]}`}
        >
          <Icon size={10} /> {IMPACT_STATUS_LABELS[status]}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 text-[10px]">
        <span className="text-[var(--text-muted)]">Current success fee</span>
        <span
          className={`font-semibold tabular-nums ${
            successFee.eligible ? "text-[var(--green)]" : "text-[var(--text-secondary)]"
          }`}
        >
          {successFee.label}
        </span>
      </div>
      <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mt-1">
        {successFee.reason}
      </p>

      {reviewNote && (
        <p className="mt-2 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-2 text-[10px] text-[var(--text-secondary)]">
          <span className="text-[var(--text-muted)]">Reviewer note: </span>
          {reviewNote}
        </p>
      )}

      {submittedAt && (
        <p className="mt-2 text-[10px] text-[var(--text-muted)]">
          Submitted {new Date(submittedAt).toLocaleDateString()}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {status === "pending" ? (
          <button
            type="button"
            onClick={() => act("withdraw")}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors disabled:opacity-50"
          >
            {busy === "withdraw" && <Loader2 size={10} className="animate-spin" />}
            Withdraw request
          </button>
        ) : (
          <button
            type="button"
            onClick={() => act("submit")}
            disabled={!canSubmit || busy !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy === "submit" && <Loader2 size={10} className="animate-spin" />}
            {status === "verified" ? "Claim verified" : "Request verification"}
          </button>
        )}

        {!hasGoals && (
          <span className="text-[10px] text-[var(--text-muted)]">
            Select at least one goal to request review
          </span>
        )}
        {hasGoals && descriptionLength < 40 && (
          <span className="text-[10px] text-[var(--text-muted)]">
            Add an impact description (40+ characters)
          </span>
        )}
        {dirty && hasGoals && descriptionLength >= 40 && (
          <span className="text-[10px] text-[var(--text-muted)]">
            Save your changes before requesting review
          </span>
        )}
      </div>

      {error && <p className="mt-2 text-[10px] text-[var(--red)]">{error}</p>}

      <p className="mt-3 text-[9px] leading-relaxed text-[var(--text-muted)]">
        {IMPACT_METHODOLOGY_NOTE}
      </p>
    </div>
  );
}
