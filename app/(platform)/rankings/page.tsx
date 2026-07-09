import { db } from "@/db";
import { startups } from "@/db/schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import { RankingsClient } from "./rankings-client";

export const metadata = { title: "Rankings" };

type Props = { searchParams: Promise<{ sector?: string }> };

export default async function RankingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const sector = params.sector;

  const conditions = [eq(startups.isPublic, true)];
  if (sector && sector.toLowerCase() !== "all") conditions.push(ilike(startups.sector, `%${sector}%`));

  const results = await db.select().from(startups).where(and(...conditions)).orderBy(desc(startups.score)).limit(50);

  const mapped = results.map(s => ({
    id: s.id, slug: s.slug, name: s.name, tagline: s.tagline,
    sector: s.sector, stage: s.stage, score: parseFloat(s.score || "0"),
    monthlyGrowth: s.monthlyGrowth || "0",
  }));

  return <RankingsClient startups={mapped} currentSector={sector} />;
}
