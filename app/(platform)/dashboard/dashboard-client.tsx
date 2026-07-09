"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Eye, Heart, FileText, Trophy, ArrowRight, Zap, Search, Sparkles, Target, Users, BarChart3 } from "lucide-react";

type StartupData = {
  name: string;
  tagline: string | null;
  sector: string;
  stage: string;
  score: number;
  breakdown: { traction: number; financial: number; team: number; market: number; momentum: number } | null;
  stats: { views: number; interests: number; decks: number; competitions: number };
  mrr: number;
  growth: string;
  recentInterests: number;
};

type InvestorData = {
  name: string;
  firmName: string | null;
  sectors: string[];
  stages: string[];
  stats: { interests: number };
  topStartups: { id: string; slug: string; name: string; sector: string; stage: string; score: number; growth: string }[];
};

type Props = { type: "startup"; data: StartupData } | { type: "investor"; data: InvestorData };

export function DashboardClient(props: Props) {
  if (props.type === "startup") return <StartupDashboard data={props.data} />;
  return <InvestorDashboard data={props.data} />;
}

function StartupDashboard({ data }: { data: StartupData }) {
  const mrrDisplay = data.mrr > 0 ? `$${(data.mrr / 100).toLocaleString()}` : "$0";

  // Score tips based on breakdown
  const tips = getScoreTips(data.breakdown);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{data.name}</h1>
            <p className="text-xs text-[var(--text-muted)]">{data.sector} · {data.stage}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold tabular-nums ${data.score >= 70 ? "text-[var(--green)]" : "text-[var(--text-secondary)]"}`}>
              {Math.round(data.score)}
            </span>
            <span className="text-xs text-[var(--text-muted)]">/100</span>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Eye} label="Profile views" value={data.stats.views} sub="30d" delay={0} />
        <StatCard icon={Heart} label="Interests" value={data.stats.interests} delay={0.05} />
        <StatCard icon={FileText} label="Pitch decks" value={data.stats.decks} delay={0.1} />
        <StatCard icon={Trophy} label="Competitions" value={data.stats.competitions} delay={0.15} />
      </motion.div>

      {/* Main grid - fills remaining space */}
      <div className="flex-1 grid lg:grid-cols-5 gap-4 min-h-0">
        {/* Left: Score + Metrics */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-3 rounded-xl border border-[var(--border)] p-5 flex flex-col">

          {/* Score breakdown */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-[var(--text-muted)]">Score breakdown</p>
            <Link href="/settings" className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              Improve →
            </Link>
          </div>
          {data.breakdown && (
            <div className="space-y-2.5">
              {[
                { label: "Traction", value: data.breakdown.traction, max: 35 },
                { label: "Financial", value: data.breakdown.financial, max: 25 },
                { label: "Team", value: data.breakdown.team, max: 15 },
                { label: "Market", value: data.breakdown.market, max: 15 },
                { label: "Momentum", value: data.breakdown.momentum, max: 10 },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }} className="flex items-center gap-3">
                  <span className="text-[11px] text-[var(--text-muted)] w-16">{item.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(item.value / item.max) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                      className="h-full rounded-full bg-[var(--accent)]" />
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] w-8 text-right tabular-nums">{item.value}/{item.max}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Metrics */}
          <div className="mt-5 pt-4 border-t border-[var(--border)] grid grid-cols-3 gap-4">
            <div>
              <p className="text-lg font-semibold">{mrrDisplay}</p>
              <p className="text-[10px] text-[var(--text-muted)]">MRR</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--green)]">+{data.growth}%</p>
              <p className="text-[10px] text-[var(--text-muted)]">Monthly growth</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{data.recentInterests}</p>
              <p className="text-[10px] text-[var(--text-muted)]">New interests</p>
            </div>
          </div>

          {/* Tips to improve - fills remaining space */}
          <div className="mt-5 pt-4 border-t border-[var(--border)] flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={12} className="text-[var(--accent)]" />
              <p className="text-[11px] font-medium text-[var(--text-muted)]">How to improve your score</p>
            </div>
            <div className="space-y-2">
              {tips.map((tip, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-start gap-2 px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors">
                  <tip.icon size={11} className="text-[var(--accent)] mt-0.5 shrink-0" />
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{tip.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Actions + Activity */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="lg:col-span-2 flex flex-col gap-4">

          {/* Quick actions */}
          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-[11px] font-medium text-[var(--text-muted)] mb-3">Quick actions</p>
            <div className="space-y-2">
              <ActionCard href="/deck/new" icon={Zap} label="Generate pitch deck" />
              <ActionCard href="/explore" icon={Search} label="Explore startups" />
              <ActionCard href="/settings" icon={TrendingUp} label="Update metrics" />
              <ActionCard href="/rankings" icon={BarChart3} label="View rankings" />
            </div>
          </div>

          {/* Activity / status */}
          <div className="rounded-xl border border-[var(--border)] p-4 flex-1">
            <p className="text-[11px] font-medium text-[var(--text-muted)] mb-3">Activity</p>
            <div className="space-y-3">
              {data.stats.interests > 0 && (
                <ActivityItem icon={Heart} text={`${data.stats.interests} investor${data.stats.interests > 1 ? "s" : ""} expressed interest`} accent />
              )}
              {data.stats.views > 0 && (
                <ActivityItem icon={Eye} text={`${data.stats.views} profile views this month`} />
              )}
              {data.stats.decks > 0 && (
                <ActivityItem icon={FileText} text={`${data.stats.decks} pitch deck${data.stats.decks > 1 ? "s" : ""} created`} />
              )}
              {data.stats.competitions > 0 && (
                <ActivityItem icon={Trophy} text={`Entered ${data.stats.competitions} competition${data.stats.competitions > 1 ? "s" : ""}`} />
              )}
              {data.stats.interests === 0 && data.stats.views === 0 && (
                <p className="text-[11px] text-[var(--text-muted)] py-4 text-center">
                  Activity will appear here as investors discover you.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InvestorDashboard({ data }: { data: InvestorData }) {
  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-lg font-semibold">{data.name}</h1>
        <p className="text-xs text-[var(--text-muted)]">{data.firmName || "Angel Investor"} · {data.sectors.slice(0, 3).join(", ")}</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3">
        <StatCard icon={Heart} label="Interests sent" value={data.stats.interests} delay={0} />
        <StatCard icon={Target} label="Focus sectors" value={data.sectors.length} delay={0.05} />
        <StatCard icon={Users} label="Startups available" value={data.topStartups.length} delay={0.1} />
      </motion.div>

      {/* Main - startup feed fills remaining space */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex-1 rounded-xl border border-[var(--border)] overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <p className="text-xs font-medium text-[var(--text-muted)]">Recommended for you</p>
          <Link href="/explore" className="text-[10px] text-[var(--accent)] hover:underline transition-colors">
            View all →
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
          {data.topStartups.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.3 + i * 0.04 }}>
              <Link href={`/explore/${s.slug}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-card-hover)] transition-colors group">
                <div className="w-8 h-8 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-muted)] transition-colors">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors">{s.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{s.sector} · {s.stage}</p>
                </div>
                {parseFloat(s.growth) > 0 && (
                  <span className="text-[10px] text-[var(--green)] font-medium">+{s.growth}%</span>
                )}
                <span className={`text-xs font-semibold tabular-nums ${s.score >= 70 ? "text-[var(--green)]" : "text-[var(--text-muted)]"}`}>
                  {Math.round(s.score)}
                </span>
                <ArrowRight size={12} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// --- Helper components ---

