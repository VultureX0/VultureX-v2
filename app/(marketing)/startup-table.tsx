"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

type Startup = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  sector: string;
  stage: string;
  growth: string;
  score: number;
};

export function StartupTable({ startups }: { startups: Startup[] }) {
  return (
    <section className="px-6 py-20 md:py-28 border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-baseline justify-between mb-6"
        >
          <div>
            <h2 className="text-2xl font-semibold">On the platform</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Recently active startups</p>
          </div>
          <Link href="/explore" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            View all →
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border border-[var(--border)] overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_80px_70px] md:grid-cols-[1fr_120px_100px_80px_70px] gap-4 px-5 py-2.5 bg-[var(--bg-card)] text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
            <span>Company</span>
            <span className="hidden md:block">Sector</span>
            <span>Stage</span>
            <span>Growth</span>
            <span className="text-right">Score</span>
          </div>

          {/* Rows */}
          {startups.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                href={`/explore/${s.slug}`}
                className="grid grid-cols-[1fr_80px_80px_70px] md:grid-cols-[1fr_120px_100px_80px_70px] gap-4 px-5 py-3.5 items-center border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)] transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-medium text-[var(--text-muted)] shrink-0 group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-muted)] transition-colors">
                    {s.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors">{s.name}</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)] hidden md:block">{s.sector}</span>
                <span className="text-xs text-[var(--text-muted)]">{s.stage}</span>
                <span className={`text-xs flex items-center gap-1 ${parseFloat(s.growth) > 0 ? "text-[var(--green)]" : "text-[var(--text-muted)]"}`}>
                  {parseFloat(s.growth) > 0 ? <><TrendingUp size={10} />+{s.growth}%</> : "-"}
                </span>
                <span className={`text-sm font-semibold text-right ${s.score >= 70 ? "text-[var(--green)]" : "text-[var(--text-secondary)]"}`}>
                  {Math.round(s.score)}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
