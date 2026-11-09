import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Award, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui";
import { StatusChip } from "@/components/competitions/StatusChip";
import { getAdminCompetition, getCompetitionActor } from "@/features/competitions";
import { APPLICATION_STATUS_LABELS, sdgLabel } from "@/features/competitions/types";
import { formatDate, formatDateTime } from "@/features/competitions/format";
import { AdminReviewPanel } from "./admin-review-panel";

export const metadata = { title: "Review competition" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminCompetitionDetailPage({ params }: Props) {
  const { id } = await params;
  const actor = await getCompetitionActor();
  if (!actor) redirect(`/login?callbackUrl=/admin/competitions/${id}`);
  if (actor.role !== "admin") redirect("/dashboard");

  const data = await getAdminCompetition(id);
  if (!data) notFound();

  const { competition, host, applicants, winners, events, statusCounts } = data;

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/competitions"
        className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-4 transition-colors"
      >
        <ArrowLeft size={11} /> Competition review
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <StatusChip status={competition.status} />
            {competition.category && <Badge>{competition.category}</Badge>}
            {competition.sdgGoals.map((goal) => (
              <Badge key={goal} variant="green">
                SDG {goal} · {sdgLabel(goal)}
              </Badge>
            ))}
          </div>
          <h1 className="text-xl font-semibold">{competition.title}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Hosted by {competition.host} · submitted{" "}
            {formatDate(competition.submittedAt)}
          </p>
        </div>
        <Link
          href={`/competitions/${competition.id}`}
          className="px-3 py-1.5 text-[11px] border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
        >
          Public preview
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="text-xs font-medium text-[var(--text-muted)] mb-2">
              Proposal
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
              {competition.summary ?? "No summary provided."}
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {competition.description ?? "No full description provided."}
            </p>
            {competition.rules && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-[10px] text-[var(--text-muted)] mb-1">
                  Rules &amp; terms
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] whitespace-pre-line">
                  {competition.rules}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3">
              Prize, eligibility &amp; criteria
            </h2>
            <p className="text-sm font-medium text-[var(--amber)] mb-3">
              {competition.prize ?? "Non-monetary competition"}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {competition.eligibilityLines.map((line) => (
                <Badge key={line}>{line}</Badge>
              ))}
            </div>
            {competition.eligibility.requirements && (
              <p className="text-[11px] text-[var(--text-secondary)] mb-3 whitespace-pre-line">
                {competition.eligibility.requirements}
              </p>
            )}
            <div className="space-y-1.5">
              {competition.criteria.map((criterion) => (
                <div
                  key={criterion.key}
                  className="flex items-center justify-between text-[11px]"
                >
                  <span>{criterion.label}</span>
                  <span className="text-[var(--text-muted)] tabular-nums">
                    {Math.round(criterion.weight)}%
                  </span>
                </div>
              ))}
              {competition.criteria.length === 0 && (
                <p className="text-[11px] text-[var(--text-muted)]">
                  No evaluation criteria.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
              <Users size={12} /> Applicants ({applicants.length})
            </h2>
            {applicants.length === 0 ? (
              <p className="text-[11px] text-[var(--text-muted)]">
                No applications yet.
              </p>
            ) : (
              <div className="space-y-2">
                {applicants.slice(0, 25).map((applicant) => (
                  <div
                    key={applicant.id}
                    className="flex items-center gap-3 text-[11px] border-b border-[var(--border)] last:border-0 pb-2 last:pb-0"
                  >
                    <Link
                      href={`/explore/${applicant.startupSlug}`}
                      className="font-medium hover:text-[var(--accent)] transition-colors"
                    >
                      {applicant.startupName}
                    </Link>
                    <span className="text-[var(--text-muted)]">
                      {applicant.startupSector} · {applicant.startupStage}
                    </span>
                    <span className="ml-auto text-[var(--text-muted)]">
                      {APPLICATION_STATUS_LABELS[applicant.status] ??
                        applicant.status}
                      {applicant.weightedScore !== null
                        ? ` · ${applicant.weightedScore.toFixed(1)}`
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
              <Award size={12} /> Winner records
            </h2>
            {winners.length === 0 ? (
              <p className="text-[11px] text-[var(--text-muted)]">
                No winners proposed.
              </p>
            ) : (
              <div className="space-y-2">
                {winners.map((winner) => (
                  <div
                    key={winner.id}
                    className="flex flex-wrap items-center gap-3 text-[11px] border-b border-[var(--border)] last:border-0 pb-2 last:pb-0"
                  >
                    <span className="w-10 font-semibold text-[var(--amber)]">
                      #{winner.placement}
                    </span>
                    <Link
                      href={`/explore/${winner.startupSlug}`}
                      className="font-medium hover:text-[var(--accent)]"
                    >
                      {winner.startupName}
                    </Link>
                    <Badge
                      variant={
                        winner.status === "approved"
                          ? "green"
                          : winner.status === "changes_requested"
                            ? "default"
                            : "accent"
                      }
                    >
                      {winner.status === "approved"
                        ? "Approved"
                        : winner.status === "changes_requested"
                          ? "Changes requested"
                          : "Pending approval"}
                    </Badge>
                    {winner.publishedAt && (
                      <span className="ml-auto text-[10px] text-[var(--text-muted)]">
                        published {formatDate(winner.publishedAt)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3">
              Audit trail
            </h2>
            {events.length === 0 ? (
              <p className="text-[11px] text-[var(--text-muted)]">
                No events recorded.
              </p>
            ) : (
              <div className="space-y-2">
                {events.slice(0, 20).map((event) => (
                  <div key={event.id} className="flex items-start gap-2 text-[10px]">
                    <span className="text-[var(--text-muted)] tabular-nums shrink-0">
                      {formatDate(event.createdAt)}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {event.message ?? event.type}
                    </span>
                    {event.actorRole && (
                      <span className="text-[var(--text-muted)] ml-auto">
                        {event.actorRole}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <AdminReviewPanel
            competitionId={competition.id}
            status={competition.status}
            publishedAt={competition.publishedAt}
            winnerStatus={competition.winnerAnnouncementStatus}
            hasWinners={winners.length > 0}
            phase={competition.phase}
          />

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <p className="text-xs font-medium mb-3">Schedule</p>
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
                <dt className="text-[var(--text-muted)]">Published</dt>
                <dd>{formatDate(competition.publishedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Announcement</dt>
                <dd>{formatDate(competition.winnerAnnouncementAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <p className="text-xs font-medium mb-2">Host</p>
            <p className="text-[11px]">{host?.organization ?? competition.host}</p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {host?.name ?? "Investor"}
              {host?.userId ? (
                <>
                  {" · "}
                  <Link
                    href={`/investors/${host.userId}`}
                    className="text-[var(--accent)] hover:underline"
                  >
                    profile
                  </Link>
                </>
              ) : null}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
              <Trophy size={11} /> Applications
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <span
                  key={status}
                  className="text-[10px] px-2 py-1 rounded-md bg-[var(--bg-elevated)]"
                >
                  {APPLICATION_STATUS_LABELS[status] ?? status}: {count}
                </span>
              ))}
              {Object.keys(statusCounts).length === 0 && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  None yet
                </span>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
