import { and, desc, eq, inArray, isNotNull, ne, or } from "drizzle-orm";
import { db } from "@/db";
import {
  recommendationStates,
  startupRecommendations,
  startups,
} from "@/db/schema";
import { getInterestStatuses, type InterestStatus } from "@/features/connections";
import { isUuid } from "@/lib/utils";
import {
  MATCH_CONFIG,
  buildSignals,
  scoreSignals,
  startupPairKey,
  type StartupSignals,
} from "./engine";
import { MatchError } from "./errors";
import { notifyMatchPair, type MatchNotificationSide } from "./notifications";
import type {
  MatchConfig,
  MatchProfile,
  MatchReason,
  MatchResult,
  MatchStrength,
} from "./types";

/**
 * Persistence + lifecycle for business matchmaking.
 *
 * - Recommendations are computed by the deterministic engine and stored one row
 *   per unordered pair (`pair_key` unique), so duplicates are impossible.
 * - A recalculation only ever evaluates pairs that involve the startup whose
 *   profile changed. Nothing is recalculated on page render.
 * - Dismiss/save state is per startup, never shared with the other side.
 */

const profileColumns = {
  id: startups.id,
  userId: startups.userId,
  name: startups.name,
  slug: startups.slug,
  tagline: startups.tagline,
  sector: startups.sector,
  stage: startups.stage,
  location: startups.location,
  problem: startups.problem,
  solution: startups.solution,
  tags: startups.tags,
  offerings: startups.offerings,
  needs: startups.needs,
  targetCustomers: startups.targetCustomers,
  isPublic: startups.isPublic,
  logoUrl: startups.logoUrl,
  updatedAt: startups.updatedAt,
};

type ProfileRow = {
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
  logoUrl: string | null;
  updatedAt: Date | null;
};

function toProfile(row: ProfileRow): MatchProfile {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    sector: row.sector,
    stage: row.stage,
    location: row.location,
    problem: row.problem,
    solution: row.solution,
    tags: row.tags,
    offerings: row.offerings,
    needs: row.needs,
    targetCustomers: row.targetCustomers,
    isPublic: row.isPublic,
  };
}

function strengthRank(strength: MatchStrength): number {
  return strength === "high" ? 3 : strength === "good" ? 2 : 1;
}

export type RecalculateSummary = {
  evaluated: number;
  eligible: number;
  created: number;
  updated: number;
  expired: number;
  notified: number;
};

function emptySummary(): RecalculateSummary {
  return { evaluated: 0, eligible: 0, created: 0, updated: 0, expired: 0, notified: 0 };
}

/**
 * Re-evaluate every candidate pair that involves `startupId`, persist the
 * eligible ones and expire matches that no longer qualify. Safe to retry: all
 * writes are idempotent upserts keyed by pair.
 */
