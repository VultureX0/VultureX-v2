import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import {
  getReminderFormOptions,
  listReminders,
  syncReminderNotifications,
} from "@/features/reminders";
import { isUuid } from "@/lib/utils";
import { RemindersClient } from "./reminders-client";

export const metadata: Metadata = {
  title: "Reminders",
  description: "In-app reminders linked to roadmap tasks and saved resources.",
};

export const dynamic = "force-dynamic";

export default async function RemindersPage({
  searchParams,
}: {
  searchParams: Promise<{ taskId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/knowledge-hub/for-you/reminders");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "startup") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <header>
          <p className="vx-label">Founder workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Reminders</h1>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
            In-app reminders belong to startup accounts. Your current account keeps its existing
            dashboard.
          </p>
          <Link href="/dashboard" className="mt-3 inline-flex text-[11px] font-medium text-[var(--accent)]">
            Back to dashboard
          </Link>
        </header>
      </div>
    );
  }

  const userId = session.user.id;
  await syncReminderNotifications(userId).catch((error) => {
    console.error("Failed to sync reminder notifications:", error);
  });

  const params = await searchParams;
  const [reminders, options] = await Promise.all([
    listReminders(userId),
    getReminderFormOptions(userId),
  ]);
  const initialTaskId =
    isUuid(params.taskId) && options.tasks.some((task) => task.id === params.taskId)
      ? params.taskId
      : null;

  return (
    <div className="mx-auto w-full max-w-3xl pb-24 md:pb-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/knowledge-hub/for-you"
          className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          ← For You
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/knowledge-hub/for-you/saved"
            className="text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
          >
            Saved resources
          </Link>
          <Link
            href="/knowledge-hub/roadmap"
            className="text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
          >
            Roadmap
          </Link>
        </div>
      </div>

      <header className="mb-4">
        <p className="vx-label">Founder workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Reminders</h1>
        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[var(--text-secondary)]">
          Keep follow-ups separate from task status. Completing a reminder never completes the
          linked roadmap task. Due and overdue reminders create one in-app notification in the bell.
        </p>
      </header>

      <RemindersClient
        reminders={reminders}
        tasks={options.tasks}
        resources={options.resources}
        initialTaskId={initialTaskId}
      />
    </div>
  );
}
