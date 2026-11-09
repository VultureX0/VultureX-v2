import assert from "node:assert/strict";
import test from "node:test";
import { summarizeReminders } from "./rules";
import type { ReminderView } from "./types";

const base: ReminderView = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Follow up",
  description: null,
  dueAt: "2026-11-03T09:00:00.000Z",
  hasTime: true,
  completedAt: null,
  roadmapTaskId: null,
  savedResourceId: null,
  createdAt: "2026-11-01T09:00:00.000Z",
  updatedAt: "2026-11-01T09:00:00.000Z",
};

test("classifies overdue, due today, upcoming and completed reminders", () => {
  const now = new Date("2026-11-03T12:00:00.000Z");
  const summary = summarizeReminders(
    [
      { ...base, id: "overdue", dueAt: "2026-11-03T09:00:00.000Z" },
      { ...base, id: "today", dueAt: "2026-11-03T18:00:00.000Z" },
      { ...base, id: "upcoming", dueAt: "2026-11-04T09:00:00.000Z" },
      { ...base, id: "done", completedAt: "2026-11-02T09:00:00.000Z" },
    ],
    now
  );

  assert.deepEqual(summary, {
    total: 4,
    overdue: 1,
    dueToday: 1,
    upcoming: 1,
    completed: 1,
  });
});

test("an empty reminder list reports zero counts", () => {
  assert.deepEqual(summarizeReminders([], new Date("2026-11-03T12:00:00.000Z")), {
    total: 0,
    overdue: 0,
    dueToday: 0,
    upcoming: 0,
    completed: 0,
  });
});
