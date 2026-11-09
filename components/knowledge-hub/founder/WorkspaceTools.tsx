import Link from "next/link";
import { ArrowRight, Bookmark, CalendarClock } from "lucide-react";
import type { ReminderSummary } from "@/features/reminders/types";

export function WorkspaceTools({
  savedCount,
  reminders,
}: {
  savedCount: number;
  reminders: ReminderSummary;
}) {
  const due = reminders.overdue + reminders.dueToday;

  return (
    <section aria-labelledby="workspace-tools-heading" className="vx-card p-5">
      <p className="vx-label">Founder workspace</p>
      <h2 id="workspace-tools-heading" className="mt-1 text-sm font-semibold tracking-tight">
        Saved resources and reminders
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
        Everything here is read from your own saved items and reminders.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Link
          href="/knowledge-hub/for-you/saved"
          className="vx-inset group flex items-start justify-between gap-3 p-3 transition-colors hover:border-[var(--border-hover)]"
        >
          <div className="flex items-start gap-2.5">
            <Bookmark size={14} className="mt-0.5 text-[var(--accent)]" aria-hidden="true" />
            <div>
              <p className="text-[11px] font-medium">Saved resources</p>
              <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                {savedCount === 0
                  ? "No resources saved yet"
                  : `${savedCount} ${savedCount === 1 ? "resource" : "resources"} saved`}
              </p>
            </div>
          </div>
          <ArrowRight
            size={11}
            className="mt-1 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)]"
            aria-hidden="true"
          />
        </Link>

        <Link
          href="/knowledge-hub/for-you/reminders"
          className="vx-inset group flex items-start justify-between gap-3 p-3 transition-colors hover:border-[var(--border-hover)]"
        >
          <div className="flex items-start gap-2.5">
            <CalendarClock size={14} className="mt-0.5 text-[var(--accent)]" aria-hidden="true" />
            <div>
              <p className="text-[11px] font-medium">Reminders</p>
              <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                {reminders.total === 0
                  ? "No reminders yet"
                  : due > 0
                    ? `${reminders.overdue} overdue · ${reminders.dueToday} due today`
                    : `${reminders.upcoming} upcoming · ${reminders.completed} completed`}
              </p>
            </div>
          </div>
          <ArrowRight
            size={11}
            className="mt-1 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)]"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
