import { DollarSign } from 'lucide-react';
import type { StartupProfileData } from '../../types';

type Props = { startup: StartupProfileData };

export default function FinancialSection({ startup }: Props) {
  return (
    <section className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-[#111111] mb-4 flex items-center gap-2">
        <DollarSign size={20} className="text-[#4ade80]" />
        Financial Snapshot
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-[#f9f9f7] rounded-2xl p-4">
          <div className="text-xs text-gray-600 mb-1">Burn Rate</div>
          <div className="text-[#111111] font-semibold">{startup.burnRate}</div>
        </div>
        <div className="bg-[#f9f9f7] rounded-2xl p-4">
          <div className="text-xs text-gray-600 mb-1">Runway</div>
          <div className="text-[#111111] font-semibold">{startup.runway}</div>
        </div>
        <div className="bg-[#f9f9f7] rounded-2xl p-4 sm:col-span-1">
          <div className="text-xs text-gray-600 mb-1">Unit Economics</div>
          <div className="text-gray-700 text-sm">{startup.unitEconomics}</div>
        </div>
      </div>
    </section>
  );
}
