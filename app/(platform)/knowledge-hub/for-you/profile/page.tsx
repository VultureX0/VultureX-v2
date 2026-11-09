import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/features/auth";
import { db } from "@/db";
import { startups } from "@/db/schema";
import { getFounderProfile } from "@/features/founder-profile";
import { Breadcrumbs } from "@/components/knowledge-hub/Breadcrumbs";
import { FounderProfileForm } from "@/components/knowledge-hub/founder/FounderProfileForm";
import { buildProfileFormValues } from "@/components/knowledge-hub/founder/profile-values";

export const metadata: Metadata = {
  title: "Founder profile",
  description: "Manage the preferences that personalise your VultureX founder workspace.",
};

export const dynamic = "force-dynamic";

export default async function FounderProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/knowledge-hub/for-you/profile");
  }

  const role = (session.user as { role?: string }).role;
  const userId = session.user.id;

  if (role !== "startup") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <Breadcrumbs
          items={[
            { label: "Knowledge Hub", href: "/knowledge-hub" },
            { label: "For You", href: "/knowledge-hub/for-you" },
            { label: "Founder profile" },
          ]}
        />
        <header>
          <p className="vx-label">Personalisation</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Founder profile</h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[var(--text-secondary)]">
            Founder preferences belong to startup accounts. Your current account keeps its existing
            settings.
          </p>
        </header>
        <div className="vx-card p-5">
          <p className="text-sm font-medium">This account is not a founder account</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
            You can manage your investor or administrator details in the existing settings page.
          </p>
          <Link
            href="/settings"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text)]"
          >
            Open settings
          </Link>
        </div>
      </div>
    );
  }

  const [profile, startupRows] = await Promise.all([
    getFounderProfile(userId),
    db.select().from(startups).where(eq(startups.userId, userId)).limit(1),
  ]);
  const startup = startupRows[0] ?? null;

  const initial = buildProfileFormValues(profile, startup?.location ?? null);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <Breadcrumbs
        items={[
          { label: "Knowledge Hub", href: "/knowledge-hub" },
          { label: "For You", href: "/knowledge-hub/for-you" },
          { label: "Founder profile" },
        ]}
      />

      <header>
        <p className="vx-label">Personalisation</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Founder profile</h1>
        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[var(--text-secondary)]">
          Your objective, challenges and interests decide which hub sections and actions appear on
          For You. Everything is optional, private to your account, and can be changed or cleared
          later.
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
        mode="profile"
      />
    </div>
  );
}
