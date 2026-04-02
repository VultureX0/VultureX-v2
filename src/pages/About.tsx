import { ArrowRight, Target, Globe, Users, TrendingUp, Zap, Mail } from 'lucide-react';

const team = [
  { name: 'Amir Hassan', role: 'CEO & Co-founder', bg: 'from-[#8b5cf6] to-[#7c3aed]', desc: 'Serial entrepreneur. Former VC analyst. Built 3 startups, raised $12M+ total.' },
  { name: 'Priya Nair', role: 'CTO & Co-founder', bg: 'from-[#60a5fa] to-[#a78bfa]', desc: 'ML engineer. 10+ years in AI systems. Ex-Google, ex-DeepMind. Led teams of 30+.' },
  { name: 'Leila Osei', role: 'Chief Impact Officer', bg: 'from-[#4ade80] to-[#22c55e]', desc: 'SDG advocate and impact measurement expert. Former UNDP. Worked across 18 countries.' },
  { name: 'James Rodrigues', role: 'Head of Investor Relations', bg: 'from-[#f472b6] to-[#ec4899]', desc: 'Former investment banker. $2B+ in transactions across Africa and Southeast Asia.' },
];

const milestones = [
  { year: '2023', title: 'Founded in Nairobi', desc: 'Vulture X was born from the frustration of African founders unable to access global capital.' },
  { year: 'Q2 2023', title: 'First 100 Startups', desc: 'Onboarded our first cohort of 100 startups across 8 African countries.' },
  { year: 'Q4 2023', title: 'Investor Onboarding Launched', desc: 'First 50 verified investors joined the platform. First 3 deals closed.' },
  { year: 'Q1 2024', title: 'Competition Module Live', desc: 'Launched themed competitions. First CleanTech competition attracted 312 applicants.' },
  { year: 'Q3 2024', title: 'Impact Program Launch', desc: 'Launched the SDG Impact Verification program. 0% success fee policy activated.' },
  { year: '2025', title: '$100M Capital Milestone', desc: 'Startups on Vulture X collectively raised over $100M in funding.' },
  { year: '2026', title: 'Global Expansion', desc: 'Expanded to Southeast Asia, MENA, and Latin America. 2,400+ startups across 40 countries.' },
];

const values = [
  { icon: Target, title: 'Merit Above All', desc: 'Rankings and visibility are earned through quality, not payments or connections.', color: 'text-[#8b5cf6]' },
  { icon: Globe, title: 'Global by Default', desc: 'Capital should be accessible to any founder anywhere. Geography is not a barrier.', color: 'text-[#60a5fa]' },
  { icon: Users, title: 'Builder First', desc: 'We design every feature for the founder experience. Investors serve founders here.', color: 'text-[#4ade80]' },
  { icon: Zap, title: 'AI-Augmented', desc: 'We use AI to remove barriers: the expensive pitch deck, the connections you lack, the bias in evaluation.', color: 'text-[#a78bfa]' },
];

export default function About() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="bg-[#09091a] border-b border-[#1c1c3a] py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-4">About Us</div>
          <h1 className="text-5xl font-bold text-white mb-6 max-w-3xl">
            We're Building the<br />
            <span className="gradient-text">Infrastructure for Global Startups</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mb-6">
            Vulture X was founded on a simple belief: every ambitious founder, regardless of geography or background, deserves fair access to the global capital ecosystem.
          </p>
          <p className="text-gray-500 max-w-2xl">
            We watched brilliant founders in Africa, Southeast Asia, and MENA struggle to raise capital not because their ideas were weak — but because they lacked the right network, the polished pitch deck, and the platform visibility. We built Vulture X to fix that.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { value: '40+', label: 'Countries', icon: Globe },
              { value: '2,400+', label: 'Startups', icon: Zap },
              { value: '850+', label: 'Investors', icon: Users },
              { value: '$180M+', label: 'Capital Raised', icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 text-center card-hover">
                <s.icon size={20} className="text-[#8b5cf6] mx-auto mb-3" />
                <div className="text-4xl font-bold gradient-text mb-1">{s.value}</div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-[#09091a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-4">Our Mission</div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Democratize Access to Global Capital
              </h2>
              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                We believe the next generation of transformative companies will come from every corner of the world — and the capital that funds them should too.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Vulture X removes the three biggest barriers to fundraising: presentation bias (solved by AI pitch decks), network dependency (solved by structured discovery), and geographic invisibility (solved by global rankings).
              </p>
              <div className="bg-[#0f0f1e] border border-[#8b5cf6]/20 rounded-xl p-6">
                <p className="text-[#8b5cf6] font-semibold italic text-lg">"The best startup ideas don't always come with the best pitch decks. We fix that."</p>
                <p className="text-gray-500 text-sm mt-2">— Amir Hassan, CEO</p>
              </div>
            </div>
            <div>
              <div className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-4">Our Values</div>
              <div className="space-y-4">
                {values.map((v) => (
                  <div key={v.title} className="flex gap-4 bg-[#0f0f1e] border border-[#1c1c3a] rounded-xl p-5">
                    <v.icon size={22} className={`${v.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <h4 className="text-white font-semibold mb-1">{v.title}</h4>
                      <p className="text-gray-400 text-sm">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-3">Team</div>
            <h2 className="text-4xl font-bold text-white">The Builders Behind Vulture X</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((member) => (
              <div key={member.name} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 text-center card-hover">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.bg} flex items-center justify-center text-black font-bold text-3xl mx-auto mb-5`}>
                  {member.name[0]}
                </div>
                <h4 className="text-white font-bold mb-0.5">{member.name}</h4>
                <div className="text-[#8b5cf6] text-sm mb-3">{member.role}</div>
                <p className="text-gray-400 text-sm">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-20 bg-[#09091a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-3">Journey</div>
            <h2 className="text-4xl font-bold text-white">Our Story So Far</h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-[#1c1c3a] hidden md:block" />
            <div className="space-y-6">
              {milestones.map((m) => (
                <div key={m.title} className="flex gap-6 items-start">
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#0f0f1e] border border-[#8b5cf6]/30 rounded-xl flex items-center justify-center flex-shrink-0 z-10">
                      <div className="w-3 h-3 bg-[#8b5cf6] rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1 bg-[#0f0f1e] border border-[#1c1c3a] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[#8b5cf6] font-bold text-sm">{m.year}</span>
                      <span className="w-1 h-1 bg-gray-600 rounded-full" />
                      <span className="text-white font-semibold">{m.title}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-3">Get in Touch</h3>
              <p className="text-gray-400 mb-6">Questions about the platform, partnerships, or press inquiries?</p>
              <div className="space-y-3">
                {[
                  { label: 'General', email: 'hello@vulturex.io' },
                  { label: 'Investors', email: 'investors@vulturex.io' },
                  { label: 'Press', email: 'press@vulturex.io' },
                  { label: 'Impact Program', email: 'impact@vulturex.io' },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-20">{c.label}</span>
                    <a href={`mailto:${c.email}`} className="text-[#8b5cf6] text-sm hover:underline flex items-center gap-1.5">
                      <Mail size={13} /> {c.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0f0f1e] border border-[#8b5cf6]/15 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Join the Ecosystem</h3>
                <p className="text-gray-400 mb-6">Whether you're a founder, investor, or accelerator — Vulture X is built for you.</p>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-black font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Create Startup Profile <ArrowRight size={16} />
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                  Join as Investor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
