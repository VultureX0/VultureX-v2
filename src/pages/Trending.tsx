import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Flame, ArrowUp } from 'lucide-react';
import { useAuth } from '../features/auth';
import { getLeaderboardByCategory } from '../services';
import type { LeaderboardCategory, LeaderboardEntry, LeaderboardResult } from '../types';

const categories = [
  { id: 'overall', label: 'Top 10 Overall', icon: '🏆' },
  { id: 'cleantech', label: 'Top 10 CleanTech', icon: '🌿' },
  { id: 'fintech', label: 'Top 10 FinTech', icon: '💰' },
  { id: 'web3', label: 'Top 10 Web3', icon: '⛓️' },
  { id: 'impact', label: 'Top 10 Impact', icon: '🌱' },
  { id: 'rising', label: 'Fastest Rising', icon: '🚀' },
  { id: 'investor', label: 'Most Investor Interest', icon: '👀' },
];

type CategoryResultMap = Partial<Record<LeaderboardCategory, LeaderboardResult>>;

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((id) => (
        <div key={id} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl px-6 py-5 animate-pulse">
          <div className="h-5 w-2/5 bg-[#1c1c3a] rounded mb-3" />
          <div className="h-4 w-3/5 bg-[#1c1c3a] rounded" />
        </div>
      ))}
    </div>
  );
}

export default function Trending() {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('overall');
  const [categoryData, setCategoryData] = useState<CategoryResultMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const activeCategoryData = categoryData[activeCategory];
  const list = activeCategoryData?.entries ?? [];
  const updatedAt = activeCategoryData?.updatedAt
    ? new Date(activeCategoryData.updatedAt).toLocaleString()
    : null;

  useEffect(() => {
    if (categoryData[activeCategory]) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function loadCategory() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getLeaderboardByCategory(activeCategory);
        if (!isMounted) return;
        setCategoryData((prev) => ({ ...prev, [activeCategory]: result }));
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCategory();
    return () => {
      isMounted = false;
    };
  }, [activeCategory, categoryData]);

  const handleStartupClick = (startup: LeaderboardEntry) => {
    if (isAuthenticated) {
      navigate(`/startup/view/${encodeURIComponent(startup.name)}`, { state: { startup } });
    } else {
      navigate('/login', {
        state: {
          from: '/trending',
          message: 'Please log in to view startup details.',
          startup,
          returnToStartup: true,
        },
      });
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="bg-[#09091a] border-b border-[#1c1c3a] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-2">
            <Flame size={16} /> Live Rankings
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Trending Startups</h1>
          <p className="text-gray-400">Dynamic merit-based rankings updated in real-time based on AI score, traction, and investor interest.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#8b5cf6]'
                  : 'bg-[#0f0f1e] border-[#1c1c3a] text-gray-400 hover:text-white hover:border-[#2d2d50]'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {!isLoading && !error && updatedAt && (
          <div className="mb-4 text-xs text-gray-500">
            Last updated: {updatedAt}
          </div>
        )}

        {/* Leaderboard */}
        {isLoading && <LeaderboardSkeleton />}

        {error && !isLoading && (
          <div className="bg-[#0f0f1e] border border-red-400/20 rounded-2xl p-6 text-red-300">
            {error}
          </div>
        )}

        {!isLoading && !error && list.length === 0 && (
          <div className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 text-gray-400">
            No startups are ranked in this category yet.
          </div>
        )}

        {!isLoading && !error && list.length > 0 && (
          <div className="space-y-3">
            {list.map((startup, i) => (
            <div
              key={startup.id}
              role="button"
              tabIndex={0}
              onClick={() => handleStartupClick(startup)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartupClick(startup)}
              className={`flex items-center gap-5 bg-[#0f0f1e] rounded-2xl px-6 py-5 card-hover cursor-pointer border transition-all ${
                i === 0 ? 'border-[#8b5cf6]/25' : i === 1 ? 'border-gray-400/20' : i === 2 ? 'border-[#cd7f32]/20' : 'border-[#1c1c3a]'
              }`}
            >
              {/* Rank */}
              <div className={`text-3xl font-black min-w-[3rem] text-center ${
                i === 0 ? 'text-[#8b5cf6]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-[#cd7f32]' : 'text-gray-600'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${startup.rank}`}
              </div>

              {/* Logo */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                i === 0 ? 'bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-black' :
                'bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/20 border border-[#8b5cf6]/20 text-[#8b5cf6]'
              }`}>
                {startup.name[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-lg">{startup.name}</span>
                  {startup.sdg && <span className="px-2 py-0.5 text-xs bg-[#1a2e1a] text-[#4ade80] border border-[#4ade80]/20 rounded-full">🌱 Impact</span>}
                  <span className="px-2 py-0.5 text-xs bg-[#1c1c3a] text-gray-400 rounded-full">{startup.sector}</span>
                </div>
                <p className="text-gray-500 text-sm mt-0.5">{startup.desc}</p>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-8">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-0.5">AI Score</div>
                  <div className="text-[#8b5cf6] font-bold text-xl">{startup.score}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-0.5">Investors</div>
                  <div className="text-white font-semibold">{startup.investors}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-0.5">Change</div>
                  <div className={`flex items-center gap-1 font-semibold text-sm ${
                    startup.change > 0 ? 'text-[#4ade80]' : startup.change < 0 ? 'text-red-400' : 'text-gray-500'
                  }`}>
                    {startup.change > 0 ? <ArrowUp size={12} /> : startup.change < 0 ? <ArrowUp size={12} className="rotate-180" /> : null}
                    {startup.change > 0 ? `+${startup.change}` : startup.change === 0 ? '—' : startup.change}
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* How ranking works */}
        <div className="mt-14 bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-8">
          <div className="flex items-center gap-2 text-[#8b5cf6] mb-4">
            <TrendingUp size={18} />
            <h3 className="font-bold text-lg text-white">How Rankings Work</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'AI Evaluation Score', weight: '35%', color: 'from-[#8b5cf6] to-[#7c3aed]' },
              { label: 'Competition Performance', weight: '25%', color: 'from-[#60a5fa] to-[#a78bfa]' },
              { label: 'Investor Interest', weight: '25%', color: 'from-[#4ade80] to-[#22c55e]' },
              { label: 'Profile Completeness', weight: '15%', color: 'from-[#f472b6] to-[#ec4899]' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>{item.weight}</div>
                <div className="text-gray-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-6">
            Rankings recalculate every 24 hours. Pro subscribers receive a visibility boost, but the core score remains merit-based.
          </p>
        </div>
      </div>
    </div>
  );
}
