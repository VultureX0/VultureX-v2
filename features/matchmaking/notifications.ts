import { sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import type { MatchReason, MatchStrength } from "./types";

/**
 * Recommendation notifications reuse the existing `notifications` table and
 * bell UI. Each side gets its own body built from its own reasons.
 *
 * Deduplication uses `dedupe_key = rec:<pair>:<recipient>:<strength>`, backed by
 * a unique index. A pair therefore produces at most one alert per strength tier
 * (possible -> good -> high), no matter how often the matcher is retried, the
 * page is refreshed or the same profile is saved again.
 */

export type MatchNotificationSide = {
  userId: string;
  startupName: string;
  reasons: MatchReason[];
};

export type MatchNotificationInput = {
  pairKey: string;
  recommendationId: string;
  strength: MatchStrength;
  sides: [MatchNotificationSide, MatchNotificationSide];
};

function bodyFor(side: MatchNotificationSide, other: MatchNotificationSide): string {
  const primary = side.reasons[0];
  if (!primary) {
    return `${other.startupName} looks like a relevant business connection for ${side.startupName}.`;
  }
  const prefix =
    primary.label === "Potential customer"
      ? "New business opportunity"
      : primary.label === "Potential supplier" || primary.label === "Need alignment"
        ? "Potential partner found"
        : "New recommended connection";
  return `${prefix}: ${primary.detail}`;
}

export async function notifyMatchPair(input: MatchNotificationInput): Promise<number> {
  const [left, right] = input.sides;
  const rows = [
    { side: left, other: right },
    { side: right, other: left },
  ].filter(
    ({ side, other }) => side.userId && other.userId && side.userId !== other.userId
  );

  let inserted = 0;
  for (const { side, other } of rows) {
    const result = await db
      .insert(notifications)
      .values({
        recipientUserId: side.userId,
        actorUserId: other.userId,
        type: "business_match",
        body: bodyFor(side, other),
        dedupeKey: `rec:${input.pairKey}:${side.userId}:${input.strength}`,
      })
      .onConflictDoNothing({
        target: [
          notifications.recipientUserId,
          notifications.type,
          notifications.dedupeKey,
        ],
        where: sql`${notifications.dedupeKey} is not null`,
      })
      .returning({ id: notifications.id });

    inserted += result.length;
  }

  return inserted;
}
