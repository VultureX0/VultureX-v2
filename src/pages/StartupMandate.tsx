import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, FileSignature, ShieldAlert } from 'lucide-react';
import { useStartupMandate } from '../context/StartupMandateContext';

type FormState = {
  founderName: string;
  startupName: string;
  workEmail: string;
  country: string;
  signatoryTitle: string;
  fundraisingRound: string;
  signature: string;
  acceptedExclusivity: boolean;
  acceptedSuccessFee: boolean;
  acceptedNonCircumvention: boolean;
  acceptedReporting: boolean;
};

const emptyForm: FormState = {
  founderName: '',
  startupName: '',
  workEmail: '',
  country: '',
  signatoryTitle: '',
  fundraisingRound: '',
  signature: '',
  acceptedExclusivity: false,
  acceptedSuccessFee: false,
  acceptedNonCircumvention: false,
  acceptedReporting: false,
};

export default function StartupMandate() {
  const navigate = useNavigate();
  const { mandate, signMandate } = useStartupMandate();
  const [form, setForm] = useState<FormState>(() =>
    mandate
      ? {
          founderName: mandate.founderName,
          startupName: mandate.startupName,
          workEmail: mandate.workEmail,
          country: mandate.country,
          signatoryTitle: mandate.signatoryTitle,
          fundraisingRound: mandate.fundraisingRound,
          signature: mandate.signature,
          acceptedExclusivity: mandate.acceptedExclusivity,
          acceptedSuccessFee: mandate.acceptedSuccessFee,
          acceptedNonCircumvention: mandate.acceptedNonCircumvention,
          acceptedReporting: mandate.acceptedReporting,
        }
      : emptyForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.founderName.trim()) nextErrors.founderName = 'Founder name is required';
    if (!form.startupName.trim()) nextErrors.startupName = 'Startup name is required';
    if (!form.workEmail.trim()) nextErrors.workEmail = 'Work email is required';
    if (!form.signature.trim()) nextErrors.signature = 'Typed signature is required';
    if (!form.acceptedExclusivity) nextErrors.acceptedExclusivity = 'You must accept the exclusivity clause';
    if (!form.acceptedSuccessFee) nextErrors.acceptedSuccessFee = 'You must accept the 3% success fee clause';
    if (!form.acceptedNonCircumvention) nextErrors.acceptedNonCircumvention = 'You must accept non-circumvention';
    if (!form.acceptedReporting) nextErrors.acceptedReporting = 'You must accept the reporting obligation';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    signMandate(form);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#ffffff]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <p className="text-sm text-gray-600 mb-2">Startup mandate</p>
          <h1 className="text-3xl font-bold text-[#111111]">Vulture X Exclusive Fundraising Mandate</h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            This mandate confirms that fundraising opportunities arising after your listing on Vulture X are
            handled through Vulture X on an exclusive basis, subject to the 3% success fee and non-circumvention terms below.
          </p>
        </div>

        {mandate && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-emerald-200">
            <div className="flex items-center gap-2 font-medium mb-1">
              <CheckCircle2 size={18} />
              Mandate already signed
            </div>
            <p className="text-sm text-emerald-100/80">
              Signed by `{mandate.founderName}` for `{mandate.startupName}` on{' '}
              {new Date(mandate.signedAt).toLocaleDateString()}.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <form onSubmit={handleSubmit} className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#d14343]">
              <FileSignature size={20} />
              <h2 className="text-lg font-semibold text-[#111111]">Signatory Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Founder / signatory name *</label>
                <input
                  value={form.founderName}
                  onChange={(e) => update({ founderName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f9f9f7] border border-[#e8e8e2] text-[#111111] focus:ring-2 focus:ring-[#d14343] focus:border-transparent"
                  placeholder="Aarya Mehta"
                />
                {errors.founderName && <p className="text-red-400 text-xs mt-1">{errors.founderName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Startup legal name *</label>
                <input
                  value={form.startupName}
                  onChange={(e) => update({ startupName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f9f9f7] border border-[#e8e8e2] text-[#111111] focus:ring-2 focus:ring-[#d14343] focus:border-transparent"
                  placeholder="Vulture X Labs Pvt Ltd"
                />
                {errors.startupName && <p className="text-red-400 text-xs mt-1">{errors.startupName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Work email *</label>
                <input
                  type="email"
                  value={form.workEmail}
                  onChange={(e) => update({ workEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f9f9f7] border border-[#e8e8e2] text-[#111111] focus:ring-2 focus:ring-[#d14343] focus:border-transparent"
                  placeholder="founder@startup.com"
                />
                {errors.workEmail && <p className="text-red-400 text-xs mt-1">{errors.workEmail}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country / jurisdiction</label>
                <input
                  value={form.country}
                  onChange={(e) => update({ country: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f9f9f7] border border-[#e8e8e2] text-[#111111] focus:ring-2 focus:ring-[#d14343] focus:border-transparent"
                  placeholder="India"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Signatory title</label>
                <input
                  value={form.signatoryTitle}
                  onChange={(e) => update({ signatoryTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f9f9f7] border border-[#e8e8e2] text-[#111111] focus:ring-2 focus:ring-[#d14343] focus:border-transparent"
                  placeholder="CEO / Founder"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current fundraising round</label>
                <input
                  value={form.fundraisingRound}
                  onChange={(e) => update({ fundraisingRound: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f9f9f7] border border-[#e8e8e2] text-[#111111] focus:ring-2 focus:ring-[#d14343] focus:border-transparent"
                  placeholder="Pre-seed / Seed / Series A"
                />
              </div>
            </div>

            <div className="border-t border-[#e8e8e2] pt-6 space-y-4">
              <h3 className="text-[#111111] font-semibold">Mandate confirmations</h3>
              <CheckboxRow
                checked={form.acceptedExclusivity}
                onChange={(checked) => update({ acceptedExclusivity: checked })}
                label="I appoint Vulture X as an exclusive mandate platform for investor introductions and fundraising opportunities arising after listing on the platform."
                error={errors.acceptedExclusivity}
              />
              <CheckboxRow
                checked={form.acceptedSuccessFee}
                onChange={(checked) => update({ acceptedSuccessFee: checked })}
                label="I agree that Vulture X is entitled to a 3% success fee on capital raised through introductions, access, or deal flow originating from Vulture X."
                error={errors.acceptedSuccessFee}
              />
              <CheckboxRow
                checked={form.acceptedNonCircumvention}
                onChange={(checked) => update({ acceptedNonCircumvention: checked })}
                label="I agree not to circumvent Vulture X by moving Vulture X-originated investor conversations off-platform in order to avoid the success fee."
                error={errors.acceptedNonCircumvention}
              />
              <CheckboxRow
                checked={form.acceptedReporting}
                onChange={(checked) => update({ acceptedReporting: checked })}
                label="I agree to report any signed term sheet, investment close, or capital receipt involving a Vulture X-introduced investor."
                error={errors.acceptedReporting}
              />
            </div>

            <div className="border-t border-[#e8e8e2] pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Typed signature *</label>
              <input
                value={form.signature}
                onChange={(e) => update({ signature: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f9f9f7] border border-[#e8e8e2] text-[#111111] focus:ring-2 focus:ring-[#d14343] focus:border-transparent"
                placeholder="Type your full name as signature"
              />
              {errors.signature && <p className="text-red-400 text-xs mt-1">{errors.signature}</p>}
              <p className="text-xs text-gray-600 mt-2">
                By signing, you confirm you are authorized to bind the startup to this mandate.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#d14343] to-[#b73535] text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity"
              >
                Sign mandate
              </button>
              <Link
                to="/for-startups"
                className="px-6 py-3 border border-[#e8e8e2] text-gray-700 rounded-2xl hover:text-[#111111] hover:border-[#d14343]/40 transition-all text-center"
              >
                Back to startup page
              </Link>
            </div>
          </form>

          <div className="space-y-6">
            <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6">
              <div className="flex items-center gap-2 text-amber-300 mb-3">
                <ShieldAlert size={18} />
                <h3 className="text-[#111111] font-semibold">Key commercial terms</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>Exclusive fundraising mandate for Vulture X-originated investor relationships.</li>
                <li>3% success fee on capital raised from Vulture X-sourced investors.</li>
                <li>Applies to direct introductions, gated deal room access, and platform-mediated negotiations.</li>
                <li>Founders must notify Vulture X of term sheets, closes, and capital receipt.</li>
              </ul>
            </div>

            <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6">
              <h3 className="text-[#111111] font-semibold mb-3">What investors will know</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Startups signed under this mandate can be marked as <span className="text-[#111111] font-medium">Exclusive to Vulture X</span>,
                signaling that fundraising conversations and closings are expected to be handled through the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  error?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[#e8e8e2] bg-[#f9f9f7] text-[#d14343] focus:ring-[#d14343]"
        />
        <span className="text-sm text-gray-700 leading-relaxed">{label}</span>
      </div>
      {error && <p className="text-red-400 text-xs mt-1 ml-7">{error}</p>}
    </label>
  );
}