export async function recalculateMatchesForStartup(
  startupId: string,
  config: MatchConfig = MATCH_CONFIG
): Promise<RecalculateSummary> {
  if (!isUuid(startupId)) return emptySummary();

  const [actor] = await db
    .select(profileColumns)
    .from(startups)
    .where(eq(startups.id, startupId))
    .limit(1);

  const summary = emptySummary();
  if (!actor) return summary;

  const expireAll = async () => {
    const expired = await db
      .update(startupRecommendations)
      .set({ status: "expired", updatedAt: new Date() })
      .where(
        and(
          or(
            eq(startupRecommendations.startupAId, startupId),
            eq(startupRecommendations.startupBId, startupId)
          ),
          eq(startupRecommendations.status, "active")
        )
      )
      .returning({ id: startupRecommendations.id });
    summary.expired += expired.length;
  };

  // A profile that is not public (or has no owner account) can never be
  // recommended to anyone.
  const ownerUserId = actor.userId;
  if (!actor.isPublic || !ownerUserId) {
    await expireAll();
    return summary;
  }

  const candidates = await db
    .select(profileColumns)
    .from(startups)
    .where(
      and(
        eq(startups.isPublic, true),
        ne(startups.id, startupId),
        isNotNull(startups.userId)
      )
    )
    .orderBy(desc(startups.updatedAt))
    .limit(config.maxCandidates);

  const existingRows = await db
    .select({
      id: startupRecommendations.id,
      pairKey: startupRecommendations.pairKey,
      status: startupRecommendations.status,
      strength: startupRecommendations.strength,
      signalsHash: startupRecommendations.signalsHash,
    })
    .from(startupRecommendations)
    .where(
      or(
        eq(startupRecommendations.startupAId, startupId),
        eq(startupRecommendations.startupBId, startupId)
      )
    );

  const existingByPair = new Map(existingRows.map((row) => [row.pairKey, row]));

  const actorRow = actor as ProfileRow;
  const actorSignals = buildSignals(toProfile(actorRow));
  const activePairs: string[] = [];

  for (const candidate of candidates) {
    const candidateRow = candidate as ProfileRow;
    const candidateSignals: StartupSignals = buildSignals(toProfile(candidateRow));
    const result: MatchResult = scoreSignals(actorSignals, candidateSignals, config);
    summary.evaluated += 1;

    if (!result.eligible) continue;

    const actorIsA = startupId < candidateRow.id;
    const startupAId = actorIsA ? startupId : candidateRow.id;
    const startupBId = actorIsA ? candidateRow.id : startupId;
    const pairKey = startupPairKey(startupId, candidateRow.id);
    activePairs.push(pairKey);
    summary.eligible += 1;

    const reasons = actorIsA
      ? result.reasons
      : { aToB: result.reasons.bToA, bToA: result.reasons.aToB };

    const previous = existingByPair.get(pairKey);

    // Unchanged active match: no write, no notification.
    if (
      previous &&
      previous.status === "active" &&
      previous.signalsHash === result.signalsHash
    ) {
      continue;
    }

    await db
      .insert(startupRecommendations)
      .values({
        startupAId,
        startupBId,
        pairKey,
        score: String(result.score),
        strength: result.strength,
        relationshipType: result.relationshipType,
        reasons,
        signalsHash: result.signalsHash,
        status: "active",
        computedAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: startupRecommendations.pairKey,
        set: {
          score: String(result.score),
          strength: result.strength,
          relationshipType: result.relationshipType,
          reasons,
          signalsHash: result.signalsHash,
          status: "active",
          computedAt: new Date(),
          updatedAt: new Date(),
        },
      });

    if (previous) summary.updated += 1;
    else summary.created += 1;

    const upgraded =
      !previous ||
      previous.status !== "active" ||
      strengthRank(result.strength) > strengthRank(previous.strength);

    const candidateUserId = candidateRow.userId;
    if (upgraded && candidateUserId) {
      const sides: [MatchNotificationSide, MatchNotificationSide] = actorIsA
        ? [
            { userId: ownerUserId, startupName: actorRow.name, reasons: result.reasons.aToB },
            { userId: candidateUserId, startupName: candidateRow.name, reasons: result.reasons.bToA },
          ]
        : [
            { userId: candidateUserId, startupName: candidateRow.name, reasons: result.reasons.bToA },
            { userId: ownerUserId, startupName: actorRow.name, reasons: result.reasons.aToB },
          ];

      try {
        summary.notified += await notifyMatchPair({
          pairKey,
          recommendationId: previous?.id ?? pairKey,
          strength: result.strength,
          sides,
        });
      } catch (error) {
        // A notification failure must never roll back or corrupt the match.
        console.error("Failed to notify match pair:", error);
      }
    }
  }

  const activePairSet = new Set(activePairs);
  const stale = existingRows
    .filter((row) => row.status === "active" && !activePairSet.has(row.pairKey))
    .map((row) => row.pairKey);

  if (stale.length > 0) {
    const expired = await db
      .update(startupRecommendations)
      .set({ status: "expired", updatedAt: new Date() })
      .where(
        and(
          eq(startupRecommendations.status, "active"),
          inArray(startupRecommendations.pairKey, stale)
        )
      )
      .returning({ id: startupRecommendations.id });
    summary.expired += expired.length;
  }

  return summary;
}

/** Full backfill for the CLI script and admin-less maintenance runs. */
export async function recalculateAllMatches(
  config: MatchConfig = MATCH_CONFIG
): Promise<{ startups: number; results: RecalculateSummary }> {
  const rows = await db
    .select({ id: startups.id })
    .from(startups)
    .where(and(eq(startups.isPublic, true), isNotNull(startups.userId)));

  const total = emptySummary();
  for (const row of rows) {
    const summary = await recalculateMatchesForStartup(row.id, config);
    total.evaluated += summary.evaluated;
    total.eligible += summary.eligible;
    total.created += summary.created;
    total.updated += summary.updated;
    total.expired += summary.expired;
    total.notified += summary.notified;
  }

  return { startups: rows.length, results: total };
}

// ============================================
// READING RECOMMENDATIONS
// ============================================

export type RecommendationView = "all" | "saved" | "dismissed";

export type RecommendationFilters = {
  view?: RecommendationView;
  strength?: MatchStrength | "all";
  relationshipType?: string | "all";
  sector?: string | "all";
  page?: number;
  limit?: number;
};

export type RecommendationItem = {
  id: string;
  score: number;
  strength: MatchStrength;
  relationshipType: string;
  reasons: MatchReason[];
  savedAt: string | null;
  dismissedAt: string | null;
  interest: InterestStatus;
  startup: {
    id: string;
    userId: string | null;
    name: string;
    slug: string;
    sector: string | null;
    stage: string | null;
    location: string | null;
    tagline: string | null;
    description: string | null;
    logoUrl: string | null;
    href: string;
  };
};

