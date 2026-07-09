"use client";

import { motion } from "framer-motion";
import { ProfileCard } from "@/components/startup/ProfileCard";
import { ExploreFilters } from "./filters";

type Startup = {
  id: string; slug: string; name: string; tagline: string | null;
  sector: string; stage: string; score: number; mrr: number;
  monthlyGrowth: string; location: string | null;
};

type Props = {
  startups: Startup[];
  currentSector?: string;
  currentStage?: string;
  currentQuery?: string;
};

export function ExploreClient({ startups, currentSector, currentStage, currentQuery }: Props) {
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Explore startups</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">{startups.length} startups on the platform</p>
        </div>
      </motion.div>

      <ExploreFilters currentSector={currentSector} currentStage={currentStage} currentQuery={currentQuery} />

      {startups.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
          <p className="text-sm text-[var(--text-muted)]">No startups match your filters.</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Try adjusting your search or filters.</p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {startups.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <ProfileCard
                slug={s.slug} name={s.name} tagline={s.tagline} sector={s.sector}
                stage={s.stage} score={s.score} mrr={s.mrr}
                monthlyGrowth={s.monthlyGrowth} location={s.location}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
