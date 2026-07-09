import { NextResponse } from "next/server";
import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { auth } from "@/features/auth";
import { db } from "@/db";
import { startups, profileViews, interests } from "@/db/schema";
import { computeVultureScore } from "@/features/scoring";
import { slugify } from "@/lib/utils";

// Fetches public startups with optional sector/stage/search filters and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get("sector");
    const stage = searchParams.get("stage");
    const search = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const conditions = [eq(startups.isPublic, true)];

    if (sector && sector !== "all") {
      conditions.push(ilike(startups.sector, `%${sector}%`));
    }
    if (stage && stage !== "all") {
      conditions.push(eq(startups.stage, stage));
    }
    if (search) {
      conditions.push(ilike(startups.name, `%${search}%`));
    }

    const results = await db
      .select()
      .from(startups)
      .where(and(...conditions))
      .orderBy(desc(startups.score))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to fetch startups:", error);
    return NextResponse.json(
      { error: "Failed to fetch startups" },
      { status: 500 }
    );
  }
}

// Creates a new startup profile or updates the existing one for the authenticated user
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const [existing] = await db
      .select()
      .from(startups)
      .where(eq(startups.userId, session.user.id))
      .limit(1);

    // Fetch momentum metrics for score computation (views and interests in last 30d)
    const viewsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(profileViews)
      .where(
        existing
          ? and(
              eq(profileViews.startupId, existing.id),
              sql`viewed_at > now() - interval '30 days'`
            )
          : sql`false`
      );

    const interestsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(interests)
      .where(existing ? eq(interests.startupId, existing.id) : sql`false`);

    const scoreInput = {
      mrr: data.mrr ?? 0,
      monthlyGrowth: parseFloat(data.monthlyGrowth) || 0,
      activeUsers: data.activeUsers ?? 0,
      customers: data.customers ?? 0,
      fundingRaised: data.fundingRaised ?? 0,
      burnRate: data.burnRate ?? 0,
      runwayMonths: data.runwayMonths ?? 0,
      teamSize: data.teamSize ?? 1,
      founderBio: data.founderBio ?? null,
      founderLinkedin: data.founderLinkedin ?? null,
      founderRole: data.founderRole ?? null,
      sector: data.sector ?? "other",
      stage: data.stage ?? "pre-seed",
      profileViews30d: Number(viewsResult[0]?.count) ?? 0,
      interestsReceived: Number(interestsResult[0]?.count) ?? 0,
      inCompetition: false,
    };

    const scoreBreakdown = computeVultureScore(scoreInput);

    // Append timestamp to slug to avoid collisions on duplicate names
    const slug =
      existing?.slug || slugify(data.name) + "-" + Date.now().toString(36);

    const startupData = {
      userId: session.user.id,
      slug,
      name: data.name,
      tagline: data.tagline ?? null,
      sector: data.sector,
      stage: data.stage,
      location: data.location ?? null,
      website: data.website ?? null,
      logoUrl: data.logoUrl ?? null,
      problem: data.problem ?? null,
      solution: data.solution ?? null,
      mrr: data.mrr ?? 0,
      monthlyGrowth: String(data.monthlyGrowth ?? 0),
      activeUsers: data.activeUsers ?? 0,
      customers: data.customers ?? 0,
      fundingRaised: data.fundingRaised ?? 0,
      burnRate: data.burnRate ?? 0,
      runwayMonths: data.runwayMonths ?? 0,
      founderName: data.founderName ?? null,
      founderRole: data.founderRole ?? null,
      founderBio: data.founderBio ?? null,
      founderLinkedin: data.founderLinkedin ?? null,
      teamSize: data.teamSize ?? 1,
      tags: Array.isArray(data.tags) ? data.tags : null,
      score: String(scoreBreakdown.total),
      scoreBreakdown,
      updatedAt: new Date(),
    };

    if (existing) {
      const [updated] = await db
        .update(startups)
        .set(startupData)
        .where(eq(startups.id, existing.id))
        .returning();
      return NextResponse.json(updated);
    }

    const [created] = await db
      .insert(startups)
      .values(startupData)
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to save startup:", error);
    return NextResponse.json(
      { error: "Failed to save startup profile" },
      { status: 500 }
    );
  }
}
