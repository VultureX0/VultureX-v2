import { useEffect } from 'react';
import { X } from 'lucide-react';
import { getStartupById } from '../../data/startups';
import type { StartupProfileData } from '../../data/startups';
import {
  HeroSection,
  AboutSection,
  TractionSection,
  FinancialSection,
  TeamSection,
  PitchSection,
  InvestorSignalsSection,
} from './index';

type Props = {
  startupId: number | null;
  onClose: () => void;
};

export default function StartupProfileModal({ startupId, onClose }: Props) {
  const startup = startupId != null ? getStartupById(startupId) : null;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (startupId != null) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [startupId, onClose]);

  if (startupId == null || !startup) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-auto">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-4xl mx-auto my-8 px-4 sm:px-6">
        <div className="bg-[#050511] border border-[#1c1c3a] rounded-2xl shadow-2xl overflow-hidden">
          <div className="sticky top-0 z-10 flex justify-end p-3 bg-[#050511]/95 border-b border-[#1c1c3a]">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>
          <div className="p-6 sm:p-8 space-y-8 max-h-[85vh] overflow-y-auto">
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
    </div>
  );
}
