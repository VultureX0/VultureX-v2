import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/features/auth";
import { db } from "@/db";
import { decks, startups } from "@/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [deck] = await db.select().from(decks).where(eq(decks.id, id)).limit(1);
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deck);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify ownership: deck belongs to user's startup
  const [deck] = await db.select().from(decks).where(eq(decks.id, id)).limit(1);
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [startup] = await db.select().from(startups).where(eq(startups.id, deck.startupId)).limit(1);
  if (!startup || startup.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slides } = await request.json();
  const [updated] = await db.update(decks).set({ slides, updatedAt: new Date() }).where(eq(decks.id, id)).returning();
  return NextResponse.json(updated);
}
