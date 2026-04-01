import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Trophy, Users, ChevronRight, Target, BarChart3, Shield, DollarSign, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function useCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

const stats = [
  { value: 47, display: '47', label: 'Founders connected this week' },
  { value: 112, display: '112', label: 'Active investor conversations' },
  { value: 18, display: '18h', label: 'Avg. first response' },
  { value: 9, display: '9', label: 'Deals closed this quarter' },
];

const trendingStartups = [
  { name: 'SolarAI', sector: 'CleanTech', stage: 'MVP', score: 94, sdg: true, raised: '$2.1M', rank: 1 },
  { name: 'NeuralPay', sector: 'FinTech', stage: 'Revenue', score: 91, sdg: false, raised: '$5.4M', rank: 2 },
  { name: 'AgriSense', sector: 'AgriTech', stage: 'Scaling', score: 89, sdg: true, raised: '$8.2M', rank: 3 },
  { name: 'HealthChain', sector: 'HealthTech', stage: 'MVP', score: 87, sdg: true, raised: '$1.8M', rank: 4 },
];

const competitions = [
  { title: 'Climate Innovation Challenge', prize: '$50K + Mentorship', deadline: '14 days left', sector: 'CleanTech', applicants: 234 },
  { title: 'Web3 Founders Sprint', prize: '$30K + Pilot', deadline: '7 days left', sector: 'Web3', applicants: 178 },
  { title: 'SaaS Product Showdown', prize: '$25K + Visibility', deadline: '21 days left', sector: 'SaaS', applicants: 312 },
];

const features = [
  { icon: Zap, title: 'One profile, every investor', desc: 'Stop rewriting your story for every call. Build it once.' },
  { icon: BarChart3, title: 'Ranked by traction', desc: 'Revenue, users, growth rate. Not who you know.' },
  { icon: Shield, title: 'Investors are vetted', desc: 'Verified angels and VCs only. No tire-kickers.' },
  { icon: Target, title: 'Impact founders pay $0', desc: 'SDG-aligned? Free Pro access, 0% fees.' },
  { icon: Trophy, title: 'Real competitions', desc: 'Sector challenges with prize money and investor access.' },
  { icon: DollarSign, title: 'Pay when you raise', desc: '3% success fee on closed deals. Nothing upfront.' },
];

const testimonials = [
  { name: 'Priya S.', role: 'Seed-stage founder', quote: 'Got 2 investor calls in 5 days. Way better than cold emails. We closed our round 6 weeks later.' },
  { name: 'James C.', role: 'Angel investor', quote: 'I don\'t dig through 200 decks anymore. Filter by sector and stage, reach out. Simple.' },
  { name: 'Amina A.', role: 'Impact founder, CleanTech', quote: 'Paid nothing upfront. Raised $2M and only paid the success fee after close. That\'s fair.' },
];

