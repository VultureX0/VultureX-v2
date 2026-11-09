import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, Sparkles } from "lucide-react";
import { auth } from "@/features/auth";
import { getStartupActor } from "@/features/matchmaking/access";
import { getRecommendationsForStartup } from "@/features/matchmaking";
import { DiscoverClient } from "./discover-client";

export const metadata = { title: "Discover Connections" };

export default async function DiscoverPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/discover");

  const role = (session.user as { role?: string }).role;
  if (role !== "startup") {
    return (
      <div className="max-w-xl">
        <h1 className="text-xl font-semibold mb-1">Discover Connections</h1>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Business matchmaking is available for startup accounts.
        </p>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <Compass size={18} className="text-[var(--text-muted)] mb-3" />
          <p className="text-sm font-medium mb-1">Explore the platform instead</p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
            Investor and admin accounts do not receive startup-to-startup
            recommendations. Use Explore to discover startups directly.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors"
          >
            Browse startups
          </Link>
        </div>
      </div>
    );
  }

  const actor = await getStartupActor();
  if (!actor) {
    return (
      <div className="max-w-md">
        <h1 className="text-xl font-semibold mb-1">Discover Connections</h1>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Find startups that complement your business, meet your needs, or could
          become valuable partners.
        </p>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <Sparkles size={18} className="text-[var(--text-muted)] mb-3" />
          <p className="text-sm font-medium mb-1">Create your startup profile</p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
            Recommendations are generated from your startup profile, so we need
            the profile before we can match you with relevant businesses.
          </p>
          <Link
            href="/onboarding/startup"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors"
          >
            Set up profile
          </Link>
        </div>
      </div>
    );
  }

  const initial = await getRecommendationsForStartup(actor.startup.id, {
    page: 1,
    limit: 12,
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-1">Discover Connections</h1>
        <p className="text-xs text-[var(--text-muted)]">
          Find startups that complement your business, meet your needs, or could
          become valuable partners.
        </p>
      </div>

      <DiscoverClient initial={initial} />

      <p className="text-[10px] text-[var(--text-muted)] mt-6 leading-relaxed">
        Matches are generated from the business details in your profile using
        explainable rules — a relevance signal, not a guarantee of partnership.
        Interest+ requests are handled through the existing VultureX connection
        flow.
      </p>
    </div>
  );
}
