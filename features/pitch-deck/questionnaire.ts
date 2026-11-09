/**
 * Pitch Deck Questionnaire — single source of truth.
 *
 * Mirrors the Vulture X "Pitch Deck Questionnaire" PDF exactly:
 *   Batch 1 — Business & Market
 *   Batch 2 — Competition & Growth
 *   Batch 3 — Fundraising & Ask
 *
 * Everything the profile already captures (company, sector, stage, location,
 * founder, team size, MRR, growth, users, customers, total raised, burn,
 * runway, problem, solution) is NEVER asked again — it is pulled from the
 * profile when the summary is built.
 *
 * One additional question ("Describe Your Startup", 200 words max) is added to
 * Batch 1. No PDF question was removed, reordered or replaced.
 */

export const QUESTIONNAIRE_VERSION = 1;

export const BATCH_TITLES = {
  1: "Business & Market",
  2: "Competition & Growth",
  3: "Fundraising & Ask",
} as const;

export type BatchNumber = 1 | 2 | 3;
export const BATCHES: BatchNumber[] = [1, 2, 3];

export type QuestionType =
  | "select"
  | "text"
  | "textarea"
  | "number"
  | "url"
  | "email"
  | "money"
  | "multiselect"
  | "repeatable"
  | "allocations"
  | "file";

export type Question = {
  id: string;
  /** Exact PDF wording */
  label: string;
  /** Small helper line under the label (PDF placeholder/notes) */
  help?: string;
  placeholder?: string;
  type: QuestionType;
  required: boolean;
  options?: readonly string[];
  /** For repeatable questions: min/max rows */
  minItems?: number;
  maxItems?: number;
  /** For word-counted textareas */
  maxWords?: number;
  /** Optional short-text follow-up rendered under a multiselect */
  followUp?: { id: string; label: string; placeholder?: string };
  /** Rendered only when this predicate is satisfied */
  visibleWhen?: (answers: Answers) => boolean;
  /** Overrides `required` when visibleWhen is used (Q11A/Q11B) */
  requiredWhen?: (answers: Answers) => boolean;
  /** Alternative label for conditional re-wording (Q11C when recently closed) */
  labelWhen?: (answers: Answers) => string | undefined;
};

export type MoneyAnswer = { value: string; currency: string; unit: string };
export type CompetitorAnswer = { name: string; difference: string };
export type AllocationAnswer = {
  product: number;
  sales: number;
  hiring: number;
  operations: number;
  other: number;
  otherLabel: string;
};

export type Answers = Record<string, unknown>;

export const BUSINESS_MODELS = [
  "SaaS / Subscription",
  "Marketplace",
  "Transaction / Commission",
  "D2C / E-commerce",
  "Freemium",
  "Advertising",
  "Licensing",
  "Other",
] as const;

export const SELL_TO = ["B2B", "B2C", "B2B2C", "Other"] as const;

export const CURRENCIES = ["₹", "$", "€", "Other"] as const;
export const UNITS = ["Lakh", "Crore", "Million", "Billion"] as const;

export const PRODUCT_STAGES = [
  "Idea",
  "Prototype",
  "MVP",
  "Beta",
  "Live",
  "Scaling",
] as const;

export const MOAT_OPTIONS = [
  "Proprietary technology",
  "Data advantage",
  "Network effects",
  "Brand",
  "Distribution advantage",
  "Partnerships",
  "Switching costs",
  "Regulatory / compliance advantage",
  "Operational advantage",
  "Community",
  "Other",
] as const;

export const ACQUISITION_OPTIONS = [
  "Direct sales",
  "Inside sales",
  "Partnerships",
  "Referrals",
  "Organic / SEO",
  "Social media",
  "Content",
  "Paid advertising",
  "Community",
  "Product-led growth",
  "Marketplace / platform",
  "Other",
] as const;

export const FUNDRAISING_STATUSES = [
  { value: "not_raising", label: "Not currently raising" },
  { value: "planning", label: "Planning to raise" },
  { value: "raising", label: "Currently raising" },
  { value: "closed", label: "Recently closed a round" },
] as const;

export const USE_OF_FUNDS_ROWS = [
  { key: "product", label: "Product / Technology" },
  { key: "sales", label: "Sales & Marketing" },
  { key: "hiring", label: "Hiring" },
  { key: "operations", label: "Operations" },
] as const;

export const DESCRIPTION_QUESTION_ID = "NEW_DESC";
export const DESCRIPTION_MAX_WORDS = 200;

// ---------------------------------------------------------------------------
// Conditional helpers
// ---------------------------------------------------------------------------

export function isRaising(answers: Answers): boolean {
  const s = answers.Q11 as string | undefined;
  return s === "planning" || s === "raising";
}

