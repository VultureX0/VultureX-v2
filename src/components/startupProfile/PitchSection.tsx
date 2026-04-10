import { FileText, Play } from 'lucide-react';
import type { StartupProfileData } from '../../types';

type Props = { startup: StartupProfileData };

export default function PitchSection({ startup }: Props) {
  return (
    <section className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-[#111111] mb-6">Pitch Materials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#f9f9f7] border border-[#e8e8e2] rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[180px]">
          <FileText size={40} className="text-[#d14343] mb-3" />
          <div className="font-medium text-[#111111] mb-2">Pitch Deck</div>
          <p className="text-gray-600 text-sm mb-4">
            {startup.pitchDeckUrl ? 'Download or preview the deck' : 'Not uploaded'}
          </p>
          {startup.pitchDeckUrl && (
            <a
              href={startup.pitchDeckUrl}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#d14343] text-[#111111] text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <FileText size={16} /> Download
            </a>
          )}
        </div>
        <div className="bg-[#f9f9f7] border border-[#e8e8e2] rounded-2xl overflow-hidden min-h-[180px] flex items-center justify-center">
          {startup.demoVideoUrl ? (
            <div className="w-full aspect-video bg-black/50 flex items-center justify-center">
              <a
                href={startup.demoVideoUrl}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[#111111] text-sm font-medium transition-colors"
              >
                <Play size={18} /> Watch Demo
              </a>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Play size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">Demo video placeholder</p>
              <p className="text-gray-600 text-xs mt-1">Embed or link when available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
