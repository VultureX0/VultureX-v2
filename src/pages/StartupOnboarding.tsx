import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../features/startups';
import type { UserStartupProfile, Founder } from '../types';
import { defaultUserStartupProfile } from '../types';
import { Building2, User, BarChart3, DollarSign, FileText, Plus, X, Loader2 } from 'lucide-react';

const SECTORS = ['SaaS', 'Fintech', 'AI', 'Healthtech', 'Web3', 'Consumer', 'DeepTech', 'CleanTech', 'EdTech', 'AgriTech', 'Impact'];
const STAGES = ['Idea', 'MVP', 'Revenue', 'Scaling'];

export default function StartupOnboarding() {
  const navigate = useNavigate();
  const { profile: existing, isLoading, setProfile } = useStartup();
  const [form, setForm] = useState<UserStartupProfile>(existing ?? defaultUserStartupProfile);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [hydrated, setHydrated] = useState(!isLoading);

  // Sync form state when the existing profile finishes loading (edit mode)
  useEffect(() => {
    if (!isLoading && existing && !hydrated) {
      setForm(existing);
      setHydrated(true);
    } else if (!isLoading) {
      setHydrated(true);
    }
  }, [isLoading, existing, hydrated]);

  const update = (patch: Partial<UserStartupProfile>) => setForm((f) => ({ ...f, ...patch }));

  const addTeamMember = () =>
    update({ team: [...form.team, { name: '', role: '', linkedIn: '', bio: '' }] });

  const updateTeamMember = (idx: number, patch: Partial<Founder>) =>
    update({ team: form.team.map((m, i) => (i === idx ? { ...m, ...patch } : m)) });

  const removeTeamMember = (idx: number) =>
    update({ team: form.team.filter((_, i) => i !== idx) });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSubmitting(true);
    try {
      await setProfile(form);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setSaveError('Could not save your profile. Your changes are saved locally — please try again later.');
    } finally {
      setSubmitting(false);
    }
    // Navigate regardless — optimistic state + localStorage are already set
    navigate('/dashboard', { replace: true });
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen pt-20 bg-[#050511] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
      </div>
    );
  }

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-all';

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#050511]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            {existing ? 'Edit Startup Profile' : 'Startup Onboarding'}
          </h1>
          <p className="text-gray-400 mt-1">
            {existing
              ? 'Update your startup details.'
              : 'Tell us about your startup. You can always update this later.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1: Company Info */}
          <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#8b5cf6] mb-6">
              <Building2 size={20} />
              <h2 className="text-lg font-semibold text-white">Company Info</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Name *</label>
                <input
                  required
                  value={form.companyName}
                  onChange={(e) => update({ companyName: e.target.value })}
                  className={inputClass}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Tagline</label>
                <input
                  value={form.tagline}
                  onChange={(e) => update({ tagline: e.target.value })}
                  className={inputClass}
                  placeholder="One-liner about what you do"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Sector *</label>
                <select
                  required
                  value={form.sector}
                  onChange={(e) => update({ sector: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select sector</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Stage *</label>
                <select
                  required
                  value={form.stage}
                  onChange={(e) => update({ stage: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select stage</option>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => update({ location: e.target.value })}
                  className={inputClass}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => update({ website: e.target.value })}
                  className={inputClass}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Founder */}
          <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#8b5cf6] mb-6">
              <User size={20} />
              <h2 className="text-lg font-semibold text-white">Founder</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                <input
                  required
                  value={form.founderName}
                  onChange={(e) => update({ founderName: e.target.value })}
                  className={inputClass}
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
                <input
                  value={form.founderRole}
                  onChange={(e) => update({ founderRole: e.target.value })}
                  className={inputClass}
                  placeholder="CEO & Co-founder"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Short Bio</label>
                <textarea
                  value={form.founderBio}
                  onChange={(e) => update({ founderBio: e.target.value })}
                  className={inputClass + ' min-h-[80px] resize-y'}
                  placeholder="Brief background..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">LinkedIn</label>
                <input
                  type="url"
                  value={form.founderLinkedIn}
                  onChange={(e) => update({ founderLinkedIn: e.target.value })}
                  className={inputClass}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </section>

          {/* Section 3: Team */}
          <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-[#8b5cf6]">
                <User size={20} />
                <h2 className="text-lg font-semibold text-white">Team Members</h2>
              </div>
              <button
                type="button"
                onClick={addTeamMember}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#c4b5fd] hover:bg-[#8b5cf6]/20 transition-colors"
              >
                <Plus size={14} /> Add Member
              </button>
            </div>
            {form.team.length === 0 && (
              <p className="text-sm text-gray-500">No team members added yet. Click "Add Member" above.</p>
            )}
            <div className="space-y-4">
              {form.team.map((member, idx) => (
                <div key={idx} className="relative bg-[#09091a] rounded-xl p-4 border border-[#1c1c3a]">
                  <button
                    type="button"
                    onClick={() => removeTeamMember(idx)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      value={member.name}
                      onChange={(e) => updateTeamMember(idx, { name: e.target.value })}
                      className={inputClass}
                      placeholder="Name"
                    />
                    <input
                      value={member.role}
                      onChange={(e) => updateTeamMember(idx, { role: e.target.value })}
                      className={inputClass}
                      placeholder="Role"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Traction */}
          <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#8b5cf6] mb-6">
              <BarChart3 size={20} />
              <h2 className="text-lg font-semibold text-white">Traction</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">MRR</label>
                <input
                  value={form.mrr}
                  onChange={(e) => update({ mrr: e.target.value })}
                  className={inputClass}
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Active Users</label>
                <input
                  value={form.activeUsers}
                  onChange={(e) => update({ activeUsers: e.target.value })}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Customers</label>
                <input
                  value={form.customers}
                  onChange={(e) => update({ customers: e.target.value })}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Monthly Growth %</label>
                <input
                  value={form.monthlyGrowthPercent}
                  onChange={(e) => update({ monthlyGrowthPercent: e.target.value })}
                  className={inputClass}
                  placeholder="0%"
                />
              </div>
            </div>
          </section>

          {/* Section 5: Financials */}
          <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-emerald-400 mb-6">
              <DollarSign size={20} />
              <h2 className="text-lg font-semibold text-white">Financials</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Funding Raised</label>
                <input
                  value={form.fundingRaised}
                  onChange={(e) => update({ fundingRaised: e.target.value })}
                  className={inputClass}
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Runway</label>
                <input
                  value={form.runway}
                  onChange={(e) => update({ runway: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 18 months"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Monthly Burn Rate</label>
                <input
                  value={form.burnRate}
                  onChange={(e) => update({ burnRate: e.target.value })}
                  className={inputClass}
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Cash in Bank</label>
                <input
                  value={form.cashInBank}
                  onChange={(e) => update({ cashInBank: e.target.value })}
                  className={inputClass}
                  placeholder="$0"
                />
              </div>
            </div>
          </section>

          {/* Section 6: Pitch */}
          <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#8b5cf6] mb-6">
              <FileText size={20} />
              <h2 className="text-lg font-semibold text-white">Pitch</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Problem Statement</label>
                <textarea
                  value={form.problemStatement}
                  onChange={(e) => update({ problemStatement: e.target.value })}
                  className={inputClass + ' min-h-[80px] resize-y'}
                  placeholder="What problem are you solving?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Solution</label>
                <textarea
                  value={form.solutionDescription}
                  onChange={(e) => update({ solutionDescription: e.target.value })}
                  className={inputClass + ' min-h-[80px] resize-y'}
                  placeholder="How does your product solve this?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Pitch Deck URL</label>
                <input
                  type="url"
                  value={form.pitchDeckUrl}
                  onChange={(e) => update({ pitchDeckUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://docs.google.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Demo Video URL</label>
                <input
                  type="url"
                  value={form.demoVideoUrl}
                  onChange={(e) => update({ demoVideoUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </section>

          {saveError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
              {saveError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white hover:opacity-90 transition-all disabled:opacity-50"
          >
            {submitting ? 'Saving...' : existing ? 'Save Changes' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
