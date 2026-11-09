import crypto from "crypto";
import type { ImpactClaimStatus } from "@/db/schema";
import { normalizeSdgPrimary, sanitizeSdgIds } from "./taxonomy";
import {
  formatFeeRate,
  STANDARD_SUCCESS_FEE_RATE,
  VERIFIED_IMPACT_SUCCESS_FEE_RATE,
  type ImpactStatus,
} from "./status";

/**
 * Server-side impact verification rules.
 *
 * The single invariant: a claim is only verified while its stored signature
 * still matches the startup's current SDG selection and impact description.
 * Editing the claim therefore makes an earlier approval stale instead of
 * silently presenting outdated claims as verified.
 */

export type ImpactClaimLike =
  | {
      status: ImpactClaimStatus;
      impactDescription: string;
      sdgGoals: number[];
      sdgPrimary: number | null;
      claimSignature: string;
    }
  | null
  | undefined;

export type StartupClaimSignals = {
  sdgGoals: number[] | null | undefined;
  sdgPrimary: number | null | undefined;
  impactDescription: string | null | undefined;
};

/** Trimmed, newline-normalised description used for hashing and storage. */
export function normalizeImpactDescription(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").trim();
}

/**
 * Stable hash of the exact claim an admin reviewed. Goal order and duplicate
 * selections never change the signature; any material edit does.
 */
export function computeClaimSignature(input: StartupClaimSignals): string {
  const goals = sanitizeSdgIds(input.sdgGoals ?? []);
  const primary = normalizeSdgPrimary(goals, input.sdgPrimary);
  const description = normalizeImpactDescription(input.impactDescription);
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ goals, primary, description }))
    .digest("hex");
}

export function claimIsCurrent(
  claim: ImpactClaimLike,
  startup: StartupClaimSignals
): boolean {
  if (!claim) return false;
  return claim.claimSignature === computeClaimSignature(startup);
}

/**
 * The status to show for a startup, accounting for edits made after review.
 * A missing claim is never treated as verified.
 */
export function effectiveImpactStatus(
  startup: StartupClaimSignals,
  claim: ImpactClaimLike
): ImpactStatus {
  if (!claim) return "not_submitted";
  if (claim.status === "verified" && !claimIsCurrent(claim, startup)) {
    return "stale";
  }
  return claim.status;
}

export function hasVerifiedImpact(
  startup: StartupClaimSignals,
  claim: ImpactClaimLike
): boolean {
  return effectiveImpactStatus(startup, claim) === "verified";
}

export type SuccessFeeEligibility = {
  eligible: boolean;
  rate: number;
  label: string;
  reason: string;
};

/**
 * Groundwork for the existing 0%-success-fee policy for verified impact
 * startups. It is deliberately a pure calculation: no fee record, invoice or
 * past transaction is ever rewritten by the SDG layer.
 */
export function successFeeEligibility(
  startup: StartupClaimSignals,
  claim: ImpactClaimLike
): SuccessFeeEligibility {
  const status = effectiveImpactStatus(startup, claim);
  if (status === "verified") {
    return {
      eligible: true,
      rate: VERIFIED_IMPACT_SUCCESS_FEE_RATE,
      label: formatFeeRate(VERIFIED_IMPACT_SUCCESS_FEE_RATE),
      reason: "Verified impact claims qualify for the 0% success fee policy.",
    };
  }

  const reason =
    status === "stale"
      ? "The verified impact claim changed after review, so it must be reviewed again before 0% fee eligibility applies."
      : status === "pending"
        ? "Impact claim is awaiting admin review. The standard fee applies until it is verified."
        : "The standard success fee applies until an impact claim is verified.";

  return {
    eligible: false,
    rate: STANDARD_SUCCESS_FEE_RATE,
    label: formatFeeRate(STANDARD_SUCCESS_FEE_RATE),
    reason,
  };
}
