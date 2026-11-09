import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { auth } from "@/features/auth";
import { db } from "@/db";
import {
  startupImpactClaims,
  startups,
  users,
  IMPACT_CLAIM_STATUSES,
  type ImpactClaimStatus,
} from "@/db/schema";
import { PageHeader, Section, StatCard, EmptyState } from "@/components/ui";
import { SdgChips } from "@/components/sdg/SdgChips";
import { ImpactReviewControls } from "@/components/sdg/ImpactReviewControls";
import {
  effectiveImpactStatus,
  successFeeEligibility,
} from "@/features/sdg/verification";
import {
  IMPACT_STATUS_LABELS,
  impactStatusTone,
  type ImpactStatus,
} from "@/features/sdg/status";
import { ExternalLink } from "lucide-react";
// Icons passed as props to client components must cross a client boundary.
import { ShieldCheck, Clock, CheckCircle2, XCircle } from "@/components/pitch-deck/icons";

export const metadata = { title: "Impact verification" };

const TONE_CLASS: Record<string, string> = {
  green: "text-[var(--green)] border-[var(--green)]/40 bg-[var(--green-muted)]",
  accent: "text-[var(--accent)] border-[var(--accent)]/40 bg-[var(--accent-muted)]",
  amber: "text-[var(--amber)] border-[var(--amber)]/40 bg-[var(--amber-muted)]",
  red: "text-[var(--red)] border-[var(--red)]/40 bg-[var(--red-muted)]",
  default: "text-[var(--text-muted)] border-[var(--border)] bg-[var(--bg-elevated)]/40",
};

const FILTERS = [
  { value: "pending", label: "Pending review" },
  { value: "changes_requested", label: "More info requested" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All submissions" },
] as const;

export default async function AdminImpactPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/impact");
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") redirect("/dashboard");

  const { status: statusParam } = await searchParams;
  const filter = FILTERS.some((entry) => entry.value === statusParam)
    ? statusParam!
    : "pending";

  const counts = await db
    .select({ status: startupImpactClaims.status, count: sql<number>`count(*)` })
    .from(startupImpactClaims)
    .groupBy(startupImpactClaims.status);
  const byStatus = Object.fromEntries(
    counts.map((row) => [row.status, Number(row.count)])
  ) as Record<string, number>;
  const total = counts.reduce((sum, row) => sum + Number(row.count), 0);

  const rows = await db
    .select({
      claim: startupImpactClaims,
      startup: startups,
      reviewerEmail: users.email,
    })
    .from(startupImpactClaims)
    .innerJoin(startups, eq(startups.id, startupImpactClaims.startupId))
    .leftJoin(users, eq(users.id, startupImpactClaims.reviewedByUserId))
    .where(
      filter === "all"
        ? undefined
        : eq(startupImpactClaims.status, filter as ImpactClaimStatus)
    )
    .orderBy(desc(startupImpactClaims.submittedAt))
    .limit(100);

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Impact verification"
        subtitle="Review the SDG alignment and impact claims startups have submitted. Verification is the only way a profile earns a verified-impact badge or 0% success-fee eligibility."
        action={
          <Link
            href="/admin"
            className="px-4 py-2 text-xs border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
          >
            Back to admin
          </Link>
        }
      />

      <Section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Clock} label="Pending review" value={byStatus.pending ?? 0} />
          <StatCard icon={ShieldCheck} label="Awaiting info" value={byStatus.changes_requested ?? 0} delay={0.05} />
          <StatCard icon={CheckCircle2} label="Verified" value={byStatus.verified ?? 0} delay={0.1} />
          <StatCard icon={XCircle} label="Rejected" value={byStatus.rejected ?? 0} delay={0.15} />
        </div>
      </Section>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {FILTERS.map((entry) => {
          const active = filter === entry.value;
          const count =
            entry.value === "all" ? total : (byStatus[entry.value] ?? 0);
          return (
            <Link
              key={entry.value}
              href={entry.value === "pending" ? "/admin/impact" : `/admin/impact?status=${entry.value}`}
              aria-current={active ? "page" : undefined}
              className={`px-3 py-1.5 text-[11px] rounded-md border transition-colors ${
                active
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-muted)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {entry.label}
              <span className="ml-1.5 tabular-nums opacity-70">{count}</span>
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nothing to review here"
          description="Impact claims appear in this queue after a startup requests verification from its profile settings."
        />
      ) : (
        <div className="space-y-3">
          {rows.map(({ claim, startup, reviewerEmail }) => {
            const effective = effectiveImpactStatus(startup, claim) as ImpactStatus;
            const tone = impactStatusTone(effective);
            const fee = successFeeEligibility(startup, claim);
            const stale =
              claim.status === "verified" && effective === "stale";

            return (
              <Section key={claim.id} delay={0.02}>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/explore/${startup.slug}`}
                          className="text-sm font-medium hover:text-[var(--accent)] transition-colors"
                        >
                          {startup.name}
                        </Link>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] ${TONE_CLASS[tone]}`}
                        >
                          {IMPACT_STATUS_LABELS[effective]}
                        </span>
                        {stale && (
                          <span className="text-[10px] text-[var(--amber)]">
                            claim changed after review
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        {startup.sector} · {startup.stage}
                        {startup.location ? ` · ${startup.location}` : ""} · submitted{" "}
                        {claim.submittedAt.toLocaleDateString()}
                        {claim.reviewedAt
                          ? ` · reviewed ${claim.reviewedAt.toLocaleDateString()}`
                          : ""}
                        {reviewerEmail ? ` by ${reviewerEmail}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[var(--text-muted)]">Success fee</p>
                      <p
                        className={`text-sm font-semibold tabular-nums ${
                          fee.eligible ? "text-[var(--green)]" : "text-[var(--text-secondary)]"
                        }`}
                      >
                        {fee.label}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <SdgChips goals={claim.sdgGoals} primary={claim.sdgPrimary} />
                  </div>

                  <p className="mt-3 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                    {claim.impactDescription}
                  </p>

                  {claim.reviewNote && (
                    <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-2 text-[10px] text-[var(--text-secondary)]">
                      <span className="text-[var(--text-muted)]">Reviewer note: </span>
                      {claim.reviewNote}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/explore/${startup.slug}`}
                      className="inline-flex items-center gap-1 text-[10px] text-[var(--accent)] hover:underline"
                    >
                      View startup profile <ExternalLink size={9} />
                    </Link>
                    {fee.eligible ? (
                      <span className="text-[10px] text-[var(--green)]">
                        0% success fee eligible under the verified-impact policy
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--text-muted)]">
                        Standard 3% success fee applies
                      </span>
                    )}
                  </div>

                  <ImpactReviewControls claimId={claim.id} currentStatus={claim.status} />
                </div>
              </Section>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-[10px] text-[var(--text-muted)] max-w-2xl">
        Only {IMPACT_CLAIM_STATUSES.join(", ")} are stored review states. A profile
        with no claim is treated as not submitted — never as verified.
      </p>
    </div>
  );
}
