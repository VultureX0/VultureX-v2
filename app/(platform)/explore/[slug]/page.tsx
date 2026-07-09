import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { startups } from "@/db/schema";
import { auth } from "@/features/auth";
import { InterestButton } from "@/components/investor/InterestButton";
import { SaveButton } from "@/components/investor/SaveButton";
import { ProfileAnimations, AnimatedSection, AnimatedMetric, AnimatedBar } from "./animations";
import { ViewTracker } from "@/components/shared/ViewTracker";
import { MapPin, Globe, Users, TrendingUp, DollarSign, Calendar, ExternalLink } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export default async function StartupProfilePage({ params }: Props) {
  const { slug } = await params;
  const [startup] = await db.select().from(startups).where(eq(startups.slug, slug)).limit(1);
  if (!startup) notFound();

  const session = await auth();
  const isInvestor = (session?.user as { role?: string })?.role === "investor";
  const score = parseFloat(startup.score || "0");
  const breakdown = startup.scoreBreakdown as { traction: number; financial: number; team: number; market: number; momentum: number } | null;
  const mrrDollars = (startup.mrr || 0) / 100;
  const raisedDollars = (startup.fundingRaised || 0) / 100;
  const burnDollars = (startup.burnRate || 0) / 100;

  // Track view client-side
  const shouldTrackView = !!session?.user?.id && startup.userId !== session.user.id;

  return (
    <ProfileAnimations>
      {shouldTrackView && <ViewTracker startupId={startup.id} />}
      <div className="max-w-4xl">
        {/* Header */}
        <AnimatedSection delay={0}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-xl font-bold text-[var(--text-muted)]">
                {startup.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{startup.name}</h1>
                {startup.tagline && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{startup.tagline}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[10px] font-medium text-[var(--text-muted)] border border-[var(--border)]">{startup.sector}</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[10px] font-medium text-[var(--text-muted)] border border-[var(--border)]">{startup.stage}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold tabular-nums ${score >= 70 ? "text-[var(--green)]" : score >= 40 ? "text-[var(--amber)]" : "text-[var(--text-muted)]"}`}>
                {Math.round(score)}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">VultureScore</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Meta + CTA */}
        <AnimatedSection delay={0.1}>
          <div className="flex flex-wrap items-center gap-4 mb-8 text-xs text-[var(--text-muted)]">
            {startup.location && <span className="inline-flex items-center gap-1"><MapPin size={12} /> {startup.location}</span>}
            {startup.website && (
              <a href={startup.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[var(--accent)] transition-colors">
                <Globe size={12} /> Website <ExternalLink size={10} />
              </a>
            )}
            <span className="inline-flex items-center gap-1"><Users size={12} /> {startup.teamSize} members</span>
          </div>

          {isInvestor && (
            <div className="mb-8 flex items-center gap-3">
              <InterestButton startupId={startup.id} startupName={startup.name} />
              <SaveButton startupId={startup.id} />
            </div>
          )}
          {session?.user?.id === startup.userId && (
            <div className="mb-8">
              <Link href="/settings" className="text-xs font-medium px-4 py-2 border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors">
                Edit profile
              </Link>
            </div>
          )}
          {!session?.user && (
            <div className="mb-8 p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Interested in connecting?</p>
              <Link href="/signup" className="text-xs font-medium text-[var(--accent)] hover:underline">Sign up to express interest</Link>
            </div>
          )}
        </AnimatedSection>

        {/* Metrics */}
        <AnimatedSection delay={0.15} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <MetricCard icon={<DollarSign size={14} />} label="MRR" value={mrrDollars > 0 ? `$${mrrDollars.toLocaleString()}` : "-"} />
          <MetricCard icon={<TrendingUp size={14} />} label="Growth" value={`${startup.monthlyGrowth || 0}%`} accent={parseFloat(startup.monthlyGrowth || "0") > 0} />
          <MetricCard icon={<Users size={14} />} label="Customers" value={startup.customers?.toLocaleString() || "0"} />
          <MetricCard icon={<Calendar size={14} />} label="Runway" value={startup.runwayMonths ? `${startup.runwayMonths}mo` : "-"} />
        </AnimatedSection>

        {/* Two columns: Score breakdown + Problem/Solution */}
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          {/* Score breakdown */}
          {breakdown && (
            <AnimatedSection delay={0.2} className="rounded-xl border border-[var(--border)] p-5">
              <p className="text-xs font-medium text-[var(--text-muted)] mb-4">Score breakdown</p>
              <div className="space-y-3">
                {[
                  { label: "Traction", value: breakdown.traction, max: 35 },
                  { label: "Financial", value: breakdown.financial, max: 25 },
                  { label: "Team", value: breakdown.team, max: 15 },
                  { label: "Market", value: breakdown.market, max: 15 },
                  { label: "Momentum", value: breakdown.momentum, max: 10 },
                ].map((item, i) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[var(--text-muted)]">{item.label}</span>
                      <span className="text-[var(--text-secondary)] tabular-nums">{item.value}/{item.max}</span>
                    </div>
                    <AnimatedBar value={item.value} max={item.max} delay={0.3 + i * 0.08} />
                  </div>
                ))}
              </div>
            </AnimatedSection>
          )}

          {/* Problem & Solution */}
          <AnimatedSection delay={0.25} className="space-y-4">
            {startup.problem && (
              <div className="rounded-xl border border-[var(--border)] p-5">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Problem</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{startup.problem}</p>
              </div>
            )}
            {startup.solution && (
              <div className="rounded-xl border border-[var(--border)] p-5">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Solution</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{startup.solution}</p>
              </div>
            )}
          </AnimatedSection>
        </div>

        {/* Founder */}
        {startup.founderName && (
          <AnimatedSection delay={0.3} className="rounded-xl border border-[var(--border)] p-5 mb-8">
            <p className="text-xs font-medium text-[var(--text-muted)] mb-3">Founder</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">
                {startup.founderName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{startup.founderName}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{startup.founderRole}</p>
              </div>
              {startup.founderLinkedin && (
                <a href={startup.founderLinkedin} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-[var(--accent)] hover:underline">LinkedIn</a>
              )}
            </div>
            {startup.founderBio && (
              <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">{startup.founderBio}</p>
            )}
          </AnimatedSection>
        )}

        {/* Financials */}
        {(raisedDollars > 0 || burnDollars > 0) && (
          <AnimatedSection delay={0.35} className="rounded-xl border border-[var(--border)] p-5">
            <p className="text-xs font-medium text-[var(--text-muted)] mb-3">Financials</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-semibold">${raisedDollars.toLocaleString()}</p>
                <p className="text-[10px] text-[var(--text-muted)]">Total raised</p>
              </div>
              <div>
                <p className="text-sm font-semibold">${burnDollars.toLocaleString()}</p>
                <p className="text-[10px] text-[var(--text-muted)]">Monthly burn</p>
              </div>
              <div>
                <p className="text-sm font-semibold">{startup.runwayMonths || 0} months</p>
                <p className="text-[10px] text-[var(--text-muted)]">Runway</p>
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </ProfileAnimations>
  );
}

function MetricCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-3.5 hover:border-[var(--border-hover)] transition-colors">
      <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-1.5">{icon}<span className="text-[10px]">{label}</span></div>
      <p className={`text-base font-semibold ${accent ? "text-[var(--green)]" : ""}`}>{value}</p>
    </div>
  );
}
