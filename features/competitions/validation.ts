import type {
  CompetitionBenefit,
  CompetitionCriterion,
  CompetitionEligibility,
} from "@/db/schema";
import { CompetitionError } from "./errors";
import { COMPETITION_CURRENCIES, SDG_GOALS } from "./types";

export type CompetitionInput = {
  title: string | null;
  summary: string | null;
  description: string | null;
  category: string | null;
  hostOrganization: string | null;
  bannerUrl: string | null;
  openAt: Date | null;
  deadline: Date | null;
  evaluationEndsAt: Date | null;
  winnerAnnouncementAt: Date | null;
  completionAt: Date | null;
  prizeAmount: number | null;
  prizeCurrency: string;
  prizeDescription: string | null;
  benefits: CompetitionBenefit;
  eligibility: CompetitionEligibility;
  criteria: CompetitionCriterion[];
  sdgGoals: number[];
  sdgPrimary: number | null;
  rules: string | null;
};

const MAX_TEXT = 20000;

function str(value: unknown, max: number, field: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    throw new CompetitionError(`${field} must be text.`, 400, "INVALID_FIELD");
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new CompetitionError(
      `${field} is too long (max ${max} characters).`,
      400,
      "INVALID_FIELD"
    );
  }
  return trimmed || null;
}

function bool(value: unknown): boolean {
  return value === true;
}

function date(value: unknown, field: string): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" && !(value instanceof Date)) {
    throw new CompetitionError(
      `${field} must be a date.`,
      400,
      "INVALID_DATE"
    );
  }
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new CompetitionError(
      `${field} is not a valid date.`,
      400,
      "INVALID_DATE"
    );
  }
  return parsed;
}

function num(value: unknown, field: string): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new CompetitionError(
      `${field} must be a positive number.`,
      400,
      "INVALID_FIELD"
    );
  }
  return parsed;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter(Boolean)
    ),
  ].slice(0, 20);
}

/**
 * Normalizes a client payload. Every value is coerced to a known shape and
 * length-limited here; the route never writes raw request JSON to the database.
 */
export function normalizeCompetitionInput(
  raw: unknown,
  fallbackHost: string | null
): CompetitionInput {
  const body = (raw ?? {}) as Record<string, unknown>;
  const benefitsRaw = (body.benefits ?? {}) as Record<string, unknown>;
  const eligibilityRaw = (body.eligibility ?? {}) as Record<string, unknown>;

  const currency =
    typeof body.prizeCurrency === "string" &&
    (COMPETITION_CURRENCIES as readonly string[]).includes(body.prizeCurrency)
      ? body.prizeCurrency
      : "USD";

  const criteriaRaw = Array.isArray(body.criteria) ? body.criteria : [];
  const seen = new Set<string>();
  const criteria: CompetitionCriterion[] = [];
  for (const entry of criteriaRaw.slice(0, 12)) {
    const item = (entry ?? {}) as Record<string, unknown>;
    const label = str(item.label, 80, "Criterion name");
    if (!label) continue;
    const key =
      typeof item.key === "string" && /^[a-z0-9_]{2,40}$/.test(item.key)
        ? item.key
        : label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const weight = num(item.weight, "Criterion weight");
    criteria.push({ key, label, weight: weight === null ? 0 : weight });
  }

  const minMrr = num(eligibilityRaw.minMrr, "Minimum MRR");
  const maxMrr = num(eligibilityRaw.maxMrr, "Maximum MRR");

  const sdgGoals = Array.isArray(body.sdgGoals)
    ? [
        ...new Set(
          body.sdgGoals
            .map((value) => Number(value))
            .filter(
              (value) =>
                Number.isInteger(value) &&
                SDG_GOALS.some((goal) => goal.id === value)
            )
        ),
      ].slice(0, 17)
    : [];

  // The primary focus must be one of the selected goals; otherwise it is
  // cleared rather than stored as a dangling reference.
  const sdgPrimaryRaw = Number(body.sdgPrimary);
  const sdgPrimary = sdgGoals.includes(sdgPrimaryRaw) ? sdgPrimaryRaw : null;

  const requiredSdgs = Array.isArray(eligibilityRaw.requiredSdgs)
    ? [
        ...new Set(
          eligibilityRaw.requiredSdgs
            .map((value) => Number(value))
            .filter(
              (value) =>
                Number.isInteger(value) &&
                SDG_GOALS.some((goal) => goal.id === value)
            )
        ),
      ].slice(0, 17)
    : [];

  return {
    title: str(body.title, 160, "Title"),
    summary: str(body.summary, 400, "Short summary"),
    description: str(body.description, MAX_TEXT, "Description"),
    category: str(body.category, 60, "Category"),
    hostOrganization:
      str(body.hostOrganization, 160, "Host organization") || fallbackHost,
    bannerUrl: str(body.bannerUrl, 500, "Banner URL"),
    openAt: date(body.openAt, "Opening date"),
    deadline: date(body.deadline, "Application deadline"),
    evaluationEndsAt: date(body.evaluationEndsAt, "Evaluation end date"),
    winnerAnnouncementAt: date(
      body.winnerAnnouncementAt,
      "Winner announcement date"
    ),
    completionAt: date(body.completionAt, "Completion date"),
    prizeAmount: num(body.prizeAmount, "Prize amount"),
    prizeCurrency: currency,
    prizeDescription: str(body.prizeDescription, 500, "Prize description"),
    benefits: {
      mentorship: bool(benefitsRaw.mentorship),
      incubation: bool(benefitsRaw.incubation),
      pilotPartnership: bool(benefitsRaw.pilotPartnership),
      investorVisibility: bool(benefitsRaw.investorVisibility),
      other: str(benefitsRaw.other, 300, "Other benefits"),
    },
    eligibility: {
      allStages: eligibilityRaw.allStages !== false,
      stages: stringList(eligibilityRaw.stages),
      sectors: stringList(eligibilityRaw.sectors),
      minMrr,
      maxMrr,
      regions: stringList(eligibilityRaw.regions),
      requirements: str(
        eligibilityRaw.requirements,
        2000,
        "Additional requirements"
      ),
      requiredSdgs,
      requireVerifiedImpact: bool(eligibilityRaw.requireVerifiedImpact),
    },
    criteria,
    sdgGoals,
    sdgPrimary,
    rules: str(body.rules, MAX_TEXT, "Rules"),
  };
}