function StatCard({ stat }: { stat: typeof stats[0] }) {
  const { count, ref } = useCounter(stat.value);
  const display = stat.display.replace(/\d+/, count.toLocaleString());
  return (
    <div ref={ref} className="reveal-scale">
      <div className="text-2xl font-semibold text-white tabular-nums">{display}</div>
      <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-20 md:pt-32 md:pb-28 min-h-[90vh] flex items-center bg-[#06060f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-[560px]">
            <h1 className="reveal text-[2.5rem] sm:text-5xl font-semibold text-white leading-[1.1] tracking-tight mb-5">
              Fundraising is broken. We're fixing the plumbing.
            </h1>
            <p className="reveal delay-100 text-[16px] text-gray-400 mb-8 leading-relaxed max-w-md">
              Most founders spend months chasing intros that go nowhere. We put your startup in front of verified investors who are actually looking.
            </p>
            <div className="reveal delay-200 flex flex-wrap items-center gap-3 mb-3">
              <Link
                to="/for-startups"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#06060f] font-medium rounded-md text-sm hover:bg-gray-200 transition-colors"
              >
                I'm a founder
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/for-investors"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#2a2a3d] text-gray-300 font-medium rounded-md text-sm hover:border-gray-500 hover:text-white transition-colors"
              >
                I invest in startups
                <ChevronRight size={15} />
              </Link>
              <Link
                to="/explore"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors ml-1"
              >
                Just browsing
              </Link>
            </div>
            <p className="reveal delay-200 text-xs text-gray-600">No spam. Takes 2 minutes.</p>
          </div>

          <div className="flex flex-wrap gap-8 sm:gap-12 mt-16 pt-8 border-t border-[#1c1c3a]/50">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`delay-${(i + 1) * 100}`}>
                <StatCard stat={stat} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20 bg-[#08081a] border-y border-[#1c1c3a]/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="reveal text-xl sm:text-2xl font-semibold text-white mb-8">Where founders usually get stuck</h2>
          <div className="space-y-3">
            {[
              { problem: 'Cold outreach gets ignored', fix: 'Investors find you based on traction and sector fit' },
              { problem: 'Pitch decks go unread', fix: 'Your profile is live -- investors read it before reaching out' },
              { problem: 'Other platforms are too noisy', fix: 'Curated discovery, verified investors, real conversations' },
            ].map((item) => (
              <div key={item.problem} className="reveal flex gap-4 items-start py-3">
                <div className="flex-1">
                  <p className="text-gray-500 text-sm line-through decoration-gray-700">{item.problem}</p>
                  <p className="text-gray-200 text-sm mt-1">{item.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-[#06060f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="reveal text-xs text-gray-500 uppercase tracking-wider mb-2">How it works</p>
            <h2 className="reveal delay-100 text-2xl sm:text-3xl font-semibold text-white">Three steps. No fluff.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1c1c3a]/40 rounded-xl overflow-hidden">
            {[
              { num: '01', icon: Zap, title: 'Tell your story once', desc: 'What you\'re building, how far along, what you need. About 10 minutes. No pitch deck required.' },
              { num: '02', icon: Trophy, title: 'Get ranked on merit', desc: 'Enter sector competitions. Win on traction and clarity, not connections. Top founders get seen first.' },
              { num: '03', icon: Users, title: 'Talk to real investors', desc: 'Verified angels and VCs find you, request intros, move things forward. No cold DMs.' },
            ].map((item) => (
              <div key={item.num} className="reveal bg-[#0a0a1a] p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-md bg-[#1c1c3a]/60 flex items-center justify-center">
                    <item.icon size={16} className="text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-600 font-mono">{item.num}</span>
                </div>
                <h3 className="text-white font-medium mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-20 bg-[#08081a] border-y border-[#1c1c3a]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="reveal text-xs text-gray-500 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp size={12} /> This week
              </div>
              <h2 className="reveal delay-100 text-2xl sm:text-3xl font-semibold text-white">Trending startups</h2>
            </div>
            <Link to="/trending" className="reveal text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-2">
            {trendingStartups.map((startup, i) => (
              <div
                key={startup.name}
                className={`reveal delay-${i * 100 + 100} flex items-center gap-4 bg-[#0a0a1a] border border-[#1c1c3a]/40 rounded-lg px-4 py-3.5 cursor-pointer group transition-colors hover:border-[#2a2a4a]`}
              >
                <span className={`text-sm font-medium min-w-[1.5rem] ${i === 0 ? 'text-white' : 'text-gray-600'}`}>
                  {startup.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white group-hover:text-gray-200">{startup.name}</span>
                    <span className="text-xs text-gray-600">{startup.sector}</span>
                    <span className="text-xs text-gray-700">{startup.stage}</span>
                    {startup.sdg && (
                      <span className="text-xs text-emerald-600">SDG</span>
                    )}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-5">
                  <span className="text-xs text-gray-500">{startup.raised}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1 bg-[#1c1c3a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-500 rounded-full"
                        style={{ width: `${startup.score}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums">{startup.score}</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitions */}
      <section className="py-20 bg-[#06060f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="reveal text-xs text-gray-500 uppercase tracking-wider mb-1.5">Competitions</p>
              <h2 className="reveal delay-100 text-2xl sm:text-3xl font-semibold text-white">Open challenges</h2>
            </div>
            <Link to="/competitions" className="reveal text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
              All <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {competitions.map((comp, i) => (
              <div
                key={comp.title}
                className={`reveal delay-${i * 100 + 100} bg-[#0a0a1a] border border-[#1c1c3a]/40 rounded-xl p-5 group hover:border-[#2a2a4a] transition-colors`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 border border-[#1c1c3a] rounded px-2 py-0.5">{comp.sector}</span>
                  <span className="text-xs text-amber-300/70">{comp.deadline}</span>
                </div>
                <h3 className="text-sm font-medium text-white mb-3">{comp.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{comp.applicants} applicants</span>
                  <span className="text-xs text-gray-400 font-medium">{comp.prize}</span>
                </div>
                <Link
                  to="/login"
                  className="mt-4 block text-center text-xs text-gray-500 border border-[#1c1c3a] rounded-md py-1.5 hover:text-white hover:border-[#2a2a4a] transition-colors"
                >
                  Apply
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#08081a] border-y border-[#1c1c3a]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-md">
            <p className="reveal text-xs text-gray-500 uppercase tracking-wider mb-2">What you get</p>
            <h2 className="reveal delay-100 text-2xl sm:text-3xl font-semibold text-white">Less noise. More conversations.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1c1c3a]/30 rounded-xl overflow-hidden">
            {features.map((f) => (
              <div key={f.title} className="reveal bg-[#0a0a1a] p-6">
                <f.icon size={18} className="text-gray-500 mb-3" />
                <h4 className="text-sm text-white font-medium mb-1.5">{f.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 bg-[#06060f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal bg-[#0a110a] border border-[#1a2e1a]/60 rounded-xl p-8 sm:p-10">
            <div className="max-w-lg">
              <p className="text-xs text-emerald-500/70 uppercase tracking-wider mb-2">Impact program</p>
              <h2 className="text-2xl font-semibold text-white mb-3">Impact startups pay nothing</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                If you're aligned with UN Sustainable Development Goals, you get free Pro access and 0% success fee. We verify manually. No catch.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['No Poverty', 'Clean Energy', 'Climate Action', 'Decent Work', 'Reduced Inequalities'].map((sdg) => (
                  <span key={sdg} className="text-xs text-emerald-500/60 border border-emerald-900/30 rounded px-2 py-1">{sdg}</span>
                ))}
              </div>
              <Link
                to="/impact"
                className="inline-flex items-center gap-1.5 text-sm text-emerald-400/80 hover:text-emerald-300 transition-colors"
              >
                Learn more <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#08081a] border-y border-[#1c1c3a]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="reveal text-xs text-gray-500 uppercase tracking-wider mb-2">From people using it</p>
            <h2 className="reveal delay-100 text-2xl sm:text-3xl font-semibold text-white">Real talk, not marketing copy</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`reveal delay-${i * 100 + 100} bg-[#0a0a1a] border border-[#1c1c3a]/40 rounded-xl p-6`}
              >
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <p className="text-xs text-gray-600">{t.name}, {t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#06060f]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="reveal text-2xl sm:text-3xl font-semibold text-white mb-3">
            Stop chasing. Start getting found.
          </h2>
          <p className="reveal delay-100 text-gray-500 text-sm mb-6">
            2 minutes to set up. No credit card.
          </p>
          <div className="reveal delay-200 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/for-startups"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#06060f] font-medium rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              I'm a founder
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/for-investors"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#2a2a3d] text-gray-300 font-medium rounded-md text-sm hover:border-gray-500 transition-colors"
            >
              I invest in startups
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
