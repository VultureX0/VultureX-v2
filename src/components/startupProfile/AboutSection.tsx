import type { StartupProfileData } from '../../types';

type Props = { startup: StartupProfileData };

export default function AboutSection({ startup }: Props) {
  return (
    <section className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-[#111111] mb-4">About</h2>
      <p className="text-gray-600 leading-relaxed mb-6">{startup.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-[#d14343] mb-2">Problem</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{startup.problem}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#d14343] mb-2">Solution</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{startup.solution}</p>
        </div>
      </div>
    </section>
  );
}
