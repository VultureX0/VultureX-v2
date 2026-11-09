"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Check, Loader2, Plus, Trash2, Upload, AlertTriangle, Info,
} from "lucide-react";
import {
  BATCHES,
  BATCH_QUESTIONS,
  BATCH_TITLES,
  CURRENCIES,
  DESCRIPTION_MAX_WORDS,
  FUNDRAISING_STATUSES,
  UNITS,
  USE_OF_FUNDS_ROWS,
  asAllocation,
  asCompetitors,
  asMoney,
  allocationTotal,
  competitionNudge,
  countWords,
  isRequired,
  isVisible,
  marketSizeWarning,
  validateBatch,
  type Answers,
  type BatchNumber,
  type Question,
  type ValidationErrors,
} from "@/features/pitch-deck/questionnaire";

type Props = {
  requestId: string;
  initialAnswers: Answers;
  initialBatch: number;
  /** "incomplete" | "pending_approval" | ... — used to lock completed requests */
  status: string;
};

export function QuestionnaireForm({ requestId, initialAnswers, initialBatch, status }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [batch, setBatch] = useState<BatchNumber>(
    ([1, 2, 3].includes(initialBatch) ? initialBatch : 1) as BatchNumber,
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const locked = status !== "incomplete";
  const dirty = useRef(false);
  const lastSaved = useRef<string>(JSON.stringify(initialAnswers));

  const questions = BATCH_QUESTIONS[batch];
  const completedBatches = useMemo(
    () => BATCHES.filter((b) => Object.keys(validateBatch(b, answers)).length === 0),
    [answers],
  );
  const progress = Math.round((completedBatches.length / BATCHES.length) * 100);

  const setAnswer = useCallback((id: string, value: unknown) => {
    dirty.current = true;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  // ---------------------------------------------------------------- autosave
  const save = useCallback(
    async (options: { batch?: BatchNumber; silent?: boolean } = {}) => {
      if (locked) return true;
      const batchToSave = options.batch ?? batch;
      if (!dirty.current) return true;

      setSaving(true);
      try {
        const res = await fetch(`/api/pitch-deck/requests/${requestId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save_batch", batch: batchToSave, answers }),
        });
        if (!res.ok) throw new Error("save failed");
        const data = (await res.json()) as { errors?: ValidationErrors };
        dirty.current = false;
        lastSaved.current = JSON.stringify(answers);
        setSavedAt(new Date().toLocaleTimeString());
        if (!options.silent) setErrors(data.errors ?? {});
        return true;
      } catch {
        setNotice("Couldn't save just now — we'll retry. Your answers are still on screen.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [answers, batch, locked, requestId],
  );

  useEffect(() => {
    if (locked) return;
    if (!dirty.current) return;
    const t = setTimeout(() => void save({ silent: true }), 1200);
    return () => clearTimeout(t);
  }, [answers, save, locked]);

  // Warn before leaving with unsaved answers
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (dirty.current && !locked) e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [locked]);

  // ------------------------------------------------------------ navigation
  async function continueNext() {
    setNotice("");
    const batchErrors = validateBatch(batch, answers);
    setErrors(batchErrors);
    if (Object.keys(batchErrors).length > 0) {
      setNotice("Please fix the highlighted fields before continuing.");
      return;
    }
    await save({ batch });

    if (batch < 3) {
      const next = (batch + 1) as BatchNumber;
      setBatch(next);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    await submit();
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setNotice("");
    try {
      const res = await fetch(`/api/pitch-deck/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", answers }),
      });
      const data = await res.json();

      if (!res.ok) {
        const batchErrors = (data.batchErrors ?? {}) as Record<string, ValidationErrors>;
        const firstIncomplete = BATCHES.find(
          (b) => Object.keys(batchErrors[String(b)] ?? {}).length > 0,
        );
        if (firstIncomplete) {
          setBatch(firstIncomplete);
          setErrors(batchErrors[String(firstIncomplete)] ?? {});
          setNotice(`Batch ${firstIncomplete} still has unanswered required fields.`);
        } else {
          setNotice(data.error ?? "Could not submit the questionnaire.");
        }
        return;
      }

      router.push(`/pitch-decks/${requestId}/summary`);
    } catch {
      setNotice("Something went wrong while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function goBack() {
    if (batch > 1) {
      await save({ batch });
      setBatch((batch - 1) as BatchNumber);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function onUploadScreenshot(file: File) {
    setUploadError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/pitch-deck/requests/${requestId}/files`, {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
        return;
      }
      setAnswer("Q7_SCREENSHOT", data.fileId);
      setNotice("Screenshot attached. It stays private until your deck is prepared.");
    } catch {
      setUploadError("Upload failed. Please try a smaller image.");
    } finally {
      setUploading(false);
    }
  }

  const tamWarning = batch === 1 ? marketSizeWarning(answers) : null;
  const nudge = batch === 2 ? competitionNudge(answers) : null;

  return (
    <div className="max-w-3xl">
      {/* Batch tabs / progress */}
      <div className="flex items-center gap-2 mb-6">
        {BATCHES.map((b) => {
          const done = completedBatches.includes(b);
          const active = b === batch;
          return (
            <button
              key={b}
              type="button"
              onClick={() => {
                void save({ batch });
                setBatch(b);
                setErrors({});
              }}
              className="flex-1 text-left"
            >
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  done ? "bg-[var(--accent-fill)]" : active ? "bg-[var(--amber)]" : "bg-[var(--border)]"
                }`}
              />
              <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${active ? "font-medium text-[var(--text)]" : "text-[var(--text-muted)]"}`}>
                {done && !active && <Check size={10} className="text-[var(--accent)]" />}
                Batch {b} — {BATCH_TITLES[b]}
              </p>
            </button>
          );
        })}
        <span className="text-[10px] text-[var(--text-muted)] tabular-nums shrink-0">{progress}%</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Batch {batch} — {BATCH_TITLES[batch]}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {batch === 1 && "Business model, market size and product stage."}
            {batch === 2 && "Competition, defensibility and how you acquire customers."}
            {batch === 3 && "Fundraising status, the ask and your contact email."}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-[var(--text-muted)]">
            {saving ? (
              <span className="inline-flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Saving…</span>
            ) : savedAt ? (
              `Saved ${savedAt}`
            ) : (
              "Autosave on"
            )}
          </p>
        </div>
      </div>

      {locked && (
        <div className="mb-5 flex items-start gap-2 px-3 py-2.5 rounded-md border border-[var(--amber)]/30 bg-[var(--amber-muted)] text-[11px] text-[var(--amber)]">
          <Info size={12} className="mt-0.5 shrink-0" />
          <p>
            This questionnaire has been submitted and is read-only. Reopen the summary from your
            request page if you need to make corrections.
          </p>
        </div>
      )}

      {notice && (
        <div className="mb-5 px-3 py-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[11px] text-[var(--text-secondary)]">
          {notice}
        </div>
      )}

      {tamWarning && (
        <div className="mb-5 flex items-start gap-2 px-3 py-2.5 rounded-md border border-[var(--amber)]/30 bg-[var(--amber-muted)] text-[11px] text-[var(--amber)]">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          <p>{tamWarning}</p>
        </div>
      )}

      {nudge && (
        <div className="mb-5 flex items-start gap-2 px-3 py-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-[11px] text-[var(--text-secondary)]">
          <Info size={12} className="mt-0.5 shrink-0" />
          <p>{nudge}</p>
        </div>
      )}

      {/* Questions */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] divide-y divide-[var(--border)]">
        {questions.map((q) => {
          if (!isVisible(q, answers)) return null;
          return (
            <QuestionField
              key={q.id}
              question={q}
              answers={answers}
              error={errors[q.id]}
              disabled={locked}
              uploading={uploading}
              uploadError={uploadError}
              onUpload={onUploadScreenshot}
              onChange={setAnswer}
            />
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={goBack}
          disabled={batch === 1 || locked}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void save()}
            disabled={saving || locked}
            className="px-4 py-2 text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] rounded-md hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)] disabled:opacity-40 transition-colors"
          >
            Save and Continue later
          </button>
          <button
            onClick={continueNext}
            disabled={submitting || locked}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <><Loader2 size={14} className="animate-spin" /> Submitting…</>
            ) : batch < 3 ? (
              <>Continue <ArrowRight size={14} /></>
            ) : (
              <>Review &amp; submit <Check size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Field renderer
// ===========================================================================

function QuestionField({
  question,
  answers,
  error,
  disabled,
  uploading,
  uploadError,
  onChange,
  onUpload,
}: {
  question: Question;
  answers: Answers;
  error?: string;
  disabled: boolean;
  uploading: boolean;
  uploadError: string;
  onChange: (id: string, value: unknown) => void;
  onUpload: (file: File) => void;
}) {
  const required = isRequired(question, answers);
  const label = question.labelWhen?.(answers) ?? question.label;
  const inputClass =
    "w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors disabled:opacity-60";

  const value = answers[question.id];

  return (
    <div className="p-5">
      <div className="mb-2">
        <label className="block text-xs font-medium">
          {label}{" "}
          {required ? (
            <span className="text-[var(--accent)]">*</span>
          ) : (
            <span className="text-[10px] font-normal text-[var(--text-muted)]">(optional)</span>
          )}
        </label>
        {question.help && (
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{question.help}</p>
        )}
      </div>

      {/* ---- select -------------------------------------------------------- */}
      {question.type === "select" && (
        <div className="flex flex-wrap gap-2">
          {(question.options ?? []).map((option) => {
            const label2 =
              question.id === "Q11"
                ? FUNDRAISING_STATUSES.find((s) => s.value === option)?.label ?? option
                : option;
            const selected = value === option;
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => onChange(question.id, option)}
                className={`px-3 py-2 text-xs rounded-md border transition-colors disabled:opacity-60 ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                }`}
              >
                {label2}
              </button>
            );
          })}
        </div>
      )}

      {/* ---- multiselect --------------------------------------------------- */}
      {question.type === "multiselect" && (
        <div className="flex flex-wrap gap-2">
          {(question.options ?? []).map((option) => {
            const list = Array.isArray(value) ? (value as string[]) : [];
            const selected = list.includes(option);
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() =>
                  onChange(
                    question.id,
                    selected ? list.filter((v) => v !== option) : [...list, option],
                  )
                }
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors disabled:opacity-60 ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {/* ---- text / url / email ------------------------------------------- */}
      {(question.type === "text" || question.type === "url" || question.type === "email") && (
        <input
          type={question.type === "email" ? "email" : question.type === "url" ? "url" : "text"}
          value={String(value ?? "")}
          disabled={disabled}
          placeholder={question.placeholder}
          onChange={(e) => onChange(question.id, e.target.value)}
          className={inputClass}
        />
      )}

      {/* ---- textarea with word counter ----------------------------------- */}
      {question.type === "textarea" && (
        <WordCountedTextarea
          question={question}
          value={String(value ?? "")}
          disabled={disabled}
          onChange={(v) => onChange(question.id, v)}
          inputClass={inputClass}
        />
      )}

      {/* ---- money --------------------------------------------------------- */}
      {question.type === "money" && (
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            min={0}
            step="any"
            value={asMoney(value).value}
            disabled={disabled}
            placeholder="Value"
            onChange={(e) => onChange(question.id, { ...asMoney(value), value: e.target.value })}
            className={inputClass}
          />
          <select
            value={asMoney(value).currency}
            disabled={disabled}
            onChange={(e) => onChange(question.id, { ...asMoney(value), currency: e.target.value })}
            className={inputClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={asMoney(value).unit}
            disabled={disabled}
            onChange={(e) => onChange(question.id, { ...asMoney(value), unit: e.target.value })}
            className={inputClass}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      )}

      {/* ---- repeatable competitors --------------------------------------- */}
      {question.type === "repeatable" && (
        <div className="space-y-2">
          {asCompetitors(value).map((row, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={row.name}
                disabled={disabled}
                placeholder={question.placeholder ?? "Name (required)"}
                onChange={(e) => {
                  const rows = [...asCompetitors(value)];
                  rows[i] = { ...rows[i], name: e.target.value };
                  onChange(question.id, rows);
                }}
                className={inputClass}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={row.difference}
                  disabled={disabled}
                  placeholder="How are you different? (optional)"
                  onChange={(e) => {
                    const rows = [...asCompetitors(value)];
                    rows[i] = { ...rows[i], difference: e.target.value };
                    onChange(question.id, rows);
                  }}
                  className={inputClass}
                />
                <button
                  type="button"
                  disabled={disabled || asCompetitors(value).length <= 1}
                  onClick={() =>
                    onChange(question.id, asCompetitors(value).filter((_, idx) => idx !== i))
                  }
                  className="px-2 text-[var(--text-muted)] hover:text-[var(--red)] disabled:opacity-30"
                  aria-label="Remove row"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {asCompetitors(value).length < (question.maxItems ?? 5) && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(question.id, [...asCompetitors(value), { name: "", difference: "" }])}
              className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] disabled:opacity-40"
            >
              <Plus size={12} /> Add another (up to {question.maxItems ?? 5})
            </button>
          )}
        </div>
      )}

      {/* ---- use of funds -------------------------------------------------- */}
      {question.type === "allocations" && (
        <UseOfFunds value={value} disabled={disabled} onChange={(v) => onChange(question.id, v)} />
      )}

      {/* ---- file upload --------------------------------------------------- */}
      {question.type === "file" && (
        <div>
          <label className="inline-flex items-center gap-2 px-3 py-2 text-xs border border-[var(--border)] rounded-md cursor-pointer hover:border-[var(--border-hover)] text-[var(--text-muted)]">
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            {uploading ? "Uploading…" : value ? "Replace screenshot" : "Upload screenshot"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={disabled || uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
            />
          </label>
          {Boolean(value) && !uploading && (
            <p className="text-[10px] text-[var(--accent)] mt-1.5">Screenshot attached.</p>
          )}
          {uploadError && <p className="text-[10px] text-[var(--red)] mt-1.5">{uploadError}</p>}
        </div>
      )}

      {/* ---- follow-up ----------------------------------------------------- */}
      {question.followUp && (
        <div className="mt-3">
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">
            {question.followUp.label} (optional)
          </label>
          <input
            type="text"
            value={String(answers[question.followUp.id] ?? "")}
            disabled={disabled}
            placeholder={question.followUp.placeholder}
            onChange={(e) => onChange(question.followUp!.id, e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {error && <p className="text-[11px] text-[var(--red)] mt-2">{error}</p>}
    </div>
  );
}

function WordCountedTextarea({
  question,
  value,
  disabled,
  onChange,
  inputClass,
}: {
  question: Question;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
  inputClass: string;
}) {
  const words = countWords(value);
  const max = question.maxWords;
  const over = max !== undefined && words > max;

  return (
    <div>
      <textarea
        value={value}
        rows={question.maxWords ? 5 : 3}
        disabled={disabled}
        placeholder={question.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-none ${over ? "border-[var(--red)]" : ""}`}
      />
      {max !== undefined && (
        <div className="flex items-center justify-between mt-1.5">
          <p className={`text-[10px] ${over ? "text-[var(--red)]" : "text-[var(--text-muted)]"}`}>
            {words}/{max} words
            {over && ` — please remove ${words - max} word${words - max === 1 ? "" : "s"}`}
          </p>
          {over && (
            <button
              type="button"
              onClick={() => onChange(value.trim().split(/\s+/).slice(0, max).join(" "))}
              className="text-[10px] text-[var(--accent)] hover:underline"
            >
              Trim to {max} words
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function UseOfFunds({
  value,
  disabled,
  onChange,
}: {
  value: unknown;
  disabled: boolean;
  onChange: (v: unknown) => void;
}) {
  const allocation = asAllocation(value);
  const total = allocationTotal(value);
  const remaining = 100 - total;

  const inputClass =
    "w-20 px-2 py-1.5 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] transition-colors text-right tabular-nums disabled:opacity-60";

  return (
    <div>
      <div className="space-y-2">
        {USE_OF_FUNDS_ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3">
            <span className="text-xs text-[var(--text-secondary)]">{row.label}</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                value={allocation[row.key] || ""}
                disabled={disabled}
                placeholder="0"
                onChange={(e) =>
                  onChange({ ...allocation, [row.key]: Math.max(0, Number(e.target.value) || 0) })
                }
                className={inputClass}
              />
              <span className="text-[11px] text-[var(--text-muted)]">%</span>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between gap-3">
          <input
            type="text"
            value={allocation.otherLabel}
            disabled={disabled}
            placeholder="Other (optional label, e.g. Legal & compliance)"
            onChange={(e) => onChange({ ...allocation, otherLabel: e.target.value })}
            className="flex-1 px-3 py-1.5 text-xs rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors disabled:opacity-60"
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={allocation.other || ""}
              disabled={disabled}
              placeholder="0"
              onChange={(e) =>
                onChange({ ...allocation, other: Math.max(0, Number(e.target.value) || 0) })
              }
              className={inputClass}
            />
            <span className="text-[11px] text-[var(--text-muted)]">%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
        <div>
          <p className="text-xs font-medium tabular-nums">Total: {total}%</p>
          {remaining > 0 && (
            <p className="text-[10px] text-[var(--amber)]">Add {remaining}% more to continue.</p>
          )}
          {remaining < 0 && (
            <p className="text-[10px] text-[var(--red)]">Your allocation exceeds 100%.</p>
          )}
          {remaining === 0 && <p className="text-[10px] text-[var(--accent)]">Allocated exactly 100%.</p>}
        </div>
        {remaining !== 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...allocation, other: Math.max(0, allocation.other + remaining) })}
            className="text-[10px] px-2.5 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 disabled:opacity-40 transition-colors"
          >
            Auto-fill remainder into Other
          </button>
        )}
      </div>
    </div>
  );
}

export { DESCRIPTION_MAX_WORDS };
