import { db } from "@/db";
import { startups, investors } from "@/db/schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import { auth } from "@/features/auth";
import { getInterestStatuses } from "@/features/connections";
import { sanitizeSdgIds } from "@/features/sdg/taxonomy";
import { parseSdgMatchMode, startupSdgCondition } from "@/features/sdg/filters";
import { ExploreClient } from "./explore-client";

export const metadata = { title: "Explore Startups" };

type Props = {
  searchParams: Promise<{
    sector?: string;
    stage?: string;
    q?: string;
    sdg?: string;
    sdgMode?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const { sector, stage, q } = params;
  // Unknown ids are dropped by the sanitizer, so a hand-edited URL can never
  // produce an empty result caused by a non-existent goal.
  const sdgIds = sanitizeSdgIds(params.sdg ?? "");
  const sdgMode = parseSdgMatchMode(params.sdgMode);

  const conditions = [eq(startups.isPublic, true)];
  if (sector && sector !== "all") conditions.push(ilike(startups.sector, `%${sector}%`));
  if (stage && stage !== "all") conditions.push(eq(startups.stage, stage));
  if (q) conditions.push(ilike(startups.name, `%${q}%`));
  if (sdgIds.length > 0) {
    conditions.push(startupSdgCondition(startups.sdgGoals, sdgIds, sdgMode));
  }

  const results = await db.select().from(startups).where(and(...conditions)).orderBy(desc(startups.score)).limit(50);

  const mapped = results.map(s => ({
    id: s.id, userId: s.userId, slug: s.slug, name: s.name, tagline: s.tagline,
    sector: s.sector, stage: s.stage, score: parseFloat(s.score || "0"),
    mrr: s.mrr || 0, monthlyGrowth: s.monthlyGrowth || "0",
    location: s.location,
    sdgGoals: s.sdgGoals ?? [], sdgPrimary: s.sdgPrimary,
  }));

  // Investors can express interest from the card grid. Look up every status in
  // one query instead of letting each card fetch its own state.
  const session = await auth();
  const viewerId = session?.user?.id;
  const viewerRole = (session?.user as { role?: string } | undefined)?.role;
  const canSendInterest = viewerRole === "investor";

  // Investor impact interests are offered as a one-click filter shortcut, not
  // applied automatically: an explicit search must always win.
  let preferredSdgs: number[] = [];
  if (viewerId && viewerRole === "investor") {
    const [investor] = await db
      .select({ sdgPreferences: investors.sdgPreferences })
      .from(investors)
      .where(eq(investors.userId, viewerId))
      .limit(1);
    preferredSdgs = investor?.sdgPreferences ?? [];
  }

  const statuses =
    viewerId && canSendInterest
      ? await getInterestStatuses(
          viewerId,
          mapped.map((s) => s.userId).filter((id): id is string => !!id)
        )
      : {};

  return (
    <ExploreClient
      startups={mapped}
      currentSector={sector}
      currentStage={stage}
      currentQuery={q}
      currentSdg={sdgIds}
      currentSdgMode={sdgMode}
      preferredSdgs={preferredSdgs}
      viewerId={viewerId ?? null}
      canSendInterest={canSendInterest}
      statuses={statuses}
    />
  );
}
