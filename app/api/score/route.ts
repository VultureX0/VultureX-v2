import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/features/auth";
import { db } from "@/db";
import {
  startups,
  profileViews,
  interests,
  competitionEntries,
} from "@/db/schema";
import { computeVultureScore } from "@/features/scoring";

// Recomputes the VultureScore for the authenticated user's startup (or a specific startupId for admin use)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const targetStartupId = body.startupId;

    let startup;
    if (targetStartupId) {
      [startup] = await db
        .select()
        .from(startups)
        .where(eq(startups.id, targetStartupId))
        .limit(1);
    } else {
      [startup] = await db
        .select()
        .from(startups)
        .where(eq(startups.userId, session.user.id))
        .limit(1);
    }

    if (!startup) {
      return NextResponse.json(
        { error: "Startup not found" },
        { status: 404 }
      );
    }

    // Gather momentum signals used by the scoring algorithm
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

    const [updated] = await db
      .update(startups)
      .set({
        score: String(scoreBreakdown.total),
        scoreBreakdown,
        updatedAt: new Date(),
      })
      .where(eq(startups.id, startup.id))
      .returning();

    return NextResponse.json({
      startupId: startup.id,
      score: scoreBreakdown.total,
      breakdown: scoreBreakdown,
      inputs: {
        profileViews30d: scoreInput.profileViews30d,
        interestsReceived: scoreInput.interestsReceived,
        inCompetition: scoreInput.inCompetition,
      },
    });
  } catch (error) {
    console.error("Failed to recompute score:", error);
    return NextResponse.json(
      { error: "Failed to recompute score" },
      { status: 500 }
    );
  }
}
