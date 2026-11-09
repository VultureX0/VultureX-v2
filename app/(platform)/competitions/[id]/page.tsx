import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CalendarClock,
  CheckCircle2,
  Scale,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { ApplyPanel } from "@/components/competitions/ApplyPanel";
import { StatusChip } from "@/components/competitions/StatusChip";
import { getCompetitionActor, getCompetitionDetail } from "@/features/competitions";
import { formatDate, formatDateTime } from "@/features/competitions/format";
import { sdgLabel } from "@/features/competitions/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const actor = await getCompetitionActor();
  const detail = await getCompetitionDetail(id, actor);
  return { title: detail?.competition.title ?? "Competition" };
}

function placementLabel(placement: number): string {
  if (placement === 1) return "1st place";
  if (placement === 2) return "2nd place";
  if (placement === 3) return "3rd place";
  return `#${placement}`;
}

export default async function CompetitionDetailPage({ params }: Props) {
  const { id } = await params;
  const actor = await getCompetitionActor();
  const detail = await getCompetitionDetail(id, actor);
  if (!detail) notFound();

  const { competition, winners, application, eligibility } = detail;
  const publishedWinners = winners.filter(
    (winner) => winner.status === "approved"
  );
  const privateWinners = winners.filter((winner) => winner.status !== "approved");
  const showPrivateWinners =
    privateWinners.length > 0 && (detail.canManage || detail.canReview);

  return (
    <div className="max-w-5xl">
      <Link
        href="/competitions"
        className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-4 transition-colors"
      >
        <ArrowLeft size={11} /> Back to competitions
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <StatusChip status={competition.status} />
          {competition.category && <Badge>{competition.category}</Badge>}
          {competition.phase === "upcoming" && (
            <Badge variant="accent">
              Opens {formatDate(competition.opensAt)}
            </Badge>
          )}
          {competition.sdgGoals.map((goal) => (
            <Badge key={goal} variant={competition.sdgPrimary === goal ? "accent" : "green"}>
              SDG {goal} · {sdgLabel(goal)}
              {competition.sdgPrimary === goal ? " (primary)" : ""}
            </Badge>
          ))}
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          {competition.title}
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Hosted by{" "}
          {competition.hostInvestorUserId ? (
            <Link
              href={`/investors/${competition.hostInvestorUserId}`}
              className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              {competition.host}
            </Link>
          ) : (
            competition.host
          )}
        </p>
        {competition.summary && (
          <p className="text-sm text-[var(--text-secondary)] mt-3 max-w-3xl leading-relaxed">
            {competition.summary}
          </p>
        )}
      </div>

      {detail.canManage &&
        competition.status === "changes_requested" &&
        competition.adminFeedback && (
          <div className="mb-4 rounded-lg border border-[var(--amber)]/30 bg-[var(--amber-muted)] px-4 py-3">
            <p className="text-[11px] font-medium text-[var(--amber)] mb-1">
              VultureX requested changes
            </p>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {competition.adminFeedback}
            </p>
            <Link
              href={`/competitions/host/${competition.id}`}
              className="inline-block mt-2 text-[10px] text-[var(--accent)] hover:underline"
            >
              Edit and resubmit →
            </Link>
          </div>
        )}

      {detail.canManage &&
        competition.status === "rejected" &&
        competition.rejectionReason && (
          <div className="mb-4 rounded-lg border border-[var(--red)]/30 bg-[var(--red-muted)] px-4 py-3">
            <p className="text-[11px] font-medium text-[var(--red)] mb-1">
              Proposal rejected
            </p>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {competition.rejectionReason}
            </p>
          </div>
        )}

      {competition.bannerUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={competition.bannerUrl}
          alt=""
          className="w-full h-44 object-cover rounded-xl border border-[var(--border)] mb-5"
        />
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {competition.description && (
            <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <h2 className="text-xs font-medium text-[var(--text-muted)] mb-2">
                About this competition
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {competition.description}
              </p>
            </section>
          )}

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
              <Trophy size={12} /> Prize &amp; benefits
            </h2>
            {competition.prize ? (
              <p className="text-sm font-medium text-[var(--amber)]">
                {competition.prize}
              </p>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                Non-monetary recognition and access.
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {competition.benefits.mentorship && <Badge>Mentorship</Badge>}
              {competition.benefits.incubation && <Badge>Incubation</Badge>}
              {competition.benefits.pilotPartnership && (
                <Badge>Pilot partnership</Badge>
              )}
              {competition.benefits.investorVisibility && (
                <Badge>Investor visibility</Badge>
              )}
              {competition.benefits.other && (
                <Badge>{competition.benefits.other}</Badge>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
              <ShieldCheck size={12} /> Eligibility
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {competition.eligibilityLines.map((line) => (
                <Badge key={line}>{line}</Badge>
              ))}
            </div>
            {competition.eligibility.requirements && (
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {competition.eligibility.requirements}
              </p>
            )}
            {detail.eligibility && (
              <div
                className={`mt-3 rounded-lg border px-3 py-2.5 ${
                  detail.eligibility.status === "ineligible"
                    ? "border-[var(--red)]/30 bg-[var(--red-muted)]"
                    : detail.eligibility.status === "needs_info"
                      ? "border-[var(--amber)]/30 bg-[var(--amber-muted)]"
                      : "border-[var(--green)]/30 bg-[var(--green-muted)]"
                }`}
              >
                <p className="text-[10px] font-medium text-[var(--text)] flex items-center gap-1.5">
                  <CheckCircle2 size={11} /> Based on your profile:{" "}
                  {detail.eligibility.status === "ineligible"
                    ? "appears ineligible"
                    : detail.eligibility.status === "needs_info"
                      ? "needs more information"
                      : "appears eligible"}
                </p>
                {detail.eligibility.reasons.map((reason) => (
                  <p
                    key={reason}
                    className="text-[10px] text-[var(--text-secondary)] mt-1"
                  >
                    {reason}
                  </p>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
              <Scale size={12} /> Evaluation criteria
            </h2>
            {competition.criteria.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">
                No criteria have been published.
              </p>
            ) : (
              <div className="space-y-2.5">
                {competition.criteria.map((criterion) => (
                  <div key={criterion.key}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span>{criterion.label}</span>
                      <span className="text-[var(--text-muted)] tabular-nums">
                        {Math.round(criterion.weight)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent-fill)]"
                        style={{ width: `${Math.min(100, criterion.weight)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {competition.rules && (
            <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <h2 className="text-xs font-medium text-[var(--text-muted)] mb-2">
                Rules &amp; requirements
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {competition.rules}
              </p>
            </section>
          )}

          {publishedWinners.length > 0 && (
            <section className="rounded-xl border border-[var(--green)]/25 bg-[var(--green-muted)]/30 p-5">
              <h2 className="text-xs font-medium text-[var(--green)] mb-3 flex items-center gap-1.5">
                <Award size={12} /> Winners
              </h2>
              <div className="space-y-2">
                {publishedWinners.map((winner) => (
                  <div
                    key={winner.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5"
                  >
                    <span className="w-16 text-[10px] font-semibold text-[var(--amber)]">
                      {placementLabel(winner.placement)}
                    </span>
                    <Link
                      href={`/explore/${winner.startupSlug}`}
                      className="text-xs font-medium hover:text-[var(--accent)]"
                    >
                      {winner.startupName}
                    </Link>
                    {winner.awardLabel && (
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {winner.awardLabel}
                      </span>
                    )}
                    {winner.prizeNote && (
                      <span className="text-[10px] text-[var(--text-secondary)] ml-auto">
                        {winner.prizeNote}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {showPrivateWinners && (
            <section className="rounded-xl border border-[var(--amber)]/30 bg-[var(--amber-muted)]/30 p-5">
              <h2 className="text-xs font-medium text-[var(--amber)] mb-2">
                Proposed winners — private, awaiting admin approval
              </h2>
              <div className="space-y-2">
                {privateWinners.map((winner) => (
                  <div
                    key={winner.id}
                    className="flex items-center gap-3 text-[11px]"
                  >
                    <span className="w-16 font-semibold text-[var(--amber)]">
                      {placementLabel(winner.placement)}
                    </span>
                    <span>{winner.startupName}</span>
                    <span className="text-[var(--text-muted)] ml-auto">
                      {winner.status === "changes_requested"
                        ? "Changes requested"
                        : "Pending approval"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <ApplyPanel
            competitionId={competition.id}
            role={detail.viewerRole}
            canApply={detail.canApply}
            application={application}
            eligibility={eligibility}
            deadline={competition.deadline}
            opensAt={competition.opensAt}
            phase={competition.phase}
            status={competition.status}
          />

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <p className="text-xs font-medium mb-3 flex items-center gap-1.5">
              <CalendarClock size={12} /> Key dates
            </p>
            <dl className="space-y-2 text-[10px]">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Opens</dt>
                <dd>{formatDateTime(competition.opensAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Deadline</dt>
                <dd>{formatDateTime(competition.deadline)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Evaluation ends</dt>
                <dd>{formatDateTime(competition.evaluationEndsAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Winners announced</dt>
                <dd>{formatDate(competition.winnerAnnouncementAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Completed</dt>
                <dd>{formatDate(competition.completionAt)}</dd>
              </div>
              <div className="flex justify-between gap-3 pt-2 border-t border-[var(--border)]">
                <dt className="text-[var(--text-muted)] flex items-center gap-1">
                  <Users size={9} /> Applications
                </dt>
                <dd className="tabular-nums">{competition.applicationCount}</dd>
              </div>
            </dl>
          </div>

          {(detail.canManage || detail.canReview) && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-2">
              <p className="text-xs font-medium mb-1">Management</p>
              {detail.canEdit && (
                <Link
                  href={`/competitions/host/${competition.id}`}
                  className="block text-center px-3 py-2 text-[11px] font-medium border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
                >
                  Edit proposal
                </Link>
              )}
              {detail.canManage && (
                <Link
                  href={`/competitions/manage/${competition.id}`}
                  className="block text-center px-3 py-2 text-[11px] font-medium bg-[var(--bg-elevated)] rounded-md hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  Review applicants
                </Link>
              )}
              {detail.canReview && (
                <Link
                  href={`/admin/competitions/${competition.id}`}
                  className="block text-center px-3 py-2 text-[11px] font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Open admin review
                </Link>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
