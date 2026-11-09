import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { getOwnedStartup, loadRoadmap } from "@/features/roadmap";
import { getStageTemplate } from "@/features/roadmap/stages";
import { getTaskReminderMap } from "@/features/reminders";
import { RoadmapClient } from "@/components/knowledge-hub/roadmap/RoadmapClient";

export const metadata: Metadata = {
  title: "Founder roadmap",
  description: "Stage-specific founder tasks, milestones and real progress.",
};

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/knowledge-hub/roadmap");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "startup") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <header>
          <p className="vx-label">Founder tools</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Roadmap</h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[var(--text-secondary)]">
            Roadmaps belong to startup accounts. Your current account keeps its existing dashboard
            and workflows.
          </p>
        </header>
        <div className="vx-card p-5">
          <p className="text-sm font-medium">This account is not a founder account</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
            Return to your dashboard to continue with investor or administrator work.
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text)]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const startup = await getOwnedStartup(session.user.id);
  if (!startup) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <header>
          <p className="vx-label">Founder tools</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Roadmap</h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[var(--text-secondary)]">
            Your roadmap needs a startup profile for its stage and ownership.
          </p>
        </header>
        <div className="vx-card p-5">
          <p className="text-sm font-medium">Create your startup profile first</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
            The roadmap uses the stage saved on that profile. No tasks are created until you build
            the roadmap yourself.
          </p>
          <Link
            href="/onboarding/startup"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-fill)] px-3 py-1.5 text-[11px] font-medium text-[var(--accent-foreground)]"
          >
            Create startup profile
          </Link>
        </div>
      </div>
    );
  }

  const overview = await loadRoadmap(session.user.id, startup.id, startup.stage);
  const templateKeys = new Set(getStageTemplate(startup.stage).map((task) => task.taskKey));
  const existingKeys = new Set(overview.tasks.map((task) => task.taskKey));
  const missingTemplateCount = [...templateKeys].filter((key) => !existingKeys.has(key)).length;
  const taskReminders = await getTaskReminderMap(
    session.user.id,
    overview.tasks.map((task) => task.id)
  );

  return (
    <div className="mx-auto w-full max-w-3xl pb-24 md:pb-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link
          href="/knowledge-hub/for-you"
          className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          ← For You
        </Link>
        <Link
          href="/knowledge-hub/for-you/profile"
          className="text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          Founder profile
        </Link>
      </div>
      <RoadmapClient
        overview={overview}
        missingTemplateCount={missingTemplateCount}
        taskReminders={taskReminders}
      />
    </div>
  );
}
