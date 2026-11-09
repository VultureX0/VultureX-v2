"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { InterestPlusButton } from "@/components/connections/InterestPlusButton";
import { SdgChips } from "@/components/sdg/SdgChips";

type InterestStatus = {
  status:
    | "none"
    | "self"
    | "pending_sent"
    | "pending_received"
    | "accepted"
    | "rejected"
    | "rejected_by_me";
  requestId: string | null;
  conversationId: string | null;
};

type Props = {
  slug: string;
  name: string;
  tagline: string | null;
  sector: string;
  stage: string;
  score: number;
  mrr: number;
  monthlyGrowth: string;
  location: string | null;
  sdgGoals?: number[];
  sdgPrimary?: number | null;
  targetUserId?: string;
  interest?: InterestStatus;
  canSendInterest?: boolean;
  authenticated?: boolean;
};

export function ProfileCard({
  slug,
  name,
  tagline,
  sector,
  stage,
  score,
  mrr,
  monthlyGrowth,
  sdgGoals,
  sdgPrimary,
  targetUserId,
  interest,
  canSendInterest = false,
  authenticated = true,
}: Props) {
  const mrrDisplay = mrr > 0 ? `$${(mrr / 100).toLocaleString()}` : null;
  const growth = parseFloat(monthlyGrowth);

  return (
    <motion.div
      whileHover={{ y: -2, borderColor: "rgba(62, 207, 142, 0.25)" }}
      transition={{ duration: 0.15 }}
      className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] transition-colors hover:bg-[var(--bg-card-hover)] overflow-hidden"
    >
      <Link href={`/explore/${slug}`} className="block p-5 pb-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-semibold text-[var(--text-muted)]">
              {name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-medium">{name}</h3>
              <p className="text-[11px] text-[var(--text-muted)]">{sector} · {stage}</p>
            </div>
          </div>
          <span className={`text-sm font-bold tabular-nums ${score >= 70 ? "text-[var(--green)]" : score >= 40 ? "text-[var(--amber)]" : "text-[var(--text-muted)]"}`}>
            {Math.round(score)}
          </span>
        </div>

        {tagline && <p className="text-xs text-[var(--text-muted)] mb-1 line-clamp-2 leading-relaxed">{tagline}</p>}
        {!!sdgGoals?.length && (
          <SdgChips
            goals={sdgGoals}
            primary={sdgPrimary ?? null}
            max={2}
            showPrimaryLabel={false}
            className="mt-2"
          />
        )}
      </Link>

      <div className="px-5 pb-4 pt-2 flex items-center justify-between gap-2 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] min-w-0">
          {mrrDisplay && <span>{mrrDisplay} MRR</span>}
          {growth > 0 && (
            <span className="flex items-center gap-0.5 text-[var(--green)]">
              <TrendingUp size={10} /> +{growth}%
            </span>
          )}
        </div>
        {canSendInterest && targetUserId && (
          <InterestPlusButton
            targetUserId={targetUserId}
            targetName={name}
            initialState={interest ?? null}
            authenticated={authenticated}
            compact
          />
        )}
      </div>
    </motion.div>
  );
}
