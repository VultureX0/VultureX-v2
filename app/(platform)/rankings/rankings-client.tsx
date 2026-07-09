"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const SECTORS = ["All", "Fintech", "AI/ML", "Climate", "SaaS", "Healthtech", "Edtech"];

type Startup = {
  id: string; slug: string; name: string; tagline: string | null;
  sector: string; stage: string; score: number; monthlyGrowth: string;
};

export function RankingsClient({ startups, currentSector }: { startups: Startup[]; currentSector?: string }) {
  const router = useRouter();

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-xl font-semibold mb-1">Rankings</h1>
        <p className="text-xs text-[var(--text-muted)] mb-6">Startups ranked by VultureScore - updated live.</p>
      </motion.div>

      {/* Sector tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-1.5 mb-8">
        {SECTORS.map((s) => {
          const isActive = (!currentSector && s === "All") || currentSector?.toLowerCase() === s.toLowerCase();
          return (
            <button
              key={s}
              onClick={() => router.push(s === "All" ? "/rankings" : `/rankings?sector=${s.toLowerCase()}`)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                isActive
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-muted)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
              }`}
            >
              {s}
            </button>
          );
        })}
      </motion.div>

      {startups.length === 0 ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-sm text-[var(--text-muted)] py-16 text-center">
          No startups in this sector yet.
        </motion.p>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-xl border border-[var(--border)] overflow-hidden">

          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_80px_80px_60px] md:grid-cols-[40px_1fr_100px_80px_80px_60px] gap-2 px-4 py-2 bg-[var(--bg-card)] text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
            <span>#</span>
            <span>Startup</span>
            <span className="hidden md:block">Sector</span>
            <span>Stage</span>
            <span>Growth</span>
            <span className="text-right">Score</span>
          </div>

          {/* Rows */}
          {startups.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.2 + i * 0.03 }}
            >
              <Link href={`/explore/${s.slug}`}
                className={`grid grid-cols-[40px_1fr_80px_80px_60px] md:grid-cols-[40px_1fr_100px_80px_80px_60px] gap-2 px-4 py-3 items-center hover:bg-[var(--bg-card-hover)] transition-colors group ${
                  i < startups.length - 1 ? "border-b border-[var(--border)]" : ""
                }`}>
                <span className={`text-xs font-semibold tabular-nums ${i < 3 ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                  {i + 1}
                </span>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center text-[11px] font-medium text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-muted)] transition-colors shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors">{s.name}</p>
                    {s.tagline && <p className="text-[10px] text-[var(--text-muted)] truncate hidden lg:block">{s.tagline}</p>}
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)] hidden md:block">{s.sector}</span>
                <span className="text-xs text-[var(--text-muted)]">{s.stage}</span>
                <span className={`text-xs flex items-center gap-0.5 ${parseFloat(s.monthlyGrowth) > 0 ? "text-[var(--green)]" : "text-[var(--text-muted)]"}`}>
                  {parseFloat(s.monthlyGrowth) > 0 ? <><TrendingUp size={10} />+{s.monthlyGrowth}%</> : "-"}
                </span>
                <div className="flex items-center justify-end gap-1.5">
                  <span className={`text-sm font-bold tabular-nums ${s.score >= 70 ? "text-[var(--green)]" : s.score >= 40 ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}`}>
                    {Math.round(s.score)}
                  </span>
                  <ArrowRight size={10} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
