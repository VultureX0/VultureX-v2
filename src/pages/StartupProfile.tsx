import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getStartupById } from '../services/startups';
import type { StartupProfileData } from '../types';
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
          <div className="h-8 bg-[#e8e8e2] rounded-xl w-32" />
          <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-8">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-[#e8e8e2] rounded-2xl" />
              <div className="flex-1 space-y-3">
                <div className="h-8 bg-[#e8e8e2] rounded w-3/4" />
                <div className="h-4 bg-[#e8e8e2] rounded w-1/2" />
                <div className="h-4 bg-[#e8e8e2] rounded w-1/3" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl" />
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
        <h1 className="text-2xl font-bold text-[#111111] mb-2">Startup not found</h1>
        <p className="text-gray-600 mb-6">The profile you’re looking for doesn’t exist or was removed.</p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d14343] text-[#111111] font-medium rounded-2xl hover:opacity-90"
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
    // Load startup data
    let cancelled = false;
    const load = async () => {
      const result = await getStartupById(id);
      if (!cancelled) setStartup(result);
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (startup === undefined) return <LoadingState />;
  if (startup === null) return <NotFound />;

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#ffffff]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#111111] mb-6 transition-colors"
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
