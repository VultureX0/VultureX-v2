import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { pitchDeckRequests, users, startups, startupImpactClaims, PITCH_DECK_STATUSES } from "@/db/schema";
import { getActor } from "@/features/pitch-deck";
import { PageHeader, Section, StatCard } from "@/components/ui";
// Icons flow into Client Components as props → import them from the client
// boundary, not directly from lucide-react (see that module's note).
import { Presentation, Clock, CheckCircle2, Hammer, Users } from "@/components/pitch-deck/icons";
import { Trophy, ShieldCheck } from "lucide-react";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const actor = await getActor();
  if (!actor) redirect("/login?callbackUrl=/admin");
  if (actor.role !== "admin") redirect("/dashboard");

  const counts = await db
    .select({
      status: pitchDeckRequests.status,
      count: sql<number>`count(*)`,
    })
    .from(pitchDeckRequests)
    .groupBy(pitchDeckRequests.status);

  const byStatus = Object.fromEntries(counts.map((c) => [c.status, Number(c.count)])) as Record<
    string,
    number
  >;

  const [startupCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(startups);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [adminCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "admin"));
  const [pendingImpact] = await db
    .select({ count: sql<number>`count(*)` })
    .from(startupImpactClaims)
    .where(eq(startupImpactClaims.status, "pending"));

  const total = PITCH_DECK_STATUSES.reduce((sum, s) => sum + (byStatus[s] ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Admin"
        subtitle={`Signed in as ${actor.email ?? "admin"}`}
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/admin/impact"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
            >
              <ShieldCheck size={12} /> Impact verification
              {Number(pendingImpact.count) > 0 && (
                <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--accent-fill)] text-[var(--accent-foreground)] text-[9px] font-bold flex items-center justify-center tabular-nums">
                  {Number(pendingImpact.count)}
                </span>
              )}
            </Link>
            <Link
              href="/admin/competitions"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
            >
              <Trophy size={12} /> Competition review
            </Link>
            <Link
              href="/admin/pitch-decks"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors"
            >
              <Presentation size={12} /> Pitch Deck Requests
            </Link>
          </div>
        }
      />

      <Section>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <StatCard icon={Presentation} label="Total requests" value={total} />
          <StatCard icon={Clock} label="Awaiting approval" value={byStatus.pending_approval ?? 0} delay={0.05} />
          <StatCard icon={CheckCircle2} label="Approved" value={byStatus.approved ?? 0} delay={0.1} />
          <StatCard icon={Hammer} label="In progress" value={byStatus.in_progress ?? 0} delay={0.15} />
          <StatCard icon={CheckCircle2} label="Completed" value={byStatus.completed ?? 0} delay={0.2} />
        </div>
      </Section>

      <Section delay={0.1}>
        <div className="rounded-xl border border-[var(--border)] p-5">
          <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center gap-2">
            <Presentation size={12} /> Pitch Deck Requests
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mb-4 max-w-xl">
            Review approved summaries, upload the prepared deck, and publish it to the right startup.
            Only requests with a founder-approved summary are available for deck preparation.
          </p>
          <Link
            href="/admin/pitch-decks"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
          >
            Open the request queue →
          </Link>
        </div>
      </Section>

      <Section delay={0.15}>
        <div className="rounded-xl border border-[var(--border)] p-5 mt-4">
          <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center gap-2">
            <Users size={12} /> Platform
          </h2>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-lg font-semibold tabular-nums">{Number(userCount.count)}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Accounts</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">{Number(startupCount.count)}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Startup profiles</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">{Number(adminCount.count)}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Admins (provisioned via CLI)</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