function StatCard({ icon: Icon, label, value, sub, delay = 0 }: { icon: typeof Eye; label: string; value: number; sub?: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: 0.15 + delay }}
      className="rounded-lg border border-[var(--border)] p-3.5 hover:border-[var(--border-hover)] transition-colors">
      <Icon size={13} className="text-[var(--text-muted)] mb-2" />
      <p className="text-lg font-semibold tabular-nums">
        {value}{sub && <span className="text-[10px] font-normal text-[var(--text-muted)] ml-1">{sub}</span>}
      </p>
      <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
    </motion.div>
  );
}

function ActionCard({ href, icon: Icon, label }: { href: string; icon: typeof Zap; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[var(--bg-elevated)] transition-colors group">
      <Icon size={13} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
      <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text)] transition-colors">{label}</span>
      <ArrowRight size={10} className="ml-auto text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function ActivityItem({ icon: Icon, text, accent }: { icon: typeof Eye; text: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${accent ? "bg-[var(--accent-muted)]" : "bg-[var(--bg-elevated)]"}`}>
        <Icon size={10} className={accent ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
      </div>
      <p className="text-[11px] text-[var(--text-secondary)]">{text}</p>
    </div>
  );
}

// --- Score tips logic ---

function getScoreTips(breakdown: StartupData["breakdown"]) {
  if (!breakdown) return [{ icon: Target, text: "Complete your profile to get your first score." }];

  const tips: { icon: typeof Target; text: string }[] = [];

  if (breakdown.traction < 20) tips.push({ icon: TrendingUp, text: "Increase your MRR and customer count to boost traction score." });
  if (breakdown.financial < 15) tips.push({ icon: BarChart3, text: "Add burn rate and runway to improve your financial score." });
  if (breakdown.team < 10) tips.push({ icon: Users, text: "Complete founder bio and LinkedIn to max out team score." });
  if (breakdown.momentum < 5) tips.push({ icon: Sparkles, text: "Enter a competition to boost momentum points." });
  if (tips.length === 0) tips.push({ icon: Target, text: "Your score is strong. Keep growing MRR to stay at the top." });

  return tips.slice(0, 4);
}
