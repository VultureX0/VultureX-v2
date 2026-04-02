import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { getActiveCompetitions, getPastCompetitionWinners, getUpcomingCompetitions } from '../services';
import type { Competition, CompetitionWinner } from '../types';

const tabs = ['Active', 'Upcoming', 'Past Winners', 'Host a Competition'];

function CompetitionsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((id) => (
        <div key={id} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-7 animate-pulse">
          <div className="h-5 w-36 bg-[#1c1c3a] rounded mb-3" />
          <div className="h-6 w-56 bg-[#1c1c3a] rounded mb-2" />
          <div className="h-4 w-44 bg-[#1c1c3a] rounded mb-6" />
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="h-16 bg-[#09091a] rounded-xl" />
            <div className="h-16 bg-[#09091a] rounded-xl" />
            <div className="h-16 bg-[#09091a] rounded-xl" />
            <div className="h-16 bg-[#09091a] rounded-xl" />
          </div>
          <div className="h-10 bg-[#1c1c3a] rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default function Competitions() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeCompetitions, setActiveCompetitions] = useState<Competition[]>([]);
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<Competition[]>([]);
  const [pastWinners, setPastWinners] = useState<CompetitionWinner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCompetitions() {
      setIsLoading(true);
      setError(null);
      try {
        const [activeData, upcomingData, winnerData] = await Promise.all([
          getActiveCompetitions(),
          getUpcomingCompetitions(),
          getPastCompetitionWinners(),
        ]);
        if (!isMounted) return;
        setActiveCompetitions(activeData);
        setUpcomingCompetitions(upcomingData);
        setPastWinners(winnerData);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Failed to load competitions.';
        setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCompetitions();
    return () => {
      isMounted = false;
    };
  }, []);

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
        {activeTab === 0 && isLoading && <CompetitionsSkeleton />}

        {activeTab < 3 && error && !isLoading && (
          <div className="bg-[#0f0f1e] border border-red-400/20 rounded-2xl p-6 text-red-300">
            {error}
          </div>
        )}

        {activeTab === 0 && !isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeCompetitions.map((comp) => (
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
                    <div className="text-orange-400 text-sm font-medium">{comp.deadline ?? 'TBD'}</div>
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
            {activeCompetitions.length === 0 && (
              <div className="lg:col-span-2 bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 text-gray-400">
                No active competitions right now.
              </div>
            )}
          </div>
        )}

        {/* Upcoming */}
        {activeTab === 1 && isLoading && <CompetitionsSkeleton />}

        {activeTab === 1 && !isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {upcomingCompetitions.map((comp) => (
              <div key={comp.title} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 card-hover">
                <div className={`inline-block px-3 py-1 text-xs font-semibold bg-gradient-to-r ${comp.color} text-black rounded-full mb-4`}>
                  {comp.sector}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{comp.title}</h3>
                <p className="text-gray-400 text-sm mb-2">By {comp.host}</p>
                <p className="text-[#8b5cf6] font-semibold text-sm mb-3">{comp.prize}</p>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-5">
                  <Clock size={13} /> {comp.opensOn ?? 'TBD'}
                </div>
                <button className="w-full py-2.5 border border-[#1c1c3a] text-gray-300 hover:border-[#8b5cf6]/30 hover:text-white rounded-xl text-sm transition-all">
                  Get Notified
                </button>
              </div>
            ))}
            {upcomingCompetitions.length === 0 && (
              <div className="md:col-span-3 bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 text-gray-400">
                No upcoming competitions have been announced yet.
              </div>
            )}
          </div>
        )}

        {/* Past Winners */}
        {activeTab === 2 && isLoading && <CompetitionsSkeleton />}

        {activeTab === 2 && !isLoading && !error && (
          <div className="space-y-4">
            {pastWinners.map((w, i) => (
              <div key={w.id} className="flex items-center gap-5 bg-[#0f0f1e] border border-[#1c1c3a] rounded-xl px-6 py-5 card-hover">
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
            {pastWinners.length === 0 && (
              <div className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-xl p-6 text-gray-400">
                Winners will appear here once competitions are completed.
              </div>
            )}
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
