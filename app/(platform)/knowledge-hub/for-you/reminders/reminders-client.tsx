"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarClock,
  Check,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import type {
  ReminderResourceOption,
  ReminderTaskOption,
  ReminderView,
} from "@/features/reminders/types";

type Values = {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  roadmapTaskId: string;
  savedResourceId: string;
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

function sameUtcDay(left: Date, right: Date) {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

function dueLabel(reminder: ReminderView): string {
  const due = new Date(reminder.dueAt);
  return `${DATE_FORMAT.format(due)} · ${
    reminder.hasTime ? `${TIME_FORMAT.format(due)} UTC` : "all day UTC"
  }`;
}

function valuesFor(reminder: ReminderView): Values {
  return {
    title: reminder.title,
    description: reminder.description ?? "",
    dueDate: reminder.dueAt.slice(0, 10),
    dueTime: reminder.hasTime ? reminder.dueAt.slice(11, 16) : "",
    roadmapTaskId: reminder.roadmapTaskId ?? "",
    savedResourceId: reminder.savedResourceId ?? "",
  };
}

export function RemindersClient({
  reminders,
  tasks,
  resources,
  initialTaskId,
}: {
  reminders: ReminderView[];
  tasks: ReminderTaskOption[];
  resources: ReminderResourceOption[];
  initialTaskId: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showCreate, setShowCreate] = useState(Boolean(initialTaskId));
  const [createVersion, setCreateVersion] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialTask = tasks.find((task) => task.id === initialTaskId);
  const now = new Date();
  const open = reminders.filter((reminder) => !reminder.completedAt);
  const overdue = open.filter(
    (reminder) => new Date(reminder.dueAt).getTime() < now.getTime()
  );
  const dueToday = open.filter((reminder) => {
    const due = new Date(reminder.dueAt);
    return due.getTime() >= now.getTime() && sameUtcDay(due, now);
  });
  const upcoming = open.filter((reminder) => {
    const due = new Date(reminder.dueAt);
    return due.getTime() >= now.getTime() && !sameUtcDay(due, now);
  });
  const completed = reminders.filter((reminder) => reminder.completedAt);

  async function request(
    key: string,
    url: string,
    method: "POST" | "PATCH" | "DELETE",
    body?: unknown
  ): Promise<boolean> {
    setBusy(key);
    setError("");
    setNotice("");
    try {
      const response = await fetch(url, {
        method,
        headers: body === undefined ? undefined : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "That change could not be saved.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Network error. Nothing was changed.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function create(values: Values) {
    const ok = await request("create", "/api/reminders", "POST", values);
    if (ok) {
      setNotice("Reminder created.");
      setShowCreate(false);
      setCreateVersion((version) => version + 1);
    }
    return ok;
  }

  async function update(id: string, values: Values) {
    const ok = await request(`edit:${id}`, `/api/reminders/${id}`, "PATCH", values);
    if (ok) {
      setNotice("Reminder updated.");
      setEditingId(null);
    }
    return ok;
  }

  async function setCompleted(reminder: ReminderView, completed: boolean) {
    const ok = await request(
      `complete:${reminder.id}`,
      `/api/reminders/${reminder.id}`,
      "PATCH",
      { completed }
    );
    if (ok) setNotice(completed ? "Reminder completed." : "Reminder reopened.");
  }

  async function remove(reminder: ReminderView) {
    const ok = await request(
      `delete:${reminder.id}`,
      `/api/reminders/${reminder.id}`,
      "DELETE"
    );
    if (ok) setNotice("Reminder deleted.");
  }

  if (reminders.length === 0 && !showCreate) {
    return (
      <section className="vx-card p-6 text-center">
        <CalendarClock size={20} className="mx-auto text-[var(--text-muted)]" aria-hidden="true" />
        <h2 className="mt-2 text-sm font-medium">No reminders yet</h2>
        <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-[var(--text-muted)]">
          Create a reminder for a follow-up, or add one from a roadmap task. Due dates are stored
          in UTC.
        </p>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-fill)] px-3 py-1.5 text-[11px] font-medium text-[var(--accent-foreground)]"
        >
          <Plus size={11} aria-hidden="true" />
          Create reminder
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {(error || notice) && (
        <div
          role={error ? "alert" : "status"}
          className={`vx-card px-4 py-3 text-[11px] ${
            error ? "text-[var(--red)]" : "text-[var(--green)]"
          }`}
        >
          {error || notice}
        </div>
      )}

      <section aria-labelledby="reminder-counts" className="vx-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="vx-label">Reminders</p>
            <h2 id="reminder-counts" className="mt-1 text-sm font-semibold tracking-tight">
              {open.length} open · {completed.length} completed
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate((visible) => !visible)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text)]"
          >
            <Plus size={11} aria-hidden="true" />
            New reminder
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <CountChip label="Overdue" count={overdue.length} tone="red" />
          <CountChip label="Due today" count={dueToday.length} tone="accent" />
          <CountChip label="Upcoming" count={upcoming.length} tone="neutral" />
          <CountChip label="Completed" count={completed.length} tone="green" />
        </div>
      </section>

      {showCreate && (
        <section className="vx-card p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="vx-label">New reminder</p>
              <h2 className="mt-1 text-sm font-semibold tracking-tight">What should VultureX remind you about?</h2>
            </div>
            {reminders.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                Cancel
              </button>
            )}
          </div>
          <ReminderEditor
            key={`create-${createVersion}`}
            initial={{
              title: initialTask?.title ?? "",
              description: "",
              dueDate: "",
              dueTime: "",
              roadmapTaskId: initialTask?.id ?? "",
              savedResourceId: "",
            }}
            tasks={tasks}
            resources={resources}
            submitLabel="Create reminder"
            busy={busy === "create"}
            onSubmit={create}
          />
        </section>
      )}

      <ReminderSection title="Overdue" description="Past their due time and not completed." items={overdue} tone="red">
        {(reminder) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            nowMs={now.getTime()}
            tasks={tasks}
            resources={resources}
            busy={busy}
            editing={editingId === reminder.id}
            onEdit={() => setEditingId(reminder.id)}
            onCancelEdit={() => setEditingId(null)}
            onUpdate={(values) => update(reminder.id, values)}
            onCompleted={(value) => setCompleted(reminder, value)}
            onDelete={() => remove(reminder)}
          />
        )}
      </ReminderSection>

      <ReminderSection title="Due today" description="Due later today in UTC." items={dueToday} tone="accent">
        {(reminder) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            nowMs={now.getTime()}
            tasks={tasks}
            resources={resources}
            busy={busy}
            editing={editingId === reminder.id}
            onEdit={() => setEditingId(reminder.id)}
            onCancelEdit={() => setEditingId(null)}
            onUpdate={(values) => update(reminder.id, values)}
            onCompleted={(value) => setCompleted(reminder, value)}
            onDelete={() => remove(reminder)}
          />
        )}
      </ReminderSection>

      <ReminderSection title="Upcoming" description="Scheduled for a later day." items={upcoming} tone="neutral">
        {(reminder) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            nowMs={now.getTime()}
            tasks={tasks}
            resources={resources}
            busy={busy}
            editing={editingId === reminder.id}
            onEdit={() => setEditingId(reminder.id)}
            onCancelEdit={() => setEditingId(null)}
            onUpdate={(values) => update(reminder.id, values)}
            onCompleted={(value) => setCompleted(reminder, value)}
            onDelete={() => remove(reminder)}
          />
        )}
      </ReminderSection>

      <ReminderSection title="Completed" description="Finished reminders. Task status is separate." items={completed} tone="green">
        {(reminder) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            nowMs={now.getTime()}
            tasks={tasks}
            resources={resources}
            busy={busy}
            editing={editingId === reminder.id}
            onEdit={() => setEditingId(reminder.id)}
            onCancelEdit={() => setEditingId(null)}
            onUpdate={(values) => update(reminder.id, values)}
            onCompleted={(value) => setCompleted(reminder, value)}
            onDelete={() => remove(reminder)}
          />
        )}
      </ReminderSection>
    </div>
  );
}

