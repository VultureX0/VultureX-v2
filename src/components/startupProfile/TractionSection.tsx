import { TrendingUp, Users, Building2, Flag } from 'lucide-react';
import type { StartupProfileData } from '../../data/startups';

type Props = { startup: StartupProfileData };

export default function TractionSection({ startup }: Props) {
  return (
    <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-white mb-6">Traction Metrics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#09091a] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Revenue</div>
          <div className="text-white font-semibold">{startup.revenue}</div>
        </div>
        <div className="bg-[#09091a] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <TrendingUp size={12} /> Monthly Growth
          </div>
          <div className="text-[#4ade80] font-semibold">+{startup.monthlyGrowthPercent}%</div>
        </div>
        <div className="bg-[#09091a] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Users size={12} /> Active Users
          </div>
          <div className="text-white font-semibold">{startup.activeUsers}</div>
        </div>
        <div className="bg-[#09091a] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Building2 size={12} /> Customers
          </div>
          <div className="text-white font-semibold">{startup.customers}</div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <Flag size={14} /> Key Milestones
        </h3>
        <ul className="space-y-3">
          {startup.milestones.map((m, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-xs text-gray-500 whitespace-nowrap">{m.date}</span>
              <span className="text-gray-300 text-sm">{m.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
