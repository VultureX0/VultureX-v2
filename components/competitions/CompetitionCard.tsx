"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarClock, Clock, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui";
import { sdgLabel } from "@/features/competitions/types";
import { daysUntil, formatDate } from "@/features/competitions/format";
import type { CompetitionCard as CompetitionCardData } from "@/features/competitions/service";

export function CompetitionCard({
  competition,
  delay = 0,
}: {
  competition: CompetitionCardData;
  delay?: number;
}) {
  const days = daysUntil(competition.deadline);
  const isUpcoming = competition.phase === "upcoming";
  const totalWeight = competition.criteria.reduce(
    (sum, criterion) => sum + criterion.weight,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <div className="h-full flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-colors overflow-hidden">
        {competition.id && (
          <Link
            href={`/competitions/${competition.id}`}
            className="flex-1 p-5 group block"
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  {competition.category && (
                    <Badge>{competition.category}</Badge>
                  )}
                  {competition.sdgGoals.length > 0 && (
                    <Badge variant="accent">
                      SDG {competition.sdgPrimary ?? competition.sdgGoals[0]}
                      {competition.sdgPrimary ? " · focus" : ""}
                      {competition.sdgGoals.length > 1
                        ? ` +${competition.sdgGoals.length - 1}`
                        : ""}
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm font-semibold leading-snug group-hover:text-[var(--accent)] transition-colors">
                  {competition.title}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Hosted by {competition.host}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[var(--amber-muted)] text-[var(--amber)] flex items-center justify-center shrink-0">
                <Trophy size={15} />
              </div>
            </div>

            {competition.summary && (
              <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-3">
                {competition.summary}
              </p>
            )}

            {competition.prize && (
              <p className="text-xs font-medium text-[var(--amber)] mb-3">
                {competition.prize}
              </p>
            )}

            {competition.benefits.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {competition.benefits.slice(0, 3).map((benefit) => (
                  <span
                    key={benefit}
                    className="px-2 py-0.5 rounded-md text-[10px] border border-[var(--border)] text-[var(--text-secondary)]"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] text-[var(--text-muted)] mt-auto">
              <span className="flex items-center gap-1">
                <Users size={10} /> {competition.applicationCount}{" "}
                {competition.applicationCount === 1 ? "application" : "applications"}
              </span>
              <span className="flex items-center gap-1">
                {isUpcoming ? <CalendarClock size={10} /> : <Clock size={10} />}
                {isUpcoming
                  ? `Opens ${formatDate(competition.opensAt)}`
                  : days !== null && days >= 0
                    ? `${days}d left`
                    : "Closed"}
              </span>
              <span className="col-span-2 truncate">
                {competition.eligibilityLines.join(" · ") || "Open to all"}
              </span>
            </div>

            {competition.criteria.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <p className="text-[10px] text-[var(--text-muted)] mb-1.5">
                  Evaluated on {competition.criteria.length} criteria
                  {totalWeight === 100 ? "" : " (weights pending)"}
                </p>
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  {competition.criteria.slice(0, 4).map((criterion) => (
                    <span
                      key={criterion.key}
                      className="text-[10px] text-[var(--text-secondary)]"
                    >
                      {criterion.label}{" "}
                      <span className="text-[var(--text-muted)]">
                        {Math.round(criterion.weight)}%
                      </span>
                    </span>
                  ))}
                  {competition.criteria.length > 4 && (
                    <span className="text-[10px] text-[var(--text-muted)]">
                      +{competition.criteria.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </Link>
        )}

        <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--bg)]/40 flex items-center justify-between gap-2">
          <span className="text-[10px] text-[var(--text-muted)] truncate">
            {competition.sdgGoals.length > 0
              ? competition.sdgGoals.map(sdgLabel).slice(0, 1).join("")
              : competition.phase === "upcoming"
                ? `Deadline ${formatDate(competition.deadline)}`
                : competition.deadline
                  ? `Apply by ${formatDate(competition.deadline)}`
                  : "Applications closed"}
          </span>
          <Link
            href={`/competitions/${competition.id}`}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
              isUpcoming
                ? "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                : "bg-[var(--accent-fill)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
            }`}
          >
            {isUpcoming ? "View details" : "Apply now"}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
