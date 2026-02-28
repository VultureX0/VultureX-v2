import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getStartupById } from '../data/startups';
import type { StartupProfileData } from '../data/startups';
import {
  HeroSection,
  AboutSection,
  TractionSection,
  FinancialSection,
  TeamSection,
  PitchSection,
  InvestorSignalsSection,
} from '../components/startupProfile';

function LoadingState() {
  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-[#1c1c3a] rounded-lg w-32" />
          <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-8">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-[#1c1c3a] rounded-2xl" />
              <div className="flex-1 space-y-3">
                <div className="h-8 bg-[#1c1c3a] rounded w-3/4" />
                <div className="h-4 bg-[#1c1c3a] rounded w-1/2" />
                <div className="h-4 bg-[#1c1c3a] rounded w-1/3" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen pt-20 pb-20 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Startup not found</h1>
        <p className="text-gray-400 mb-6">The profile you’re looking for doesn’t exist or was removed.</p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8b5cf6] text-white font-medium rounded-xl hover:opacity-90"
        >
          <ArrowLeft size={18} /> Back to Explore
        </Link>
      </div>
    </div>
  );
}

export default function StartupProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [startup, setStartup] = useState<StartupProfileData | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setStartup(null);
      return;
    }
    // Simulate async load (e.g. API) for loading state
    const t = setTimeout(() => {
      setStartup(getStartupById(id) ?? null);
    }, 400);
    return () => clearTimeout(t);
  }, [id]);

  if (startup === undefined) return <LoadingState />;
  if (startup === null) return <NotFound />;

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#050511]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Explore
        </Link>

        <div className="space-y-8">
          <HeroSection startup={startup} />
          <AboutSection startup={startup} />
          <TractionSection startup={startup} />
          <FinancialSection startup={startup} />
          <TeamSection team={startup.team} />
          <PitchSection startup={startup} />
          <InvestorSignalsSection startup={startup} />
        </div>
      </div>
    </div>
  );
}
