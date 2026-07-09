import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { competitions, competitionEntries, startups } from "@/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [competition] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, id))
    .limit(1);

  if (!competition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const entries = await db
    .select({
      entry: competitionEntries,
      startup: startups,
    })
    .from(competitionEntries)
    .innerJoin(startups, eq(startups.id, competitionEntries.startupId))
    .where(eq(competitionEntries.competitionId, id))
    .orderBy(desc(startups.score));

  return NextResponse.json({ competition, entries });
}
