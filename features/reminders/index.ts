/**
 * Owner-scoped reminders and their in-app notification fan-out.
 *
 * Reminder completion is deliberately independent of roadmap task completion:
 * no function here writes to roadmap_tasks.
 */

import { and, asc, eq, inArray, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  notifications,
  reminders,
  roadmapTasks,
  savedResources,
} from "@/db/schema";
import { isUuid } from "@/lib/utils";
import { parseOptionalDate } from "@/features/roadmap";
import { summarizeReminders } from "./rules";
import type {
  ReminderResourceOption,
  ReminderSummary,
  ReminderTaskOption,
  ReminderView,
} from "./types";

export class ReminderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ReminderError";
    this.status = status;
  }
}

function toView(row: typeof reminders.$inferSelect): ReminderView {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueAt: row.dueAt.toISOString(),
    hasTime: row.hasTime,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    roadmapTaskId: row.roadmapTaskId,
    savedResourceId: row.savedResourceId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listReminders(userId: string): Promise<ReminderView[]> {
  const rows = await db
    .select()
    .from(reminders)
    .where(eq(reminders.userId, userId))
    .orderBy(asc(reminders.completedAt), asc(reminders.dueAt));
  return rows.map(toView);
}

export async function getReminderSummary(userId: string): Promise<ReminderSummary> {
  return summarizeReminders(await listReminders(userId));
}

export async function getReminderFormOptions(userId: string): Promise<{
  tasks: ReminderTaskOption[];
  resources: ReminderResourceOption[];
}> {
  const [tasks, resources] = await Promise.all([
    db
      .select({ id: roadmapTasks.id, title: roadmapTasks.title, status: roadmapTasks.status })
      .from(roadmapTasks)
      .where(eq(roadmapTasks.userId, userId))
      .orderBy(asc(roadmapTasks.sortOrder)),
    db
      .select({
        id: savedResources.id,
        title: savedResources.title,
        category: savedResources.category,
      })
      .from(savedResources)
      .where(eq(savedResources.userId, userId))
      .orderBy(asc(savedResources.title)),
  ]);
  return { tasks, resources };
}

export async function getTaskReminderMap(
  userId: string,
  taskIds: string[]
): Promise<Record<string, ReminderView[]>> {
  if (taskIds.length === 0) return {};

  const rows = await db
    .select()
    .from(reminders)
    .where(
      and(
        eq(reminders.userId, userId),
        inArray(reminders.roadmapTaskId, taskIds)
      )
    )
    .orderBy(asc(reminders.dueAt));

  const map: Record<string, ReminderView[]> = {};
  for (const row of rows) {
    if (!row.roadmapTaskId) continue;
    (map[row.roadmapTaskId] ??= []).push(toView(row));
  }
  return map;
}

type DueFields = {
  dueDate: unknown;
  dueTime?: unknown;
};

export function parseReminderDue({
  dueDate,
  dueTime,
}: DueFields): { dueAt: Date; hasTime: boolean } {
  if (typeof dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw new ReminderError("A due date in YYYY-MM-DD format is required");
  }
  if (!parseOptionalDate(dueDate)) {
    throw new ReminderError("That due date does not exist");
  }

  let hasTime = false;
  let time = "23:59";
  if (dueTime !== undefined && dueTime !== null && dueTime !== "") {
    if (typeof dueTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(dueTime)) {
      throw new ReminderError("Due time must use HH:MM (UTC)");
    }
    hasTime = true;
    time = dueTime;
  }

  const dueAt = new Date(`${dueDate}T${time}:00.000Z`);
  if (Number.isNaN(dueAt.getTime())) {
    throw new ReminderError("That due date and time are invalid");
  }
  return { dueAt, hasTime };
}

function normalizeText(value: unknown, max: number, required: boolean): string | null {
  if (value === undefined || value === null) {
    if (required) throw new ReminderError("A title is required");
    return null;
  }
  if (typeof value !== "string") throw new ReminderError("Text fields must be strings");
  const trimmed = value.trim();
  if (!trimmed) {
    if (required) throw new ReminderError("A title is required");
    return null;
  }
  if (trimmed.length > max) {
    throw new ReminderError(`Keep this field to ${max} characters or fewer`);
  }
  return trimmed;
}

function normalizeLinkId(value: unknown, label: string): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (!isUuid(value)) throw new ReminderError(`${label} not found`, 404);
  return value;
}

async function ensureLinkedTask(userId: string, taskId: string | null | undefined) {
  if (!taskId) return;
  const [task] = await db
    .select({ id: roadmapTasks.id })
    .from(roadmapTasks)
    .where(and(eq(roadmapTasks.id, taskId), eq(roadmapTasks.userId, userId)))
    .limit(1);
  if (!task) throw new ReminderError("Roadmap task not found", 404);
}

async function ensureLinkedResource(
  userId: string,
  resourceId: string | null | undefined
) {
  if (!resourceId) return;
  const [resource] = await db
    .select({ id: savedResources.id })
    .from(savedResources)
    .where(and(eq(savedResources.id, resourceId), eq(savedResources.userId, userId)))
    .limit(1);
  if (!resource) throw new ReminderError("Saved resource not found", 404);
}

export type ReminderCreateInput = {
  title: string;
  description: string | null;
  dueAt: Date;
  hasTime: boolean;
  roadmapTaskId: string | null;
  savedResourceId: string | null;
};