export function hasClosedRound(answers: Answers): boolean {
  return (answers.Q11 as string | undefined) === "closed";
}

/** Q11A (raise amount) applies when raising or when a round was just closed */
export function needsRaiseAmount(answers: Answers): boolean {
  return isRaising(answers) || hasClosedRound(answers);
}

/** Q11B (use of funds) applies only when planning / currently raising */
export function needsUseOfFunds(answers: Answers): boolean {
  return isRaising(answers);
}

export function needsOutcome(answers: Answers): boolean {
  // Q11C is optional, but only meaningful when a round exists
  return needsRaiseAmount(answers);
}

// ---------------------------------------------------------------------------
// The three batches
// ---------------------------------------------------------------------------

export const BATCH_1: Question[] = [
  {
    id: "Q1A",
    label: "What is your primary business model?",
    type: "select",
    required: true,
    options: BUSINESS_MODELS,
  },
  {
    id: "Q1B",
    label: "Who do you primarily sell to?",
    type: "select",
    required: true,
    options: SELL_TO,
  },
  {
    id: "Q1C",
    label: "How do customers pay you?",
    help: "Optional — one line.",
    placeholder:
      "e.g. monthly subscription, transaction fee, annual enterprise contract",
    type: "text",
    required: false,
  },
  {
    id: DESCRIPTION_QUESTION_ID,
    label: "Describe Your Startup",
    help: `Tell us about your startup, what it does, the problem it solves, and what makes it valuable. Maximum ${DESCRIPTION_MAX_WORDS} words.`,
    placeholder:
      "We help mid-market logistics teams cut empty-mile waste by matching backhauls in real time...",
    type: "textarea",
    required: true,
    maxWords: DESCRIPTION_MAX_WORDS,
  },
  {
    id: "Q2",
    label: "What is your TAM (Total Addressable Market)?",
    help: "Value + currency + unit. Stored as entered (e.g. 500 Cr).",
    type: "money",
    required: true,
  },
  {
    id: "Q3",
    label: "What is your SAM (Serviceable Addressable Market)?",
    help: "Value + currency + unit.",
    type: "money",
    required: true,
  },
  {
    id: "Q4",
    label: "What is your SOM (Serviceable Obtainable Market)?",
    help: "Value + currency + unit.",
    type: "money",
    required: true,
  },
  {
    id: "Q5",
    label: "What is the basis for your TAM / SAM / SOM estimates?",
    placeholder:
      "industry data, customer count × pricing, reports, or your own calculation",
    type: "textarea",
    required: true,
  },
  {
    id: "Q6",
    label: "Who is your ideal customer?",
    placeholder:
      "Who are they? What industry/company type and size? Where are they located?",
    type: "textarea",
    required: true,
  },
  {
    id: "Q7",
    label: "What stage is your product currently at?",
    type: "select",
    required: true,
    options: PRODUCT_STAGES,
  },
  {
    id: "Q7_DEMO",
    label: "Demo link",
    help: "Optional — https://...",
    placeholder: "https://demo.yourcompany.com",
    type: "url",
    required: false,
  },
  {
    id: "Q7_SCREENSHOT",
    label: "Screenshot upload",
    help: "Optional — only needed if you have no demo link. PNG, JPG or WebP up to 5 MB.",
    type: "file",
    required: false,
  },
];

export const BATCH_2: Question[] = [
  {
    id: "Q8",
    label: "Who or what are you competing against today?",
    help:
      'Up to 5. Include existing alternatives such as spreadsheets, manual processes, or "doing nothing".',
    type: "repeatable",
    required: true,
    minItems: 1,
    maxItems: 5,
    placeholder: "Competitor or alternative you face today",
  },
  {
    id: "Q9",
    label: "What makes your company difficult to replicate?",
    help: "Select all that apply.",
    type: "multiselect",
    required: true,
    options: MOAT_OPTIONS,
    followUp: {
      id: "Q9_TEXT",
      label: "Briefly explain your moat",
      placeholder: "Optional — one or two lines",
    },
  },
  {
    id: "Q10",
    label: "How do you acquire customers?",
    help: "Select all that apply.",
    type: "multiselect",
    required: true,
    options: ACQUISITION_OPTIONS,
    followUp: {
      id: "Q10_TEXT",
      label: "Briefly describe your go-to-market strategy",
      placeholder: "Optional — one or two lines",
    },
  },
];

