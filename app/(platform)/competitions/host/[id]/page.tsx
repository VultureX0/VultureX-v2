import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { StatusChip } from "@/components/competitions/StatusChip";
import { getCompetitionActor, getCompetitionDetail } from "@/features/competitions";
import { toLocalInput } from "@/features/competitions/format";
import { CompetitionForm } from "../competition-form";

export const metadata = { title: "Edit competition proposal" };

type Props = { params: Promise<{ id: string }> };

export default async function EditCompetitionPage({ params }: Props) {
  const { id } = await params;
  const actor = await getCompetitionActor();
  if (!actor) redirect(`/login?callbackUrl=/competitions/host/${id}`);

  const detail = await getCompetitionDetail(id, actor);
  if (!detail || !detail.isHost) notFound();

  if (!detail.canEdit) {
    redirect(`/competitions/manage/${id}`);
  }

  const competition = detail.competition;

  return (
    <div className="max-w-4xl">
      <Link
        href="/competitions?tab=host"
        className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-4 transition-colors"
      >
        <ArrowLeft size={11} /> Back to competitions
      </Link>

      <div className="flex items-start justify-between gap-3 mb-6">
        <PageHeader
          title="Edit proposal"
          subtitle="Saving keeps this as a draft. Submitting sends it to the VultureX team for review."
        />
        <StatusChip status={competition.status} />
      </div>

      <CompetitionForm
        initial={{
          id: competition.id,
          title: competition.title,
          summary: competition.summary ?? "",
          description: competition.description ?? "",
          category: competition.category ?? "",
          hostOrganization: competition.hostOrganization ?? competition.host,
          bannerUrl: competition.bannerUrl ?? "",
          openAt: toLocalInput(competition.opensAt),
          deadline: toLocalInput(competition.deadline),
          evaluationEndsAt: toLocalInput(competition.evaluationEndsAt),
          winnerAnnouncementAt: toLocalInput(competition.winnerAnnouncementAt),
          completionAt: toLocalInput(competition.completionAt),
          prizeAmount:
            competition.prizeAmount === null
              ? ""
              : String(competition.prizeAmount),
          prizeCurrency: competition.prizeCurrency ?? "USD",
          prizeDescription: competition.prize ?? "",
          benefits: {
            mentorship: competition.benefits.mentorship,
            incubation: competition.benefits.incubation,
            pilotPartnership: competition.benefits.pilotPartnership,
            investorVisibility: competition.benefits.investorVisibility,
            other: competition.benefits.other ?? "",
          },
          eligibility: {
            allStages: competition.eligibility.allStages,
            stages: competition.eligibility.stages,
            sectors: competition.eligibility.sectors,
            minMrr:
              competition.eligibility.minMrr === null
                ? ""
                : String(competition.eligibility.minMrr),
            maxMrr:
              competition.eligibility.maxMrr === null
                ? ""
                : String(competition.eligibility.maxMrr),
            regions: competition.eligibility.regions.join(", "),
            requirements: competition.eligibility.requirements ?? "",
            requiredSdgs: competition.eligibility.requiredSdgs ?? [],
            requireVerifiedImpact: competition.eligibility.requireVerifiedImpact ?? false,
          },
          criteria: competition.criteria.map((criterion) => ({
            key: criterion.key,
            label: criterion.label,
            weight: String(criterion.weight),
          })),
          sdgGoals: competition.sdgGoals,
          sdgPrimary: competition.sdgPrimary,
          rules: competition.rules ?? "",
          status: competition.status,
        }}
      />
    </div>
  );
}
