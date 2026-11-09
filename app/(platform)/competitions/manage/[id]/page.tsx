import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { StatusChip } from "@/components/competitions/StatusChip";
import {
  getCompetitionActor,
  getCompetitionDetail,
  getInvestorCompetition,
} from "@/features/competitions";
import { formatDate } from "@/features/competitions/format";
import { ManageClient } from "./manage-client";

export const metadata = { title: "Manage competition" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "accepted", label: "Selected" },
  { value: "rejected", label: "Not selected" },
  { value: "withdrawn", label: "Withdrawn" },
];

const PAGE_SIZE = 10;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
};

export default async function ManageCompetitionPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { status: statusParam, page: pageParam } = await searchParams;

  const actor = await getCompetitionActor();
  if (!actor) redirect(`/login?callbackUrl=/competitions/manage/${id}`);
  if (actor.role !== "investor") redirect("/competitions");

  const base = await getCompetitionDetail(id, actor);
  if (!base || !base.isHost) notFound();

  const filter = FILTERS.some((entry) => entry.value === statusParam)
    ? statusParam!
    : "all";
  const page = Math.max(1, Number(pageParam) || 1);

  let data;
  try {
    data = await getInvestorCompetition(actor, id, {
      status: filter,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    });
  } catch {
    notFound();
  }
  if (!data) notFound();

  const canProposeWinners =
    data.competition.publishedAt !== null &&
    data.competition.phase !== "open" &&
    data.competition.phase !== "upcoming";

  const totalPages = Math.max(
    1,
    Math.ceil(data.totalApplicants / PAGE_SIZE)
  );
  const query = (nextPage: number) =>
    `/competitions/manage/${id}?status=${filter}&page=${nextPage}`;

  return (
    <div className="max-w-5xl">
      <Link
        href="/competitions/manage"
        className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-4 transition-colors"
      >
        <ArrowLeft size={11} /> My competitions
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <PageHeader
          title={data.competition.title}
          subtitle={`${data.competition.host} · ${
            data.competition.deadline
              ? `deadline ${formatDate(data.competition.deadline)}`
              : "no deadline set"
          }`}
        />
        <div className="flex items-center gap-2">
          <StatusChip status={data.competition.status} />
          <Link
            href={`/competitions/${id}`}
            className="px-3 py-1.5 text-[11px] border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
          >
            Public page
          </Link>
        </div>
      </div>

      {data.competition.adminFeedback &&
        data.competition.status === "changes_requested" && (
          <div className="mb-4 rounded-lg border border-[var(--amber)]/30 bg-[var(--amber-muted)] px-4 py-2.5">
            <p className="text-[11px] text-[var(--amber)]">
              Admin feedback: {data.competition.adminFeedback}
            </p>
          </div>
        )}

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {FILTERS.map((entry) => {
          const count =
            entry.value === "all"
              ? data.totalApplicants
              : data.statusCounts[entry.value] ?? 0;
          return (
            <Link
              key={entry.value}
              href={`/competitions/manage/${id}?status=${entry.value}`}
              className={`px-3 py-1.5 text-[11px] rounded-md border transition-colors ${
                filter === entry.value
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
              }`}
            >
              {entry.label}
              {count > 0 && (
                <span className="ml-1 text-[9px] tabular-nums opacity-70">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
        <span className="ml-auto text-[10px] text-[var(--text-muted)] flex items-center gap-1">
          <Users size={9} /> {data.totalApplicants} total applications
        </span>
      </div>

      <ManageClient
        competitionId={id}
        phase={data.competition.phase}
        criteria={data.competition.criteria}
        applicants={data.applicants}
        winners={data.winners}
        events={data.events}
        canProposeWinners={canProposeWinners}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          {page > 1 ? (
            <Link
              href={query(page - 1)}
              className="px-3 py-1.5 text-[11px] border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-[10px] text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={query(page + 1)}
              className="px-3 py-1.5 text-[11px] border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
