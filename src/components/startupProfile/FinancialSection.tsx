import { DollarSign } from 'lucide-react';
import type { StartupProfileData } from '../../data/startups';

type Props = { startup: StartupProfileData };

export default function FinancialSection({ startup }: Props) {
  return (
    <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <DollarSign size={20} className="text-[#4ade80]" />
        Financial Snapshot
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-[#09091a] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Burn Rate</div>
          <div className="text-white font-semibold">{startup.burnRate}</div>
        </div>
        <div className="bg-[#09091a] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Runway</div>
          <div className="text-white font-semibold">{startup.runway}</div>
        </div>
        <div className="bg-[#09091a] rounded-xl p-4 sm:col-span-1">
          <div className="text-xs text-gray-500 mb-1">Unit Economics</div>
          <div className="text-gray-300 text-sm">{startup.unitEconomics}</div>
        </div>
      </div>
    </section>
  );
}
