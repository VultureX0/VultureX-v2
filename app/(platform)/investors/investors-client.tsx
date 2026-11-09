"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, Users } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui";
import { InterestPlusButton } from "@/components/connections/InterestPlusButton";

type Investor = {
  userId: string;
  fullName: string;
  investorType: string;
  firmName: string | null;
  location: string | null;
  checkSizeMin: number;
  checkSizeMax: number;
  stageFocus: string[];
  sectorFocus: string[];
  investmentThesis: string | null;
  avatarUrl: string | null;
};

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

const TYPES: Record<string, string> = {
  angel: "Angel",
  vc: "Venture Capital",
  family_office: "Family Office",
  corporate_vc: "Corporate VC",
};

function Avatar({ investor }: { investor: Investor }) {
  return (
    <div className="w-10 h-10 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-sm font-semibold text-[var(--text-muted)] overflow-hidden shrink-0">
      {investor.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={investor.avatarUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        investor.fullName.charAt(0).toUpperCase()
      )}
    </div>
  );
}

export function InvestorsClient({
  investors,
  statuses,
  viewerId,
  canSendInterest,
}: {
  investors: Investor[];
  statuses: Record<string, InterestStatus>;
  viewerId: string | null;
  canSendInterest: boolean;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [sector, setSector] = useState("all");

  const sectors = useMemo(() => {
    const all = new Set<string>();
    investors.forEach((investor) =>
      investor.sectorFocus.forEach((focus) => all.add(focus.toLowerCase()))
    );
    return [...all].sort();
  }, [investors]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return investors.filter((investor) => {
      if (type !== "all" && investor.investorType !== type) return false;
      if (sector !== "all" && !investor.sectorFocus.map((s) => s.toLowerCase()).includes(sector))
        return false;
      if (!needle) return true;
      return (
        investor.fullName.toLowerCase().includes(needle) ||
        (investor.firmName ?? "").toLowerCase().includes(needle) ||
        (investor.investmentThesis ?? "").toLowerCase().includes(needle) ||
        investor.sectorFocus.some((focus) => focus.toLowerCase().includes(needle))
      );
    });
  }, [investors, query, type, sector]);

  return (
    <div>
      <PageHeader
        title="Investors"
        subtitle={`${investors.length} investor${investors.length === 1 ? "" : "s"} on the platform`}
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, firm or thesis..."
            aria-label="Search investors"
            className="w-full pl-8 pr-4 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] text-xs placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-hover)] transition-colors"
          />
        </div>
        <select
          aria-label="Filter by investor type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-[var(--border-hover)] transition-colors cursor-pointer"
        >
          <option value="all">All investor types</option>
          {Object.entries(TYPES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by sector"
          value={sector}
          onChange={(event) => setSector(event.target.value)}
          className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-[var(--border-hover)] transition-colors cursor-pointer"
        >
          <option value="all">All sectors</option>
          {sectors.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        investors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No investors yet"
            description="Investor profiles will appear here as they join the platform."
          />
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-[var(--text-muted)]">No investors match your filters.</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Try a different search or filter.</p>
          </div>
        )
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((investor, index) => (
            <motion.div
              key={investor.userId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 flex flex-col hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              <Link href={`/investors/${investor.userId}`} className="block">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar investor={investor} />
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium truncate">{investor.fullName}</h3>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {investor.firmName || TYPES[investor.investorType] || "Investor"}
                    </p>
                  </div>
                </div>

                {investor.investmentThesis && (
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-3">
                    {investor.investmentThesis}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="px-1.5 py-0.5 rounded text-[9px] border border-[var(--border)] text-[var(--text-muted)]">
                    {TYPES[investor.investorType] ?? investor.investorType}
                  </span>
                  {investor.location && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] border border-[var(--border)] text-[var(--text-muted)] inline-flex items-center gap-1">
                      <MapPin size={8} /> {investor.location}
                    </span>
                  )}
                </div>
              </Link>

              <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                <p className="text-[10px] text-[var(--text-muted)]">
                  {investor.checkSizeMin || investor.checkSizeMax
                    ? `$${investor.checkSizeMin}K – $${investor.checkSizeMax}K`
                    : "Check size n/a"}
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/investors/${investor.userId}`}
                    className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  >
                    View
                  </Link>
                  {canSendInterest && (
                    <InterestPlusButton
                      targetUserId={investor.userId}
                      targetName={investor.fullName}
                      initialState={statuses[investor.userId] ?? null}
                      authenticated={!!viewerId}
                      compact
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
