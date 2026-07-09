"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Check, X, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageHeader, Section, EmptyState, Badge, Avatar } from "@/components/ui";

type SentInterest = {
  id: string; startupId: string; startupName: string; startupSlug: string;
  startupSector: string; message: string | null; status: string; createdAt: string;
};

type ReceivedInterest = {
  id: string; investorName: string; investorFirm: string | null;
  investorType: string; investorLinkedin: string | null;
  message: string | null; status: string; createdAt: string;
};

export function InterestsClient({ role }: { role: string }) {
  const [interests, setInterests] = useState<(SentInterest | ReceivedInterest)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/interest")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setInterests(d.interests || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const title = role === "investor" ? "Sent Interests" : "Incoming Interests";
  const subtitle = loading ? "Loading..." : error ? "Failed to load" : `${interests.length} connection${interests.length !== 1 ? "s" : ""}`;

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={16} className="animate-spin text-[var(--text-muted)]" />
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-xs text-[var(--red)]">Failed to load interests. Please refresh.</p>
        </div>
      ) : role === "investor" ? (
        <InvestorView interests={interests as SentInterest[]} />
      ) : (
        <StartupView interests={interests as ReceivedInterest[]} onUpdate={setInterests} />
      )}
    </div>
  );
}

function InvestorView({ interests }: { interests: SentInterest[] }) {
  return (
    <div>
      {interests.length === 0 ? (
        <EmptyState icon={Heart} title="No interests sent yet"
          description="Browse startups and express interest to start connecting."
          action={{ label: "Explore startups", href: "/explore" }} />
      ) : (
        <Section delay={0.1}>
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            {interests.map((interest, i) => (
              <motion.div key={interest.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}>
                <Link href={`/explore/${interest.startupSlug}`}
                  className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card-hover)] transition-colors group">
                  <Avatar letter={interest.startupName?.charAt(0) || "?"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors">
                      {interest.startupName}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {interest.startupSector} · {new Date(interest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {interest.message && (
                    <p className="text-[10px] text-[var(--text-muted)] max-w-[200px] truncate hidden md:block">
                      &ldquo;{interest.message}&rdquo;
                    </p>
                  )}
                  <StatusBadge status={interest.status} />
                </Link>
              </motion.div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function StartupView({ interests, onUpdate }: { interests: ReceivedInterest[]; onUpdate: (i: ReceivedInterest[]) => void }) {
  const [updating, setUpdating] = useState<string | null>(null);

  async function respond(interestId: string, status: "accepted" | "declined") {
    setUpdating(interestId);
    try {
      const res = await fetch("/api/interest", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interestId, status }),
      });
      if (res.ok) {
        onUpdate(interests.map(i => i.id === interestId ? { ...i, status } : i) as ReceivedInterest[]);
      }
    } catch { /* ignore */ }
    finally { setUpdating(null); }
  }

  return (
    <div>
      {interests.length === 0 ? (
        <EmptyState icon={Heart} title="No interests yet"
          description="When investors discover your startup and express interest, they'll appear here." />
      ) : (
        <Section delay={0.1}>
          <div className="space-y-3">
            {interests.map((interest, i) => (
              <motion.div key={interest.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="rounded-xl border border-[var(--border)] p-4 hover:border-[var(--border-hover)] transition-colors">
                <div className="flex items-start gap-3">
                  <Avatar letter={interest.investorName?.charAt(0) || "?"} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{interest.investorName}</p>
                      <StatusBadge status={interest.status} />
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {interest.investorFirm || interest.investorType} · {new Date(interest.createdAt).toLocaleDateString()}
                    </p>
                    {interest.message && (
                      <p className="text-xs text-[var(--text-secondary)] mt-2 italic">&ldquo;{interest.message}&rdquo;</p>
                    )}
                  </div>
                  {interest.investorLinkedin && (
                    <a href={interest.investorLinkedin} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-0.5 shrink-0">
                      LinkedIn <ExternalLink size={8} />
                    </a>
                  )}
                </div>

                {/* Accept/Decline buttons */}
                {interest.status === "pending" && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                    <button onClick={() => respond(interest.id, "accepted")} disabled={updating === interest.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--accent)] text-[#171717] rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50">
                      {updating === interest.id ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />} Accept
                    </button>
                    <button onClick={() => respond(interest.id, "declined")} disabled={updating === interest.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] rounded-md hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-50">
                      <X size={10} /> Decline
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "accepted") return <Badge variant="green">accepted</Badge>;
  if (status === "declined") return <Badge>declined</Badge>;
  return <Badge variant="accent">pending</Badge>;
}