export type RecommendationCounts = {
  total: number;
  high: number;
  good: number;
  possible: number;
  saved: number;
  dismissed: number;
};

export type RecommendationPage = {
  items: RecommendationItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  counts: RecommendationCounts;
  facets: {
    sectors: string[];
    relationshipTypes: string[];
  };
};

function descriptionFor(row: ProfileRow): string | null {
  if (row.tagline) return row.tagline;
  const narrative = (row.problem ?? row.solution ?? "").trim();
  if (!narrative) return null;
  return narrative.length > 160 ? `${narrative.slice(0, 157)}…` : narrative;
}

export async function getRecommendationsForStartup(
  startupId: string,
  filters: RecommendationFilters = {}
): Promise<RecommendationPage> {
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const pageSize = Math.min(
    50,
    Math.max(1, Math.floor(filters.limit ?? MATCH_CONFIG.pageSize))
  );
  const view: RecommendationView = filters.view ?? "all";

  const empty: RecommendationPage = {
    items: [],
    total: 0,
    page,
    pageSize,
    hasMore: false,
    counts: { total: 0, high: 0, good: 0, possible: 0, saved: 0, dismissed: 0 },
    facets: { sectors: [], relationshipTypes: [] },
  };

  if (!isUuid(startupId)) return empty;

  const [viewer] = await db
    .select({ id: startups.id, userId: startups.userId, name: startups.name })
    .from(startups)
    .where(eq(startups.id, startupId))
    .limit(1);
  if (!viewer) return empty;

  const rows = await db
    .select()
    .from(startupRecommendations)
    .where(
      and(
        eq(startupRecommendations.status, "active"),
        or(
          eq(startupRecommendations.startupAId, startupId),
          eq(startupRecommendations.startupBId, startupId)
        )
      )
    )
    .orderBy(desc(startupRecommendations.score));

  const otherIds = rows.map((row) =>
    row.startupAId === startupId ? row.startupBId : row.startupAId
  );
  if (otherIds.length === 0) return empty;

  const [others, states] = await Promise.all([
    db.select(profileColumns).from(startups).where(inArray(startups.id, otherIds)),
    db
      .select()
      .from(recommendationStates)
      .where(eq(recommendationStates.startupId, startupId)),
  ]);

  const otherById = new Map((others as ProfileRow[]).map((row) => [row.id, row]));
  const stateByTarget = new Map(
    states.map((state) => [state.targetStartupId, state])
  );

  const targetUserIds = (others as ProfileRow[])
    .map((row) => row.userId)
    .filter((id): id is string => !!id);
  const interestMap = viewer.userId
    ? await getInterestStatuses(viewer.userId, targetUserIds)
    : {};

  const all: RecommendationItem[] = [];
  for (const row of rows) {
    const otherId = row.startupAId === startupId ? row.startupBId : row.startupAId;
    const other = otherById.get(otherId);
    // Deactivated/private profiles stop being recommended even before the next
    // recalculation runs.
    if (!other || other.isPublic !== true) continue;

    const state = stateByTarget.get(otherId);
    const viewerIsA = row.startupAId === startupId;
    const reasons = viewerIsA ? row.reasons.aToB : row.reasons.bToA;
    const interest: InterestStatus =
      other.userId && interestMap[other.userId]
        ? interestMap[other.userId]
        : { status: "none", requestId: null, conversationId: null };

    all.push({
      id: row.id,
      score: Number(row.score),
      strength: row.strength,
      relationshipType: row.relationshipType,
      reasons: reasons ?? [],
      savedAt: state?.savedAt ? state.savedAt.toISOString() : null,
      dismissedAt: state?.dismissedAt ? state.dismissedAt.toISOString() : null,
      interest,
      startup: {
        id: other.id,
        userId: other.userId,
        name: other.name,
        slug: other.slug,
        sector: other.sector,
        stage: other.stage,
        location: other.location,
        tagline: other.tagline,
        description: descriptionFor(other),
        logoUrl: other.logoUrl,
        href: `/explore/${other.slug}`,
      },
    });
  }

  const discoverable = all.filter(
    (item) => !item.dismissedAt && item.interest.status !== "accepted"
  );
  const facets = {
    sectors: [...new Set(discoverable.map((item) => item.startup.sector).filter((sector): sector is string => !!sector))].sort(),
    relationshipTypes: [...new Set(discoverable.map((item) => item.relationshipType))].sort(),
  };

  const counts: RecommendationCounts = {
    total: all.filter((item) => !item.dismissedAt && item.interest.status !== "accepted").length,
    high: all.filter((item) => !item.dismissedAt && item.interest.status !== "accepted" && item.strength === "high").length,
    good: all.filter((item) => !item.dismissedAt && item.interest.status !== "accepted" && item.strength === "good").length,
    possible: all.filter((item) => !item.dismissedAt && item.interest.status !== "accepted" && item.strength === "possible").length,
    saved: all.filter((item) => item.savedAt && !item.dismissedAt).length,
    dismissed: all.filter((item) => !!item.dismissedAt).length,
  };

  let visible = all.filter((item) => {
    if (view === "dismissed") return !!item.dismissedAt;
    if (item.dismissedAt) return false;
    // Already connected: the relationship exists, so it is not a discovery
    // suggestion any more. The historical recommendation stays in the table.
    if (item.interest.status === "accepted") return false;
    if (view === "saved") return !!item.savedAt;
    return true;
  });

  if (filters.strength && filters.strength !== "all") {
    visible = visible.filter((item) => item.strength === filters.strength);
  }
  if (filters.relationshipType && filters.relationshipType !== "all") {
    visible = visible.filter(
      (item) => item.relationshipType === filters.relationshipType
    );
  }
  if (filters.sector && filters.sector !== "all") {
    const sector = filters.sector.toLowerCase();
    visible = visible.filter(
      (item) => (item.startup.sector ?? "").toLowerCase() === sector
    );
  }

  visible.sort((left, right) => {
    if (view === "saved") {
      const leftSaved = left.savedAt ? Date.parse(left.savedAt) : 0;
      const rightSaved = right.savedAt ? Date.parse(right.savedAt) : 0;
      if (leftSaved !== rightSaved) return rightSaved - leftSaved;
    }
    if (right.score !== left.score) return right.score - left.score;
    return left.startup.name.localeCompare(right.startup.name);
  });

  const total = visible.length;
  const start = (page - 1) * pageSize;
  const items = visible.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    hasMore: start + items.length < total,
    counts,
    facets,
  };
}

