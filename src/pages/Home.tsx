import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Trophy, Users, Target, BarChart3, Shield, DollarSign, Zap, Check, ArrowUpRight, Star } from 'lucide-react';

const trendingStartups = [
  { name: 'SolarAI', sector: 'CleanTech', stage: 'Series A', raised: '$2.1M', logo: 'S', growth: '+124%' },
  { name: 'NeuralPay', sector: 'FinTech', stage: 'Seed', raised: '$5.4M', logo: 'N', growth: '+89%' },
  { name: 'AgriSense', sector: 'AgriTech', stage: 'Series B', raised: '$8.2M', logo: 'A', growth: '+156%' },
];

const competitions = [
  { title: 'Climate Innovation Challenge', prize: '$50K', deadline: '14 days left', entries: 234 },
  { title: 'FinTech Disruptors 2024', prize: '$30K', deadline: '7 days left', entries: 178 },
];

const features = [
  { icon: Shield, title: 'Verified Investors', desc: 'Every investor on the platform is verified. No time-wasters.' },
  { icon: BarChart3, title: 'Traction-Based', desc: 'Rankings based on real metrics, not connections or hype.' },
  { icon: Target, title: 'Smart Matching', desc: 'AI-powered matching connects you with the right investors.' },
  { icon: DollarSign, title: 'Pay on Success', desc: '3% success fee only when you close. Nothing upfront.' },
  { icon: Trophy, title: 'Competition Edge', desc: 'Compete publicly, rank higher, and get featured visibility.' },
  { icon: Zap, title: 'Fast Setup', desc: 'Create your profile in minutes. No pitch deck needed.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'CEO, TechFlow', quote: 'Closed our seed round in 6 weeks. The platform matched us with investors who actually understood our space.', avatar: 'PS' },
  { name: 'James Chen', role: 'Partner, Horizon VC', quote: 'Finally, a platform that surfaces quality deals. I spend less time on bad fits and more time on great founders.', avatar: 'JC' },
  { name: 'Amina Adeyemi', role: 'Founder, GreenPath', quote: 'As an impact founder, getting free Pro access changed everything for us. Now we are Series A.', avatar: 'AA' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f6f2]">
      {/* Hero Section */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28 relative overflow-hidden bg-[#f6f6f2]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-12 w-[420px] h-[420px] bg-[#d14343]/12 rounded-full blur-[130px]" />
          <div className="absolute -bottom-24 right-0 w-[620px] h-[620px] bg-[#8d7cf5]/30 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.48)_45%,transparent_100%)]" />
          <div className="absolute right-[-120px] top-[80px] h-[520px] w-[720px] rounded-[120px] bg-[radial-gradient(ellipse_at_center,rgba(153,120,255,0.30)_0%,rgba(209,67,67,0.14)_40%,rgba(255,255,255,0)_72%)]" />
          <div className="absolute right-[-160px] bottom-[-40px] h-[360px] w-[760px] rounded-[999px] border border-white/50 bg-gradient-to-r from-white/15 via-[#c7b2ff]/20 to-white/10 blur-[1px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#ebd6d6] mb-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
              <span className="w-2 h-2 rounded-full bg-[#d14343]" />
              <span className="text-sm font-medium text-[#a24a4a]">$127M raised by founders this year</span>
            </div>

            <h1 className="reveal text-5xl md:text-7xl font-bold tracking-tight text-[#101014] leading-[1.01] mb-8">
              Where startups get
              <br />
              <span className="bg-gradient-to-r from-[#54486b] via-[#7661a8] to-[#4c577f] bg-clip-text text-transparent">discovered, ranked</span>
              <br />
              & funded
            </h1>

            <p className="reveal delay-100 text-xl text-[#5f5f66] leading-relaxed mb-12 max-w-xl">
              Stop cold-emailing. Get discovered by verified investors based on your traction, not your network.
            </p>

            <div className="reveal delay-200 flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                to="/for-startups"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#111111] text-white font-semibold rounded-full text-base hover:opacity-90 transition-all"
              >
                Launch your startup
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/for-investors"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-[#dbdbd3] text-[#111111] font-semibold rounded-full text-base hover:bg-white transition-all"
              >
                Join as investor
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-0 max-w-xl rounded-3xl border border-white/90 bg-gradient-to-br from-white/90 to-[#f3edff]/80 backdrop-blur-md shadow-[0_20px_40px_rgba(17,17,17,0.10)] overflow-hidden">
              {[
                { value: '2,847', label: 'Active Founders' },
                { value: '412', label: 'Verified Investors' },
                { value: '89', label: 'Deals Closed' },
              ].map((stat) => (
                <div key={stat.label} className="px-5 py-5 text-center border-r last:border-r-0 border-[#eceae5]">
                  <div className="text-4xl font-bold text-[#111111]">{stat.value}</div>
                  <div className="text-sm text-[#6b6b73] mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 border-y border-[#e8e8e2] bg-[#f8f5fb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-sm text-[#77777f]">Trusted by founders from</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {['Y Combinator', 'Techstars', '500 Global', 'Antler', 'Sequoia Scout'].map((name) => (
                <span key={name} className="text-lg font-semibold text-[#9c9ca3]">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-28 bg-[#f4f1fb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-sm font-semibold text-[#d14343] uppercase tracking-wider mb-4">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111111]">
              Three steps to your next funding round
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: Zap, title: 'Build Your Profile', desc: 'Create a compelling profile in minutes. No pitch deck required upfront.', highlight: '2 min average setup' },
              { step: '02', icon: Trophy, title: 'Compete & Rank', desc: 'Join sector-specific challenges. Your traction determines your visibility.', highlight: 'Merit-based rankings' },
              { step: '03', icon: Users, title: 'Get Discovered', desc: 'Verified investors reach out directly. No more cold emails or warm intros.', highlight: 'Direct connections' },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-8 rounded-3xl bg-[#fcfaff] border border-[#e8e8e2] transition-all duration-300 hover:border-[#d8d8d2]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#f2f2ee] flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-[#111111]" />
                  </div>
                  <span className="text-5xl font-bold text-[#e4e4de]">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-3">{item.title}</h3>
                <p className="text-[#66666e] leading-relaxed mb-4">{item.desc}</p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#d14343]">
                  <Check className="w-4 h-4" />
                  {item.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Startups */}
      <section className="py-24 md:py-28 bg-[#fbf8ff] border-y border-[#e8e8e2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#d14343]" />
                <span className="text-sm font-semibold text-[#d14343] uppercase tracking-wider">Live Rankings</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111111]">
                Trending This Week
              </h2>
            </div>
            <Link
              to="/explore"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#111111] hover:text-[#d14343] transition-colors"
            >
              Explore all startups
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {trendingStartups.map((startup, i) => (
              <div
                key={startup.name}
                className="group flex items-center gap-6 p-6 rounded-2xl bg-[#fdfbff] border border-[#e8e8e2] hover:border-[#d9d9d2] transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 text-center">
                  <span className="text-2xl font-bold text-[#9b9ba3]">#{i + 1}</span>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-[#f6f1ff] border border-[#ecece6] flex items-center justify-center text-2xl font-bold text-[#111111] shrink-0">
                  {startup.logo}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-[#111111]">{startup.name}</h3>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-[#f4e8e8] text-[#a24a4a]">
                      {startup.sector}
                    </span>
                  </div>
                  <p className="text-[#66666e]">{startup.stage}</p>
                </div>

                <div className="hidden sm:flex items-center gap-10">
                  <div className="text-right">
                    <div className="text-sm text-[#77777f]">Raised</div>
                    <div className="text-lg font-bold text-[#111111]">{startup.raised}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#77777f]">Growth</div>
                    <div className="text-lg font-bold text-[#d14343]">{startup.growth}</div>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-[#a3a3aa] group-hover:text-[#d14343] group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitions */}
      <section className="py-24 md:py-28 bg-[#f7f3ff]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 mb-8">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">Open Competitions</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111111] mb-6">
                Compete for visibility, prizes, and funding
              </h2>

              <p className="text-xl text-[#66666e] leading-relaxed mb-8">
                Sector-specific challenges with real prizes. Winners get direct access to investors and accelerator opportunities.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  'Compete against startups in your sector',
                  'Rankings based purely on traction metrics',
                  'Winners featured to verified investor network',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#f4e8e8] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#d14343]" />
                    </div>
                    <span className="text-[#111111]">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/competitions"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Browse Competitions
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-4">
              {competitions.map((comp, i) => (
                <div
                  key={comp.title}
                  className={`p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
                    i === 0
                      ? 'bg-[#d14343] text-white border-[#d14343] shadow-[0_18px_35px_rgba(209,67,67,0.25)]'
                      : 'bg-[#fdfbff] border-[#e8e8e2] hover:border-[#d9d9d2]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Trophy className={`w-8 h-8 ${i === 0 ? 'text-amber-200' : 'text-amber-500'}`} />
                    <span className={`text-sm font-medium ${i === 0 ? 'text-white/85' : 'text-[#77777f]'}`}>
                      {comp.deadline}
                    </span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${i === 0 ? 'text-white' : 'text-[#111111]'}`}>
                    {comp.title}
                  </h3>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className={`text-sm ${i === 0 ? 'text-white/85' : 'text-[#77777f]'}`}>Prize Pool</div>
                      <div className={`text-xl font-bold ${i === 0 ? 'text-white' : 'text-[#111111]'}`}>{comp.prize}</div>
                    </div>
                    <div>
                      <div className={`text-sm ${i === 0 ? 'text-white/85' : 'text-[#77777f]'}`}>Entries</div>
                      <div className={`text-xl font-bold ${i === 0 ? 'text-white' : 'text-[#111111]'}`}>{comp.entries}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 md:py-28 bg-[#191922] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Built for modern fundraising
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to get discovered by the right investors
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <feature.icon className="w-8 h-8 text-white mb-6" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-28 bg-[#f5f2fa]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#d14343] uppercase tracking-wider mb-4">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111111]">
              Loved by founders and investors
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="p-8 rounded-3xl bg-[#fdfbff] border border-[#e8e8e2]"
              >
                <div className="flex items-center gap-1 mb-6">
                  {Array(5).fill(0).map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-lg text-[#111111] leading-relaxed mb-8">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#efefea] flex items-center justify-center text-sm font-bold text-[#111111]">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-[#111111]">{testimonial.name}</div>
                    <div className="text-sm text-[#77777f]">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-28 bg-[#f6f6f2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative p-12 md:p-20 rounded-[2.5rem] bg-[#d14343] overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-10" />

            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111111] mb-6">
                Ready to find your perfect investor match?
              </h2>
              <p className="text-xl text-[#111111]/80 mb-10">
                Join thousands of founders who stopped chasing and started closing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#111111] text-white font-semibold rounded-full text-base hover:opacity-90 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/for-investors"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-white/30 text-[#111111] font-semibold rounded-full text-base hover:bg-white/10 transition-all"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact ribbon */}
      <section className="py-12 bg-[#f8f5fb] border-y border-[#e8e8e2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-xs text-[#d14343] uppercase tracking-wider mb-2">Impact program</p>
              <h3 className="text-2xl font-semibold text-[#111111] mb-2">SDG-aligned startups get 0% success fee</h3>
              <p className="text-sm text-[#66666e]">Impact founders receive free Pro access after verification.</p>
            </div>
            <Link
              to="/impact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white font-semibold rounded-full hover:bg-[#222222] transition-colors"
            >
              Explore Impact
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="py-20 bg-[#f3effa]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#111111] mb-4">
            Where founders raise faster
          </h2>
          <p className="text-[#66666e] text-lg mb-8">
            Built for startups that want real investor conversations, not inbox noise.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/for-startups"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#111111] text-white font-semibold rounded-full hover:bg-[#222222] transition-colors"
            >
              Start Raising
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#d9d9d2] text-[#111111] font-semibold rounded-full hover:bg-white transition-colors"
            >
              Browse Startups
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
