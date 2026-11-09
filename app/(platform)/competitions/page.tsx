import {
  getCompetitionActor,
  getDiscovery,
  getInvestorCompetitions,
} from "@/features/competitions";
import { sanitizeSdgIds } from "@/features/sdg/taxonomy";
import { CompetitionsClient } from "./competitions-client";

export const metadata = { title: "Competitions" };

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; sdg?: string }>;
}) {
  const { tab, sdg } = await searchParams;
  const actor = await getCompetitionActor();
  const sdgId = sanitizeSdgIds(sdg ?? "")[0] ?? null;
  const discovery = await getDiscovery(new Date(), sdgId);

  const mine =
    actor?.role === "investor" && actor.investorId
      ? (await getInvestorCompetitions(actor.investorId)).map((row) => ({
          id: row.competition.id,
          title: row.competition.title,
          status: row.competition.status,
          phase: row.competition.phase,
          applications: row.applications,
          pending: row.pending,
        }))
      : [];

  return (
    <CompetitionsClient
      discovery={discovery}
      role={actor?.role ?? null}
      mine={mine}
      initialTab={tab}
      currentSdg={sdgId}
    />
  );
}
