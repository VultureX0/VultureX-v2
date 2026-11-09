"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, User, Building2, Link2, Mail, Sparkles, Globe2 } from "lucide-react";
import { SdgPicker } from "@/components/sdg/SdgPicker";
import { ImpactVerificationCard } from "@/components/sdg/ImpactVerificationCard";
import type { ImpactStatus } from "@/features/sdg/status";

type UserProps = { id: string; email: string; name: string | null; role: string };
type StartupProps = { name: string; tagline: string | null; sector: string; stage: string; location: string | null; website: string | null; founderName: string | null; founderRole: string | null; founderBio: string | null; founderLinkedin: string | null; tags: string[] | null; offerings: string[] | null; needs: string[] | null; targetCustomers: string[] | null; sdgGoals: number[]; sdgPrimary: number | null; impactDescription: string | null } | null;
type InvestorProps = { fullName: string; firmName: string | null; investorType: string; location: string | null; linkedin: string | null; sectorFocus: string[] | null; stageFocus: string[] | null; investmentThesis: string | null; sdgPreferences: number[] } | null;
type ImpactProps = {
  status: ImpactStatus;
  reviewNote: string | null;
  submittedAt: string | null;
  successFee: { eligible: boolean; label: string; reason: string };
} | null;
type Status = "idle" | "loading" | "success" | "error";

