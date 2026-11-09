"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Info,
  Loader2,
  Trophy,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { APPLICATION_STATUS_LABELS } from "@/features/competitions/types";
import { formatDate } from "@/features/competitions/format";
import type { EligibilityResult } from "@/features/competitions/eligibility";

type Application = {
  id: string;
  status: string;
  coverNote: string | null;
  submittedAt: string;
  decidedAt: string | null;
} | null;

function eligibilityBox(eligibility: EligibilityResult) {
  if (eligibility.status === "eligible" || eligibility.status === "open") {
    return {
      tone: "green" as const,
      icon: CheckCircle2,
      title: "You appear eligible",
    };
  }
  if (eligibility.status === "ineligible") {
    return {
      tone: "red" as const,
      icon: XCircle,
      title: "You appear ineligible",
    };
  }
  return {
    tone: "amber" as const,
    icon: AlertCircle,
    title: "We need a little more information",
  };
}

export function ApplyPanel({
  competitionId,
  role,
  canApply,
  application,
  eligibility,
  deadline,
  opensAt,
  phase,
  status,
}: {
  competitionId: string;
  role: string | null;
  canApply: boolean;
  application: Application;
  eligibility: EligibilityResult | null;
  deadline: string | null;
  opensAt: string | null;
  phase: string;
  status: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm">("idle");
  const [coverNote, setCoverNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function apply() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/competitions/${competitionId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverNote }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not submit your application.");
        return;
      }
      setStep("idle");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function withdraw() {
    if (!application) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/competitions/applications/${application.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "withdraw" }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not withdraw your application.");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (role !== "startup") {
    if (!role) {
      return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            Sign in with a startup account to apply using your VultureX profile.
          </p>
          <Link
            href={`/login?callbackUrl=/competitions/${competitionId}`}
            className="block text-center px-4 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors"
          >
            Sign in to apply
          </Link>
        </div>
      );
    }
    return null;
  }

  if (application) {
    const withdrawable =
      canApply &&
      ["submitted", "under_review", "shortlisted"].includes(application.status);
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs font-medium">Your application</p>
          <Badge
            variant={
              application.status === "accepted"
                ? "green"
                : application.status === "rejected"
                  ? "default"
                  : "accent"
            }
          >
            {APPLICATION_STATUS_LABELS[application.status] ?? application.status}
          </Badge>
        </div>
        <p className="text-[10px] text-[var(--text-muted)]">
          Submitted {formatDate(application.submittedAt)}
          {application.decidedAt
            ? ` · decision ${formatDate(application.decidedAt)}`
            : ""}
        </p>
        {application.coverNote && (
          <p className="text-[11px] text-[var(--text-secondary)] mt-2 italic">
            &ldquo;{application.coverNote}&rdquo;
          </p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <Link
            href="/competitions/applications"
            className="px-3 py-1.5 text-[11px] border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
          >
            All applications
          </Link>
          {withdrawable && (
            <button
              type="button"
              onClick={withdraw}
              disabled={loading}
              className="px-3 py-1.5 text-[11px] text-[var(--red)] hover:bg-[var(--red-muted)] rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? "Withdrawing..." : "Withdraw"}
            </button>
          )}
        </div>
        {error && <p className="text-[10px] text-[var(--red)] mt-2">{error}</p>}
      </div>
    );
  }

  if (!canApply) {
    const upcoming = phase === "upcoming";
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <p className="text-xs font-medium mb-1">
          {upcoming ? "Applications have not opened yet" : "Applications are closed"}
        </p>
        <p className="text-[10px] text-[var(--text-muted)]">
          {upcoming
            ? `This competition opens on ${formatDate(opensAt)}.`
            : status === "completed"
              ? "This competition has finished."
              : deadline
                ? `The deadline was ${formatDate(deadline)}.`
                : "This competition is not accepting applications."}
        </p>
      </div>
    );
  }

  const box = eligibility ? eligibilityBox(eligibility) : null;
  const Icon = box?.icon ?? Info;
  const toneClass =
    box?.tone === "green"
      ? "border-[var(--green)]/30 bg-[var(--green-muted)] text-[var(--green)]"
      : box?.tone === "red"
        ? "border-[var(--red)]/30 bg-[var(--red-muted)] text-[var(--red)]"
        : "border-[var(--amber)]/30 bg-[var(--amber-muted)] text-[var(--amber)]";
  const blocked = eligibility?.status === "ineligible";
  const needsInfo = eligibility?.status === "needs_info";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <p className="text-xs font-medium mb-2">Apply with your startup</p>

      {box && eligibility && (
        <div className={`rounded-lg border px-3 py-2.5 mb-3 ${toneClass}`}>
          <p className="text-[11px] font-medium flex items-center gap-1.5">
            <Icon size={12} /> {box.title}
          </p>
          <ul className="mt-1.5 space-y-1">
            {eligibility.reasons.map((reason) => (
              <li
                key={reason}
                className="text-[10px] leading-relaxed text-[var(--text-secondary)]"
              >
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {needsInfo && (
        <Link
          href="/settings"
          className="block text-center px-4 py-2 mb-2 text-xs font-medium border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
        >
          Update startup profile
        </Link>
      )}

      {step === "idle" ? (
        <button
          type="button"
          onClick={() => setStep("confirm")}
          disabled={blocked || needsInfo}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trophy size={12} /> Apply now
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-[var(--border)] px-3 py-2">
            <p className="text-[10px] text-[var(--text-muted)]">
              Your application uses your existing VultureX startup profile. Add a
              short note for the host (optional).
            </p>
          </div>
          <textarea
            value={coverNote}
            onChange={(event) => setCoverNote(event.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Why is your startup a fit for this competition?"
            className="w-full px-3 py-2 text-xs rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={apply}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Confirm application
            </button>
            <button
              type="button"
              onClick={() => setStep("idle")}
              disabled={loading}
              className="px-3 py-2 text-xs border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-[10px] text-[var(--red)] mt-2">{error}</p>}
    </div>
  );
}
