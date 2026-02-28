import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight, CheckCircle } from 'lucide-react';

const tabs = ['Active', 'Upcoming', 'Past Winners', 'Host a Competition'];

const active = [
  {
    title: 'Climate Innovation Challenge',
    host: 'GreenCapital Ventures',
    prize: '$50,000 + 6-month mentorship',
    deadline: 'March 15, 2026',
    sector: 'CleanTech',
    stage: 'Idea/MVP',
    applicants: 234,
    criteria: ['Innovation (30%)', 'Feasibility (25%)', 'Impact (25%)', 'Scalability (20%)'],
    color: 'from-[#4ade80] to-[#22c55e]',
    sdg: true,
  },
  {
    title: 'Web3 Founders Sprint',
    host: 'Apex Web3 Fund',
    prize: '$30,000 + Pilot Partnership',
    deadline: 'March 8, 2026',
    sector: 'Web3',
    stage: 'Idea/MVP',
    applicants: 178,
    criteria: ['Technical Innovation (35%)', 'Market Potential (30%)', 'Team (20%)', 'Traction (15%)'],
    color: 'from-[#60a5fa] to-[#a78bfa]',
    sdg: false,
  },
  {
    title: 'SaaS Product Showdown',
    host: 'Horizon VC',
    prize: '$25,000 + Investor Visibility',
    deadline: 'March 22, 2026',
    sector: 'SaaS',
    stage: 'MVP/Revenue',
    applicants: 312,
    criteria: ['Product Quality (30%)', 'Revenue Growth (30%)', 'Market Size (20%)', 'Team (20%)'],
    color: 'from-[#8b5cf6] to-[#7c3aed]',
    sdg: false,
  },
  {
    title: 'Impact Startup Challenge',
    host: 'UN SDG Capital',
    prize: '$40,000 + 0% Success Fee',
    deadline: 'April 1, 2026',
    sector: 'Any (SDG-aligned)',
    stage: 'All Stages',
    applicants: 156,
    criteria: ['SDG Impact (40%)', 'Innovation (25%)', 'Scalability (20%)', 'Team (15%)'],
    color: 'from-[#34d399] to-[#059669]',
    sdg: true,
  },
];

const upcoming = [
  { title: 'FinTech Revolution Cup', host: 'BankTech Fund', prize: '$35K + Pilot', date: 'Opens April 15, 2026', sector: 'FinTech', color: 'from-[#a78bfa] to-[#f59e0b]' },
  { title: 'HealthTech Innovation Award', host: 'MedVentures', prize: '$45K + Hospital Partnership', date: 'Opens May 1, 2026', sector: 'HealthTech', color: 'from-[#f472b6] to-[#ec4899]' },
  { title: 'Student Founders Challenge', host: 'University Alliance Fund', prize: '$20K + Incubation', date: 'Opens April 20, 2026', sector: 'All Sectors', color: 'from-[#a78bfa] to-[#7c3aed]' },
];

const pastWinners = [
  { competition: 'AgriTech Africa Cup 2025', winner: 'AgriSense', prize: '$40K', raised: '$8.2M since', sector: 'AgriTech' },
  { competition: 'DeepTech Summit 2025', winner: 'NeuralPay', prize: '$30K', raised: '$5.4M since', sector: 'FinTech' },
  { competition: 'SDG Founders Pitch 2024', winner: 'SolarAI', prize: '$25K', raised: '$2.1M since', sector: 'CleanTech' },
  { competition: 'Web3 Build Sprint 2024', winner: 'ChainVault', prize: '$20K', raised: '$1.5M since', sector: 'Web3' },
  { competition: 'SaaS Growth Challenge 2024', winner: 'CodeStream', prize: '$35K', raised: '$3.6M since', sector: 'SaaS' },
];

