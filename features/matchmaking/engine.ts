import {
  type AudienceId,
  AUDIENCE_LABELS,
  capabilityAffinity,
  capabilityLabel,
  detectAudiences,
  detectCapabilities,
  detectCapabilitiesInList,
  normalizeSector,
  normalizeText,
  sectorRelation,
} from "./taxonomy";
import type {
  DimensionScore,
  MatchConfig,
  MatchDimension,
  MatchProfile,
  MatchReason,
  MatchResult,
  MatchStrength,
} from "./types";

/**
 * Rules-based business matchmaking.
 *
 * Design notes
 * ------------
 * - Deterministic: the same profiles and config always produce the same score.
 * - Explainable: every point comes from a named dimension and a reason that is
 *   built from the actual fields on both profiles.
 * - Missing data safe: a dimension is only evaluated when BOTH profiles carry
 *   the signal it needs. Weights are renormalized over the evaluated
 *   dimensions, so an empty optional field never silently lowers a score.
 * - Conservative: a pair must clear a concrete-evidence gate (supplier,
 *   complementary or needs) before it can be recommended. Sharing an industry
 *   or a buzzword is not enough.
 */

// Bump this whenever weights, thresholds or rules change: the stored
// signals hash includes it, so existing rows are recalculated instead of being
// skipped as "unchanged".
export const MATCH_ENGINE_VERSION = "1.0.1";

export const MATCH_CONFIG: MatchConfig = {
  weights: {
    supplier: 0.3,
    complementary: 0.25,
    needs: 0.2,
    industry: 0.15,
    market: 0.1,
  },
  // A 0..100 relevance threshold, not a probability of partnership.
  minScore: 40,
  strengthBands: { high: 70, good: 55 },
  maxCandidates: 300,
  pageSize: 12,
};

export const DIMENSION_LABELS: Record<MatchDimension, string> = {
  supplier: "Supplier / customer fit",
  complementary: "Complementary offerings",
  needs: "Business-needs fit",
  industry: "Industry relevance",
  market: "Customer and market fit",
};

const DIMENSION_PRIORITY: MatchDimension[] = [
  "supplier",
  "needs",
  "complementary",
  "market",
  "industry",
];

const SECTOR_CAPABILITY: Record<string, string> = {
  saas: "software",
  "ai/ml": "ai_data",
  fintech: "fintech",
  banking: "fintech",
  insurance: "fintech",
  healthtech: "health",
  biotech: "health",
  healthcare: "health",
  edtech: "education",
  education: "education",
  climate: "sustainability",
  energy: "energy",
  sustainability: "sustainability",
  ecommerce: "ecommerce",
  "e-commerce": "ecommerce",
  marketplace: "ecommerce",
  retail: "distribution",
  cybersecurity: "cybersecurity",
  gaming: "media",
  media: "media",
};

export type StartupSignals = {
  profile: MatchProfile;
  name: string;
  sectorKey: string | null;
  /** Capabilities listed in offerings/tags: highest confidence. */
  explicitOfferings: Set<string>;
  /** Capabilities inferred from narrative text + sector: weaker confidence. */
  describedOfferings: Set<string>;
  needs: Set<string>;
  audiences: Set<AudienceId>;
  locationKey: string | null;
  /** True when the startup actually describes products/services it provides. */
  hasOfferingData: boolean;
  hasEnoughData: boolean;
  fingerprint: string;
};

function intersection(left: Set<string>, right: Set<string>): string[] {
  const found: string[] = [];
  for (const value of left) if (right.has(value)) found.push(value);
  found.sort();
  return found;
}

/** Small deterministic string hash (djb2). Only used for change detection. */
function hashString(value: string): string {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(index)) | 0;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function locationKey(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);
  return normalized || null;
}

