import { MapPin, TrendingUp } from 'lucide-react';
import type { StartupProfileData } from '../../types';

type Props = { startup: StartupProfileData };

export default function HeroSection({ startup }: Props) {
  return (
    <section className="bg-[#09091a] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8 md:p-10">
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-[0_0_40px_rgba(139,92,246,0.3)]">
            {startup.logoLetter}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{startup.name}</h1>
            {startup.sdg && (
              <span className="px-2.5 py-0.5 text-xs bg-[#1a2e1a] text-[#4ade80] border border-[#4ade80]/20 rounded-full">
                🌱 Impact
              </span>
            )}
            {startup.matchScore != null && (
              <span className="px-2.5 py-0.5 text-xs bg-[#8b5cf6]/10 text-[#a78bfa] border border-[#8b5cf6]/30 rounded-full flex items-center gap-1">
                <TrendingUp size={12} /> Score {startup.matchScore}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-lg mb-4">{startup.tagline}</p>
          <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-6">
            <span className="px-2.5 py-1 bg-[#1c1c3a] rounded-lg">{startup.sector}</span>
            <span className="px-2.5 py-1 bg-[#1c1c3a] rounded-lg">{startup.stage}</span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {startup.location}
            </span>
            <span className="text-[#8b5cf6] font-semibold">{startup.fundingRaised} raised</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="px-5 py-2.5 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Request Intro
            </button>
            <button
              type="button"
              className="px-5 py-2.5 border border-[#1c1c3a] text-gray-300 rounded-xl hover:bg-white/5 hover:border-[#8b5cf6]/40 transition-all"
            >
              Save Startup
            </button>
            <button
              type="button"
              className="px-5 py-2.5 border border-[#1c1c3a] text-gray-300 rounded-xl hover:bg-white/5 hover:border-[#8b5cf6]/40 transition-all"
            >
              Contact Founder
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
