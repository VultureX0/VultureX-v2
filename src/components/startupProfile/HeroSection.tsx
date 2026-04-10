import { MapPin, TrendingUp } from 'lucide-react';
import type { StartupProfileData } from '../../types';

type Props = { startup: StartupProfileData };

export default function HeroSection({ startup }: Props) {
  return (
    <section className="bg-[#f9f9f7] border border-[#e8e8e2] rounded-2xl p-6 sm:p-8 md:p-10">
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#d14343] to-[#b73535] flex items-center justify-center text-3xl sm:text-4xl font-bold text-[#111111] shadow-[0_0_40px_rgba(139,92,246,0.3)]">
            {startup.logoLetter}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111111]">{startup.name}</h1>
            {startup.sdg && (
              <span className="px-2.5 py-0.5 text-xs bg-[#1a2e1a] text-[#4ade80] border border-[#4ade80]/20 rounded-full">
                🌱 Impact
              </span>
            )}
            {startup.matchScore != null && (
              <span className="px-2.5 py-0.5 text-xs bg-[#d14343]/10 text-[#c35c5c] border border-[#d14343]/30 rounded-full flex items-center gap-1">
                <TrendingUp size={12} /> Score {startup.matchScore}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-lg mb-4">{startup.tagline}</p>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-6">
            <span className="px-2.5 py-1 bg-[#e8e8e2] rounded-xl">{startup.sector}</span>
            <span className="px-2.5 py-1 bg-[#e8e8e2] rounded-xl">{startup.stage}</span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {startup.location}
            </span>
            <span className="text-[#d14343] font-semibold">{startup.fundingRaised} raised</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="px-5 py-2.5 bg-gradient-to-r from-[#d14343] to-[#b73535] text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity"
            >
              Request Intro
            </button>
            <button
              type="button"
              className="px-5 py-2.5 border border-[#e8e8e2] text-gray-700 rounded-2xl hover:bg-white/5 hover:border-[#d14343]/40 transition-all"
            >
              Save Startup
            </button>
            <button
              type="button"
              className="px-5 py-2.5 border border-[#e8e8e2] text-gray-700 rounded-2xl hover:bg-white/5 hover:border-[#d14343]/40 transition-all"
            >
              Contact Founder
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
