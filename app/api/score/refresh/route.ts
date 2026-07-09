import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  startups,
  profileViews,
  interests,
  competitionEntries,
} from "@/db/schema";
import { computeVultureScore } from "@/features/scoring";

export async function GET(request: Request) {
  const cronSecret = request.headers.get("CRON_SECRET");

  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allStartups = await db.select().from(startups);
    let updated = 0;

    for (const startup of allStartups) {
      const [viewCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(profileViews)
        .where(
          and(
            eq(profileViews.startupId, startup.id),
            sql`viewed_at > now() - interval '30 days'`
          )
        );

      const [interestCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(interests)
        .where(eq(interests.startupId, startup.id));

      const [competitionEntry] = await db
        .select({ count: sql<number>`count(*)` })
        .from(competitionEntries)
        .where(eq(competitionEntries.startupId, startup.id));

      const scoreInput = {
        mrr: startup.mrr ?? 0,
        monthlyGrowth: parseFloat(startup.monthlyGrowth ?? "0"),
        activeUsers: startup.activeUsers ?? 0,
        customers: startup.customers ?? 0,
        fundingRaised: startup.fundingRaised ?? 0,
        burnRate: startup.burnRate ?? 0,
        runwayMonths: startup.runwayMonths ?? 0,
        teamSize: startup.teamSize ?? 1,
        founderBio: startup.founderBio,
        founderLinkedin: startup.founderLinkedin,
        founderRole: startup.founderRole,
        sector: startup.sector,
        stage: startup.stage,
        profileViews30d: Number(viewCount?.count) || 0,
        interestsReceived: Number(interestCount?.count) || 0,
        inCompetition: Number(competitionEntry?.count) > 0,
      };

      const scoreBreakdown = computeVultureScore(scoreInput);

      await db
        .update(startups)
        .set({
          score: String(scoreBreakdown.total),
          scoreBreakdown,
          updatedAt: new Date(),
        })
        .where(eq(startups.id, startup.id));

      updated++;
    }

    return NextResponse.json({ updated });
  } catch (error) {
    console.error("Failed to refresh scores:", error);
    return NextResponse.json(
      { error: "Failed to refresh scores" },
      { status: 500 }
    );
  }
}