export default function Competitions() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen pt-20">
      <div className="bg-[#09091a] border-b border-[#1c1c3a] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-2">🏆 Challenges</div>
          <h1 className="text-4xl font-bold text-white mb-2">Competitions</h1>
          <p className="text-gray-400">Themed startup challenges. Win prizes, earn badges, boost your ranking, and get in front of serious investors.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#1c1c3a] pb-4">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2 rounded-xl text-sm font-medium border transition-all ${
                activeTab === i
                  ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#8b5cf6]'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Active Competitions */}
        {activeTab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {active.map((comp) => (
              <div key={comp.title} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-7 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className={`inline-block px-3 py-1 text-xs font-semibold bg-gradient-to-r ${comp.color} text-black rounded-full mb-2`}>
                      {comp.sector}
                    </div>
                    <h3 className="text-xl font-bold text-white">{comp.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">Hosted by {comp.host}</p>
                  </div>
                  {comp.sdg && <span className="px-2.5 py-1 text-xs bg-[#1a2e1a] text-[#4ade80] border border-[#4ade80]/20 rounded-full">🌱 SDG</span>}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-[#09091a] rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Prize</div>
                    <div className="text-[#8b5cf6] font-semibold text-sm">{comp.prize}</div>
                  </div>
                  <div className="bg-[#09091a] rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Stage Focus</div>
                    <div className="text-white text-sm font-medium">{comp.stage}</div>
                  </div>
                  <div className="bg-[#09091a] rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock size={10} /> Deadline</div>
                    <div className="text-orange-400 text-sm font-medium">{comp.deadline}</div>
                  </div>
                  <div className="bg-[#09091a] rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Users size={10} /> Applicants</div>
                    <div className="text-white text-sm font-medium">{comp.applicants}</div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Evaluation Criteria</div>
                  <div className="flex flex-wrap gap-2">
                    {comp.criteria.map((c) => (
                      <span key={c} className="px-2.5 py-1 text-xs bg-[#1c1c3a] text-gray-300 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>

                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Apply Now <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming */}
        {activeTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {upcoming.map((comp) => (
              <div key={comp.title} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 card-hover">
                <div className={`inline-block px-3 py-1 text-xs font-semibold bg-gradient-to-r ${comp.color} text-black rounded-full mb-4`}>
                  {comp.sector}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{comp.title}</h3>
                <p className="text-gray-400 text-sm mb-2">By {comp.host}</p>
                <p className="text-[#8b5cf6] font-semibold text-sm mb-3">{comp.prize}</p>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-5">
                  <Clock size={13} /> {comp.date}
                </div>
                <button className="w-full py-2.5 border border-[#1c1c3a] text-gray-300 hover:border-[#8b5cf6]/30 hover:text-white rounded-xl text-sm transition-all">
                  Get Notified
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Past Winners */}
        {activeTab === 2 && (
          <div className="space-y-4">
            {pastWinners.map((w, i) => (
              <div key={w.competition} className="flex items-center gap-5 bg-[#0f0f1e] border border-[#1c1c3a] rounded-xl px-6 py-5 card-hover">
                <div className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏆'}</div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{w.competition}</div>
                  <div className="text-gray-400 text-sm">{w.winner} • {w.sector}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#8b5cf6] font-semibold">{w.prize} Prize</div>
                  <div className="text-[#4ade80] text-sm">{w.raised}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Host a Competition */}
        {activeTab === 3 && (
          <div className="max-w-3xl">
            <div className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-8 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Host a Competition on Vulture X</h2>
              <p className="text-gray-400 mb-6">
                Organizations, VC funds, corporates, and accelerators can create themed competitions to source structured deal flow from our curated startup ecosystem.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  'Define sector & stage focus',
                  'Set custom evaluation criteria',
                  'Access AI pre-scored applicants',
                  'Manage shortlisting & scoring',
                  'Generate leaderboards automatically',
                  'Convert winners to pipeline',
                  'Get analytics & insights',
                  'Brand your competition page',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle size={16} className="text-[#4ade80] flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#1c1c3a] pt-6">
                <h3 className="text-white font-semibold mb-4">Pricing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { tier: 'Starter', price: '$499', features: 'Up to 100 applicants', color: 'border-[#1c1c3a]' },
                    { tier: 'Growth', price: '$1,499', features: 'Up to 500 applicants + Analytics', color: 'border-[#8b5cf6]/30' },
                    { tier: 'Enterprise', price: 'Custom', features: 'Unlimited + Priority Placement', color: 'border-[#60a5fa]/30' },
                  ].map((tier) => (
                    <div key={tier.tier} className={`bg-[#09091a] border ${tier.color} rounded-xl p-4 text-center`}>
                      <div className="font-semibold text-white mb-1">{tier.tier}</div>
                      <div className="text-[#8b5cf6] font-bold text-xl mb-2">{tier.price}</div>
                      <div className="text-gray-400 text-xs">{tier.features}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity">
              Apply to Host a Competition <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
