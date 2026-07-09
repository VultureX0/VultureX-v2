"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

const SECTORS = [
  "SaaS", "Fintech", "AI/ML", "Healthtech", "Edtech", "Climate",
  "E-commerce", "Marketplace", "Cybersecurity", "Biotech", "Gaming", "Media", "Other",
];

const STAGES = [
  { value: "pre-seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B" },
  { value: "growth", label: "Growth" },
];

type FormData = {
  name: string;
  tagline: string;
  sector: string;
  stage: string;
  location: string;
  website: string;
  founderName: string;
  founderRole: string;
  founderBio: string;
  founderLinkedin: string;
  teamSize: number;
  mrr: number;
  monthlyGrowth: number;
  activeUsers: number;
  customers: number;
  fundingRaised: number;
  burnRate: number;
  runwayMonths: number;
  problem: string;
  solution: string;
};

const defaultData: FormData = {
  name: "",
  tagline: "",
  sector: "",
  stage: "pre-seed",
  location: "",
  website: "",
  founderName: "",
  founderRole: "CEO",
  founderBio: "",
  founderLinkedin: "",
  teamSize: 1,
  mrr: 0,
  monthlyGrowth: 0,
  activeUsers: 0,
  customers: 0,
  fundingRaised: 0,
  burnRate: 0,
  runwayMonths: 0,
  problem: "",
  solution: "",
};

const STEPS = ["Company", "Founder & Team", "Traction", "Pitch"];

export default function StartupOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(fields: Partial<FormData>) {
    setData((prev) => ({ ...prev, ...fields }));
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      // Convert dollar amounts to cents for storage
      const payload = {
        ...data,
        mrr: Math.round(data.mrr * 100),
        fundingRaised: Math.round(data.fundingRaised * 100),
        burnRate: Math.round(data.burnRate * 100),
      };

      const res = await fetch("/api/startups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to save profile");
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
      <h1 className="text-xl font-semibold mb-2">Set up your startup profile</h1>
      <p className="text-xs text-[var(--text-muted)] mb-8">
        This takes about 3 minutes. The more you fill in, the better your VultureScore.
      </p>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                i <= step ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
            />
            <p className={`text-xs mt-1.5 ${i === step ? "font-medium" : "text-[var(--text-muted)]"}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-[var(--border)] p-5 bg-[var(--bg-card)]">
        {step === 0 && <CompanyStep data={data} update={update} />}
        {step === 1 && <FounderStep data={data} update={update} />}
        {step === 2 && <TractionStep data={data} update={update} />}
        {step === 3 && <PitchStep data={data} update={update} />}

        {error && <p className="text-sm text-[var(--accent)] mt-4">{error}</p>}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border)]">
          <button
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              disabled={step === 0 && (!data.name || !data.sector)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[var(--accent)] text-[#171717] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[var(--accent)] text-[#171717] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : "Complete Profile"}
              <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Step Components ---

function CompanyStep({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[10px] text-[var(--text-muted)] mb-1">Company Name *</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
          placeholder="Acme Inc"
        />
      </div>
      <div>
        <label className="block text-[10px] text-[var(--text-muted)] mb-1">Tagline</label>
        <input
          type="text"
          value={data.tagline}
          onChange={(e) => update({ tagline: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
          placeholder="One line describing what you do"
        />
      </div>
      <div>
        <label className="block text-[10px] text-[var(--text-muted)] mb-1">Sector *</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {SECTORS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update({ sector: s.toLowerCase() })}
              className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                data.sector === s.toLowerCase()
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
                  : "border-[var(--border)] hover:border-[var(--border-hover)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[10px] text-[var(--text-muted)] mb-1">Stage *</label>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => update({ stage: s.value })}
              className={`px-4 py-2 text-xs rounded-md border transition-colors ${
                data.stage === s.value
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
                  : "border-[var(--border)] hover:border-[var(--border-hover)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Location</label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => update({ location: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            placeholder="San Francisco, CA"
          />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Website</label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => update({ website: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            placeholder="https://acme.com"
          />
        </div>
      </div>
    </div>
  );
}

function FounderStep({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Your Name</label>
          <input
            type="text"
            value={data.founderName}
            onChange={(e) => update({ founderName: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Your Role</label>
          <input
            type="text"
            value={data.founderRole}
            onChange={(e) => update({ founderRole: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            placeholder="CEO & Co-Founder"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] text-[var(--text-muted)] mb-1">Bio</label>
        <textarea
          value={data.founderBio}
          onChange={(e) => update({ founderBio: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors resize-none"
          placeholder="Brief background - previous experience, exits, domain expertise..."
        />
      </div>
      <div>
        <label className="block text-[10px] text-[var(--text-muted)] mb-1">LinkedIn URL</label>
        <input
          type="url"
          value={data.founderLinkedin}
          onChange={(e) => update({ founderLinkedin: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
          placeholder="https://linkedin.com/in/janesmith"
        />
      </div>
      <div>
        <label className="block text-[10px] text-[var(--text-muted)] mb-1">Team Size</label>
        <input
          type="number"
          min={1}
          value={data.teamSize}
          onChange={(e) => update({ teamSize: parseInt(e.target.value) || 1 })}
          className="w-32 px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
        />
        <p className="text-xs text-[var(--text-muted)] mt-1">Including yourself</p>
      </div>
    </div>
  );
}

function TractionStep({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-[var(--text-muted)] -mt-1 mb-4">
        Enter your current metrics. These directly affect your VultureScore. These directly affect your VultureScore.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Monthly Revenue (MRR)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
            <input
              type="number"
              min={0}
              value={data.mrr || ""}
              onChange={(e) => update({ mrr: parseFloat(e.target.value) || 0 })}
              className="w-full pl-7 pr-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Monthly Growth Rate</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={data.monthlyGrowth || ""}
              onChange={(e) => update({ monthlyGrowth: parseFloat(e.target.value) || 0 })}
              className="w-full pr-8 pl-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">%</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Active Users</label>
          <input
            type="number"
            min={0}
            value={data.activeUsers || ""}
            onChange={(e) => update({ activeUsers: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Paying Customers</label>
          <input
            type="number"
            min={0}
            value={data.customers || ""}
            onChange={(e) => update({ customers: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            placeholder="0"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Total Raised</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
            <input
              type="number"
              min={0}
              value={data.fundingRaised || ""}
              onChange={(e) => update({ fundingRaised: parseFloat(e.target.value) || 0 })}
              className="w-full pl-7 pr-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Monthly Burn</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
            <input
              type="number"
              min={0}
              value={data.burnRate || ""}
              onChange={(e) => update({ burnRate: parseFloat(e.target.value) || 0 })}
              className="w-full pl-7 pr-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Runway (months)</label>
          <input
            type="number"
            min={0}
            value={data.runwayMonths || ""}
            onChange={(e) => update({ runwayMonths: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}

function PitchStep({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-[var(--text-muted)] -mt-1 mb-4">
        These feed directly into your auto-generated pitch deck. The better the input, the better the deck.
      </p>
      <div>
        <label className="block text-[10px] text-[var(--text-muted)] mb-1">Problem</label>
        <textarea
          value={data.problem}
          onChange={(e) => update({ problem: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors resize-none"
          placeholder="What problem are you solving? Who experiences it? How painful is it?"
        />
      </div>
      <div>
        <label className="block text-[10px] text-[var(--text-muted)] mb-1">Solution</label>
        <textarea
          value={data.solution}
          onChange={(e) => update({ solution: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors resize-none"
          placeholder="How does your product solve this? What's unique about your approach?"
        />
      </div>
    </div>
  );
}
