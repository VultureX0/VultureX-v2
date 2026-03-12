import { Users, Linkedin } from 'lucide-react';
import type { Founder } from '../../types';

type Props = { team: Founder[] };

export default function TeamSection({ team }: Props) {
  return (
    <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Users size={20} className="text-[#60a5fa]" />
        Team
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {team.map((f, i) => (
          <div key={i} className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/20 border border-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] font-bold text-lg flex-shrink-0">
                {f.name[0]}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-white">{f.name}</div>
                <div className="text-sm text-[#8b5cf6] mb-1">{f.role}</div>
                {f.linkedIn && (
                  <a
                    href={f.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#60a5fa] transition-colors"
                  >
                    <Linkedin size={12} /> LinkedIn
                  </a>
                )}
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{f.bio}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