export const BATCH_3: Question[] = [
  {
    id: "Q11",
    label: "What best describes your current fundraising status?",
    type: "select",
    required: true,
    options: FUNDRAISING_STATUSES.map((s) => s.value),
    // option labels rendered from FUNDRAISING_STATUSES
  },
  {
    id: "Q11A",
    label: "How much are you raising (or did you raise)?",
    help: "Currency + unit.",
    type: "money",
    required: false,
    visibleWhen: needsRaiseAmount,
    requiredWhen: needsRaiseAmount,
  },
  {
    id: "Q11B",
    label: "How will you use the funds?",
    help: "Total must equal exactly 100%.",
    type: "allocations",
    required: false,
    visibleWhen: needsUseOfFunds,
    requiredWhen: needsUseOfFunds,
  },
  {
    id: "Q11C",
    label: "What will this funding help you achieve in the next 12-18 months?",
    help:
      "Optional. Examples: launch in new markets, reach a customer milestone, expand the team, reach profitability.",
    type: "textarea",
    required: false,
    visibleWhen: needsOutcome,
    labelWhen: (a) =>
      hasClosedRound(a) ? "What will this funding help you achieve?" : undefined,
  },
  {
    id: "Q12",
    label: "Confirm your contact email",
    help: "Pre-filled from your account. This appears on the closing slide.",
    type: "email",
    required: true,
  },
];

export const BATCH_QUESTIONS: Record<BatchNumber, Question[]> = {
  1: BATCH_1,
  2: BATCH_2,
  3: BATCH_3,
};

// ---------------------------------------------------------------------------
// Answers helpers
// ---------------------------------------------------------------------------

export function defaultAnswers(): Answers {
  return {
    Q8: [{ name: "", difference: "" }],
    Q9: [],
    Q10: [],
    Q11B: {
      product: 0,
      sales: 0,
      hiring: 0,
      operations: 0,
      other: 0,
      otherLabel: "",
    },
  };
}

export function asMoney(value: unknown): MoneyAnswer {
  if (value && typeof value === "object") {
    const v = value as Partial<MoneyAnswer>;
    return {
      value: v.value ?? "",
      currency: v.currency ?? "$",
      unit: v.unit ?? "Million",
    };
  }
  return { value: "", currency: "$", unit: "Million" };
}

export function asCompetitors(value: unknown): CompetitorAnswer[] {
  if (Array.isArray(value)) {
    return value.map((c) => {
      const row = (c ?? {}) as Partial<CompetitorAnswer>;
      return { name: row.name ?? "", difference: row.difference ?? "" };
    });
  }
  return [{ name: "", difference: "" }];
}

export function asAllocation(value: unknown): AllocationAnswer {
  const v = (value ?? {}) as Partial<AllocationAnswer>;
  return {
    product: Number(v.product) || 0,
    sales: Number(v.sales) || 0,
    hiring: Number(v.hiring) || 0,
    operations: Number(v.operations) || 0,
    other: Number(v.other) || 0,
    otherLabel: v.otherLabel ?? "",
  };
}

export function allocationTotal(value: unknown): number {
  const a = asAllocation(value);
  return a.product + a.sales + a.hiring + a.operations + a.other;
}

const UNIT_MULTIPLIER: Record<string, number> = {
  Lakh: 1e5,
  Crore: 1e7,
  Million: 1e6,
  Billion: 1e9,
};

/** Normalised numeric value for market-size ordering checks. */
export function normalizeMoney(value: unknown): number | null {
  const m = asMoney(value);
  const raw = parseFloat(m.value);
  if (!Number.isFinite(raw)) return null;
  return raw * (UNIT_MULTIPLIER[m.unit] ?? 1);
}

/** Human-readable market value exactly as the founder entered it, e.g. "500 Cr". */
export function formatMoney(value: unknown): string {
  const m = asMoney(value);
  if (!m.value) return "";
  const unitAbbrev: Record<string, string> = {
    Lakh: "L",
    Crore: "Cr",
    Million: "M",
    Billion: "B",
  };
  return `${m.currency === "Other" ? "" : m.currency}${m.value} ${
    unitAbbrev[m.unit] ?? m.unit
  }`.trim();
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function truncateToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ");
}

export function isVisible(question: Question, answers: Answers): boolean {
  return question.visibleWhen ? question.visibleWhen(answers) : true;
}

export function isRequired(question: Question, answers: Answers): boolean {
  if (question.visibleWhen && !isVisible(question, answers)) return false;
  if (question.requiredWhen) return question.requiredWhen(answers);
  return question.required;
}

function isEmptyValue(question: Question, answers: Answers): boolean {
  const value = answers[question.id];
  switch (question.type) {
    case "select":
    case "text":
    case "textarea":
    case "url":
    case "email":
    case "file":
      return !String(value ?? "").trim();
    case "number":
      return value === undefined || value === null || String(value).trim() === "";
    case "money":
      return !asMoney(value).value.trim();
    case "multiselect":
      return !Array.isArray(value) || value.length === 0;
    case "repeatable":
      return !asCompetitors(value).some((c) => c.name.trim());
    case "allocations":
      return false; // handled separately (total must equal 100)
    default:
      return false;
  }
}

