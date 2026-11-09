import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/features/auth";
import { db } from "@/db";
import { startups } from "@/db/schema";
import { getFounderProfile } from "@/features/founder-profile";
import { FounderProfileForm } from "@/components/knowledge-hub/founder/FounderProfileForm";
import { buildProfileFormValues } from "@/components/knowledge-hub/founder/profile-values";

export const metadata: Metadata = {
  title: "Personalise your founder workspace",
  description: "Tell VultureX what you are working on so For You matches your stage.",
};

export const dynamic = "force-dynamic";

export default async function FounderOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/onboarding/founder");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "startup") {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Founder onboarding</h1>
        <div className="vx-card p-5">
          <p className="text-sm font-medium">Founder onboarding is for startup accounts</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
            Your account keeps its existing dashboard and settings.
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

  const [profile, startupRows] = await Promise.all([
    getFounderProfile(session.user.id),
    db.select().from(startups).where(eq(startups.userId, session.user.id)).limit(1),
  ]);
  const startup = startupRows[0] ?? null;
  const initial = buildProfileFormValues(profile, startup?.location ?? null);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <header>
        <p className="vx-label">Welcome to VultureX</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
          Personalise your founder workspace
        </h1>
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
          Three short, optional steps. Each step is saved before you continue, so an interrupted
          session does not lose your answers. You can skip and complete this later from For You.
        </p>
      </header>

      <FounderProfileForm
        initial={initial}
        startup={
          startup
            ? {
                name: startup.name,
                stage: startup.stage,
                sector: startup.sector,
                location: startup.location,
              }
            : null
        }
        mode="onboarding"
      />
    </div>
  );
}
