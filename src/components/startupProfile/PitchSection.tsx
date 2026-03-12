import { FileText, Play } from 'lucide-react';
import type { StartupProfileData } from '../../types';

type Props = { startup: StartupProfileData };

export default function PitchSection({ startup }: Props) {
  return (
    <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-white mb-6">Pitch Materials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[180px]">
          <FileText size={40} className="text-[#8b5cf6] mb-3" />
          <div className="font-medium text-white mb-2">Pitch Deck</div>
          <p className="text-gray-500 text-sm mb-4">
            {startup.pitchDeckUrl ? 'Download or preview the deck' : 'Not uploaded'}
          </p>
          {startup.pitchDeckUrl && (
            <a
              href={startup.pitchDeckUrl}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#8b5cf6] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <FileText size={16} /> Download
            </a>
          )}
        </div>
        <div className="bg-[#09091a] border border-[#1c1c3a] rounded-xl overflow-hidden min-h-[180px] flex items-center justify-center">
          {startup.demoVideoUrl ? (
            <div className="w-full aspect-video bg-black/50 flex items-center justify-center">
              <a
                href={startup.demoVideoUrl}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors"
              >
                <Play size={18} /> Watch Demo
              </a>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Play size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Demo video placeholder</p>
              <p className="text-gray-600 text-xs mt-1">Embed or link when available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