/**
 * Extra checks required before a draft can be submitted for admin review.
 * Returns a list of human-readable problems; empty means the proposal is
 * complete enough to review.
 */
export function submissionProblems(input: CompetitionInput): string[] {
  const problems: string[] = [];
  if (!input.title || input.title.length < 3)
    problems.push("Add a competition title (at least 3 characters).");
  if (!input.summary || input.summary.length < 10)
    problems.push("Add a short summary (at least 10 characters).");
  if (!input.description || input.description.length < 30)
    problems.push("Add a full description (at least 30 characters).");
  if (!input.category) problems.push("Choose a category or theme.");

  if (!input.openAt) problems.push("Set the application opening date.");
  if (!input.deadline) problems.push("Set the application deadline.");
  if (input.openAt && input.deadline && input.deadline <= input.openAt)
    problems.push("The deadline must be after the opening date.");
  if (input.deadline && input.evaluationEndsAt && input.evaluationEndsAt < input.deadline)
    problems.push("The evaluation period cannot end before applications close.");
  if (
    input.evaluationEndsAt &&
    input.winnerAnnouncementAt &&
    input.winnerAnnouncementAt < input.evaluationEndsAt
  )
    problems.push("The winner announcement cannot precede the evaluation period.");
  if (
    input.winnerAnnouncementAt &&
    input.completionAt &&
    input.completionAt < input.winnerAnnouncementAt
  )
    problems.push("The completion date cannot precede the winner announcement.");

  if (input.prizeAmount !== null && input.prizeAmount <= 0)
    problems.push("Enter a prize amount greater than zero, or leave it blank.");

  if (input.criteria.length === 0)
    problems.push("Add at least one evaluation criterion.");
  const total = input.criteria.reduce((sum, entry) => sum + entry.weight, 0);
  if (input.criteria.length > 0 && Math.abs(total - 100) > 0.01)
    problems.push(
      `Evaluation weights must add up to 100% (currently ${Math.round(total * 100) / 100}%).`
    );
  if (input.criteria.some((entry) => entry.weight < 0 || entry.weight > 100))
    problems.push("Each criterion weight must be between 0 and 100.");

  if (
    input.eligibility.minMrr !== null &&
    input.eligibility.maxMrr !== null &&
    input.eligibility.minMrr > input.eligibility.maxMrr
  )
    problems.push("Minimum revenue cannot be greater than maximum revenue.");

  return problems;
}
