import type { CompetitionStatus, WinnerAnnouncementStatus } from "@/db/schema";
import { SDG_GOALS as SDG_TAXONOMY, sdgLabel as taxonomySdgLabel } from "@/features/sdg/taxonomy";

/**
 * Shared vocabulary for the Competitions module. The values mirror the fields
 * already used by startup profiles (sector, stage) so eligibility can be
 * evaluated against real profile data.
 */

export const COMPETITION_STAGES = [
  "pre-seed",
  "seed",
  "series-a",
  "series-b",
  "growth",
] as const;

export const COMPETITION_SECTORS = [
  "saas",
  "fintech",
  "ai/ml",
  "healthtech",
  "edtech",
  "climate",
  "e-commerce",
  "marketplace",
  "other",
] as const;

export const COMPETITION_CURRENCIES = ["USD", "EUR", "GBP", "INR"] as const;

/** Criteria offered in the builder. Investors may add their own on top. */
export const STANDARD_CRITERIA: { key: string; label: string }[] = [
  { key: "innovation", label: "Innovation" },
  { key: "feasibility", label: "Feasibility" },
  { key: "impact", label: "Impact" },
  { key: "scalability", label: "Scalability" },
  { key: "technical", label: "Technical innovation" },
  { key: "market", label: "Market potential" },
  { key: "team", label: "Team" },
  { key: "traction", label: "Traction" },
  { key: "product", label: "Product quality" },
  { key: "revenue_growth", label: "Revenue growth" },
  { key: "market_size", label: "Market size" },
  { key: "sdg_impact", label: "SDG impact" },
];

// The official taxonomy lives in features/sdg/taxonomy.ts. Competitions keep
// their compact { id, label } shape so existing components and forms work
// unchanged, but every value now comes from that single source.
export const SDG_GOALS: { id: number; label: string }[] = SDG_TAXONOMY.map(
  (goal) => ({ id: goal.id, label: goal.shortName })
);

export const STATUS_LABELS: Record<CompetitionStatus, string> = {
  draft: "Draft",
  pending_review: "Pending admin review",
  changes_requested: "Changes requested",
  rejected: "Rejected",
  approved: "Approved",
  scheduled: "Scheduled",
  open: "Open",
  closed: "Closed",
  under_evaluation: "Under evaluation",
  completed: "Completed",
  active: "Active",
};

export const WINNER_ANNOUNCEMENT_LABELS: Record<
  WinnerAnnouncementStatus,
  string
> = {
  none: "No winner proposed",
  pending_approval: "Winner pending admin approval",
  changes_requested: "Winner changes requested",
  approved: "Winner approved",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  shortlisted: "Shortlisted",
  accepted: "Selected",
  rejected: "Not selected",
  withdrawn: "Withdrawn",
};

/** Visual tone for status chips, matching the existing Badge variants. */
export function statusTone(status: string): "accent" | "green" | "default" {
  if (status === "open" || status === "active" || status === "completed") return "green";
  if (
    status === "pending_review" ||
    status === "approved" ||
    status === "scheduled" ||
    status === "under_evaluation"
  )
    return "accent";
  return "default";
}

export function prizeLabel(input: {
  prizeAmount: number | null;
  prizeCurrency: string | null;
  prize: string | null;
}): string | null {
  if (input.prizeAmount && input.prizeAmount > 0) {
    const amount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: input.prizeCurrency || "USD",
      maximumFractionDigits: 0,
    }).format(input.prizeAmount);
    return input.prize ? `${amount} · ${input.prize}` : amount;
  }
  return input.prize || null;
}

export function benefitLabels(
  benefits: {
    mentorship?: boolean;
    incubation?: boolean;
    pilotPartnership?: boolean;
    investorVisibility?: boolean;
    other?: string | null;
  } | null
): string[] {
  if (!benefits) return [];
  const labels: string[] = [];
  if (benefits.mentorship) labels.push("Mentorship");
  if (benefits.incubation) labels.push("Incubation");
  if (benefits.pilotPartnership) labels.push("Pilot partnership");
  if (benefits.investorVisibility) labels.push("Investor visibility");
  if (benefits.other) labels.push(benefits.other);
  return labels;
}

export function sdgLabel(id: number): string {
  return taxonomySdgLabel(id);
}