export function normalizeReminderCreateInput(body: unknown): ReminderCreateInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ReminderError("A reminder object is required");
  }
  const source = body as Record<string, unknown>;
  const due = parseReminderDue({
    dueDate: source.dueDate,
    dueTime: source.dueTime,
  });

  return {
    title: normalizeText(source.title, 160, true) as string,
    description: normalizeText(source.description, 1000, false),
    dueAt: due.dueAt,
    hasTime: due.hasTime,
    roadmapTaskId: normalizeLinkId(source.roadmapTaskId, "Roadmap task") ?? null,
    savedResourceId: normalizeLinkId(source.savedResourceId, "Saved resource") ?? null,
  };
}

export async function createReminder(
  userId: string,
  input: ReminderCreateInput
): Promise<ReminderView> {
  await Promise.all([
    ensureLinkedTask(userId, input.roadmapTaskId),
    ensureLinkedResource(userId, input.savedResourceId),
  ]);

  const [row] = await db
    .insert(reminders)
    .values({
      userId,
      title: input.title,
      description: input.description,
      dueAt: input.dueAt,
      hasTime: input.hasTime,
      roadmapTaskId: input.roadmapTaskId,
      savedResourceId: input.savedResourceId,
    })
    .returning();

  return toView(row);
}

export type ReminderUpdateInput = {
  title?: string;
  description?: string | null;
  dueAt?: Date;
  hasTime?: boolean;
  roadmapTaskId?: string | null;
  savedResourceId?: string | null;
  completed?: boolean;
};

export function normalizeReminderUpdateInput(body: unknown): ReminderUpdateInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ReminderError("A reminder object is required");
  }
  const source = body as Record<string, unknown>;
  const update: ReminderUpdateInput = {};

  if (source.title !== undefined) update.title = normalizeText(source.title, 160, true) as string;
  if (source.description !== undefined) {
    update.description = normalizeText(source.description, 1000, false);
  }

  if (source.dueDate !== undefined) {
    const due = parseReminderDue({
      dueDate: source.dueDate,
      dueTime: source.dueTime,
    });
    update.dueAt = due.dueAt;
    update.hasTime = due.hasTime;
  } else if (source.dueTime !== undefined && source.dueTime !== null && source.dueTime !== "") {
    throw new ReminderError("Choose a due date when setting a due time");
  }

  if (source.roadmapTaskId !== undefined) {
    update.roadmapTaskId = normalizeLinkId(source.roadmapTaskId, "Roadmap task") ?? null;
  }
  if (source.savedResourceId !== undefined) {
    update.savedResourceId = normalizeLinkId(source.savedResourceId, "Saved resource") ?? null;
  }
  if (source.completed !== undefined) {
    if (typeof source.completed !== "boolean") {
      throw new ReminderError("Completed must be true or false");
    }
    update.completed = source.completed;
  }

  if (Object.keys(update).length === 0) {
    throw new ReminderError("Provide a field to update");
  }
  return update;
}

export async function updateReminder(
  userId: string,
  reminderId: string,
  input: ReminderUpdateInput
): Promise<ReminderView | null> {
  const [existing] = await db
    .select()
    .from(reminders)
    .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)))
    .limit(1);
  if (!existing) return null;

  await Promise.all([
    ensureLinkedTask(userId, input.roadmapTaskId),
    ensureLinkedResource(userId, input.savedResourceId),
  ]);

  const updates: Partial<typeof reminders.$inferInsert> = { updatedAt: new Date() };
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.dueAt !== undefined) {
    updates.dueAt = input.dueAt;
    updates.hasTime = input.hasTime ?? false;
  }
  if (input.roadmapTaskId !== undefined) updates.roadmapTaskId = input.roadmapTaskId;
  if (input.savedResourceId !== undefined) updates.savedResourceId = input.savedResourceId;
  if (input.completed !== undefined) {
    updates.completedAt = input.completed ? new Date() : null;
  }

  const [row] = await db
    .update(reminders)
    .set(updates)
    .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)))
    .returning();

  return row ? toView(row) : null;
}

export async function deleteReminder(
  userId: string,
  reminderId: string
): Promise<boolean> {
  const removed = await db
    .delete(reminders)
    .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)))
    .returning({ id: reminders.id });
  return removed.length > 0;
}

/**
 * Creates at most one notification per reminder. The existing partial unique
 * index on (recipient, type, dedupe_key) makes repeated calls idempotent.
 */
export async function syncReminderNotifications(
  userId: string
): Promise<{ created: number }> {
  const now = new Date();
  const due = await db
    .select({ id: reminders.id, title: reminders.title, dueAt: reminders.dueAt })
    .from(reminders)
    .where(
      and(
        eq(reminders.userId, userId),
        isNull(reminders.completedAt),
        lte(reminders.dueAt, now)
      )
    )
    .orderBy(asc(reminders.dueAt))
    .limit(50);

  if (due.length === 0) return { created: 0 };

  const inserted = await db
    .insert(notifications)
    .values(
      due.map((reminder) => ({
        recipientUserId: userId,
        type: "reminder_due" as const,
        body: `Overdue reminder: ${reminder.title}`,
        reminderId: reminder.id,
        dedupeKey: `reminder:${reminder.id}`,
      }))
    )
    .onConflictDoNothing()
    .returning({ id: notifications.id });

  return { created: inserted.length };
}

export async function countOpenReminders(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reminders)
    .where(and(eq(reminders.userId, userId), isNull(reminders.completedAt)));
  return Number(row?.count ?? 0);
}