export function SettingsClient({ user, startup, investor, impact }: { user: UserProps; startup: StartupProps; investor: InvestorProps; impact: ImpactProps }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const startupInitial = {
    name: startup?.name ?? "", tagline: startup?.tagline ?? "", sector: startup?.sector ?? "",
    stage: startup?.stage ?? "", location: startup?.location ?? "", website: startup?.website ?? "",
    founderName: startup?.founderName ?? "", founderRole: startup?.founderRole ?? "",
    founderBio: startup?.founderBio ?? "", founderLinkedin: startup?.founderLinkedin ?? "",
    tags: startup?.tags?.join(", ") ?? "",
    offerings: startup?.offerings?.join(", ") ?? "",
    needs: startup?.needs?.join(", ") ?? "",
    targetCustomers: startup?.targetCustomers?.join(", ") ?? "",
    sdgGoals: startup?.sdgGoals ?? [],
    sdgPrimary: startup?.sdgPrimary ?? null,
    impactDescription: startup?.impactDescription ?? "",
  };

  const investorInitial = {
    fullName: investor?.fullName ?? "", firmName: investor?.firmName ?? "",
    investorType: investor?.investorType ?? "", location: investor?.location ?? "",
    linkedin: investor?.linkedin ?? "", sectorFocus: investor?.sectorFocus?.join(", ") ?? "",
    stageFocus: investor?.stageFocus?.join(", ") ?? "", investmentThesis: investor?.investmentThesis ?? "",
    sdgPreferences: investor?.sdgPreferences ?? [],
  };

  const [startupForm, setStartupForm] = useState(startupInitial);
  const [investorForm, setInvestorForm] = useState(investorInitial);
  // Baseline updated after a successful save so the form (and the impact
  // verification action) become clean without a page reload.
  const [savedStartupForm, setSavedStartupForm] = useState(startupInitial);
  const [savedInvestorForm, setSavedInvestorForm] = useState(investorInitial);

  const startupDirty = JSON.stringify(startupForm) !== JSON.stringify(savedStartupForm);
  const isDirty = user.role === "startup"
    ? startupDirty
    : JSON.stringify(investorForm) !== JSON.stringify(savedInvestorForm);

  const save = async () => {
    setStatus("loading");
    setError(null);
    try {
      const endpoint = user.role === "startup" ? "/api/startups" : "/api/investors";
      const body = user.role === "startup"
        ? {
            ...startupForm,
            tags: startupForm.tags.split(",").map(t => t.trim()).filter(Boolean),
            offerings: startupForm.offerings.split(",").map(t => t.trim()).filter(Boolean),
            needs: startupForm.needs.split(",").map(t => t.trim()).filter(Boolean),
            targetCustomers: startupForm.targetCustomers.split(",").map(t => t.trim()).filter(Boolean),
            sdgGoals: startupForm.sdgGoals,
            sdgPrimary: startupForm.sdgPrimary,
            impactDescription: startupForm.impactDescription,
          }
        : {
            ...investorForm,
            sectorFocus: investorForm.sectorFocus.split(",").map(s => s.trim()).filter(Boolean),
            stageFocus: investorForm.stageFocus.split(",").map(s => s.trim()).filter(Boolean),
            sdgPreferences: investorForm.sdgPreferences,
          };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setSavedStartupForm(startupForm);
      setSavedInvestorForm(investorForm);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) { setStatus("error"); setError(e instanceof Error ? e.message : "Something went wrong"); }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-xl font-semibold mb-1">Settings</h1>
        <p className="text-xs text-[var(--text-muted)] mb-8">Manage your account and profile.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left sidebar - account info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-4">

          {/* Account card */}
          <div className="rounded-xl border border-[var(--border)] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-sm font-bold text-[var(--text-muted)]">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{user.name || "-"}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2.5 text-xs">
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={User} label="Role" value={user.role} />
            </div>
          </div>

          {/* Integrations - coming later */}

          {/* Save button */}
          <button onClick={save} disabled={status === "loading" || !isDirty}
            className="w-full py-2.5 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {status === "loading" ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : isDirty ? "Save changes" : "No changes"}
          </button>
          {status === "success" && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-[var(--green)] flex items-center gap-1 justify-center">
              <CheckCircle size={10} /> Saved successfully
            </motion.p>
          )}
          {status === "error" && error && (
            <p className="text-[10px] text-[var(--red)] text-center">{error}</p>
          )}
        </motion.div>

        {/* Right - profile form */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2">

          {user.role === "startup" && startup && (
            <div className="rounded-xl border border-[var(--border)] p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={14} className="text-[var(--accent)]" />
                <p className="text-sm font-medium">Startup profile</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Company name" value={startupForm.name} onChange={v => setStartupForm(f => ({ ...f, name: v }))} />
                <Field label="Tagline" value={startupForm.tagline} onChange={v => setStartupForm(f => ({ ...f, tagline: v }))} placeholder="What you do in one line" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Sector" value={startupForm.sector} onChange={v => setStartupForm(f => ({ ...f, sector: v }))} />
                <Field label="Stage" value={startupForm.stage} onChange={v => setStartupForm(f => ({ ...f, stage: v }))} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Location" value={startupForm.location} onChange={v => setStartupForm(f => ({ ...f, location: v }))} placeholder="City, Country" />
                <Field label="Website" value={startupForm.website} onChange={v => setStartupForm(f => ({ ...f, website: v }))} placeholder="https://..." />
              </div>

              <div className="border-t border-[var(--border)] pt-5 mt-5">
                <div className="flex items-center gap-2 mb-4">
                  <User size={14} className="text-[var(--accent)]" />
                  <p className="text-sm font-medium">Founder</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Name" value={startupForm.founderName} onChange={v => setStartupForm(f => ({ ...f, founderName: v }))} />
                  <Field label="Role" value={startupForm.founderRole} onChange={v => setStartupForm(f => ({ ...f, founderRole: v }))} placeholder="CEO & Co-Founder" />
                </div>
                <div className="mt-4">
                  <Field label="LinkedIn" value={startupForm.founderLinkedin} onChange={v => setStartupForm(f => ({ ...f, founderLinkedin: v }))} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="mt-4">
                  <TextareaField label="Bio" value={startupForm.founderBio} onChange={v => setStartupForm(f => ({ ...f, founderBio: v }))} placeholder="Background and why you're building this" />
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-5 mt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Link2 size={14} className="text-[var(--accent)]" />
                  <p className="text-sm font-medium">Discovery</p>
                </div>
                <Field label="Tags" value={startupForm.tags} onChange={v => setStartupForm(f => ({ ...f, tags: v }))} placeholder="ai, saas, b2b (comma-separated)" />
              </div>

              <div className="border-t border-[var(--border)] pt-5 mt-5">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-[var(--accent)]" />
                  <p className="text-sm font-medium">Business connections</p>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mb-4">
                  Optional. Used to recommend startups that could buy from you, supply you, or partner with you.
                </p>
                <div className="space-y-4">
                  <Field label="What you offer" value={startupForm.offerings} onChange={v => setStartupForm(f => ({ ...f, offerings: v }))} placeholder="sustainable packaging, labels (comma-separated)" />
                  <Field label="What you need" value={startupForm.needs} onChange={v => setStartupForm(f => ({ ...f, needs: v }))} placeholder="logistics, distribution (comma-separated)" />
                  <Field label="Target customers" value={startupForm.targetCustomers} onChange={v => setStartupForm(f => ({ ...f, targetCustomers: v }))} placeholder="food brands, retailers, consumers (comma-separated)" />
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-5 mt-5">
                <div className="flex items-center gap-2 mb-1">
                  <Globe2 size={14} className="text-[var(--accent)]" />
                  <p className="text-sm font-medium">Sustainable Development Goals</p>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mb-4">
                  Optional. Used in Explore filters, SDG rankings and impact review. Existing profiles stay valid with no goals selected.
                </p>
                <SdgPicker
                  value={startupForm.sdgGoals}
                  primary={startupForm.sdgPrimary}
                  onChange={(sdgGoals, sdgPrimary) => setStartupForm(f => ({ ...f, sdgGoals, sdgPrimary }))}
                />
                <div className="mt-4">
                  <TextareaField
                    label="Impact description (optional)"
                    value={startupForm.impactDescription}
                    onChange={v => setStartupForm(f => ({ ...f, impactDescription: v }))}
                    placeholder="Describe the measurable impact your business creates for the goals you selected. Avoid claims you cannot support."
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Required only if you request admin verification. Never presented as a verified outcome until approved.
                  </p>
                </div>
                {impact && (
                  <div className="mt-4">
                    <ImpactVerificationCard
                      status={impact.status}
                      reviewNote={impact.reviewNote}
                      submittedAt={impact.submittedAt}
                      successFee={impact.successFee}
                      hasGoals={startupForm.sdgGoals.length > 0}
                      descriptionLength={startupForm.impactDescription.trim().length}
                      dirty={startupDirty}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {user.role === "investor" && investor && (
            <div className="rounded-xl border border-[var(--border)] p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <User size={14} className="text-[var(--accent)]" />
                <p className="text-sm font-medium">Investor profile</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" value={investorForm.fullName} onChange={v => setInvestorForm(f => ({ ...f, fullName: v }))} />
                <Field label="Firm name" value={investorForm.firmName} onChange={v => setInvestorForm(f => ({ ...f, firmName: v }))} placeholder="Optional" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Type" value={investorForm.investorType} onChange={v => setInvestorForm(f => ({ ...f, investorType: v }))} placeholder="vc, angel, family_office" />
                <Field label="Location" value={investorForm.location} onChange={v => setInvestorForm(f => ({ ...f, location: v }))} />
              </div>
              <Field label="LinkedIn" value={investorForm.linkedin} onChange={v => setInvestorForm(f => ({ ...f, linkedin: v }))} placeholder="https://linkedin.com/in/..." />
              <Field label="Sector focus" value={investorForm.sectorFocus} onChange={v => setInvestorForm(f => ({ ...f, sectorFocus: v }))} placeholder="ai, fintech, climate (comma-separated)" />
              <Field label="Stage focus" value={investorForm.stageFocus} onChange={v => setInvestorForm(f => ({ ...f, stageFocus: v }))} placeholder="pre-seed, seed (comma-separated)" />
              <TextareaField label="Investment thesis" value={investorForm.investmentThesis} onChange={v => setInvestorForm(f => ({ ...f, investmentThesis: v }))} placeholder="What you look for in startups" />

              <div className="border-t border-[var(--border)] pt-5 mt-5">
                <div className="flex items-center gap-2 mb-1">
                  <Globe2 size={14} className="text-[var(--accent)]" />
                  <p className="text-sm font-medium">Impact interests</p>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mb-4">
                  Optional. Used to surface SDG-aligned startups in Explore. These goals express interest, not a commitment to invest.
                </p>
                <SdgPicker
                  value={investorForm.sdgPreferences}
                  primary={null}
                  onChange={(sdgPreferences) => setInvestorForm(f => ({ ...f, sdgPreferences }))}
                  hideHint
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[10px] text-[var(--text-muted)] mb-1">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors" />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[10px] text-[var(--text-muted)] mb-1">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors resize-none" />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <Icon size={11} />
        <span>{label}</span>
      </div>
      <span className="text-[var(--text-secondary)] font-medium capitalize">{value}</span>
    </div>
  );
}