function CountChip({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "red" | "accent" | "neutral" | "green";
}) {
  const classes =
    tone === "red"
      ? "border-[var(--red)]/30 bg-[var(--red-muted)] text-[var(--red)]"
      : tone === "accent"
        ? "border-[var(--accent)]/25 bg-[var(--accent-muted)] text-[var(--accent)]"
        : tone === "green"
          ? "border-[var(--green)]/30 bg-[var(--green)]/10 text-[var(--green)]"
          : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]";
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] ${classes}`}>
      {label} · {count}
    </span>
  );
}

function ReminderSection({
  title,
  description,
  items,
  tone,
  children,
}: {
  title: string;
  description: string;
  items: ReminderView[];
  tone: "red" | "accent" | "neutral" | "green";
  children: (reminder: ReminderView) => React.ReactNode;
}) {
  return (
    <section aria-labelledby={`reminders-${title.replace(/\s+/g, "-").toLowerCase()}`} className="vx-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2
            id={`reminders-${title.replace(/\s+/g, "-").toLowerCase()}`}
            className={`text-sm font-semibold tracking-tight ${
              tone === "red" ? "text-[var(--red)]" : ""
            }`}
          >
            {title}
          </h2>
          <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{description}</p>
        </div>
        <span className="vx-label">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="vx-inset mt-3 p-3 text-[11px] text-[var(--text-muted)]">
          Nothing in this group.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">{items.map((reminder) => children(reminder))}</ul>
      )}
    </section>
  );
}

function ReminderCard({
  reminder,
  nowMs,
  tasks,
  resources,
  busy,
  editing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onCompleted,
  onDelete,
}: {
  reminder: ReminderView;
  nowMs: number;
  tasks: ReminderTaskOption[];
  resources: ReminderResourceOption[];
  busy: string | null;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (values: Values) => Promise<boolean>;
  onCompleted: (completed: boolean) => void;
  onDelete: () => void;
}) {
  const task = tasks.find((entry) => entry.id === reminder.roadmapTaskId);
  const resource = resources.find((entry) => entry.id === reminder.savedResourceId);
  const isCompleted = Boolean(reminder.completedAt);
  const isOverdue = !isCompleted && new Date(reminder.dueAt).getTime() < nowMs;

  if (editing) {
    return (
      <li className="vx-inset p-3">
        <ReminderEditor
          initial={valuesFor(reminder)}
          tasks={tasks}
          resources={resources}
          submitLabel="Save changes"
          busy={busy === `edit:${reminder.id}`}
          onSubmit={onUpdate}
          onCancel={onCancelEdit}
        />
      </li>
    );
  }

  return (
    <li
      id={`reminder-${reminder.id}`}
      className={`vx-inset p-3 ${isOverdue ? "border-[var(--red)]/40" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded border px-1.5 py-0.5 text-[9px] font-medium ${
                isCompleted
                  ? "border-[var(--green)]/30 bg-[var(--green)]/10 text-[var(--green)]"
                  : isOverdue
                    ? "border-[var(--red)]/30 bg-[var(--red-muted)] text-[var(--red)]"
                    : "border-[var(--accent)]/25 bg-[var(--accent-muted)] text-[var(--accent)]"
              }`}
            >
              {isCompleted ? "Completed" : isOverdue ? "Overdue" : "Open"}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">{dueLabel(reminder)}</span>
          </div>
          <h3
            className={`mt-1 text-xs font-medium ${
              isCompleted ? "line-through opacity-70" : ""
            }`}
          >
            {reminder.title}
          </h3>
          {reminder.description && (
            <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-[var(--text-secondary)]">
              {reminder.description}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-[var(--text-muted)]">
            {task && (
              <Link
                href={`/knowledge-hub/roadmap#task-${task.id}`}
                className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
              >
                Task: {task.title}
                <ArrowRight size={9} aria-hidden="true" />
              </Link>
            )}
            {resource && (
              <Link
                href="/knowledge-hub/for-you/saved"
                className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
              >
                Resource: {resource.title}
              </Link>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-secondary)]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onCompleted(!isCompleted)}
            disabled={Boolean(busy)}
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-medium disabled:opacity-50 ${
              isCompleted
                ? "border-[var(--border)] text-[var(--text-secondary)]"
                : "border-[var(--green)]/40 text-[var(--green)]"
            }`}
          >
            {busy === `complete:${reminder.id}` ? (
              <Loader2 size={10} className="animate-spin" />
            ) : isCompleted ? (
              <RotateCcw size={10} aria-hidden="true" />
            ) : (
              <Check size={10} aria-hidden="true" />
            )}
            {isCompleted ? "Reopen" : "Complete"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={Boolean(busy)}
            aria-label={`Delete ${reminder.title}`}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--red-muted)] hover:text-[var(--red)] disabled:opacity-50"
          >
            {busy === `delete:${reminder.id}` ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Trash2 size={11} />
            )}
          </button>
        </div>
      </div>
    </li>
  );
}

function ReminderEditor({
  initial,
  tasks,
  resources,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
}: {
  initial: Values;
  tasks: ReminderTaskOption[];
  resources: ReminderResourceOption[];
  submitLabel: string;
  busy: boolean;
  onSubmit: (values: Values) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.title.trim()) {
      setError("Give the reminder a title.");
      return;
    }
    if (!values.dueDate) {
      setError("Choose a due date.");
      return;
    }
    setError("");
    await onSubmit(values);
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-2">
      <label className="block">
        <span className="vx-label">Title</span>
        <input
          required
          maxLength={160}
          value={values.title}
          onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
          className="mt-1 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-2.5 py-1.5 text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="vx-label">Description (optional)</span>
        <textarea
          rows={2}
          maxLength={1000}
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({ ...current, description: event.target.value }))
          }
          className="mt-1 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-2.5 py-1.5 text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="vx-label">Due date (UTC)</span>
          <input
            required
            type="date"
            value={values.dueDate}
            onChange={(event) =>
              setValues((current) => ({ ...current, dueDate: event.target.value }))
            }
            className="mt-1 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-2.5 py-1.5 text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="vx-label">Due time (optional, UTC)</span>
          <input
            type="time"
            value={values.dueTime}
            onChange={(event) =>
              setValues((current) => ({ ...current, dueTime: event.target.value }))
            }
            className="mt-1 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-2.5 py-1.5 text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          />
        </label>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="vx-label">Link a roadmap task (optional)</span>
          <select
            value={values.roadmapTaskId}
            onChange={(event) =>
              setValues((current) => ({ ...current, roadmapTaskId: event.target.value }))
            }
            className="mt-1 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-2.5 py-1.5 text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="">No task</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="vx-label">Link a saved resource (optional)</span>
          <select
            value={values.savedResourceId}
            onChange={(event) =>
              setValues((current) => ({ ...current, savedResourceId: event.target.value }))
            }
            className="mt-1 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-2.5 py-1.5 text-[11px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="">No resource</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="text-[10px] text-[var(--red)]">
          {error}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-fill)] px-3 py-1.5 text-[11px] font-medium text-[var(--accent-foreground)] disabled:opacity-50"
        >
          {busy && <Loader2 size={11} className="animate-spin" />}
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[11px] text-[var(--text-secondary)]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
