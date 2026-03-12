import { Users, Heart, Target } from 'lucide-react';
import type { StartupProfileData } from '../../types';

type Props = { startup: StartupProfileData };

export default function InvestorSignalsSection({ startup }: Props) {
  return (
    <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-white mb-6">Investor Signals</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {startup.investorsOnboard.length > 0 && (
          <div className="bg-[#09091a] rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Users size={12} /> Already onboard
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              {startup.investorsOnboard.map((inv, i) => (
                <li key={i}>{inv}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="bg-[#09091a] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Heart size={12} /> Interested investors
          </div>
          <div className="text-[#8b5cf6] font-bold text-xl">{startup.interestedInvestorsCount}</div>
        </div>
        {startup.matchScore != null && (
          <div className="bg-[#09091a] rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Target size={12} /> Match score
            </div>
            <div className="text-white font-bold text-xl">{startup.matchScore}</div>
            <div className="text-xs text-gray-500">out of 100</div>
          </div>
        )}
      </div>
    </section>
  );
}
