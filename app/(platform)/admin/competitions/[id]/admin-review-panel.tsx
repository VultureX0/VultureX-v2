"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  PlayCircle,
  Send,
  ShieldCheck,
  Trophy,
  XCircle,
} from "lucide-react";

type Action =
  | "approve"
  | "reject"
  | "request_changes"
  | "publish"
  | "start_evaluation"
  | "complete";

export function AdminReviewPanel({
  competitionId,
  status,
  publishedAt,
  winnerStatus,
  hasWinners,
  phase,
}: {
  competitionId: string;
  status: string;
  publishedAt: string | null;
  winnerStatus: string;
  hasWinners: boolean;
  phase: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function run(action: Action, endpoint = "review") {
    setBusy(action);
    setError("");
    setNotice("");
    try {
      const url =
        endpoint === "winner"
          ? `/api/admin/competitions/${competitionId}/winner-approval`
          : `/api/admin/competitions/${competitionId}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not complete that action.");
        return;
      }
      setNotice(
        action === "publish"
          ? `Published. ${data.notified ?? 0} startups notified.`
          : "Decision recorded."
      );
      setNote("");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const needsNote = status === "pending_review" || winnerStatus === "pending_approval";

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
        <ShieldCheck size={12} /> Admin actions
      </h2>

      {error && (
        <div className="rounded-lg border border-[var(--red)]/30 bg-[var(--red-muted)] px-3 py-2 mb-3">
          <p className="text-[11px] text-[var(--red)]">{error}</p>
        </div>
      )}
      {notice && (
        <div className="rounded-lg border border-[var(--green)]/30 bg-[var(--green-muted)] px-3 py-2 mb-3">
          <p className="text-[11px] text-[var(--green)]">{notice}</p>
        </div>
      )}

      {needsNote && (
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Decision note (required to reject or request changes)"
          className="w-full px-3 py-2 mb-3 text-xs rounded-md border border-[var(--border)] bg-[var(--bg)] resize-none"
        />
      )}

      <div className="flex flex-wrap gap-2">
        {status === "pending_review" && (
          <>
            <button
              type="button"
              onClick={() => run("approve")}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
            >
              {busy === "approve" ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <CheckCircle2 size={10} />
              )}
              Approve
            </button>
            <button
              type="button"
              onClick={() => run("request_changes")}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] border border-[var(--amber)]/40 text-[var(--amber)] rounded-md hover:bg-[var(--amber-muted)] disabled:opacity-50 transition-colors"
            >
              <Send size={10} /> Request changes
            </button>
            <button
              type="button"
              onClick={() => run("reject")}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] border border-[var(--red)]/30 text-[var(--red)] rounded-md hover:bg-[var(--red-muted)] disabled:opacity-50 transition-colors"
            >
              <XCircle size={10} /> Reject
            </button>
          </>
        )}

        {status === "approved" && !publishedAt && (
          <button
            type="button"
            onClick={() => run("publish")}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
          >
            {busy === "publish" ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <Trophy size={10} />
            )}
            Publish &amp; notify startups
          </button>
        )}

        {(status === "open" || status === "closed") && (
          <button
            type="button"
            onClick={() => run("start_evaluation")}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] border border-[var(--border)] text-[var(--text-muted)] rounded-md hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] disabled:opacity-50 transition-colors"
          >
            <PlayCircle size={10} /> Start evaluation
          </button>
        )}

        {status !== "completed" && winnerStatus === "approved" && (
          <button
            type="button"
            onClick={() => run("complete")}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] border border-[var(--border)] text-[var(--text-muted)] rounded-md hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] disabled:opacity-50 transition-colors"
          >
            <CheckCircle2 size={10} /> Mark completed
          </button>
        )}
      </div>

      {winnerStatus === "pending_approval" && hasWinners && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <p className="text-[11px] font-medium text-[var(--amber)] mb-2">
            Winner announcement awaiting approval
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => run("approve", "winner")}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
            >
              {busy === "approve" ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <CheckCircle2 size={10} />
              )}
              Approve &amp; publish winners
            </button>
            <button
              type="button"
              onClick={() => run("request_changes", "winner")}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] border border-[var(--amber)]/40 text-[var(--amber)] rounded-md hover:bg-[var(--amber-muted)] disabled:opacity-50 transition-colors"
            >
              <Send size={10} /> Request changes
            </button>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-2">
            Results stay private until approved. Approval publishes them to Past
            Winners and notifies the host and winning startups.
          </p>
        </div>
      )}

      <p className="text-[10px] text-[var(--text-muted)] mt-3">
        Phase: {phase.replace(/_/g, " ")} · Only admin accounts can perform these
        actions.
      </p>
    </section>
  );
}
