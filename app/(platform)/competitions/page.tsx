import { db } from "@/db";
import { competitions, competitionEntries } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { CompetitionsClient } from "./competitions-client";

export default async function CompetitionsPage() {
  const results = await db
    .select({
      competition: competitions,
      entryCount: sql<number>`count(${competitionEntries.id})`,
    })
    .from(competitions)
    .leftJoin(competitionEntries, eq(competitionEntries.competitionId, competitions.id))
    .groupBy(competitions.id)
    .orderBy(desc(competitions.createdAt));

  const mapped = results.map(({ competition: c, entryCount }) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    sector: c.sector,
    prize: c.prize,
    deadline: c.deadline.toISOString(),
    status: c.status,
    entryCount: Number(entryCount),
  }));

  return <CompetitionsClient competitions={mapped} />;
}
