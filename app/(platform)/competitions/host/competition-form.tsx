"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Plus,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui";
import {
  COMPETITION_CURRENCIES,
  COMPETITION_SECTORS,
  COMPETITION_STAGES,
  SDG_GOALS,
  STANDARD_CRITERIA,
} from "@/features/competitions/types";

import type { CompetitionFormInitial } from "@/features/competitions/form-defaults";

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors";
const labelClass = "block text-[10px] text-[var(--text-muted)] mb-1";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[var(--text-muted)] mt-1">{hint}</p>}
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-[var(--accent)]"
      />
      {label}
    </label>
  );
}

export function CompetitionForm({ initial }: { initial: CompetitionFormInitial }) {
  const router = useRouter();
  const [form, setForm] = useState<CompetitionFormInitial>(initial);
  const [saving, setSaving] = useState<"draft" | "submit" | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const competitionId = initial.id;
  const editable =
    !form.status || form.status === "draft" || form.status === "changes_requested";

  const totalWeight = useMemo(
    () =>
      Math.round(
        form.criteria.reduce(
          (sum, criterion) => sum + (Number(criterion.weight) || 0),
          0
        ) * 100
      ) / 100,
    [form.criteria]
  );

  function update<K extends keyof CompetitionFormInitial>(
    key: K,
    value: CompetitionFormInitial[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess("");
  }

  function toggleArray(
    key: "stages" | "sectors",
    value: string
  ) {
    setForm((prev) => {
      const current = prev.eligibility[key];
      return {
        ...prev,
        eligibility: {
          ...prev.eligibility,
          [key]: current.includes(value)
            ? current.filter((entry) => entry !== value)
            : [...current, value],
        },
      };
    });
  }

  function toggleSdg(id: number) {
    setForm((prev) => {
      const sdgGoals = prev.sdgGoals.includes(id)
        ? prev.sdgGoals.filter((entry) => entry !== id)
        : [...prev.sdgGoals, id];
      return {
        ...prev,
        sdgGoals,
        // Removing the primary focus clears the designation.
        sdgPrimary: prev.sdgPrimary && sdgGoals.includes(prev.sdgPrimary)
          ? prev.sdgPrimary
          : null,
      };
    });
  }

  function toggleRequiredSdg(id: number) {
    setForm((prev) => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        requiredSdgs: prev.eligibility.requiredSdgs.includes(id)
          ? prev.eligibility.requiredSdgs.filter((entry) => entry !== id)
          : [...prev.eligibility.requiredSdgs, id],
      },
    }));
  }

  function addCriterion(label: string) {
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);
    if (!key || form.criteria.some((criterion) => criterion.key === key)) return;
    setForm((prev) => ({
      ...prev,
      criteria: [...prev.criteria, { key, label, weight: "0" }],
    }));
  }

  function buildPayload() {
    return {
      title: form.title,
      summary: form.summary,
      description: form.description,
      category: form.category,
      hostOrganization: form.hostOrganization,
      bannerUrl: form.bannerUrl,
      openAt: fromLocalInput(form.openAt),
      deadline: fromLocalInput(form.deadline),
      evaluationEndsAt: fromLocalInput(form.evaluationEndsAt),
      winnerAnnouncementAt: fromLocalInput(form.winnerAnnouncementAt),
      completionAt: fromLocalInput(form.completionAt),
      prizeAmount: form.prizeAmount === "" ? null : Number(form.prizeAmount),
      prizeCurrency: form.prizeCurrency,
      prizeDescription: form.prizeDescription,
      benefits: form.benefits,
      eligibility: {
        allStages: form.eligibility.allStages,
        stages: form.eligibility.stages,
        sectors: form.eligibility.sectors,
        minMrr:
          form.eligibility.minMrr === ""
            ? null
            : Number(form.eligibility.minMrr),
        maxMrr:
          form.eligibility.maxMrr === ""
            ? null
            : Number(form.eligibility.maxMrr),
        regions: form.eligibility.regions
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
        requirements: form.eligibility.requirements,
        requiredSdgs: form.eligibility.requiredSdgs,
        requireVerifiedImpact: form.eligibility.requireVerifiedImpact,
      },
      criteria: form.criteria.map((criterion) => ({
        key: criterion.key,
        label: criterion.label,
        weight: Number(criterion.weight) || 0,
      })),
      sdgGoals: form.sdgGoals,
      sdgPrimary: form.sdgPrimary,
      rules: form.rules,
    };
  }

  function clientProblems(): string[] {
    const list: string[] = [];
    if (form.title.trim().length < 3) list.push("Add a competition title.");
    if (form.summary.trim().length < 10) list.push("Add a short summary.");
    if (form.description.trim().length < 30)
      list.push("Add a full description (at least 30 characters).");
    if (!form.category) list.push("Choose a category or theme.");
    if (!form.openAt) list.push("Set the application opening date.");
    if (!form.deadline) list.push("Set the application deadline.");
    if (form.openAt && form.deadline && new Date(form.deadline) <= new Date(form.openAt))
      list.push("The deadline must be after the opening date.");
    if (form.criteria.length === 0) list.push("Add at least one criterion.");
    if (form.criteria.length > 0 && Math.abs(totalWeight - 100) > 0.01)
      list.push("Evaluation weights must add up to 100%.");
    return list;
  }

  async function save(mode: "draft" | "submit") {
    setProblems([]);
    setError("");
    setSuccess("");

    if (!editable) {
      setError("This proposal can no longer be edited.");
      return;
    }
    if (mode === "submit") {
      const list = clientProblems();
      if (list.length > 0) {
        setProblems(list);
        return;
      }
    }

    setSaving(mode);
    try {
      const payload = buildPayload();
      let id = competitionId;

      if (!id) {
        const created = await fetch("/api/competitions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await created.json().catch(() => ({}));
        if (!created.ok) {
          setError(data.error ?? "Could not save the draft.");
          return;
        }
        id = data.id as string;
      }

      const res = await fetch(`/api/competitions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, submit: mode === "submit" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (Array.isArray(data.problems)) setProblems(data.problems);
        setError(data.error ?? "Could not save the proposal.");
        return;
      }

      if (mode === "submit") {
        router.push("/competitions?tab=host");
        router.refresh();
        return;
      }
      setSuccess("Draft saved.");
      if (!competitionId) {
        router.push(`/competitions/host/${id}`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-5">
      {!editable && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
          <p className="text-[11px] text-[var(--text-muted)]">
            This proposal is {form.status?.replace(/_/g, " ")} and can no longer be
            edited. You can still view it from the competitions page.
          </p>
        </div>
      )}

      {problems.length > 0 && (
        <div className="rounded-lg border border-[var(--amber)]/30 bg-[var(--amber-muted)] px-4 py-3">
          <p className="text-[11px] font-medium text-[var(--amber)] flex items-center gap-1.5 mb-1">
            <AlertCircle size={12} /> Complete these before submitting
          </p>
          <ul className="space-y-1">
            {problems.map((problem) => (
              <li key={problem} className="text-[10px] text-[var(--text-secondary)]">
                • {problem}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-[var(--red)]/30 bg-[var(--red-muted)] px-4 py-2.5">
          <p className="text-[11px] text-[var(--red)]">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-[var(--green)]/30 bg-[var(--green-muted)] px-4 py-2.5">
          <p className="text-[11px] text-[var(--green)] flex items-center gap-1.5">
            <CheckCircle2 size={12} /> {success}
          </p>
        </div>
      )}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="text-xs font-medium text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
          <Trophy size={12} /> Competition details
        </h2>
        <div className="space-y-3">
          <Field label="Title">
            <input
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              maxLength={160}
              placeholder="AI for Climate Challenge"
              className={inputClass}
            />
          </Field>
          <Field label="Short summary" hint="One or two lines shown on the competition card.">
            <input
              value={form.summary}
              onChange={(event) => update("summary", event.target.value)}
              maxLength={400}
              placeholder="A challenge for startups using AI to reduce industrial emissions."
              className={inputClass}
            />
          </Field>
          <Field label="Full description">
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              rows={6}
              placeholder="Explain the challenge, why it matters, and what you are looking for."
              className={`${inputClass} resize-none`}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Category / theme">
              <select
                value={form.category}
                onChange={(event) => update("category", event.target.value)}
                className={inputClass}
              >
                <option value="">Select a category</option>
                {COMPETITION_SECTORS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Host organization" hint="Defaults to your investor profile.">
              <input
                value={form.hostOrganization}
                onChange={(event) => update("hostOrganization", event.target.value)}
                maxLength={160}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Banner image URL (optional)">
            <input
              value={form.bannerUrl}
              onChange={(event) => update("bannerUrl", event.target.value)}
              maxLength={500}
              placeholder="https://…"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="text-xs font-medium text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
          <CalendarClock size={12} /> Schedule
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Applications open">
            <input
              type="datetime-local"
              value={form.openAt}
              onChange={(event) => update("openAt", event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Application deadline">
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(event) => update("deadline", event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Evaluation period ends">
            <input
              type="datetime-local"
              value={form.evaluationEndsAt}
              onChange={(event) => update("evaluationEndsAt", event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Expected winner announcement">
            <input
              type="datetime-local"
              value={form.winnerAnnouncementAt}
              onChange={(event) =>
                update("winnerAnnouncementAt", event.target.value)
              }
              className={inputClass}
            />
          </Field>
          <Field label="Completion date (optional)">
            <input
              type="datetime-local"
              value={form.completionAt}
              onChange={(event) => update("completionAt", event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="text-xs font-medium text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
          <Sparkles size={12} /> Prize &amp; benefits
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Prize amount (optional)">
            <input
              type="number"
              min={0}
              value={form.prizeAmount}
              onChange={(event) => update("prizeAmount", event.target.value)}
              placeholder="25000"
              className={inputClass}
            />
          </Field>
          <Field label="Currency">
            <select
              value={form.prizeCurrency}
              onChange={(event) => update("prizeCurrency", event.target.value)}
              className={inputClass}
            >
              {COMPETITION_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Prize description">
            <input
              value={form.prizeDescription}
              onChange={(event) => update("prizeDescription", event.target.value)}
              maxLength={500}
              placeholder="Equity-free grant + pilot"
              className={inputClass}
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 mt-4">
          <CheckRow
            checked={form.benefits.mentorship}
            onChange={(value) =>
              update("benefits", { ...form.benefits, mentorship: value })
            }
            label="Mentorship"
          />
          <CheckRow
            checked={form.benefits.incubation}
            onChange={(value) =>
              update("benefits", { ...form.benefits, incubation: value })
            }
            label="Incubation"
          />
          <CheckRow
            checked={form.benefits.pilotPartnership}
            onChange={(value) =>
              update("benefits", { ...form.benefits, pilotPartnership: value })
            }
            label="Pilot partnership"
          />
          <CheckRow
            checked={form.benefits.investorVisibility}
            onChange={(value) =>
              update("benefits", {
                ...form.benefits,
                investorVisibility: value,
              })
            }
            label="Investor visibility"
          />
        </div>
        <div className="mt-3">
          <Field label="Other benefits (optional)">
            <input
              value={form.benefits.other}
              onChange={(event) =>
                update("benefits", { ...form.benefits, other: event.target.value })
              }
              maxLength={300}
              className={inputClass}
            />
          </Field>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-2">
          Leave the prize amount blank for a non-monetary competition.
        </p>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="text-xs font-medium text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
          <ShieldCheck size={12} /> Eligibility
        </h2>
        <CheckRow
          checked={form.eligibility.allStages}
          onChange={(value) =>
            update("eligibility", {
              ...form.eligibility,
              allStages: value,
              stages: value ? [] : form.eligibility.stages,
            })
          }
          label="Open to all startup stages"
        />
        {!form.eligibility.allStages && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {COMPETITION_STAGES.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => toggleArray("stages", stage)}
                className={`px-2.5 py-1 text-[10px] rounded-md border transition-colors ${
                  form.eligibility.stages.includes(stage)
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        )}

        <p className="text-[10px] text-[var(--text-muted)] mt-4 mb-1.5">
          Sector restrictions (leave empty for all sectors)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {COMPETITION_SECTORS.map((sector) => (
            <button
              key={sector}
              type="button"
              onClick={() => toggleArray("sectors", sector)}
              className={`px-2.5 py-1 text-[10px] rounded-md border transition-colors ${
                form.eligibility.sectors.includes(sector)
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
              }`}
            >
              {sector}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <Field label="Minimum MRR (USD)">
            <input
              type="number"
              min={0}
              value={form.eligibility.minMrr}
              onChange={(event) =>
                update("eligibility", {
                  ...form.eligibility,
                  minMrr: event.target.value,
                })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Maximum MRR (USD)">
            <input
              type="number"
              min={0}
              value={form.eligibility.maxMrr}
              onChange={(event) =>
                update("eligibility", {
                  ...form.eligibility,
                  maxMrr: event.target.value,
                })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Regions (comma separated)">
            <input
              value={form.eligibility.regions}
              onChange={(event) =>
                update("eligibility", {
                  ...form.eligibility,
                  regions: event.target.value,
                })
              }
              placeholder="India, Singapore"
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Additional requirements">
            <textarea
              value={form.eligibility.requirements}
              onChange={(event) =>
                update("eligibility", {
                  ...form.eligibility,
                  requirements: event.target.value,
                })
              }
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>
        </div>

        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <p className="text-[10px] text-[var(--text-muted)] mb-2">
            Impact requirements (optional). Leave empty to accept startups
            regardless of SDG alignment.
          </p>
          <CheckRow
            checked={form.eligibility.requireVerifiedImpact}
            onChange={(value) =>
              update("eligibility", {
                ...form.eligibility,
                requireVerifiedImpact: value,
              })
            }
            label="Require admin-verified impact"
          />
          <p className="text-[10px] text-[var(--text-muted)] mt-3 mb-1.5">
            Require at least one of these goals
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SDG_GOALS.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleRequiredSdg(goal.id)}
                title={goal.label}
                aria-pressed={form.eligibility.requiredSdgs.includes(goal.id)}
                className={`px-2 py-1 text-[10px] rounded-md border transition-colors ${
                  form.eligibility.requiredSdgs.includes(goal.id)
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
                }`}
              >
                {goal.id}. {goal.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
            <Scale size={12} /> Evaluation criteria
          </h2>
          <span
            className={`text-[10px] font-medium tabular-nums ${
              Math.abs(totalWeight - 100) <= 0.01
                ? "text-[var(--green)]"
                : "text-[var(--amber)]"
            }`}
          >
            Total weight: {totalWeight}%
          </span>
        </div>

        <div className="space-y-2">
          {form.criteria.map((criterion, index) => (
            <div key={criterion.key} className="flex items-center gap-2">
              <input
                value={criterion.label}
                onChange={(event) =>
                  update(
                    "criteria",
                    form.criteria.map((entry, i) =>
                      i === index ? { ...entry, label: event.target.value } : entry
                    )
                  )
                }
                className={`${inputClass} flex-1 text-xs`}
              />
              <input
                type="number"
                min={0}
                max={100}
                value={criterion.weight}
                onChange={(event) =>
                  update(
                    "criteria",
                    form.criteria.map((entry, i) =>
                      i === index ? { ...entry, weight: event.target.value } : entry
                    )
                  )
                }
                className={`${inputClass} w-16 text-xs text-right`}
              />
              <span className="text-[10px] text-[var(--text-muted)]">%</span>
              <button
                type="button"
                onClick={() =>
                  update(
                    "criteria",
                    form.criteria.filter((_, i) => i !== index)
                  )
                }
                aria-label={`Remove ${criterion.label}`}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <select
            value=""
            onChange={(event) => {
              if (event.target.value) addCriterion(event.target.value);
            }}
            className={`${inputClass} w-auto text-xs`}
          >
            <option value="">Add a standard criterion…</option>
            {STANDARD_CRITERIA.filter(
              (standard) =>
                !form.criteria.some((entry) => entry.key === standard.key)
            ).map((standard) => (
              <option key={standard.key} value={standard.label}>
                {standard.label}
              </option>
            ))}
          </select>
          <CriterionAdder onAdd={addCriterion} />
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
          <Target size={12} /> SDG alignment (optional)
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {SDG_GOALS.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleSdg(goal.id)}
              title={goal.label}
              className={`px-2 py-1 text-[10px] rounded-md border transition-colors ${
                form.sdgGoals.includes(goal.id)
                  ? "border-[var(--green)]/40 bg-[var(--green-muted)] text-[var(--green)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
              }`}
            >
              {goal.id}. {goal.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label htmlFor="sdg-primary" className="text-[10px] text-[var(--text-muted)]">
            Primary focus (optional)
          </label>
          <select
            id="sdg-primary"
            value={form.sdgPrimary ?? ""}
            disabled={form.sdgGoals.length === 0}
            onChange={(event) =>
              update(
                "sdgPrimary",
                event.target.value ? Number(event.target.value) : null
              )
            }
            className={`${inputClass} w-auto text-xs disabled:opacity-50`}
          >
            <option value="">No primary focus</option>
            {form.sdgGoals.map((id) => {
              const goal = SDG_GOALS.find((entry) => entry.id === id);
              return (
                <option key={id} value={id}>
                  SDG {id} · {goal?.label ?? ""}
                </option>
              );
            })}
          </select>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-2">
          Shown on the competition card and detail page. It does not change
          eligibility unless you add a requirement below.
        </p>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3">
          Rules &amp; terms
        </h2>
        <textarea
          value={form.rules}
          onChange={(event) => update("rules", event.target.value)}
          rows={5}
          placeholder="Participation rules, eligibility notes, judging process and terms."
          className={`${inputClass} resize-none`}
        />
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {editable && (
          <>
            <button
              type="button"
              onClick={() => save("draft")}
              disabled={saving !== null}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors disabled:opacity-50"
            >
              {saving === "draft" && <Loader2 size={12} className="animate-spin" />}
              Save draft
            </button>
            <button
              type="button"
              onClick={() => save("submit")}
              disabled={saving !== null}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {saving === "submit" && <Loader2 size={12} className="animate-spin" />}
              Submit for review
            </button>
          </>
        )}
        <span className="text-[10px] text-[var(--text-muted)]">
          Only approved and published competitions are visible to startups.
        </span>
      </div>
    </div>
  );
}

function CriterionAdder({ onAdd }: { onAdd: (label: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="flex items-center gap-1.5">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Custom criterion"
        maxLength={80}
        className={`${inputClass} w-40 text-xs`}
      />
      <button
        type="button"
        onClick={() => {
          const label = value.trim();
          if (!label) return;
          onAdd(label);
          setValue("");
        }}
        className="inline-flex items-center gap-1 px-2.5 py-2 text-[11px] border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
      >
        <Plus size={11} /> Add
      </button>
      <Badge>{STANDARD_CRITERIA.length} standard</Badge>
    </div>
  );
}
