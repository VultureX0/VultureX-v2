import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/features/auth";
import { db } from "@/db";
import { startups, decks } from "@/db/schema";
import { generateDeck } from "@/features/deck";
import crypto from "crypto";

// Generates a pitch deck from the authenticated user's startup profile using AI
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [startup] = await db
      .select()
      .from(startups)
      .where(eq(startups.userId, session.user.id))
      .limit(1);

    if (!startup) {
      return NextResponse.json(
        { error: "Create your startup profile first" },
        { status: 400 }
      );
    }

    const slides = await generateDeck({
      name: startup.name,
      tagline: startup.tagline,
      sector: startup.sector,
      stage: startup.stage,
      problem: startup.problem,
      solution: startup.solution,
      mrr: startup.mrr || 0,
      monthlyGrowth: parseFloat(startup.monthlyGrowth || "0"),
      activeUsers: startup.activeUsers || 0,
      customers: startup.customers || 0,
      fundingRaised: startup.fundingRaised || 0,
      burnRate: startup.burnRate || 0,
      runwayMonths: startup.runwayMonths || 0,
      teamSize: startup.teamSize || 1,
      founderName: startup.founderName,
      founderRole: startup.founderRole,
      founderBio: startup.founderBio,
    });

    // Token for unauthenticated deck sharing via public link
    const shareToken = crypto.randomBytes(12).toString("hex");

    const [deck] = await db
      .insert(decks)
      .values({
        startupId: startup.id,
        title: `${startup.name} Pitch Deck`,
        slides,
        template: "minimal",
        shareToken,
      })
      .returning();

    return NextResponse.json(deck);
  } catch (error) {
    console.error("Deck generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate deck. Please try again." },
      { status: 500 }
    );
  }
}
