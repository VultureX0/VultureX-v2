import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { listSavedResources } from "@/features/saved-resources";
import { SavedResourcesClient } from "./saved-resources-client";

export const metadata: Metadata = {
  title: "Saved resources",
  description: "Knowledge Hub guides, playbooks and tools saved for later.",
};

export const dynamic = "force-dynamic";

export default async function SavedResourcesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/knowledge-hub/for-you/saved");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "startup") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <header>
          <p className="vx-label">Founder workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Saved resources</h1>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
            Saved Knowledge Hub resources belong to startup accounts. Your existing investor saved
            startups remain at <Link href="/saved" className="text-[var(--accent)]">Saved Startups</Link>.
          </p>
        </header>
      </div>
    );
  }

  const resources = await listSavedResources(session.user.id);

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
            href="/knowledge-hub/for-you/reminders"
            className="text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
          >
            My reminders
          </Link>
          <Link
            href="/knowledge-hub"
            className="text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
          >
            Knowledge Hub
          </Link>
        </div>
      </div>

      <header className="mb-4">
        <p className="vx-label">Founder workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Saved resources</h1>
        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[var(--text-secondary)]">
          Guides, industry playbooks and tools you saved from the Knowledge Hub. Everything here
          is stored against your account and opens the original hub section.
        </p>
      </header>

      <SavedResourcesClient initialResources={resources} />
    </div>
  );
}
