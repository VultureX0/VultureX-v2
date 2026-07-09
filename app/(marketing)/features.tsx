"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Users, TrendingUp, BarChart3, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: { icon: LucideIcon; title: string; description: string; wide?: boolean }[] = [
  {
    icon: BarChart3,
    title: "VultureScore",
    description: "Transparent 0-100 ranking based on real metrics. Revenue, growth, team, market fit. Updated live.",
    wide: true,
  },
  {
    icon: Zap,
    title: "Pitch deck in 60s",
    description: "Generate investor-ready decks from your data. Edit inline, share with a link, track views.",
  },
  {
    icon: Shield,
    title: "Transparent scoring",
    description: "See exactly how your score is calculated. Every point is earned, never hidden.",
  },
  {
    icon: Users,
    title: "Direct connections",
    description: "Investors express interest, you get notified. No gatekeepers.",
  },
  {
    icon: TrendingUp,
    title: "Live rankings",
    description: "Score updates as you grow. Climb sector leaderboards with real traction.",
  },
  {
    icon: FileText,
    title: "Shareable profiles",
    description: "Public startup pages with scores, decks, and metrics. SEO-friendly.",
    wide: true,
  },
];

export function FeatureGrid() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent)] mb-3">Platform</p>
          <h2 className="text-2xl md:text-3xl font-semibold mb-12">Everything to go from pitch to funded</h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ y: -3, boxShadow: "0 8px 30px -12px rgba(62, 207, 142, 0.1)" }}
              className={`rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 cursor-default hover:border-[var(--accent)]/30 transition-colors ${feature.wide ? "md:col-span-2" : ""}`}
            >
              <feature.icon size={18} className="text-[var(--accent)] mb-3" />
              <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
