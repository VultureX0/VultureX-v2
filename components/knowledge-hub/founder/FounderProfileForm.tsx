"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import {
  CHALLENGES,
  COLLABORATION_INTERESTS,
  COLLABORATION_VISIBILITY_OPTIONS,
  FUNDING_INTERESTS,
  GUIDANCE_AREAS,
  LANGUAGES,
  LEARNING_INTERESTS,
  MARKETING_NEEDS,
  OBJECTIVES,
  PRIORITIES,
  RECOMMENDATION_TYPES,
  type CollaborationVisibility,
  type FounderLanguage,
  type Option,
} from "@/features/founder-profile/options";
import type { FounderProfileFormValues, ReminderPrefs } from "./profile-values";

type StartupContext = {
  name: string;
  stage: string;
  sector: string;
  location: string | null;
} | null;

type ArrayField =
  | "challenges"
  | "guidanceAreas"
  | "priorities"
  | "learningInterests"
  | "marketingNeeds"
  | "collaborationInterests"
  | "recommendationTypes";

type Status = "idle" | "saving" | "saved" | "error";

const ONBOARDING_STEPS = ["Your focus", "Where you need help", "Interests & visibility"];

export function FounderProfileForm({
  initial,
  startup,
  mode,
}: {
  initial: FounderProfileFormValues;
  startup: StartupContext;
  mode: "profile" | "onboarding";
}) {
  const router = useRouter();
  const [values, setValues] = useState<FounderProfileFormValues>(initial);
  const [saved, setSaved] = useState<FounderProfileFormValues>(initial);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const saving = status === "saving";
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  function setValue<K extends keyof FounderProfileFormValues>(
    key: K,
    value: FounderProfileFormValues[K]
  ) {
    setValues((previous) => ({ ...previous, [key]: value }));
    if (status === "saved" || status === "error") setStatus("idle");
  }

  function toggleValue(field: ArrayField, value: string, max = 6) {
    setValues((previous) => {
      const current = previous[field];
      const next = current.includes(value)
        ? current.filter((entry) => entry !== value)
        : current.length >= max
          ? current
          : [...current, value];
      return { ...previous, [field]: next };
    });
    if (status === "saved" || status === "error") setStatus("idle");
  }

  function toggleReminder(key: keyof ReminderPrefs) {
    setValues((previous) => ({
      ...previous,
      reminderPreferences: {
        ...previous.reminderPreferences,
        [key]: !previous.reminderPreferences[key],
      },
    }));
    if (status === "saved" || status === "error") setStatus("idle");
  }

  async function persist(markComplete: boolean): Promise<boolean> {
    setStatus("saving");
    setError("");

    try {
      const response = await fetch("/api/founder-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, onboardingComplete: markComplete }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not save your founder profile.");
        setStatus("error");
        return false;
      }

      setSaved(values);
      setStatus("saved");
      return true;
    } catch {
      setError("Network error. Your changes are still on this page, so nothing was lost.");
      setStatus("error");
      return false;
    }
  }

  async function handleContinue() {
    const ok = await persist(false);
    if (ok && step < ONBOARDING_STEPS.length - 1) setStep(step + 1);
  }

  async function handleFinish() {
    const ok = await persist(true);
    if (ok) router.push("/knowledge-hub/for-you");
  }

  function handleCancel() {
    setValues(saved);
    setError("");
    setStatus("idle");
  }

  const aboutSection = (
    <Section title="About you" hint="Used to prefill guidance. Your account identity stays in Settings.">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="vx-label">Location</span>
          <input
            type="text"
            value={values.location}
            maxLength={120}
            onChange={(event) => setValue("location", event.target.value)}
            placeholder="City or region"
            className="mt-1.5 w-full rounded-[var(--radius)] border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </label>

        <fieldset>
          <legend className="vx-label">Preferred language</legend>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {LANGUAGES.map((language) => {
              const active = values.preferredLanguage === language.value;
              return (
                <button
                  key={language.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setValue("preferredLanguage", language.value as FounderLanguage)}
                  className={`rounded-md border px-3 py-2 text-[11px] transition-colors ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-muted)] font-medium text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  {language.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--text-muted)]">
            English is the interface language today. Your choice is saved so Hindi and Punjabi can
            be applied when localization ships; nothing is machine-translated in the meantime.
          </p>
        </fieldset>
      </div>

      {startup ? (
        <div className="vx-inset mt-4 flex flex-wrap items-center justify-between gap-2 p-3">
          <div>
            <p className="vx-label">Startup</p>
            <p className="mt-1 text-xs font-medium">
              {startup.name} · {startup.stage} · {startup.sector}
            </p>
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
          >
            Edit startup details
            <ArrowRight size={10} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="vx-inset mt-4 flex flex-wrap items-center justify-between gap-2 p-3">
          <p className="text-[11px] text-[var(--text-muted)]">
            No startup profile yet. Your stage and industry come from it.
          </p>
          <Link
            href="/onboarding/startup"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
          >
            Create startup profile
            <ArrowRight size={10} aria-hidden="true" />
          </Link>
        </div>
      )}
    </Section>
  );

  const focusSection = (
    <Section
      title="What are you focused on?"
      hint="Pick the objective that matters most right now. Everything here is optional and can change."
    >
      <ChoiceGroup
        label="Current objective"
        options={OBJECTIVES}
        value={values.currentObjective}
        onChange={(next) => setValue("currentObjective", next)}
      />
      <div className="mt-5">
        <ChipGroup
          label="Current priorities"
          hint="Choose up to 3."
          options={PRIORITIES}
          selected={values.priorities}
          max={3}
          onToggle={(value) => toggleValue("priorities", value, 3)}
        />
      </div>
    </Section>
  );

  const helpSection = (
    <Section
      title="Where do you need support?"
      hint="Saved challenges route you to an existing Knowledge Hub section. They are not scored or shared automatically."
    >
      <ChipGroup
        label="Main challenges"
        hint="Choose up to 4."
        options={CHALLENGES}
        selected={values.challenges}
        max={4}
        onToggle={(value) => toggleValue("challenges", value, 4)}
      />
      <div className="mt-5">
        <ChipGroup
          label="Areas where guidance would help"
          hint="Choose up to 4."
          options={GUIDANCE_AREAS}
          selected={values.guidanceAreas}
          max={4}
          onToggle={(value) => toggleValue("guidanceAreas", value, 4)}
        />
      </div>
    </Section>
  );

  const interestsSection = (
    <Section title="Interests and preferences" hint="These tune what the hub surfaces for you.">
      <ChipGroup
        label="Learning interests"
        hint="Choose up to 4."
        options={LEARNING_INTERESTS}
        selected={values.learningInterests}
        max={4}
        onToggle={(value) => toggleValue("learningInterests", value, 4)}
      />

      <div className="mt-5">
        <ChoiceGroup
          label="Funding interest"
          options={FUNDING_INTERESTS}
          value={values.fundingInterest}
          onChange={(next) => setValue("fundingInterest", next)}
        />
      </div>

      <div className="mt-5">
        <ChipGroup
          label="Marketing needs"
          hint="Choose up to 3."
          options={MARKETING_NEEDS}
          selected={values.marketingNeeds}
          max={3}
          onToggle={(value) => toggleValue("marketingNeeds", value, 3)}
        />
      </div>

      <div className="mt-5">
        <ChipGroup
          label="Collaboration interests"
          hint="Choose up to 3."
          options={COLLABORATION_INTERESTS}
          selected={values.collaborationInterests}
          max={3}
          onToggle={(value) => toggleValue("collaborationInterests", value, 3)}
        />
      </div>
    </Section>
  );

  const preferencesSection = (
    <Section title="Controls" hint="You decide what is shared and what is not.">
      <ChipGroup
        label="Recommendations I want"
        options={RECOMMENDATION_TYPES}
        selected={values.recommendationTypes}
        max={4}
        onToggle={(value) => toggleValue("recommendationTypes", value, 4)}
      />

      <fieldset className="mt-5">
        <legend className="vx-label">Reminders</legend>
        <div className="mt-2 space-y-2">
          <Toggle
            label="In-app reminders"
            description="Show reminders in VultureX."
            checked={values.reminderPreferences.inApp}
            onChange={() => toggleReminder("inApp")}
          />
          <Toggle
            label="Task due dates"
            checked={values.reminderPreferences.taskDue}
            onChange={() => toggleReminder("taskDue")}
          />
          <Toggle
            label="Milestones"
            checked={values.reminderPreferences.milestones}
            onChange={() => toggleReminder("milestones")}
          />
          <Toggle
            label="Mentor clinics"
            checked={values.reminderPreferences.clinics}
            onChange={() => toggleReminder("clinics")}
          />
          <Toggle
            label="Email reminders"
            description="Email delivery is not connected yet, so no email will be sent."
            checked={values.reminderPreferences.email}
            onChange={() => toggleReminder("email")}
            disabled
          />
        </div>
      </fieldset>

      <div className="mt-5 space-y-2">
        <Toggle
          label="Founder profile discoverability"
          description="Saved for founder discovery. It does not change your existing public startup profile, which stays controlled in Settings."
          checked={values.profileVisibility}
          onChange={() => setValue("profileVisibility", !values.profileVisibility)}
        />
      </div>

      <fieldset className="mt-5">
        <legend className="vx-label">Collaboration visibility</legend>
        <div className="mt-2 space-y-1.5">
          {COLLABORATION_VISIBILITY_OPTIONS.map((option) => {
            const active = values.collaborationVisibility === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setValue("collaborationVisibility", option.value as CollaborationVisibility)
                }
                className={`flex w-full items-start gap-2 rounded-[var(--radius)] border p-2.5 text-left transition-colors ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                    : "border-[var(--border)] hover:border-[var(--border-hover)]"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                    active ? "border-[var(--accent)]" : "border-[var(--border-hover)]"
                  }`}
                  aria-hidden="true"
                >
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
                </span>
                <span>
                  <span className="block text-[11px] font-medium">{option.label}</span>
                  <span className="block text-[10px] leading-relaxed text-[var(--text-muted)]">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </Section>
  );

  const feedback = (
    <>
      {error && (
        <p role="alert" className="text-[11px] text-[var(--red)]">
          {error}
        </p>
      )}
      {status === "saved" && (
        <p role="status" className="text-[11px] text-[var(--green)]">
          Founder profile saved.
        </p>
      )}
    </>
  );

  if (mode === "onboarding") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ol className="flex flex-wrap items-center gap-2" aria-label="Onboarding steps">
            {ONBOARDING_STEPS.map((label, index) => {
              const active = index === step;
              const complete = index < step;
              return (
                <li key={label} className="flex items-center gap-2">
                  <span
                    aria-current={active ? "step" : undefined}
                    className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] ${
                      active || complete
                        ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-muted)]"
                    }`}
                  >
                    {complete ? <Check size={10} aria-hidden="true" /> : index + 1}
                  </span>
                  <span
                    className={`text-[10px] ${active ? "font-medium text-[var(--text)]" : "text-[var(--text-muted)]"}`}
                  >
                    {label}
                  </span>
                  {index < ONBOARDING_STEPS.length - 1 && (
                    <span className="text-[var(--text-muted)]" aria-hidden="true">
                      /
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          <span className="vx-label">Optional · saves as you go</span>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            {focusSection}
            {aboutSection}
          </div>
        )}
        {step === 1 && helpSection}
        {step === 2 && (
          <div className="space-y-4">
            {interestsSection}
            {preferencesSection}
          </div>
        )}

        <div className="vx-card flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0 || saving}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] disabled:opacity-40"
            >
              <ArrowLeft size={11} aria-hidden="true" />
              Back
            </button>
            <Link
              href="/knowledge-hub/for-you"
              className="text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              Skip for now
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {feedback}
            {step < ONBOARDING_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleContinue}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-fill)] px-3.5 py-2 text-[11px] font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent-fill-hover)] disabled:opacity-50"
              >
                {saving ? <Loader2 size={11} className="animate-spin" /> : null}
                Save & continue
                <ArrowRight size={11} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-fill)] px-3.5 py-2 text-[11px] font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent-fill-hover)] disabled:opacity-50"
              >
                {saving ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                Finish and open For You
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {aboutSection}
      {focusSection}
      {helpSection}
      {interestsSection}
      {preferencesSection}

      <div className="vx-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">{feedback}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!dirty || saving}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => persist(true)}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-fill)] px-3.5 py-2 text-[11px] font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent-fill-hover)] disabled:opacity-50"
          >
            {saving ? <Loader2 size={11} className="animate-spin" /> : null}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="vx-card p-5">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {hint && <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ChipGroup({
  label,
  hint,
  options,
  selected,
  onToggle,
  max,
}: {
  label: string;
  hint?: string;
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  max?: number;
}) {
  return (
    <fieldset>
      <legend className="vx-label">{label}</legend>
      {hint && <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option.value)}
              className={`rounded-md border px-2.5 py-1.5 text-[11px] transition-colors ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] font-medium text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {max && (
        <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
          {selected.length}/{max} selected
        </p>
      )}
    </fieldset>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="vx-label">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : option.value)}
              className={`rounded-md border px-2.5 py-1.5 text-[11px] transition-colors ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] font-medium text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-2.5 rounded-md border border-[var(--border)] p-2.5 ${
        disabled ? "opacity-60" : "cursor-pointer hover:border-[var(--border-hover)]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-0.5 h-3.5 w-3.5 accent-[var(--accent)]"
      />
      <span>
        <span className="block text-[11px] font-medium">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[10px] leading-relaxed text-[var(--text-muted)]">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
