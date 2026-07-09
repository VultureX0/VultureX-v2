import { db } from "@/db";
import { startups } from "@/db/schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import { ExploreClient } from "./explore-client";

export const metadata = { title: "Explore Startups" };

type Props = { searchParams: Promise<{ sector?: string; stage?: string; q?: string }> };

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const { sector, stage, q } = params;

  const conditions = [eq(startups.isPublic, true)];
  if (sector && sector !== "all") conditions.push(ilike(startups.sector, `%${sector}%`));
  if (stage && stage !== "all") conditions.push(eq(startups.stage, stage));
  if (q) conditions.push(ilike(startups.name, `%${q}%`));

  const results = await db.select().from(startups).where(and(...conditions)).orderBy(desc(startups.score)).limit(50);

  const mapped = results.map(s => ({
    id: s.id, slug: s.slug, name: s.name, tagline: s.tagline,
    sector: s.sector, stage: s.stage, score: parseFloat(s.score || "0"),
    mrr: s.mrr || 0, monthlyGrowth: s.monthlyGrowth || "0",
    location: s.location,
  }));

  return <ExploreClient startups={mapped} currentSector={sector} currentStage={stage} currentQuery={q} />;
}
