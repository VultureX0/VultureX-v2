import type { ImpactClaimStatus } from "@/db/schema";

/**
 * Client-safe labels and policy constants for the SDG impact layer.
 *
 * Kept separate from verification.ts because that module needs Node's crypto
 * (claim signatures) and must never be pulled into a client bundle.
 */

export type ImpactStatus = ImpactClaimStatus | "not_submitted" | "stale";

export const IMPACT_STATUS_LABELS: Record<ImpactStatus, string> = {
  not_submitted: "Not submitted",
  pending: "Pending review",
  verified: "Verified impact",
  rejected: "Rejected",
  changes_requested: "Additional information required",
  // A previously verified claim whose content changed after review. It is
  // intentionally NOT presented as verified until an admin reviews it again.
  stale: "Verification outdated",
};

export function impactStatusTone(
  status: ImpactStatus
): "accent" | "green" | "amber" | "red" | "default" {
  switch (status) {
    case "verified":
      return "green";
    case "pending":
      return "accent";
    case "changes_requested":
    case "stale":
      return "amber";
    case "rejected":
      return "red";
    default:
      return "default";
  }
}

/**
 * Existing VultureX policy: closed deals carry a 3% success fee and startups
 * with verified impact qualify for 0%. The rate is centralised here so the
 * same rule is used wherever eligibility is shown.
 */
export const STANDARD_SUCCESS_FEE_RATE = 0.03;
export const VERIFIED_IMPACT_SUCCESS_FEE_RATE = 0;

export function formatFeeRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export const IMPACT_METHODOLOGY_NOTE =
  "SDG selection is self-declared. Only an admin-reviewed claim can show a verified impact badge, and verification does not guarantee commercial or impact outcomes.";

export const MIN_IMPACT_DESCRIPTION_LENGTH = 40;
export const MAX_IMPACT_DESCRIPTION_LENGTH = 4000;
