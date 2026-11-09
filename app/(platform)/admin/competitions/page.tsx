import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { StatusChip } from "@/components/competitions/StatusChip";
import { getAdminCompetitions, getCompetitionActor } from "@/features/competitions";
import { formatDate } from "@/features/competitions/format";

export const metadata = { title: "Competition review" };

const VIEWS = [
  { value: "pending", label: "Pending review" },
  { value: "changes", label: "Changes requested" },
  { value: "approved", label: "Approved & scheduled" },
  { value: "published", label: "Published / active" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
  { value: "all", label: "All competitions" },
];

export default async function AdminCompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const actor = await getCompetitionActor();
  if (!actor) redirect("/login?callbackUrl=/admin/competitions");
  if (actor.role !== "admin") redirect("/dashboard");

  const { view: viewParam } = await searchParams;
  const view = VIEWS.some((entry) => entry.value === viewParam)
    ? viewParam!
    : "pending";

  const rows = await getAdminCompetitions();

  const filtered = rows.filter(({ competition }) => {
    switch (view) {
      case "pending":
        return competition.status === "pending_review";
      case "changes":
        return competition.status === "changes_requested";
      case "approved":
        return (
          competition.status === "approved" || competition.status === "scheduled"
        );
      case "published":
        return (
          competition.publishedAt !== null &&
          competition.status !== "completed" &&
          competition.status !== "rejected"
        );
      case "rejected":
        return competition.status === "rejected";
      case "completed":
        return competition.status === "completed";
      default:
        return true;
    }
  });

  const pendingCount = rows.filter(
    (row) => row.competition.status === "pending_review"
  ).length;
  const winnerApprovals = rows.filter(
    (row) => row.competition.winnerAnnouncementStatus === "pending_approval"
  ).length;

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-4 transition-colors"
      >
        <ArrowLeft size={11} /> Admin
      </Link>

      <PageHeader
        title="Competition oversight"
        subtitle={`${pendingCount} awaiting review · ${winnerApprovals} winner announcement${
          winnerApprovals === 1 ? "" : "s"
        } awaiting approval`}
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {VIEWS.map((entry) => {
          const count =
            entry.value === "all"
              ? rows.length
              : rows.filter(({ competition }) => {
                  if (entry.value === "pending")
                    return competition.status === "pending_review";
                  if (entry.value === "changes")
                    return competition.status === "changes_requested";
                  if (entry.value === "approved")
                    return (
                      competition.status === "approved" ||
                      competition.status === "scheduled"
                    );
                  if (entry.value === "published")
                    return (
                      competition.publishedAt !== null &&
                      competition.status !== "completed" &&
                      competition.status !== "rejected"
                    );
                  if (entry.value === "rejected")
                    return competition.status === "rejected";
                  if (entry.value === "completed")
                    return competition.status === "completed";
                  return true;
                }).length;
          return (
            <Link
              key={entry.value}
              href={`/admin/competitions?view=${entry.value}`}
              className={`px-3 py-1.5 text-[11px] rounded-md border transition-colors ${
                view === entry.value
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
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] p-10 text-center">
          <Trophy size={20} className="mx-auto text-[var(--text-muted)] mb-3" />
          <p className="text-sm">Nothing in this view.</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Investor proposals appear here when they are submitted for review.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="px-4 py-3 font-medium">Competition</th>
                <th className="px-4 py-3 font-medium">Host</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Apps</th>
                <th className="px-4 py-3 font-medium">Winners</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ competition, applications, winners }) => (
                <tr
                  key={competition.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{competition.title}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {competition.category ?? "No category"}
                      {competition.sdgGoals.length > 0
                        ? ` · SDG ${competition.sdgGoals.join(", ")}`
                        : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[11px]">{competition.host}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 items-start">
                      <StatusChip status={competition.status} />
                      {competition.winnerAnnouncementStatus ===
                        "pending_approval" && (
                        <span className="text-[9px] text-[var(--amber)]">
                          Winner pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-[var(--text-muted)]">
                    {formatDate(competition.submittedAt)}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-[var(--text-muted)]">
                    {formatDate(competition.deadline)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{applications}</td>
                  <td className="px-4 py-3 tabular-nums">{winners}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/competitions/${competition.id}`}
                      className="text-[11px] text-[var(--accent)] hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
