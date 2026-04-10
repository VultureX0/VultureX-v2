import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getStartupById } from '../../services/startups';
import type { StartupProfileData } from '../../types';
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
  const [startup, setStartup] = useState<StartupProfileData | null>(null);

  useEffect(() => {
    if (startupId == null) {
      setStartup(null);
      return;
    }
    let cancelled = false;
    getStartupById(startupId).then((s) => {
      if (!cancelled) setStartup(s);
    });
    return () => { cancelled = true; };
  }, [startupId]);

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
        <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl shadow-2xl overflow-hidden">
          <div className="sticky top-0 z-10 flex justify-end p-3 bg-[#ffffff]/95 border-b border-[#e8e8e2]">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-600 hover:text-[#111111] hover:bg-white/10 transition-colors"
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
