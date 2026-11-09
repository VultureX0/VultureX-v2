"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Star,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { SdgChips } from "@/components/sdg/SdgChips";
import { APPLICATION_STATUS_LABELS } from "@/features/competitions/types";
import { formatDate, formatMoney, mrrToUnits } from "@/features/competitions/format";
import type {
  ApplicantRow,
  CompetitionEventsRow,
  WinnerView,
} from "@/features/competitions/service";

type Criterion = { key: string; label: string; weight: number };

const STATUS_ACTIONS: {
  status: string;
  label: string;
  tone: "accent" | "green" | "red" | "default";
}[] = [
  { status: "under_review", label: "Under review", tone: "accent" },
  { status: "shortlisted", label: "Shortlist", tone: "accent" },
  { status: "accepted", label: "Select", tone: "green" },
  { status: "rejected", label: "Reject", tone: "red" },
];

function placementLabel(placement: number): string {
  if (placement === 1) return "1st";
  if (placement === 2) return "2nd";
  if (placement === 3) return "3rd";
  return `#${placement}`;
}

export function ManageClient({
  competitionId,
  phase,
  criteria,
  applicants,
  winners,
  events,
  canProposeWinners,
}: {
  competitionId: string;
  phase: string;
  criteria: Criterion[];
  applicants: ApplicantRow[];
  winners: WinnerView[];
  events: CompetitionEventsRow[];
  canProposeWinners: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [winnerFor, setWinnerFor] = useState<string | null>(null);
  const [placement, setPlacement] = useState("1");
  const [awardLabel, setAwardLabel] = useState("");
  const [prizeNote, setPrizeNote] = useState("");

  async function setStatus(applicationId: string, status: string) {
    setBusy(`${applicationId}:${status}`);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/competitions/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not update the application.");
        return;
      }
      setNotice("Application updated.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function propose(applicationId: string) {
    setBusy(`${applicationId}:winner`);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/competitions/${competitionId}/winners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          placement: Number(placement),
          awardLabel,
          prizeNote,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not propose the winner.");
        return;
      }
      setNotice("Winner proposed. It stays private until an admin approves it.");
      setWinnerFor(null);
      setAwardLabel("");
      setPrizeNote("");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function removeWinner(winnerId: string) {
    setBusy(`winner:${winnerId}`);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/competitions/winners/${winnerId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not remove the winner.");
        return;
      }
      setNotice("Proposed winner removed.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-[var(--red)]/30 bg-[var(--red-muted)] px-4 py-2.5">
          <p className="text-[11px] text-[var(--red)]">{error}</p>
        </div>
      )}
      {notice && (
        <div className="rounded-lg border border-[var(--green)]/30 bg-[var(--green-muted)] px-4 py-2.5">
          <p className="text-[11px] text-[var(--green)]">{notice}</p>
        </div>
      )}

      {winners.length > 0 && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
            <Award size={12} /> Winners
          </h2>
          <div className="space-y-2">
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2.5"
              >
                <span className="w-14 text-[10px] font-semibold text-[var(--amber)]">
                  {placementLabel(winner.placement)}
                </span>
                <Link
                  href={`/explore/${winner.startupSlug}`}
                  className="text-xs font-medium hover:text-[var(--accent)] transition-colors"
                >
                  {winner.startupName}
                </Link>
                {winner.awardLabel && (
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {winner.awardLabel}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-2">
                  <Badge
                    variant={
                      winner.status === "approved"
                        ? "green"
                        : winner.status === "changes_requested"
                          ? "default"
                          : "accent"
                    }
                  >
                    {winner.status === "approved"
                      ? "Approved · published"
                      : winner.status === "changes_requested"
                        ? "Changes requested"
                        : "Pending admin approval"}
                  </Badge>
                  {winner.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => removeWinner(winner.id)}
                      disabled={busy === `winner:${winner.id}`}
                      aria-label="Remove proposed winner"
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-3">
            Winner announcements stay private until the VultureX team approves them.
          </p>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--text-muted)]">
            Applicants ({applicants.length})
          </p>
          {!canProposeWinners && (
            <span className="text-[10px] text-[var(--text-muted)]">
              Winners can be proposed after applications close.
            </span>
          )}
        </div>

        {applicants.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] py-12 text-center">
            <p className="text-sm">No applications in this view.</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Startups are notified when the competition is published.
            </p>
          </div>
        ) : (
          applicants.map((applicant) => {
            const open = expanded === applicant.id;
            return (
              <div
                key={applicant.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/explore/${applicant.startup.slug}`}
                        className="text-sm font-medium hover:text-[var(--accent)] transition-colors"
                      >
                        {applicant.startup.name}
                      </Link>
                      <Badge
                        variant={
                          applicant.status === "accepted"
                            ? "green"
                            : applicant.status === "rejected" ||
                                applicant.status === "withdrawn"
                              ? "default"
                              : "accent"
                        }
                      >
                        {APPLICATION_STATUS_LABELS[applicant.status] ??
                          applicant.status}
                      </Badge>
                      {applicant.weightedScore !== null && (
                        <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                          Weighted score {applicant.weightedScore.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      {applicant.startup.sector} · {applicant.startup.stage}
                      {applicant.startup.location
                        ? ` · ${applicant.startup.location}`
                        : ""}
                      {applicant.startup.mrr !== null
                        ? ` · ${formatMoney(
                            mrrToUnits(applicant.startup.mrr)
                          )} MRR`
                        : ""}
                    </p>
                    {applicant.startup.tagline && (
                      <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-1">
                        {applicant.startup.tagline}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <SdgChips
                        goals={applicant.sdgGoals}
                        primary={applicant.sdgPrimary}
                        max={4}
                        showPrimaryLabel={false}
                      />
                      {applicant.impactStatus === "verified" ? (
                        <Badge variant="green">Verified impact</Badge>
                      ) : applicant.impactStatus === "pending" ? (
                        <Badge variant="accent">Impact review pending</Badge>
                      ) : null}
                    </div>
                    {applicant.coverNote && (
                      <p className="text-[11px] text-[var(--text-secondary)] mt-2 italic">
                        &ldquo;{applicant.coverNote}&rdquo;
                      </p>
                    )}
                    <p className="text-[10px] text-[var(--text-muted)] mt-2">
                      Applied {formatDate(applicant.submittedAt)}
                      {applicant.decidedAt
                        ? ` · decided ${formatDate(applicant.decidedAt)}`
                        : ""}
                    </p>
                  </div>
                  <Link
                    href={`/explore/${applicant.startup.slug}`}
                    className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-0.5"
                  >
                    View profile <ExternalLink size={8} />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                  {STATUS_ACTIONS.map((action) => (
                    <button
                      key={action.status}
                      type="button"
                      onClick={() => setStatus(applicant.id, action.status)}
                      disabled={busy !== null || applicant.status === "withdrawn"}
                      className={`px-2.5 py-1.5 text-[10px] rounded-md border transition-colors disabled:opacity-40 ${
                        action.tone === "green"
                          ? "border-[var(--green)]/30 text-[var(--green)] hover:bg-[var(--green-muted)]"
                          : action.tone === "red"
                            ? "border-[var(--red)]/30 text-[var(--red)] hover:bg-[var(--red-muted)]"
                            : action.tone === "accent"
                              ? "border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent-muted)]"
                              : "border-[var(--border)] text-[var(--text-muted)]"
                      }`}
                    >
                      {busy === `${applicant.id}:${action.status}` ? (
                        <Loader2 size={9} className="animate-spin inline" />
                      ) : action.status === "accepted" ? (
                        <Check size={9} className="inline" />
                      ) : action.status === "rejected" ? (
                        <X size={9} className="inline" />
                      ) : action.status === "shortlisted" ? (
                        <Star size={9} className="inline" />
                      ) : null}{" "}
                      {action.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : applicant.id)}
                    className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    {applicant.evaluation ? "Edit evaluation" : "Evaluate"}
                  </button>

                  {canProposeWinners && (
                    <button
                      type="button"
                      onClick={() =>
                        setWinnerFor(winnerFor === applicant.id ? null : applicant.id)
                      }
                      disabled={applicant.status === "withdrawn"}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] border border-[var(--amber)]/40 text-[var(--amber)] rounded-md hover:bg-[var(--amber-muted)] transition-colors disabled:opacity-40"
                    >
                      <Trophy size={10} /> Propose winner
                    </button>
                  )}
                </div>

                {winnerFor === applicant.id && (
                  <div className="mt-3 rounded-lg border border-[var(--amber)]/30 bg-[var(--amber-muted)]/20 p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-[var(--text-muted)] mb-1">
                          Placement
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={placement}
                          onChange={(event) => setPlacement(event.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded-md border border-[var(--border)] bg-[var(--bg)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[var(--text-muted)] mb-1">
                          Award label (optional)
                        </label>
                        <input
                          value={awardLabel}
                          onChange={(event) => setAwardLabel(event.target.value)}
                          placeholder="Best SDG impact"
                          className="w-full px-2 py-1.5 text-xs rounded-md border border-[var(--border)] bg-[var(--bg)]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1">
                        Prize note (optional)
                      </label>
                      <input
                        value={prizeNote}
                        onChange={(event) => setPrizeNote(event.target.value)}
                        placeholder="Equity-free grant"
                        className="w-full px-2 py-1.5 text-xs rounded-md border border-[var(--border)] bg-[var(--bg)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => propose(applicant.id)}
                      disabled={busy !== null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[var(--amber)] text-black rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {busy === `${applicant.id}:winner` ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <Trophy size={10} />
                      )}
                      Submit proposal for admin approval
                    </button>
                  </div>
                )}

                {open && (
                  <EvaluationForm
                    applicationId={applicant.id}
                    criteria={criteria}
                    initialScores={applicant.evaluation?.scores ?? {}}
                    initialNotes={applicant.evaluation?.notes ?? ""}
                    onSaved={() => {
                      setNotice("Evaluation saved.");
                      router.refresh();
                    }}
                    onError={(message) => setError(message)}
                  />
                )}
              </div>
            );
          })
        )}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3">
          Activity
        </h2>
        {events.length === 0 ? (
          <p className="text-[11px] text-[var(--text-muted)]">
            No activity recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 15).map((event) => (
              <div key={event.id} className="flex items-start gap-2 text-[10px]">
                <span className="text-[var(--text-muted)] tabular-nums shrink-0">
                  {formatDate(event.createdAt)}
                </span>
                <span className="text-[var(--text-secondary)]">
                  {event.message ?? event.type}
                </span>
                {event.actorRole && (
                  <span className="text-[var(--text-muted)] ml-auto shrink-0">
                    {event.actorRole}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-[10px] text-[var(--text-muted)]">
        Current phase: {phase.replace(/_/g, " ")} · Evaluations and notes are private
        to you and the VultureX team.
      </p>
    </div>
  );
}

function EvaluationForm({
  applicationId,
  criteria,
  initialScores,
  initialNotes,
  onSaved,
  onError,
}: {
  applicationId: string;
  criteria: Criterion[];
  initialScores: Record<string, number>;
  initialNotes: string;
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  const [scores, setScores] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const criterion of criteria) {
      initial[criterion.key] =
        initialScores[criterion.key] === undefined
          ? ""
          : String(initialScores[criterion.key]);
    }
    return initial;
  });
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  const weighted = criteria.reduce((sum, criterion) => {
    const value = Number(scores[criterion.key]);
    return sum + (Number.isFinite(value) ? value * criterion.weight : 0);
  }, 0);
  const preview = Math.round((weighted / 100) * 100) / 100;

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/competitions/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          scores: Object.fromEntries(
            criteria.map((criterion) => [
              criterion.key,
              Number(scores[criterion.key]),
            ])
          ),
          notes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(data.error ?? "Could not save the evaluation.");
        return;
      }
      onSaved();
    } catch {
      onError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
      <div className="space-y-2">
        {criteria.map((criterion) => (
          <div key={criterion.key} className="flex items-center gap-2">
            <span className="text-[11px] flex-1">
              {criterion.label}{" "}
              <span className="text-[var(--text-muted)]">
                ({Math.round(criterion.weight)}%)
              </span>
            </span>
            <input
              type="number"
              min={0}
              max={100}
              value={scores[criterion.key] ?? ""}
              onChange={(event) =>
                setScores((prev) => ({
                  ...prev,
                  [criterion.key]: event.target.value,
                }))
              }
              placeholder="0-100"
              className="w-20 px-2 py-1 text-xs text-right rounded-md border border-[var(--border)] bg-[var(--bg-card)]"
            />
          </div>
        ))}
      </div>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={3}
        placeholder="Private evaluator notes (never shown to startups)"
        className="w-full mt-3 px-2 py-1.5 text-xs rounded-md border border-[var(--border)] bg-[var(--bg-card)] resize-none"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-[var(--text-muted)]">
          Weighted score: <span className="tabular-nums">{preview || "—"}</span>
        </span>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 size={10} className="animate-spin" />}
          Save evaluation
        </button>
      </div>
    </div>
  );
}
