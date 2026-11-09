"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CalendarClock,
  Globe2,
  PlusCircle,
  Trophy,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SDG_GOALS, sdgColor } from "@/features/sdg/taxonomy";
import { PageHeader, Section, EmptyState, Badge } from "@/components/ui";
import { CompetitionCard } from "@/components/competitions/CompetitionCard";
import { StatusChip } from "@/components/competitions/StatusChip";
import { formatDate } from "@/features/competitions/format";
import type {
  CompetitionCard as CompetitionCardData,
  PastWinnerGroup,
} from "@/features/competitions/service";

type Tab = "active" | "upcoming" | "winners" | "host";

const TABS: { key: Tab; label: string; icon: typeof Trophy }[] = [
  { key: "active", label: "Active", icon: Trophy },
  { key: "upcoming", label: "Upcoming", icon: CalendarClock },
  { key: "winners", label: "Past Winners", icon: Award },
  { key: "host", label: "Host a Competition", icon: PlusCircle },
];

type Mine = {
  id: string;
  title: string;
  status: string;
  phase: string;
  applications: number;
  pending: number;
};

function placementLabel(placement: number): string {
  if (placement === 1) return "1st place";
  if (placement === 2) return "2nd place";
  if (placement === 3) return "3rd place";
  return `#${placement}`;
}

