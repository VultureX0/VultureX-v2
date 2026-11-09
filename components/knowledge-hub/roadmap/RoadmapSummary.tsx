import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import type { RoadmapOverview } from "@/features/roadmap/types";

/**
 * Compact, server-rendered roadmap summary for For You. It only displays
 * statuses and milestones that are actually stored for the founder.
 */
export function RoadmapSummary({ roadmap }: { roadmap: RoadmapOverview }) {
  const nextTaskId = roadmap.recommendations.find((item) => item.kind === "next_task")?.taskId;
  const nextTask = nextTaskId
    ? roadmap.tasks.find((task) => task.id === nextTaskId) ?? null
    : null;

  return (
    <section aria-labelledby="roadmap-summary-heading" className="vx-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="vx-label">Roadmap</p>
          <h2 id="roadmap-summary-heading" className="mt-1 text-sm font-semibold tracking-tight">
            {roadmap.stage.label} execution
          </h2>
        </div>
        <Link
          href="/knowledge-hub/roadmap"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
        >
          Open roadmap
          <ArrowRight size={11} aria-hidden="true" />
        </Link>
      </div>

      {roadmap.tasks.length === 0 ? (
        <div className="vx-inset mt-3 p-4">
          <p className="text-xs font-medium">No roadmap tasks yet</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
            Build the suggested {roadmap.stage.label} checklist to start tracking real progress.
          </p>
          <Link
            href="/knowledge-hub/roadmap"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
          >
            Build roadmap
            <ArrowRight size={10} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="vx-inset p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[10px] text-[var(--text-secondary)]">Tasks</p>
                <p className="vx-mono text-[10px] tabular-nums text-[var(--text-muted)]">
                  {roadmap.progress.tasksCompleted}/{roadmap.progress.tasksTotal} ·{" "}
                  {roadmap.progress.taskPercent}%
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-fill)]"
                  style={{ width: `${roadmap.progress.taskPercent}%` }}
                />
              </div>
            </div>

            <div className="vx-inset p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[10px] text-[var(--text-secondary)]">Milestones</p>
                <p className="vx-mono text-[10px] tabular-nums text-[var(--text-muted)]">
                  {roadmap.progress.milestonesAchieved}/{roadmap.progress.milestonesTotal} ·{" "}
                  {roadmap.progress.milestonePercent}%
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-fill)]"
                  style={{ width: `${roadmap.progress.milestonePercent}%` }}
                />
              </div>
            </div>
          </div>

          {nextTask ? (
            <div className="vx-inset mt-3 p-3">
              <p className="vx-label">Next task</p>
              <p className="mt-1 text-xs font-medium">{nextTask.title}</p>
              <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                {nextTask.status === "in_progress" ? "In progress" : "Not started"} ·{" "}
                {nextTask.category}
              </p>
            </div>
          ) : (
            <div className="vx-inset mt-3 flex items-center gap-2 p-3">
              <Target size={13} className="text-[var(--green)]" aria-hidden="true" />
              <p className="text-[11px] text-[var(--text-secondary)]">
                No open tasks. Add a milestone or review completed work.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
