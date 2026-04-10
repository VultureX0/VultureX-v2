import { Users, Linkedin } from 'lucide-react';
import type { Founder } from '../../types';

type Props = { team: Founder[] };

export default function TeamSection({ team }: Props) {
  return (
    <section className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-[#111111] mb-6 flex items-center gap-2">
        <Users size={20} className="text-[#60a5fa]" />
        Team
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {team.map((f, i) => (
          <div key={i} className="bg-[#f9f9f7] border border-[#e8e8e2] rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d14343]/20 to-[#b73535]/20 border border-[#d14343]/20 flex items-center justify-center text-[#d14343] font-bold text-lg flex-shrink-0">
                {f.name[0]}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[#111111]">{f.name}</div>
                <div className="text-sm text-[#d14343] mb-1">{f.role}</div>
                {f.linkedIn && (
                  <a
                    href={f.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#60a5fa] transition-colors"
                  >
                    <Linkedin size={12} /> LinkedIn
                  </a>
                )}
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{f.bio}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
