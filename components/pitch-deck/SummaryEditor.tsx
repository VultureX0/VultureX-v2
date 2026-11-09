"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Check, Loader2, Pencil, Save, ShieldCheck, Undo2, Info,
} from "lucide-react";
import type { DeckSummary, SummaryField } from "@/features/pitch-deck/summary";

type Props = {
  requestId: string;
  requestTitle: string;
  startupName: string;
  initialSummary: DeckSummary;
  approvedSummary: DeckSummary | null;
  status: string;
  changedSinceApproval: boolean;
  approvedAt: string | null;
};

const SOURCE_LABEL: Record<SummaryField["source"], string> = {
  profile: "Profile",
  questionnaire: "Questionnaire",
  merged: "Profile + questionnaire",
  missing: "Missing",
};

export function SummaryEditor({
  requestId,
  requestTitle,
  startupName,
  initialSummary,
  approvedSummary,
  status,
  changedSinceApproval,
  approvedAt,
}: Props) {
  const router = useRouter();
  const [summary, setSummary] = useState<DeckSummary>(initialSummary);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [editing, setEditing] = useState(status === "pending_approval" || status === "incomplete");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const initialJson = useMemo(() => JSON.stringify(initialSummary), [initialSummary]);
  const dirty = JSON.stringify(summary) !== initialJson;

  const isApproved = status === "approved" || status === "in_progress" || status === "completed";

  function updateField(sectionId: string, fieldId: string, value: string) {
    setSummary((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              fields: section.fields.map((f) =>
                f.id !== fieldId ? f : { ...f, value, missing: !value.trim() },
              ),
            },
      ),
    }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/pitch-deck/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_summary", summary }),
      });
      if (!res.ok) throw new Error();
      setMessage("Summary saved. Your startup profile was not changed.");
      router.refresh();
    } catch {
      setError("Couldn't save the summary. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function approve() {
    if (approving) return;
    setApproving(true);
    setError("");
    setMessage("");
    try {
      // The current (possibly edited) summary is sent with the approval, so an
      // unsaved edit can never be silently left out of the approved version.
      const res = await fetch(`/api/pitch-deck/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", summary }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Approval failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setApproving(false);
    }
  }

  async function reopen() {
    setApproving(true);
    try {
      await fetch(`/api/pitch-deck/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revise" }),
      });
      setEditing(true);
      setMessage("Summary reopened. Our team will see that it changed since approval.");
      router.refresh();
    } finally {
      setApproving(false);
    }
  }

  const approvedAtLabel = approvedAt ? new Date(approvedAt).toLocaleString() : null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-semibold">Review your summary</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {startupName} · {requestTitle}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-2 max-w-xl">
            This combines your existing startup profile with everything you just submitted. Edit any
            field before you approve — your original profile stays untouched.
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          {isApproved && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border bg-[var(--green-muted)] text-[var(--green)] border-[var(--green)]/30">
              Approved{approvedAtLabel ? ` ${approvedAtLabel}` : ""}
            </span>
          )}
          {changedSinceApproval && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border bg-[var(--red-muted)] text-[var(--red)] border-[var(--red)]/30">
              Changed since approval
            </span>
          )}
        </div>
      </div>

      {status === "completed" && (
        <div className="mb-5 px-4 py-3 rounded-md border border-[var(--green)]/30 bg-[var(--green-muted)] text-xs text-[var(--green)]">
          <p className="font-medium mb-1">Your startup information has been submitted successfully.</p>
          <p>
            Our team is preparing your pitch deck. Please check your dashboard again within 24–48
            hours.
          </p>
        </div>
      )}

      {status === "approved" && !changedSinceApproval && (
        <div className="mb-5 px-4 py-3 rounded-md border border-[var(--accent)]/30 bg-[var(--accent-muted)] text-xs text-[var(--accent)]">
          <p className="font-medium mb-1">Your startup information has been submitted successfully.</p>
          <p>
            Our team is preparing your pitch deck. Please check your dashboard again within 24–48
            hours. Status: <strong>Pitch Deck In Progress</strong>.
          </p>
        </div>
      )}

      {(status === "in_progress" || (status === "approved" && changedSinceApproval)) && (
        <div className="mb-5 px-4 py-3 rounded-md border border-[var(--amber)]/30 bg-[var(--amber-muted)] text-xs text-[var(--amber)]">
          <p className="font-medium mb-1">
            {changedSinceApproval ? "This summary changed after approval" : "Pitch Deck In Progress"}
          </p>
          <p>
            {changedSinceApproval
              ? "Your edits are saved. Reopen and re-approve the summary so our team works from the corrected version."
              : "Our team is preparing your pitch deck. Please check your dashboard again within 24–48 hours."}
          </p>
        </div>
      )}

      {summary.warnings.length > 0 && (
        <div className="mb-5 rounded-md border border-[var(--border)] bg-[var(--bg-card)] divide-y divide-[var(--border)]">
          <div className="px-4 py-2.5 flex items-center gap-2">
            <AlertTriangle size={12} className="text-[var(--amber)]" />
            <p className="text-[11px] font-medium text-[var(--text-secondary)]">
              {summary.warnings.length} item{summary.warnings.length === 1 ? "" : "s"} to review
            </p>
          </div>
          <ul className="px-4 py-2.5 space-y-1">
            {summary.warnings.map((w, i) => (
              <li key={i} className="text-[11px] text-[var(--text-muted)] flex gap-2">
                <span className="text-[var(--amber)]">•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <div className="mb-4 px-3 py-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-[11px] text-[var(--text-secondary)]">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 px-3 py-2.5 rounded-md border border-[var(--red)]/30 bg-[var(--red-muted)] text-[11px] text-[var(--red)]">
          {error}
        </div>
      )}

      {isApproved && !editing ? (
        <ReadOnlySummary summary={approvedSummary ?? summary} />
      ) : (
        <div className="space-y-4">
          {summary.sections.map((section) => (
            <section key={section.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="px-5 py-3.5 border-b border-[var(--border)]">
                <h2 className="text-xs font-medium">{section.title}</h2>
                {section.description && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{section.description}</p>
                )}
              </div>
              <div className="divide-y divide-[var(--border)]">
                {section.fields.map((field) => (
                  <div key={field.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label className="text-[10px] text-[var(--text-muted)]">{field.label}</label>
                      <div className="flex items-center gap-1.5">
                        {field.conflict && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[var(--red-muted)] text-[var(--red)]">
                            Check this
                          </span>
                        )}
                        {field.missing && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                            Missing
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                          {SOURCE_LABEL[field.source]}
                        </span>
                      </div>
                    </div>

                    {editing ? (
                      <textarea
                        value={field.value}
                        rows={field.value.length > 120 ? 4 : 2}
                        onChange={(e) => updateField(section.id, field.id, e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] transition-colors resize-none"
                      />
                    ) : (
                      <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">{field.value}</p>
                    )}

                    {field.note && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-1.5 flex gap-1.5">
                        <Info size={10} className="mt-0.5 shrink-0" />
                        {field.note}
                      </p>
                    )}
                    {field.conflict && (
                      <p className="text-[10px] text-[var(--red)] mt-1.5">
                        {field.conflict.message} (profile: {field.conflict.profile || "—"} ·
                        questionnaire: {field.conflict.questionnaire || "—"})
                      </p>
                    )}
                    {field.profileValue && field.questionnaireValue &&
                      field.profileValue !== field.questionnaireValue && !field.conflict && (
                        <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                          Profile said: “{field.profileValue}” · Questionnaire said: “
                          {field.questionnaireValue}”
                        </p>
                      )}
                    {field.fileId && (
                      <a
                        href={`/api/files/${field.fileId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-1.5 text-[10px] text-[var(--accent)] hover:underline"
                      >
                        View the screenshot you attached
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="sticky bottom-0 mt-6 -mx-1 px-1 py-3 bg-[var(--bg)]/95 backdrop-blur border-t border-[var(--border)] flex items-center justify-between gap-3">
        <div className="text-[10px] text-[var(--text-muted)]">
          {dirty ? "You have unsaved edits." : "All changes saved."}
        </div>
        <div className="flex items-center gap-2">
          {!isApproved && (
            <>
              <button
                onClick={save}
                disabled={saving || !dirty}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] disabled:opacity-40 transition-colors"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save
              </button>
              <button
                onClick={approve}
                disabled={approving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
              >
                {approving ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                Approve Summary
              </button>
            </>
          )}

          {isApproved && !editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
              >
                <Pencil size={12} /> Edit (needs re-approval)
              </button>
              <button
                onClick={reopen}
                disabled={approving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
              >
                <Undo2 size={12} /> Reopen &amp; re-approve
              </button>
            </>
          )}

          {editing && isApproved && (
            <button
              onClick={approve}
              disabled={approving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
            >
              <Check size={12} /> Save &amp; re-approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadOnlySummary({ summary }: { summary: DeckSummary }) {
  return (
    <div className="space-y-4">
      {summary.sections.map((section) => (
        <section key={section.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="px-5 py-3.5 border-b border-[var(--border)]">
            <h2 className="text-xs font-medium">{section.title}</h2>
          </div>
          <dl className="divide-y divide-[var(--border)]">
            {section.fields.map((field) => (
              <div key={field.id} className="px-5 py-3 grid grid-cols-3 gap-3">
                <dt className="text-[10px] text-[var(--text-muted)]">{field.label}</dt>
                <dd className="col-span-2 text-xs text-[var(--text-secondary)] whitespace-pre-line">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
