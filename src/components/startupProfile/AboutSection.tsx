import type { StartupProfileData } from '../../data/startups';

type Props = { startup: StartupProfileData };

export default function AboutSection({ startup }: Props) {
  return (
    <section className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-white mb-4">About</h2>
      <p className="text-gray-400 leading-relaxed mb-6">{startup.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-[#8b5cf6] mb-2">Problem</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{startup.problem}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#8b5cf6] mb-2">Solution</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{startup.solution}</p>
        </div>
      </div>
    </section>
  );
}
