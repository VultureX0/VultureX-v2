import { Link, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type StartupState = {
  name: string;
  sector: string;
  stage: string;
  score: number;
  sdg: boolean;
  change: number;
  desc: string;
  investors: number;
};

export default function StartupDetail() {
  const { name } = useParams<{ name: string }>();
  const location = useLocation();
  const startup = (location.state as { startup?: StartupState })?.startup;
  const displayName = startup?.name ?? decodeURIComponent(name ?? 'Startup');

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/trending"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Trending
        </Link>

        <div className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-2xl font-bold text-white">
              {displayName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              {startup && (
                <>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="px-2 py-0.5 text-xs bg-[#1c1c3a] text-gray-400 rounded-full">
                      {startup.sector}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-[#1c1c3a] text-gray-400 rounded-full">
                      {startup.stage}
                    </span>
                    {startup.sdg && (
                      <span className="px-2 py-0.5 text-xs bg-[#1a2e1a] text-[#4ade80] border border-[#4ade80]/20 rounded-full">
                        🌱 Impact
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">{startup.desc}</p>
                </>
              )}
            </div>
          </div>

          {startup && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#1c1c3a]">
              <div className="bg-[#09091a] rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">AI Score</div>
                <div className="text-[#8b5cf6] font-bold text-xl">{startup.score}</div>
              </div>
              <div className="bg-[#09091a] rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Investors</div>
                <div className="text-white font-semibold">{startup.investors}</div>
              </div>
              <div className="bg-[#09091a] rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Rank Change</div>
                <div
                  className={`font-semibold ${
                    startup.change > 0 ? 'text-[#4ade80]' : startup.change < 0 ? 'text-red-400' : 'text-gray-500'
                  }`}
                >
                  {startup.change > 0 ? `+${startup.change}` : startup.change === 0 ? '—' : startup.change}
                </div>
              </div>
              <div className="bg-[#09091a] rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Stage</div>
                <div className="text-white font-medium">{startup.stage}</div>
              </div>
            </div>
          )}

          {!startup && (
            <p className="text-gray-500 text-sm pt-4">
              View this startup from the <Link to="/trending" className="text-[#8b5cf6] hover:underline">Trending</Link> page to see full details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
