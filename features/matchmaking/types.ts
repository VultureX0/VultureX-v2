/**
 * Shared types for the business matchmaking engine.
 *
 * These are intentionally dependency-free (no database imports) so the engine
 * can be unit-tested on its own and reused from server components, API routes
 * and scripts alike.
 */

export type MatchDimension =
  | "supplier"
  | "complementary"
  | "needs"
  | "industry"
  | "market";

export type MatchStrength = "high" | "good" | "possible";

export type MatchReason = {
  dimension: MatchDimension;
  label: string;
  detail: string;
};

export type MatchReasons = {
  aToB: MatchReason[];
  bToA: MatchReason[];
};

export type MatchRelationshipType =
  | "supplier_customer"
  | "complementary"
  | "needs_alignment"
  | "industry"
  | "shared_market";

/** The subset of `startups` the engine reads. All signals are optional. */
export type MatchProfile = {
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  tagline: string | null;
  sector: string | null;
  stage: string | null;
  location: string | null;
  problem: string | null;
  solution: string | null;
  tags: string[] | null;
  offerings: string[] | null;
  needs: string[] | null;
  targetCustomers: string[] | null;
  isPublic: boolean | null;
};

export type MatchConfig = {
  /** Weights are only applied to dimensions that can actually be evaluated. */
  weights: Record<MatchDimension, number>;
  minScore: number;
  strengthBands: { high: number; good: number };
  maxCandidates: number;
  pageSize: number;
};

export type DimensionScore = {
  dimension: MatchDimension;
  /** 0..1, or null when the profiles do not contain enough data to evaluate it. */
  score: number | null;
  /** Points contributed to the final 0..100 score (already weight-normalized). */
  points: number;
};

export type MatchResult = {
  /** Symmetric 0..100 relevance score. */
  score: number;
  strength: MatchStrength;
  relationshipType: MatchRelationshipType;
  reasons: MatchReasons;
  dimensions: DimensionScore[];
  /** True when the pair clears the evidence gate and the configured threshold. */
  eligible: boolean;
  evidence: boolean;
  signalsHash: string;
};

export const MATCH_RELATIONSHIP_LABELS: Record<MatchRelationshipType, string> = {
  supplier_customer: "Supplier / customer",
  complementary: "Complementary",
  needs_alignment: "Business needs",
  industry: "Related industry",
  shared_market: "Shared customers",
};

export const MATCH_STRENGTH_LABELS: Record<MatchStrength, string> = {
  high: "High relevance",
  good: "Good potential",
  possible: "Possible fit",
};
