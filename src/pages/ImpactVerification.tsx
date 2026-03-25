import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Leaf } from 'lucide-react';
import { useImpactVerification } from '../context/ImpactVerificationContext';

const SDG_OPTIONS = [
  'SDG 1 - No Poverty',
  'SDG 2 - Zero Hunger',
  'SDG 3 - Good Health',
  'SDG 4 - Quality Education',
  'SDG 6 - Clean Water',
  'SDG 7 - Clean Energy',
  'SDG 8 - Decent Work',
  'SDG 9 - Innovation',
  'SDG 10 - Reduced Inequalities',
  'SDG 11 - Sustainable Cities',
  'SDG 12 - Responsible Consumption',
  'SDG 13 - Climate Action',
];

type FormState = {
  startupName: string;
  founderName: string;
  workEmail: string;
  sector: string;
  location: string;
  sdgs: string[];
  problem: string;
  impactModel: string;
  impactMetrics: string;
  evidence: string;
};

const emptyForm: FormState = {
  startupName: '',
  founderName: '',
  workEmail: '',
  sector: '',
  location: '',
  sdgs: [],
  problem: '',
  impactModel: '',
  impactMetrics: '',
  evidence: '',
};

export default function ImpactVerification() {
  const navigate = useNavigate();
  const { application, submitApplication } = useImpactVerification();
  const [form, setForm] = useState<FormState>(() =>
    application
      ? {
          startupName: application.startupName,
          founderName: application.founderName,
          workEmail: application.workEmail,
          sector: application.sector,
          location: application.location,
          sdgs: application.sdgs,
          problem: application.problem,
          impactModel: application.impactModel,
          impactMetrics: application.impactMetrics,
          evidence: application.evidence,
        }
      : emptyForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const toggleSdg = (sdg: string) => {
    update({
      sdgs: form.sdgs.includes(sdg) ? form.sdgs.filter((item) => item !== sdg) : [...form.sdgs, sdg],
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.startupName.trim()) nextErrors.startupName = 'Startup name is required';
    if (!form.founderName.trim()) nextErrors.founderName = 'Founder name is required';
    if (!form.workEmail.trim()) nextErrors.workEmail = 'Work email is required';
    if (!form.sdgs.length) nextErrors.sdgs = 'Select at least one SDG';
    if (!form.impactModel.trim()) nextErrors.impactModel = 'Explain how your startup creates measurable impact';
    if (!form.impactMetrics.trim()) nextErrors.impactMetrics = 'Add at least one impact metric';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    submitApplication(form);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#050511]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <p className="text-sm text-[#4ade80] font-medium mb-2">Impact Verification</p>
          <h1 className="text-3xl font-bold text-white">Apply for SDG Impact Verification</h1>
          <p className="text-gray-400 mt-2 max-w-3xl">
            Verified impact startups receive free Pro access, 0% success fee, and priority discovery in the impact investor layer.
          </p>
        </div>

        {application && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-emerald-200">
            <div className="flex items-center gap-2 font-medium mb-1">
              <CheckCircle2 size={18} />
              Application on file
            </div>
            <p className="text-sm text-emerald-100/80">
              Status: {application.status}. Submitted on {new Date(application.submittedAt).toLocaleDateString()}.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <form onSubmit={handleSubmit} className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Startup name *" error={errors.startupName}>
                <input value={form.startupName} onChange={(e) => update({ startupName: e.target.value })} className={inputClass} placeholder="SolarAI" />
              </Field>
              <Field label="Founder name *" error={errors.founderName}>
                <input value={form.founderName} onChange={(e) => update({ founderName: e.target.value })} className={inputClass} placeholder="Amina Okafor" />
              </Field>
              <Field label="Work email *" error={errors.workEmail}>
                <input type="email" value={form.workEmail} onChange={(e) => update({ workEmail: e.target.value })} className={inputClass} placeholder="founder@startup.com" />
              </Field>
              <Field label="Sector">
                <input value={form.sector} onChange={(e) => update({ sector: e.target.value })} className={inputClass} placeholder="CleanTech" />
              </Field>
              <Field label="Location">
                <input value={form.location} onChange={(e) => update({ location: e.target.value })} className={inputClass} placeholder="Nairobi, Kenya" />
              </Field>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Aligned SDGs *</label>
              <div className="flex flex-wrap gap-2">
                {SDG_OPTIONS.map((sdg) => (
                  <button
                    key={sdg}
                    type="button"
                    onClick={() => toggleSdg(sdg)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      form.sdgs.includes(sdg)
                        ? 'bg-[#4ade80]/10 border-[#4ade80]/40 text-white'
                        : 'bg-[#09091a] border-[#1c1c3a] text-gray-400 hover:text-white'
                    }`}
                  >
                    {sdg}
                  </button>
                ))}
              </div>
              {errors.sdgs && <p className="text-red-400 text-xs mt-1">{errors.sdgs}</p>}
            </div>

            <Field label="Problem you are solving">
              <textarea value={form.problem} onChange={(e) => update({ problem: e.target.value })} rows={3} className={textareaClass} placeholder="What systemic issue are you addressing?" />
            </Field>

            <Field label="How your startup creates measurable impact *" error={errors.impactModel}>
              <textarea value={form.impactModel} onChange={(e) => update({ impactModel: e.target.value })} rows={4} className={textareaClass} placeholder="Explain the causal link between your product and real social or environmental outcomes." />
            </Field>

            <Field label="Impact metrics *" error={errors.impactMetrics}>
              <textarea value={form.impactMetrics} onChange={(e) => update({ impactMetrics: e.target.value })} rows={4} className={textareaClass} placeholder="Example: households electrified, CO2 reduced, farmers onboarded, low-income users reached." />
            </Field>

            <Field label="Supporting evidence / links">
              <textarea value={form.evidence} onChange={(e) => update({ evidence: e.target.value })} rows={3} className={textareaClass} placeholder="Pilot results, certifications, grants, NGO partnerships, impact reports, or relevant links." />
            </Field>

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" className="px-6 py-3 bg-[#4ade80] text-black font-semibold rounded-xl hover:bg-[#22c55e] transition-colors">
                Submit for verification
              </button>
              <Link to="/impact" className="px-6 py-3 border border-[#1c1c3a] text-gray-300 rounded-xl hover:text-white hover:border-[#4ade80]/40 transition-all text-center">
                Back to impact page
              </Link>
            </div>
          </form>

          <div className="space-y-6">
            <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
              <div className="flex items-center gap-2 text-[#4ade80] mb-3">
                <Leaf size={18} />
                <h3 className="text-white font-semibold">What we review</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>Clear SDG alignment and measurable outcomes</li>
                <li>Evidence that impact is core to the business model</li>
                <li>Metrics you can report over time</li>
                <li>Whether impact claims are credible and specific</li>
              </ul>
            </div>

            <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-3">Benefits if approved</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>0% success fee on platform-originated fundraising</li>
                <li>Free Pro subscription</li>
                <li>Impact badge on your startup profile</li>
                <li>Inclusion in impact-focused investor discovery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#4ade80] focus:border-transparent';

const textareaClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-[#09091a] border border-[#1c1c3a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#4ade80] focus:border-transparent resize-none';

