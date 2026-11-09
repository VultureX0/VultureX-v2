import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/features/auth";
import { db } from "@/db";
import { bookmarks, startups } from "@/db/schema";
import { isUuid, sqlStateOf } from "@/lib/utils";

// Returns all bookmarked startups for the authenticated user, newest first
export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const saved = await db
      .select({
        id: bookmarks.id,
        startupId: startups.id,
        slug: startups.slug,
        name: startups.name,
        tagline: startups.tagline,
        sector: startups.sector,
        stage: startups.stage,
        score: startups.score,
        monthlyGrowth: startups.monthlyGrowth,
        createdAt: bookmarks.createdAt,
      })
      .from(bookmarks)
      .leftJoin(startups, eq(startups.id, bookmarks.startupId))
      .where(eq(bookmarks.userId, session.user.id))
      .orderBy(desc(bookmarks.createdAt));

    return NextResponse.json({ bookmarks: saved });
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

// Bookmarks a startup for the authenticated user (idempotent — silently handles duplicates)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { startupId } = await request.json();
  if (!isUuid(startupId))
    return NextResponse.json({ error: "startupId must be a valid id" }, { status: 400 });

  try {
    await db.insert(bookmarks).values({ userId: session.user.id, startupId });
  } catch (error) {
    const state = sqlStateOf(error);

    // Unique violation — already saved, which is idempotent for the caller.
    if (state === "23505") {
      return NextResponse.json({ message: "Already bookmarked" });
    }

    // Foreign key violation — a well-formed id that matches no startup.
    if (state === "23503") {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    console.error("Failed to create bookmark:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// Removes a bookmark for the given startup
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { startupId } = await request.json();
    if (!isUuid(startupId))
      return NextResponse.json(
        { error: "startupId must be a valid id" },
        { status: 400 }
      );

    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, session.user.id),
          eq(bookmarks.startupId, startupId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove bookmark:", error);
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}
