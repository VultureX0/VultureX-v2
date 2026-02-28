import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvestor, defaultProfile, type InvestorProfile, type InvestorType } from '../context/InvestorContext';
import { User, Building2, Target, FileText } from 'lucide-react';

const SECTORS = ['SaaS', 'Fintech', 'AI', 'Healthtech', 'Web3', 'Consumer', 'DeepTech', 'CleanTech', 'EdTech', 'AgriTech', 'Impact'];
const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+'];

export default function InvestorOnboarding() {
  const navigate = useNavigate();
  const { setProfile } = useInvestor();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<InvestorProfile>(defaultProfile);

  const update = (patch: Partial<InvestorProfile>) => setForm((f) => ({ ...f, ...patch }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.fullName?.trim()) e.fullName = 'Full name is required';
    if (!form.email?.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.investorType === 'vc' && !form.firmName?.trim()) e.firmName = 'Firm name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setProfile(form);
    navigate('/investor-dashboard', { replace: true });
  };

  const toggleSector = (s: string) => {
    const next = form.preferredSectors.includes(s)
      ? form.preferredSectors.filter((x) => x !== s)
      : [...form.preferredSectors, s];
    update({ preferredSectors: next });
  };

  const toggleStage = (s: string) => {
    const next = form.stageFocus.includes(s)
      ? form.stageFocus.filter((x) => x !== s)
      : [...form.stageFocus, s];
    update({ stageFocus: next });
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#050511]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Investor Onboarding</h1>
          <p className="text-gray-400 mt-1">Complete your profile to access deal flow and recommendations.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1: Basic Info */}
          <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#60a5fa] mb-6">
              <User size={20} />
              <h2 className="text-lg font-semibold text-white">Basic Info</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                <input
                  value={form.fullName}
                  onChange={(e) => update({ fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent"
                  placeholder="Jane Smith"
                />
                {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent"
                  placeholder="jane@example.com"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">LinkedIn Profile</label>
                <input
                  type="url"
                  value={form.linkedIn}
                  onChange={(e) => update({ linkedIn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => update({ location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Investor Type */}
          <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#60a5fa] mb-6">
              <Building2 size={20} />
              <h2 className="text-lg font-semibold text-white">Investor Type</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {(
                [
                  { id: 'vc' as InvestorType, label: 'Venture Capital / Investment Firm' },
                  { id: 'angel' as InvestorType, label: 'Angel Investor' },
                  { id: 'family_office' as InvestorType, label: 'Family Office' },
                  { id: 'corporate_vc' as InvestorType, label: 'Corporate VC' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => update({ investorType: id })}
                  className={`px-4 py-3 rounded-xl text-left text-sm border transition-all ${
                    form.investorType === id
                      ? 'bg-[#60a5fa]/10 border-[#60a5fa]/40 text-white'
                      : 'bg-[#09091a] border-[#1c1c3a] text-gray-400 hover:text-white hover:border-[#2d2d50]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {form.investorType === 'vc' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-[#1c1c3a]">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Firm Name *</label>
                  <input
                    value={form.firmName}
                    onChange={(e) => update({ firmName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent"
                    placeholder="Acme Ventures"
                  />
                  {errors.firmName && <p className="text-red-400 text-xs mt-1">{errors.firmName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Website</label>
                  <input
                    type="url"
                    value={form.firmWebsite}
                    onChange={(e) => update({ firmWebsite: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Fund Size</label>
                  <input
                    value={form.fundSize}
                    onChange={(e) => update({ fundSize: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent"
                    placeholder="e.g. $50M"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stage Focus</label>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleStage(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          form.stageFocus.includes(s)
                            ? 'bg-[#60a5fa]/10 border-[#60a5fa]/40 text-white'
                            : 'bg-[#09091a] border-[#1c1c3a] text-gray-400 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {form.investorType === 'angel' && (
              <div className="pt-4 border-t border-[#1c1c3a] space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-300">Investing as Individual?</span>
                  <button
                    type="button"
                    onClick={() => update({ investingAsIndividual: !form.investingAsIndividual })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.investingAsIndividual ? 'bg-[#60a5fa]' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.investingAsIndividual ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-500">{form.investingAsIndividual ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Syndicate Member (optional)</label>
                  <input
                    value={form.syndicateMember}
                    onChange={(e) => update({ syndicateMember: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent"
                    placeholder="e.g. AngelList syndicate name"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Investment Preferences */}
          <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#60a5fa] mb-6">
              <Target size={20} />
              <h2 className="text-lg font-semibold text-white">Investment Preferences</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Typical Check Size (USD)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    value={form.checkSizeMin || ''}
                    onChange={(e) => update({ checkSizeMin: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent"
                    placeholder="Min (e.g. 25)"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    min={0}
                    value={form.checkSizeMax || ''}
                    onChange={(e) => update({ checkSizeMax: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent"
                    placeholder="Max (e.g. 500)"
                  />
                  <span className="text-gray-500 text-sm whitespace-nowrap">(K)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Sectors</label>
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSector(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                        form.preferredSectors.includes(s)
                          ? 'bg-[#60a5fa]/10 border-[#60a5fa]/40 text-white'
                          : 'bg-[#09091a] border-[#1c1c3a] text-gray-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Geography Focus</label>
                <input
                  value={form.geographyFocus}
                  onChange={(e) => update({ geographyFocus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent"
                  placeholder="e.g. North America, Europe, Global"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Portfolio Companies (optional)</label>
                <textarea
                  value={form.portfolioCompanies}
                  onChange={(e) => update({ portfolioCompanies: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent resize-none"
                  placeholder="List or describe current/prior portfolio companies"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Additional Details */}
          <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#60a5fa] mb-6">
              <FileText size={20} />
              <h2 className="text-lg font-semibold text-white">Additional Details</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Investment Thesis</label>
                <textarea
                  value={form.investmentThesis}
                  onChange={(e) => update({ investmentThesis: e.target.value })}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent resize-none"
                  placeholder="Describe your investment focus and criteria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Looking to</label>
                <div className="flex flex-wrap gap-3">
                  {(['lead', 'co_invest', 'passive'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => update({ lookingTo: opt })}
                      className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                        form.lookingTo === opt
                          ? 'bg-[#60a5fa]/10 border-[#60a5fa]/40 text-white'
                          : 'bg-[#09091a] border-[#1c1c3a] text-gray-400 hover:text-white'
                      }`}
                    >
                      {opt === 'lead' ? 'Lead' : opt === 'co_invest' ? 'Co-invest' : 'Passive'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">Open to cold pitches?</span>
                <button
                  type="button"
                  onClick={() => update({ openToColdPitches: !form.openToColdPitches })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.openToColdPitches ? 'bg-[#60a5fa]' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.openToColdPitches ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-500">{form.openToColdPitches ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Complete Onboarding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
