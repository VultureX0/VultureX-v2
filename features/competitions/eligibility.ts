import type { startups } from "@/db/schema";
import type { CompetitionEligibility } from "@/db/schema";
import { sdgLabel } from "../sdg/taxonomy";
import type { ImpactStatus } from "../sdg/status";

type StartupProfile = Pick<
  typeof startups.$inferSelect,
  "stage" | "sector" | "mrr" | "location" | "sdgGoals"
>;

/** Optional impact context, resolved from the startup's impact claim. */
export type ImpactEligibilityContext = {
  status: ImpactStatus;
};

export type EligibilityStatus =
  | "eligible"
  | "ineligible"
  | "needs_info"
  | "open";

export type EligibilityResult = {
  status: EligibilityStatus;
  /** Human-readable explanations, always derived from the stored profile. */
  reasons: string[];
  /** Required attributes the profile has not filled in yet. */
  missing: string[];
};

const EMPTY: CompetitionEligibility = {
  allStages: true,
  stages: [],
  sectors: [],
  minMrr: null,
  maxMrr: null,
  regions: [],
  requirements: null,
};

/**
 * Evaluates a startup against a competition's eligibility rules using the
 * profile that already exists on VultureX. Unknown profile attributes are
 * reported as "needs info" — never assumed to pass.
 *
 * `startups.mrr` is stored in cents (the onboarding form multiplies by 100),
 * while eligibility bounds are entered in whole currency units, so the
 * comparison converts once here.
 */
export function evaluateEligibility(
  startup: StartupProfile | null,
  rawEligibility: CompetitionEligibility | null | undefined,
  impact?: ImpactEligibilityContext | null
): EligibilityResult {
  const eligibility = { ...EMPTY, ...(rawEligibility ?? {}) };

  if (!startup) {
    return {
      status: "needs_info",
      reasons: ["Create your startup profile before applying."],
      missing: ["startup profile"],
    };
  }

  const reasons: string[] = [];
  const missing: string[] = [];

  // Stages -----------------------------------------------------------------
  if (!eligibility.allStages && eligibility.stages.length > 0) {
    if (!startup.stage) {
      missing.push("startup stage");
    } else if (
      !eligibility.stages.some(
        (stage) => stage.toLowerCase() === startup.stage.toLowerCase()
      )
    ) {
      reasons.push(
        `This competition is limited to ${eligibility.stages.join(", ")} startups; your profile is ${startup.stage}.`
      );
    }
  }

  // Sectors ----------------------------------------------------------------
  if (eligibility.sectors.length > 0) {
    if (!startup.sector) {
      missing.push("sector");
    } else if (
      !eligibility.sectors.some(
        (sector) => sector.toLowerCase() === startup.sector!.toLowerCase()
      )
    ) {
      reasons.push(
        `This competition is limited to ${eligibility.sectors.join(", ")}; your sector is ${startup.sector}.`
      );
    }
  }

  // Revenue ----------------------------------------------------------------
  const mrr =
    typeof startup.mrr === "number" ? Math.round(startup.mrr / 100) : null;
  if (eligibility.minMrr !== null && eligibility.minMrr !== undefined) {
    if (mrr === null) missing.push("monthly revenue");
    else if (mrr < eligibility.minMrr)
      reasons.push(
        `Requires at least ${formatMoney(eligibility.minMrr)} monthly revenue; your profile shows ${formatMoney(mrr)}.`
      );
  }
  if (eligibility.maxMrr !== null && eligibility.maxMrr !== undefined) {
    if (mrr === null) missing.push("monthly revenue");
    else if (mrr > eligibility.maxMrr)
      reasons.push(
        `Requires at most ${formatMoney(eligibility.maxMrr)} monthly revenue; your profile shows ${formatMoney(mrr)}.`
      );
  }

  // Geography --------------------------------------------------------------
  if (eligibility.regions.length > 0) {
    if (!startup.location) {
      missing.push("location");
    } else if (
      !eligibility.regions.some((region) =>
        startup.location!.toLowerCase().includes(region.toLowerCase())
      )
    ) {
      reasons.push(
        `This competition is open to ${eligibility.regions.join(", ")}; your location is ${startup.location}.`
      );
    }
  }

  // SDG requirements -------------------------------------------------------
  // Only enforced when the host explicitly required them. A competition with
  // no impact requirement stays open to startups that never selected a goal.
  const requiredSdgs = eligibility.requiredSdgs ?? [];
  if (requiredSdgs.length > 0) {
    const goals = startup.sdgGoals ?? [];
    const requiredLabels = requiredSdgs.map(sdgLabel).join(", ");
    if (goals.length === 0) {
      reasons.push(
        `This competition requires SDG alignment with ${requiredLabels}; your profile has no goals selected.`
      );
    } else if (!requiredSdgs.some((id) => goals.includes(id))) {
      reasons.push(
        `This competition requires alignment with ${requiredLabels}; your selected goals are ${goals.map(sdgLabel).join(", ")}.`
      );
    }
  }

  if (eligibility.requireVerifiedImpact) {
    const status = impact?.status ?? "not_submitted";
    if (status === "pending") {
      reasons.push(
        "This competition requires verified impact. Your claim is awaiting admin review."
      );
    } else if (status === "stale") {
      reasons.push(
        "This competition requires verified impact. Your claim changed after review and must be reviewed again."
      );
    } else if (status !== "verified") {
      reasons.push(
        "This competition requires verified impact. Self-declared SDG selection alone does not satisfy this requirement."
      );
    }
  }

  if (reasons.length > 0) {
    return { status: "ineligible", reasons, missing: [] };
  }
  if (missing.length > 0) {
    return {
      status: "needs_info",
      reasons: [
        `Add ${missing.join(", ")} to your startup profile so eligibility can be checked.`,
      ],
      missing,
    };
  }
  if (
    eligibility.allStages &&
    eligibility.sectors.length === 0 &&
    eligibility.minMrr === null &&
    eligibility.maxMrr === null &&
    eligibility.regions.length === 0 &&
    requiredSdgs.length === 0 &&
    !eligibility.requireVerifiedImpact
  ) {
    return {
      status: "open",
      reasons: ["Open to every stage and sector on VultureX."],
      missing: [],
    };
  }
  return {
    status: "eligible",
    reasons: ["Your startup profile meets the listed requirements."],
    missing: [],
  };
}

/** Human-readable summary of the rules, used on cards and detail pages. */
export function eligibilitySummary(
  rawEligibility: CompetitionEligibility | null | undefined
): string[] {
  const eligibility = { ...EMPTY, ...(rawEligibility ?? {}) };
  const parts: string[] = [];
  parts.push(
    eligibility.allStages || eligibility.stages.length === 0
      ? "All stages"
      : eligibility.stages.join(", ")
  );
  if (eligibility.sectors.length > 0)
    parts.push(eligibility.sectors.join(", "));
  if (eligibility.minMrr !== null && eligibility.minMrr !== undefined)
    parts.push(`MRR ≥ ${formatMoney(eligibility.minMrr)}`);
  if (eligibility.maxMrr !== null && eligibility.maxMrr !== undefined)
    parts.push(`MRR ≤ ${formatMoney(eligibility.maxMrr)}`);
  if (eligibility.regions.length > 0)
    parts.push(eligibility.regions.join(", "));
  if ((eligibility.requiredSdgs ?? []).length > 0)
    parts.push(
      (eligibility.requiredSdgs ?? []).map((id) => `SDG ${id}`).join(" or ")
    );
  if (eligibility.requireVerifiedImpact) parts.push("Verified impact required");
  return parts;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