export function CompetitionsClient({
  discovery,
  role,
  mine,
  initialTab,
  currentSdg,
}: {
  discovery: {
    active: CompetitionCardData[];
    upcoming: CompetitionCardData[];
    pastWinners: PastWinnerGroup[];
  };
  role: string | null;
  mine: Mine[];
  initialTab?: string;
  currentSdg?: number | null;
}) {
  const router = useRouter();
  const startTab: Tab =
    initialTab === "upcoming" || initialTab === "winners" || initialTab === "host"
      ? initialTab
      : "active";
  const [tab, setTab] = useState<Tab>(startTab);

  const counts = {
    active: discovery.active.length,
    upcoming: discovery.upcoming.length,
    winners: discovery.pastWinners.length,
    host: mine.length,
  };

  return (
    <div>
      <PageHeader
        title="Competitions"
        subtitle="Challenges hosted by VultureX investors — apply with your startup profile and get evaluated."
      />

      <div className="flex items-center gap-1 mb-5 border-b border-[var(--border)] overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-current={tab === key ? "page" : undefined}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === key
                ? "border-[var(--accent)] text-[var(--text)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Icon size={13} />
            {label}
            {counts[key] > 0 && (
              <span className="ml-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--bg-elevated)] text-[9px] flex items-center justify-center tabular-nums">
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Optional SDG focus filter — applies to the published competition lists. */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
          <Globe2 size={11} /> Impact focus
        </span>
        <select
          aria-label="Filter competitions by Sustainable Development Goal"
          value={currentSdg ?? ""}
          onChange={(event) =>
            router.push(
              event.target.value
                ? `/competitions?sdg=${event.target.value}`
                : "/competitions"
            )
          }
          className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-[var(--border-hover)] transition-colors cursor-pointer"
        >
          <option value="">All impact goals</option>
          {SDG_GOALS.map((goal) => (
            <option key={goal.id} value={goal.id}>
              SDG {goal.id} · {goal.shortName}
            </option>
          ))}
        </select>
        {currentSdg && (
          <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sdgColor(currentSdg) }} />
            Filtering by SDG {currentSdg}
            <button
              type="button"
              onClick={() => router.push("/competitions")}
              className="ml-1 px-1.5 py-0.5 rounded border border-[var(--border)] hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Clear
            </button>
          </span>
        )}
      </div>

      {tab === "active" && (
        <Section delay={0.05}>
          {discovery.active.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title={currentSdg ? "No open competitions for this goal" : "No competitions are open right now"}
              description={
                currentSdg
                  ? "No published competition currently lists this SDG focus. Clear the filter to see every open competition."
                  : "Published competitions accepting applications will appear here. Check the Upcoming tab or host one yourself."
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {discovery.active.map((competition, index) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  delay={index * 0.04}
                />
              ))}
            </div>
          )}
        </Section>
      )}

      {tab === "upcoming" && (
        <Section delay={0.05}>
          {discovery.upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="Nothing scheduled yet"
              description="Approved competitions with a future opening date will be listed here. Applications only open on the published date."
            />
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {discovery.upcoming.map((competition, index) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  delay={index * 0.04}
                />
              ))}
            </div>
          )}
        </Section>
      )}

      {tab === "winners" && (
        <Section delay={0.05}>
          {discovery.pastWinners.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No winners announced yet"
              description="Results appear here only after the hosting investor proposes winners and the VultureX team approves the announcement."
            />
          ) : (
            <div className="space-y-3">
              {discovery.pastWinners.map((group, index) => (
                <motion.div
                  key={group.competitionId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy size={14} className="text-[var(--amber)]" />
                        <Link
                          href={`/competitions/${group.competitionId}`}
                          className="text-sm font-semibold hover:text-[var(--accent)] transition-colors"
                        >
                          {group.competitionTitle}
                        </Link>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Hosted by {group.host}
                        {group.completedAt
                          ? ` · completed ${formatDate(group.completedAt)}`
                          : ""}
                      </p>
                    </div>
                    {group.prize && <Badge variant="accent">{group.prize}</Badge>}
                  </div>

                  <div className="space-y-2">
                    {group.winners.map((winner) => (
                      <div
                        key={winner.id}
                        className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2.5"
                      >
                        <span className="w-16 text-[10px] font-semibold text-[var(--amber)]">
                          {placementLabel(winner.placement)}
                        </span>
                        <Link
                          href={`/explore/${winner.startupSlug}`}
                          className="text-xs font-medium hover:text-[var(--accent)] transition-colors"
                        >
                          {winner.startupName}
                        </Link>
                        {winner.awardLabel && (
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {winner.awardLabel}
                          </span>
                        )}
                        {winner.prizeNote && (
                          <span className="text-[10px] text-[var(--text-secondary)] ml-auto">
                            {winner.prizeNote}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Section>
      )}

      {tab === "host" && (
        <Section delay={0.05}>
          {role === "investor" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Host a competition</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl">
                    Propose a challenge for startups on VultureX. Drafts stay
                    private until the VultureX team approves and publishes them.
                  </p>
                </div>
                <Link
                  href="/competitions/host"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors"
                >
                  <PlusCircle size={12} /> New proposal
                </Link>
              </div>

              {mine.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="You have not proposed a competition yet"
                  description="Create a draft, configure eligibility and evaluation criteria, then submit it for review."
                />
              ) : (
                <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                  {mine.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/competitions/${row.id}`}
                            className="text-sm font-medium hover:text-[var(--accent)] transition-colors truncate"
                          >
                            {row.title}
                          </Link>
                          <StatusChip status={row.status} />
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-2">
                          <Users size={9} /> {row.applications} applications
                          {row.pending > 0 ? ` · ${row.pending} awaiting review` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(row.status === "draft" ||
                          row.status === "changes_requested") && (
                          <Link
                            href={`/competitions/host/${row.id}`}
                            className="px-3 py-1.5 text-[11px] border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
                          >
                            Edit proposal
                          </Link>
                        )}
                        <Link
                          href={`/competitions/manage/${row.id}`}
                          className="px-3 py-1.5 text-[11px] font-medium bg-[var(--bg-elevated)] rounded-md hover:bg-[var(--bg-card-hover)] transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : role === "admin" ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <h2 className="text-sm font-semibold">Competition oversight</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl">
                Review proposals, publish approved competitions and approve winner
                announcements from the admin dashboard.
              </p>
              <Link
                href="/admin/competitions"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors"
              >
                Open competition review
              </Link>
            </div>
          ) : role === "startup" ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <h2 className="text-sm font-semibold">Competitions are hosted by investors</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl">
                Only investor accounts can propose competitions. Track the
                competitions you have entered from your applications page.
              </p>
              <Link
                href="/competitions/applications"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
              >
                My applications
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <h2 className="text-sm font-semibold">Sign in to host a competition</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl">
                Competitions are proposed by investor accounts and reviewed by the
                VultureX team before they appear publicly.
              </p>
              <Link
                href="/login?callbackUrl=/competitions?tab=host"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}

          {role === "investor" && mine.length > 0 && (
            <p className="text-[10px] text-[var(--text-muted)] mt-3">
              Only approved and published competitions appear in the public tabs.
            </p>
          )}
        </Section>
      )}
    </div>
  );
}