/** Top matches for the dashboard widget. */
export async function getRecommendationSummary(startupId: string, limit = 4) {
  const data = await getRecommendationsForStartup(startupId, { page: 1, limit });
  return {
    items: data.items,
    counts: data.counts,
    total: data.counts.total,
    hasMore: data.counts.total > data.items.length,
  };
}

// ============================================
// PER-STARTUP DISMISS / SAVE
// ============================================

export type RecommendationStateAction = "dismiss" | "restore" | "save" | "unsave";

async function assertActiveRecommendation(
  startupId: string,
  targetStartupId: string
) {
  if (!isUuid(startupId) || !isUuid(targetStartupId)) {
    throw new MatchError("A valid startup id is required.", 400, "INVALID_TARGET");
  }
  if (startupId === targetStartupId) {
    throw new MatchError("You cannot change a recommendation to yourself.", 400, "SELF_TARGET");
  }

  const pairKey = startupPairKey(startupId, targetStartupId);
  const [row] = await db
    .select({ id: startupRecommendations.id, status: startupRecommendations.status })
    .from(startupRecommendations)
    .where(eq(startupRecommendations.pairKey, pairKey))
    .limit(1);

  if (!row || row.status !== "active") {
    throw new MatchError(
      "This recommendation is no longer available.",
      404,
      "RECOMMENDATION_NOT_FOUND"
    );
  }
  return row;
}

export async function setRecommendationState(
  startupId: string,
  targetStartupId: string,
  action: RecommendationStateAction
) {
  await assertActiveRecommendation(startupId, targetStartupId);

  const now = new Date();
  const dismissedAt =
    action === "dismiss" ? now : action === "restore" || action === "save" ? null : undefined;
  const savedAt =
    action === "save" ? now : action === "unsave" || action === "dismiss" ? null : undefined;

  const insertValues = {
    startupId,
    targetStartupId,
    dismissedAt: action === "dismiss" ? now : null,
    savedAt: action === "save" ? now : null,
    updatedAt: now,
  };

  const updateSet: Record<string, Date | null> = { updatedAt: now };
  if (dismissedAt !== undefined) updateSet.dismissedAt = dismissedAt;
  if (savedAt !== undefined) updateSet.savedAt = savedAt;

  const [state] = await db
    .insert(recommendationStates)
    .values(insertValues)
    .onConflictDoUpdate({
      target: [recommendationStates.startupId, recommendationStates.targetStartupId],
      set: updateSet,
    })
    .returning();

  return {
    targetStartupId,
    savedAt: state.savedAt ? state.savedAt.toISOString() : null,
    dismissedAt: state.dismissedAt ? state.dismissedAt.toISOString() : null,
  };
}
