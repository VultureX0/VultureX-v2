import type { ReminderSummary, ReminderView } from "./types";

function sameUtcDay(left: Date, right: Date): boolean {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

/**
 * Classifies stored reminders using a supplied clock. Completed reminders are
 * counted separately; an incomplete reminder past its exact UTC time is overdue.
 */
export function summarizeReminders(
  items: ReminderView[],
  now = new Date()
): ReminderSummary {
  const summary: ReminderSummary = {
    total: items.length,
    overdue: 0,
    dueToday: 0,
    upcoming: 0,
    completed: 0,
  };

  for (const item of items) {
    if (item.completedAt) {
      summary.completed += 1;
      continue;
    }
    const due = new Date(item.dueAt);
    if (due.getTime() < now.getTime()) {
      summary.overdue += 1;
    } else if (sameUtcDay(due, now)) {
      summary.dueToday += 1;
    } else {
      summary.upcoming += 1;
    }
  }

  return summary;
}