function countryPart(value: string | null): string | null {
  if (!value) return null;
  const parts = value.split(",").map((part) => normalizeText(part)).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

export function buildSignals(profile: MatchProfile): StartupSignals {
  const sectorKey = normalizeSector(profile.sector);

  // Only fields the founder filled in count as explicit offerings. The sector
  // is a much weaker claim ("we are a SaaS company" does not say what we sell
  // to whom), so it joins the described signals instead.
  const explicitOfferings = new Set<string>();
  for (const id of detectCapabilitiesInList(profile.offerings)) explicitOfferings.add(id);
  for (const id of detectCapabilitiesInList(profile.tags)) explicitOfferings.add(id);

  // Capabilities described in the narrative are a weaker signal and are scored
  // with lower confidence than an offering the founder explicitly listed.
  const narrativeOfferings = new Set<string>();
  for (const id of detectCapabilities(profile.name)) narrativeOfferings.add(id);
  for (const id of detectCapabilities(profile.tagline)) narrativeOfferings.add(id);
  for (const id of detectCapabilities(profile.solution)) narrativeOfferings.add(id);
  for (const id of explicitOfferings) narrativeOfferings.delete(id);

  const describedOfferings = new Set<string>(narrativeOfferings);
  const sectorCapability = sectorKey ? SECTOR_CAPABILITY[sectorKey] : undefined;
  if (sectorCapability && !explicitOfferings.has(sectorCapability)) {
    describedOfferings.add(sectorCapability);
  }

  const needs = new Set<string>(detectCapabilitiesInList(profile.needs));

  const audiences = detectAudiences([
    ...(profile.targetCustomers ?? []),
    profile.tagline,
    profile.problem,
    profile.solution,
    profile.name,
  ]);

  const narrativeDepth =
    normalizeText(profile.tagline).length +
    normalizeText(profile.solution).length +
    normalizeText(profile.problem).length;

  const hasOfferingData = explicitOfferings.size > 0 || narrativeOfferings.size > 0;
  const hasEnoughData = hasOfferingData || needs.size > 0 || narrativeDepth >= 60;

  const fingerprint = hashString(
    [
      MATCH_ENGINE_VERSION,
      sectorKey ?? "",
      [...explicitOfferings].sort().join(","),
      [...describedOfferings].sort().join(","),
      [...needs].sort().join(","),
      [...audiences].sort().join(","),
      locationKey(profile.location) ?? "",
      normalizeText(profile.tagline),
      normalizeText(profile.solution),
      normalizeText(profile.problem),
    ].join("|")
  );

  return {
    profile,
    name: profile.name,
    sectorKey,
    explicitOfferings,
    describedOfferings,
    needs,
    audiences,
    locationKey: locationKey(profile.location),
    hasOfferingData,
    hasEnoughData,
    fingerprint,
  };
}

// ============================================
// DIMENSION SCORING
// ============================================

function matchConfidence(count: number, single: number): number {
  if (count <= 0) return 0;
  if (count === 1) return single;
  if (count === 2) return Math.min(1, single + 0.18);
  return 1;
}

function supplierDimension(a: StartupSignals, b: StartupSignals): number {
  const aNeedsB = intersection(a.needs, b.explicitOfferings).length;
  const bNeedsA = intersection(b.needs, a.explicitOfferings).length;
  return Math.max(
    matchConfidence(aNeedsB, 0.72),
    matchConfidence(bNeedsA, 0.72)
  );
}

function needsDimension(a: StartupSignals, b: StartupSignals): number {
  // Explicit need matched by a capability the other side only describes in its
  // narrative is real, but weaker than a listed offering.
  const viaDescribedA = intersection(a.needs, b.describedOfferings).length;
  const viaDescribedB = intersection(b.needs, a.describedOfferings).length;

  // Two startups looking for the same thing can still partner (co-sourcing,
  // joint procurement), but it is the weakest form of need alignment.
  const sharedNeeds = intersection(a.needs, b.needs).length;

  return Math.max(
    matchConfidence(viaDescribedA, 0.55),
    matchConfidence(viaDescribedB, 0.55),
    matchConfidence(sharedNeeds, 0.5)
  );
}

function bestComplementaryPair(
  a: StartupSignals,
  b: StartupSignals
): { aCapability: string; bCapability: string; affinity: number } | null {
  // Without a described product/service on both sides there is nothing to
  // complement, so the dimension stays unevaluated instead of guessing.
  if (!a.hasOfferingData || !b.hasOfferingData) return null;
  const aCaps = new Set([...a.explicitOfferings, ...a.describedOfferings]);
  const bCaps = new Set([...b.explicitOfferings, ...b.describedOfferings]);
  let best: { aCapability: string; bCapability: string; affinity: number } | null = null;
  for (const left of aCaps) {
    for (const right of bCaps) {
      const affinity = capabilityAffinity(left, right);
      if (affinity <= 0) continue;
      if (!best || affinity > best.affinity) {
        best = { aCapability: left, bCapability: right, affinity };
      }
    }
  }
  return best;
}

function marketDimension(a: StartupSignals, b: StartupSignals): number | null {
  const sharedAudience = intersection(
    new Set<string>(a.audiences),
    new Set<string>(b.audiences)
  );
  const audienceEvaluable =
    a.audiences.size > 0 || b.audiences.size > 0;
  let audienceScore: number | null = null;
  if (audienceEvaluable && a.audiences.size > 0 && b.audiences.size > 0) {
    const union = new Set([...a.audiences, ...b.audiences]);
    audienceScore = union.size ? sharedAudience.length / union.size : null;
  }

  let locationScore: number | null = null;
  if (a.locationKey && b.locationKey) {
    if (a.locationKey === b.locationKey) locationScore = 1;
    else {
      const aCountry = countryPart(a.profile.location);
      const bCountry = countryPart(b.profile.location);
      locationScore = aCountry && bCountry && aCountry === bCountry ? 0.7 : 0.15;
    }
  }

  if (audienceScore === null && locationScore === null) return null;
  if (audienceScore === null) return locationScore;
  if (locationScore === null) return audienceScore;
  return 0.7 * audienceScore + 0.3 * locationScore;
}

// ============================================
// REASONS
// ============================================

function pushUnique(reasons: MatchReason[], reason: MatchReason) {
  if (
    reasons.some(
      (existing) =>
        existing.dimension === reason.dimension && existing.detail === reason.detail
    )
  ) {
    return;
  }
  reasons.push(reason);
}

function buildReasons(
  a: StartupSignals,
  b: StartupSignals,
  evaluated: Record<MatchDimension, number | null>
): { reasons: MatchResult["reasons"]; relationshipType: MatchResult["relationshipType"] } {
  const aToB: MatchReason[] = [];
  const bToA: MatchReason[] = [];

  // Explicit needs matched by the other side's listed offerings.
  const aNeedsB = intersection(a.needs, b.explicitOfferings);
  for (const capability of aNeedsB) {
    const label = capabilityLabel(capability);
    pushUnique(aToB, {
      dimension: "supplier",
      label: "Potential supplier",
      detail: `Your profile lists ${label} as a need, and ${b.name} offers ${label}.`,
    });
    pushUnique(bToA, {
      dimension: "supplier",
      label: "Potential customer",
      detail: `${a.name} lists ${label} as a need that your offerings could serve.`,
    });
  }
  const bNeedsA = intersection(b.needs, a.explicitOfferings);
  for (const capability of bNeedsA) {
    const label = capabilityLabel(capability);
    pushUnique(bToA, {
      dimension: "supplier",
      label: "Potential supplier",
      detail: `Your profile lists ${label} as a need, and ${a.name} offers ${label}.`,
    });
    pushUnique(aToB, {
      dimension: "supplier",
      label: "Potential customer",
      detail: `${b.name} lists ${label} as a need that your offerings could serve.`,
    });
  }

  // Explicit needs matched by a capability the other side describes.
  for (const capability of intersection(a.needs, b.describedOfferings)) {
    const label = capabilityLabel(capability);
    pushUnique(aToB, {
      dimension: "needs",
      label: "Need alignment",
      detail: `${b.name} describes ${label} capabilities that line up with a need in your profile.`,
    });
    pushUnique(bToA, {
      dimension: "needs",
      label: "Business need",
      detail: `${a.name} needs ${label}, which aligns with the ${label} work you describe.`,
    });
  }
  for (const capability of intersection(b.needs, a.describedOfferings)) {
    const label = capabilityLabel(capability);
    pushUnique(bToA, {
      dimension: "needs",
      label: "Need alignment",
      detail: `${a.name} describes ${label} capabilities that line up with a need in your profile.`,
    });
    pushUnique(aToB, {
      dimension: "needs",
      label: "Business need",
      detail: `${b.name} needs ${label}, which aligns with the ${label} work you describe.`,
    });
  }

  for (const capability of intersection(a.needs, b.needs)) {
    const label = capabilityLabel(capability);
    pushUnique(aToB, {
      dimension: "needs",
      label: "Shared requirement",
      detail: `You and ${b.name} both list ${label} as a requirement — a possible co-sourcing or partnership angle.`,
    });
    pushUnique(bToA, {
      dimension: "needs",
      label: "Shared requirement",
      detail: `You and ${a.name} both list ${label} as a requirement — a possible co-sourcing or partnership angle.`,
    });
  }

  // Complementary offerings.
  const complementary = bestComplementaryPair(a, b);
  if (complementary && complementary.affinity >= 0.45) {
    const aLabel = capabilityLabel(complementary.aCapability);
    const bLabel = capabilityLabel(complementary.bCapability);
    pushUnique(aToB, {
      dimension: "complementary",
      label: "Complementary offering",
      detail: `${b.name} works in ${bLabel}, which pairs with your ${aLabel} for a bundle or co-marketing opportunity.`,
    });
    pushUnique(bToA, {
      dimension: "complementary",
      label: "Complementary offering",
      detail: `${a.name} works in ${aLabel}, which pairs with your ${bLabel} for a bundle or co-marketing opportunity.`,
    });
  }

  // Supporting context: market and industry.
  const sharedAudiences = intersection(
    new Set<string>(a.audiences),
    new Set<string>(b.audiences)
  ) as AudienceId[];
  if (sharedAudiences.length > 0 && (evaluated.market ?? 0) >= 0.5) {
    const labels = sharedAudiences.map((id) => AUDIENCE_LABELS[id]).join(" and ");
    pushUnique(aToB, {
      dimension: "market",
      label: "Shared customer base",
      detail: `You and ${b.name} both target ${labels}.`,
    });
    pushUnique(bToA, {
      dimension: "market",
      label: "Shared customer base",
      detail: `You and ${a.name} both target ${labels}.`,
    });
  }

  if ((evaluated.industry ?? 0) >= 0.55) {
    const bSector = b.profile.sector;
    const aSector = a.profile.sector;
    if (bSector) {
      pushUnique(aToB, {
        dimension: "industry",
        label: "Related industry",
        detail: `${b.name} operates in ${bSector}, a related business domain.`,
      });
    }
    if (aSector) {
      pushUnique(bToA, {
        dimension: "industry",
        label: "Related industry",
        detail: `${a.name} operates in ${aSector}, a related business domain.`,
      });
    }
  }

  const trim = (reasons: MatchReason[]) =>
    [...reasons]
      .sort(
        (left, right) =>
          DIMENSION_PRIORITY.indexOf(left.dimension) -
          DIMENSION_PRIORITY.indexOf(right.dimension)
      )
      .slice(0, 3);

  return {
    reasons: { aToB: trim(aToB), bToA: trim(bToA) },
    relationshipType: primaryRelationship(evaluated),
  };
}

const CONCRETE_DIMENSIONS: MatchDimension[] = [
  "supplier",
  "needs",
  "complementary",
];

function primaryRelationship(
  evaluated: Record<MatchDimension, number | null>
): MatchResult["relationshipType"] {
  let bestDimension: MatchDimension | null = null;
  let bestScore = 0;
  // The relationship type describes why the pair is a match at all, so the
  // concrete dimensions win over supporting industry/market context.
  const concrete = CONCRETE_DIMENSIONS.filter(
    (dimension) => (evaluated[dimension] ?? 0) >= 0.45
  );
  const ranked = concrete.length > 0 ? concrete : DIMENSION_PRIORITY;
  for (const dimension of ranked) {
    const value = evaluated[dimension];
    if (value !== null && value > bestScore) {
      bestScore = value;
      bestDimension = dimension;
    }
  }
  switch (bestDimension) {
    case "supplier":
      return "supplier_customer";
    case "needs":
      return "needs_alignment";
    case "complementary":
      return "complementary";
    case "market":
      return "shared_market";
    default:
      return "industry";
  }
}

// ============================================
// PAIR SCORING
// ============================================

export function scoreSignals(
  a: StartupSignals,
  b: StartupSignals,
  config: MatchConfig = MATCH_CONFIG
): MatchResult {
  const supplierScore = supplierDimension(a, b);
  const needsScore = needsDimension(a, b);
  const raw: Record<MatchDimension, number | null> = {
    supplier: supplierScore > 0 ? supplierScore : null,
    complementary: bestComplementaryPair(a, b)?.affinity ?? null,
    needs: needsScore > 0 ? needsScore : null,
    industry: sectorRelation(a.sectorKey, b.sectorKey),
    market: marketDimension(a, b),
  };

  // If the profiles contain nothing usable at all, every dimension is null.
  if (!a.hasEnoughData || !b.hasEnoughData) {
    for (const key of Object.keys(raw) as MatchDimension[]) {
      if (key !== "industry" && key !== "market") raw[key] = null;
    }
  }

  const available = (Object.keys(raw) as MatchDimension[]).filter(
    (dimension) => raw[dimension] !== null
  );
  const totalWeight = available.reduce(
    (sum, dimension) => sum + config.weights[dimension],
    0
  );

  let score = 0;
  const dimensions: DimensionScore[] = (Object.keys(raw) as MatchDimension[]).map(
    (dimension) => {
      const value = raw[dimension];
      const points =
        value !== null && totalWeight > 0
          ? (value * config.weights[dimension] * 100) / totalWeight
          : 0;
      return { dimension, score: value, points: Math.round(points * 10) / 10 };
    }
  );

  if (totalWeight > 0) {
    score =
      available.reduce(
        (sum, dimension) => sum + (raw[dimension] as number) * config.weights[dimension],
        0
      ) /
      totalWeight *
      100;
  }

  const concrete = Math.max(
    raw.supplier ?? 0,
    raw.needs ?? 0,
    raw.complementary ?? 0
  );
  const evidence = a.hasEnoughData && b.hasEnoughData && concrete >= 0.45;

  // Without concrete evidence the pair is never presented. The reported score
  // is damped as well, so an industry-only pair can never masquerade as 100/100
  // if it is ever read outside the eligibility filter.
  const computed = Math.min(100, Math.max(0, Math.round(score)));
  const bounded = evidence
    ? computed
    : Math.min(Math.round(computed * 0.4), config.minScore - 1);
  const eligible = evidence && bounded >= config.minScore;

  const strength: MatchStrength =
    bounded >= config.strengthBands.high
      ? "high"
      : bounded >= config.strengthBands.good
        ? "good"
        : "possible";

  const { reasons, relationshipType } = buildReasons(a, b, raw);
  // Profiles that do not carry usable business information never get an
  // explanation attached (and therefore can never be stored as a match).
  const usableReasons = a.hasEnoughData && b.hasEnoughData ? reasons : { aToB: [], bToA: [] };

  return {
    score: bounded,
    strength,
    relationshipType,
    reasons: usableReasons,
    dimensions,
    eligible,
    evidence,
    // Order independent: A/B and B/A must produce the same hash so a pair is
    // not rewritten (or re-notified) when the other startup saves its profile.
    signalsHash: hashString(
      [a.fingerprint, b.fingerprint].sort().join("|") + `|${MATCH_ENGINE_VERSION}`
    ),
  };
}

export function scorePair(
  a: MatchProfile,
  b: MatchProfile,
  config: MatchConfig = MATCH_CONFIG
): MatchResult {
  return scoreSignals(buildSignals(a), buildSignals(b), config);
}

/** Reasons written for one side of a stored recommendation. */
export function reasonsFor(
  result: MatchResult,
  viewer: "a" | "b"
): MatchReason[] {
  return viewer === "a" ? result.reasons.aToB : result.reasons.bToA;
}

export function normalizeStartupPair<T extends { id: string }>(
  left: T,
  right: T
): [T, T] {
  return left.id < right.id ? [left, right] : [right, left];
}

export function startupPairKey(aId: string, bId: string): string {
  return aId < bId ? `${aId}:${bId}` : `${bId}:${aId}`;
}
