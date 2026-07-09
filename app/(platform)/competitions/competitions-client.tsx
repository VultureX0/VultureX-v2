"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Clock, Users, ArrowRight } from "lucide-react";
import { PageHeader, Section, EmptyState, Badge } from "@/components/ui";

type Competition = {
  id: string; title: string; description: string | null; sector: string | null;
  prize: string | null; deadline: string; status: string | null; entryCount: number;
};

export function CompetitionsClient({ competitions }: { competitions: Competition[] }) {
  const active = competitions.filter(c => c.status === "active");
  const completed = competitions.filter(c => c.status === "completed");

  if (competitions.length === 0) {
    return (
      <div>
        <PageHeader title="Competitions" subtitle="Sector challenges with real prizes" />
        <EmptyState icon={Trophy} title="No competitions yet" description="Check back soon - new challenges launch regularly." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Competitions" subtitle="Enter challenges, get ranked, win visibility" />

      {active.length > 0 && (
        <Section delay={0.1}>
          <p className="text-xs font-medium text-[var(--text-muted)] mb-3">Active</p>
          <div className="space-y-3">
            {active.map((c, i) => <CompCard key={c.id} comp={c} delay={i * 0.05} />)}
          </div>
        </Section>
      )}

      {completed.length > 0 && (
        <Section delay={0.2} className="mt-8">
          <p className="text-xs font-medium text-[var(--text-muted)] mb-3">Completed</p>
          <div className="space-y-3 opacity-70">
            {completed.map((c, i) => <CompCard key={c.id} comp={c} delay={i * 0.05} />)}
          </div>
        </Section>
      )}
    </div>
  );
}

function CompCard({ comp, delay }: { comp: Competition; delay: number }) {
  const deadline = new Date(comp.deadline);
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const isActive = comp.status === "active" && daysLeft > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      whileHover={{ y: -2 }}>
      <Link href={`/competitions/${comp.id}`}
        className="block p-5 rounded-xl border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors group">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold group-hover:text-[var(--accent)] transition-colors">{comp.title}</h3>
            {comp.description && <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{comp.description}</p>}
          </div>
          {comp.prize && <Badge variant="accent">{comp.prize}</Badge>}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
          {comp.sector && <Badge>{comp.sector}</Badge>}
          <span className="flex items-center gap-1"><Users size={10} /> {comp.entryCount} entries</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {isActive ? `${daysLeft}d left` : "Ended"}</span>
          <ArrowRight size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]" />
        </div>
      </Link>
    </motion.div>
  );
}
