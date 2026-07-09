import { auth } from "@/features/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { startups, investors, interests, profileViews, decks, competitionEntries } from "@/db/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import Link from "next/link";
import { DashboardClient } from "./dashboard-client";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  const userId = session.user.id;

  if (role === "startup") {
    const [startup] = await db.select().from(startups).where(eq(startups.userId, userId!)).limit(1);

    if (!startup) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center max-w-xs">
            <h1 className="text-lg font-semibold mb-2">Welcome to VultureX</h1>
            <p className="text-xs text-[var(--text-muted)] mb-6">Set up your startup profile to get discovered by investors.</p>
            <Link href="/onboarding/startup" className="text-xs font-medium px-4 py-2 bg-[var(--text)] text-[var(--bg)] rounded-md hover:opacity-90 transition-opacity">
              Create profile
            </Link>
          </div>
        </div>
      );
    }

    const [viewCount, interestCount, deckCount, compCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(profileViews)
        .where(and(eq(profileViews.startupId, startup.id), sql`viewed_at > now() - interval '30 days'`))
        .then(r => r[0]),
      db.select({ count: sql<number>`count(*)` }).from(interests)
        .where(eq(interests.startupId, startup.id)).then(r => r[0]),
      db.select({ count: sql<number>`count(*)` }).from(decks)
        .where(eq(decks.startupId, startup.id)).then(r => r[0]),
      db.select({ count: sql<number>`count(*)` }).from(competitionEntries)
        .where(eq(competitionEntries.startupId, startup.id)).then(r => r[0]),
    ]);

    // Get recent interests (who's interested)
    const recentInterests = await db.select().from(interests)
      .where(eq(interests.startupId, startup.id)).orderBy(desc(interests.createdAt)).limit(5);

    const score = parseFloat(startup.score || "0");
    const breakdown = startup.scoreBreakdown as { traction: number; financial: number; team: number; market: number; momentum: number } | null;

    return (
      <DashboardClient
        type="startup"
        data={{
          name: startup.name,
          tagline: startup.tagline,
          sector: startup.sector,
          stage: startup.stage,
          score,
          breakdown,
          stats: {
            views: Number(viewCount.count),
            interests: Number(interestCount.count),
            decks: Number(deckCount.count),
            competitions: Number(compCount.count),
          },
          mrr: startup.mrr || 0,
          growth: startup.monthlyGrowth || "0",
          recentInterests: recentInterests.length,
        }}
      />
    );
  }

  // Investor
  const [investor] = await db.select().from(investors).where(eq(investors.userId, userId!)).limit(1);

  if (!investor) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-xs">
          <h1 className="text-lg font-semibold mb-2">Welcome to VultureX</h1>
          <p className="text-xs text-[var(--text-muted)] mb-6">Set up your investor profile to discover startups.</p>
          <Link href="/onboarding/investor" className="text-xs font-medium px-4 py-2 bg-[var(--text)] text-[var(--bg)] rounded-md hover:opacity-90 transition-opacity">
            Set up profile
          </Link>
        </div>
      </div>
    );
  }

  const [sentInterests] = await db.select({ count: sql<number>`count(*)` }).from(interests)
    .where(eq(interests.investorId, investor.id));

  // Get top startups for investor
  const topStartups = await db.select().from(startups).where(eq(startups.isPublic, true)).orderBy(desc(startups.score)).limit(6);

  return (
    <DashboardClient
      type="investor"
      data={{
        name: investor.fullName,
        firmName: investor.firmName,
        sectors: investor.sectorFocus || [],
        stages: investor.stageFocus || [],
        stats: { interests: Number(sentInterests.count) },
        topStartups: topStartups.map(s => ({
          id: s.id, slug: s.slug, name: s.name, sector: s.sector, stage: s.stage,
          score: parseFloat(s.score || "0"), growth: s.monthlyGrowth || "0",
        })),
      }}
    />
  );
}
