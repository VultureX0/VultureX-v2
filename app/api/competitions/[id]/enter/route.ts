import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/features/auth";
import { db } from "@/db";
import { competitionEntries, competitions, startups, decks } from "@/db/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: competitionId } = await params;

  // Verify competition exists and is active
  const [competition] = await db.select().from(competitions).where(eq(competitions.id, competitionId)).limit(1);
  if (!competition) return NextResponse.json({ error: "Competition not found" }, { status: 404 });
  if (competition.status !== "active") return NextResponse.json({ error: "Competition is not active" }, { status: 400 });

  // Get user's startup (ownership check - user can only enter their own startup)
  const [startup] = await db.select().from(startups).where(eq(startups.userId, session.user.id)).limit(1);
  if (!startup) return NextResponse.json({ error: "You need a startup profile to enter" }, { status: 400 });

  // Get latest deck
  const [latestDeck] = await db.select().from(decks)
    .where(eq(decks.startupId, startup.id)).orderBy(desc(decks.createdAt)).limit(1);

  try {
    await db.insert(competitionEntries).values({
      competitionId,
      startupId: startup.id,
      deckId: latestDeck?.id || null,
    });
  } catch {
    return NextResponse.json({ error: "Already entered" }, { status: 409 });
  }

  return NextResponse.json({ success: true });
}
