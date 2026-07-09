"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const INVESTOR_TYPES = [
  { value: "angel", label: "Angel Investor" },
  { value: "vc", label: "Venture Capital" },
  { value: "family_office", label: "Family Office" },
  { value: "corporate_vc", label: "Corporate VC" },
];

const SECTORS = [
  "SaaS", "Fintech", "AI/ML", "Healthtech", "Edtech", "Climate",
  "E-commerce", "Marketplace", "Cybersecurity", "Biotech", "Gaming", "Media",
];

const STAGES = [
  { value: "pre-seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B" },
  { value: "growth", label: "Growth" },
];

export default function InvestorOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [investorType, setInvestorType] = useState("angel");
  const [firmName, setFirmName] = useState("");
  const [location, setLocation] = useState("");
  const [checkSizeMin, setCheckSizeMin] = useState(25);
  const [checkSizeMax, setCheckSizeMax] = useState(500);
  const [stageFocus, setStageFocus] = useState<string[]>([]);
  const [sectorFocus, setSectorFocus] = useState<string[]>([]);
  const [investmentThesis, setInvestmentThesis] = useState("");
  const [linkedin, setLinkedin] = useState("");

  function toggleStage(value: string) {
    setStageFocus((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  function toggleSector(value: string) {
    setSectorFocus((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          investorType,
          firmName,
          location,
          checkSizeMin,
          checkSizeMax,
          stageFocus,
          sectorFocus: sectorFocus.map((s) => s.toLowerCase()),
          investmentThesis,
          linkedin,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-2">Set up your investor profile</h1>
      <p className="text-xs text-[var(--text-muted)] mb-8">
        Tell us your preferences and we&apos;ll surface the most relevant startups.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-[var(--border)] p-5 bg-[var(--bg-card)]">
        {/* Basic info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
              placeholder="New York, NY"
            />
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Investor Type</label>
          <div className="flex flex-wrap gap-2">
            {INVESTOR_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setInvestorType(t.value)}
                className={`px-4 py-2 text-xs rounded-md border transition-colors ${
                  investorType === t.value
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
                    : "border-[var(--border)] hover:border-[var(--border-hover)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Firm */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">Firm Name</label>
            <input
              type="text"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
              placeholder="Sequoia, First Round, etc"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">LinkedIn</label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </div>

        {/* Check size */}
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Check Size Range ($K)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              value={checkSizeMin}
              onChange={(e) => setCheckSizeMin(parseInt(e.target.value) || 0)}
              className="w-28 px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            />
            <span className="text-[var(--text-muted)]">to</span>
            <input
              type="number"
              min={0}
              value={checkSizeMax}
              onChange={(e) => setCheckSizeMax(parseInt(e.target.value) || 0)}
              className="w-28 px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            />
            <span className="text-xs text-[var(--text-muted)]">thousand</span>
          </div>
        </div>

        {/* Stage focus */}
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Stage Focus (select all that apply)</label>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleStage(s.value)}
                className={`px-4 py-2 text-xs rounded-md border transition-colors ${
                  stageFocus.includes(s.value)
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
                    : "border-[var(--border)] hover:border-[var(--border-hover)]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sector focus */}
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Sector Focus (select all that apply)</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {SECTORS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSector(s.toLowerCase())}
                className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                  sectorFocus.includes(s.toLowerCase())
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
                    : "border-[var(--border)] hover:border-[var(--border-hover)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Thesis */}
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Investment Thesis</label>
          <textarea
            value={investmentThesis}
            onChange={(e) => setInvestmentThesis(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors resize-none"
            placeholder="What do you look for in founders and startups?"
          />
        </div>

        {error && <p className="text-sm text-[var(--accent)]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium bg-[var(--accent)] text-[#171717] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Complete Setup"} <Check size={16} />
        </button>
      </form>
    </div>
  );
}