export type ValidationErrors = Record<string, string>;

/** Validates one batch. Returns {} when the batch may be completed. */
export function validateBatch(batch: BatchNumber, answers: Answers): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const question of BATCH_QUESTIONS[batch]) {
    if (!isVisible(question, answers)) continue;
    if (isRequired(question, answers) && isEmptyValue(question, answers)) {
      errors[question.id] = "This field is required.";
      continue;
    }

    const value = answers[question.id];

    if (question.type === "email" && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        errors[question.id] = "Enter a valid email address.";
      }
    }

    if (question.type === "url" && value) {
      if (!/^https?:\/\/.+/i.test(String(value))) {
        errors[question.id] = "Enter a valid URL starting with http:// or https://";
      }
    }

    if (question.type === "textarea" && question.maxWords && value) {
      const words = countWords(String(value));
      if (words > question.maxWords) {
        errors[question.id] = `Reduce your answer to ${question.maxWords} words (currently ${words}).`;
      }
    }

    if (question.type === "money" && value) {
      const m = asMoney(value);
      if (m.value && !(parseFloat(m.value) > 0)) {
        errors[question.id] = "Enter a number greater than 0.";
      }
    }

    if (question.type === "repeatable") {
      const rows = asCompetitors(value);
      if (rows.length > (question.maxItems ?? 5)) {
        errors[question.id] = `You can list up to ${question.maxItems ?? 5}.`;
      }
      if (rows.some((r) => !r.name.trim()) && rows.some((r) => r.name.trim())) {
        errors[question.id] = "Every competitor needs a name (or remove empty rows).";
      }
    }

    if (question.type === "allocations") {
      const total = allocationTotal(value);
      if (question.requiredWhen?.(answers) && total !== 100) {
        errors[question.id] =
          total > 100
            ? "Your allocation exceeds 100%."
            : `Add ${100 - total}% more to continue.`;
      }
    }
  }

  // Non-blocking extra rule: at least one fundraising follow-up must make sense
  return errors;
}

/** Soft warning (never blocks): TAM ≥ SAM ≥ SOM */
export function marketSizeWarning(answers: Answers): string | null {
  const tam = normalizeMoney(answers.Q2);
  const sam = normalizeMoney(answers.Q3);
  const som = normalizeMoney(answers.Q4);
  if (tam === null || sam === null || som === null) return null;
  if (tam >= sam && sam >= som) return null;
  return "Your market estimates usually follow TAM ≥ SAM ≥ SOM. Please check these values.";
}

/** Non-blocking nudge for competitors without a differentiation line. */
export function competitionNudge(answers: Answers): string | null {
  const rows = asCompetitors(answers.Q8);
  const named = rows.filter((r) => r.name.trim());
  if (named.length === 0) return null;
  if (named.some((r) => r.name.trim() && !r.difference.trim())) {
    return "Add a line to strengthen your Competition slide.";
  }
  return null;
}

export function batchErrorsFor(answers: Answers): Record<BatchNumber, ValidationErrors> {
  return {
    1: validateBatch(1, answers),
    2: validateBatch(2, answers),
    3: validateBatch(3, answers),
  };
}

export function isBatchComplete(batch: BatchNumber, answers: Answers): boolean {
  return Object.keys(validateBatch(batch, answers)).length === 0;
}

export function allBatchesComplete(answers: Answers): boolean {
  return BATCHES.every((b) => isBatchComplete(b, answers));
}

export function questionnaireProgress(answers: Answers): number {
  const completed = BATCHES.filter((b) => isBatchComplete(b, answers)).length;
  return Math.round((completed / BATCHES.length) * 100);
}

/** All answer keys the questionnaire may write (questions + follow-ups). */
export const ALL_ANSWER_IDS: string[] = (() => {
  const ids = new Set<string>();
  for (const batch of BATCHES) {
    for (const q of BATCH_QUESTIONS[batch]) {
      ids.add(q.id);
      if (q.followUp) ids.add(q.followUp.id);
    }
  }
  return Array.from(ids);
})();

const ANSWER_ID_SET = new Set(ALL_ANSWER_IDS);

/**
 * Keeps only known answer keys. Prevents arbitrary JSON from being persisted
 * into the answers column and keeps batch payloads (which may contain stale
 * fields from a previous render) from overwriting unrelated answers.
 */
export function sanitizeAnswers(partial: unknown): Answers {
  if (!partial || typeof partial !== "object") return {};
  const out: Answers = {};
  for (const [key, value] of Object.entries(partial as Record<string, unknown>)) {
    if (ANSWER_ID_SET.has(key)) out[key] = value;
  }
  return out;
}
