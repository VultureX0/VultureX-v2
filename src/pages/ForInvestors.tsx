import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Filter, BarChart3, Shield, Target, Trophy, TrendingUp } from 'lucide-react';
import { useInvestor } from '../context/InvestorContext';

const investorTypes = [
  { type: 'Angel Investor', desc: 'Individual investors seeking high-growth early-stage opportunities.', icon: '👼' },
  { type: 'Venture Capital', desc: 'VC funds looking for institutional-grade deal flow across sectors.', icon: '🏦' },
  { type: 'Impact Investor', desc: 'SDG-focused investors seeking measurable social & environmental returns.', icon: '🌱' },
  { type: 'Corporate VC', desc: 'Corporates seeking strategic partnerships and innovation pipeline.', icon: '🏢' },
  { type: 'CSR Arms', desc: 'Corporate social responsibility programs funding impact startups.', icon: '💼' },
];

const features = [
  {
    icon: Filter,
    title: 'Structured Deal Flow',
    desc: 'Filter startups by sector, stage, AI score, SDG alignment, and traction metrics. No more scrolling through random decks.',
    color: 'text-[#8b5cf6]',
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Rankings',
    desc: 'Every startup is evaluated and ranked by our AI engine. Standardized, consistent, bias-free assessment.',
    color: 'text-[#60a5fa]',
  },
  {
    icon: Shield,
    title: 'Verified Startups',
    desc: 'All startup data is structured and validated. Impact startups undergo manual SDG verification.',
    color: 'text-[#4ade80]',
  },
  {
    icon: Target,
    title: 'Smart Recommendations',
    desc: 'Platform suggests startups based on your investment thesis, sector preferences, and historical behavior.',
    color: 'text-[#a78bfa]',
  },
  {
    icon: Trophy,
    title: 'Host Competitions',
    desc: 'Create themed challenges to generate curated, structured deal flow aligned to your investment focus.',
    color: 'text-[#f472b6]',
  },
  {
    icon: TrendingUp,
    title: 'Pipeline CRM',
    desc: 'Save startups, add notes, track status from Interested → Due Diligence, and schedule meetings — all in one place.',
    color: 'text-[#fb923c]',
  },
];

const pricingTiers = [
  {
    tier: 'Free',
    price: '$0',
    period: '/month',
    desc: 'Browse and explore limited profiles',
    features: [
      'View top 20 startups',
      'Basic sector filtering',
      'View trending lists',
      'Limited profile data access',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    tier: 'Pro',
    price: '$149',
    period: '/month',
    desc: 'Full discovery and deal flow management',
    features: [
      'Unlimited startup discovery',
      'All filter capabilities',
      'Full startup profile access',
      'Download pitch decks',
      'Contact request system',
      'Pipeline CRM (shortlist + notes)',
      'Advanced analytics access',
      'Competition hosting (1/year)',
    ],
    cta: 'Join as Pro Investor',
    highlight: true,
  },
  {
    tier: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For funds and large organizations',
    features: [
      'Everything in Pro',
      'Team member access',
      'Unlimited competition hosting',
      'API data access',
      'White-labeled reports',
      'Dedicated account manager',
      'Custom sector analytics',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export default function ForInvestors() {
  const { profile } = useInvestor();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="bg-[#09091a] border-b border-[#1c1c3a] py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[#60a5fa] text-sm font-semibold uppercase tracking-widest mb-4">For Investors</div>
          <h1 className="text-5xl font-bold text-white mb-6 max-w-2xl">
            Smarter Deal Flow.<br />
            <span className="gradient-text-blue">Structured Discovery.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-xl mb-10">
            Stop swimming through unstructured decks. Vulture X delivers AI-ranked, filter-ready deal flow from a curated startup ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={profile ? '/investor-dashboard' : '/investor-onboarding'}
              className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              {profile ? 'Open Investor Dashboard' : 'Join as Investor'} <ArrowRight size={18} />
            </Link>
            {profile ? (
              <Link to="/investor-onboarding" className="flex items-center gap-2 px-7 py-3.5 bg-white/5 border border-[#1c1c3a] text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                Edit Investor Profile
              </Link>
            ) : (
              <Link to="/explore" className="flex items-center gap-2 px-7 py-3.5 bg-white/5 border border-[#1c1c3a] text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                Browse Startups
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-3xl">
            {[
              { value: '2,400+', label: 'Startups in discovery' },
              { value: '850+', label: 'Verified investors' },
              { value: '120+', label: 'Competitions hosted' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0f0f1e]/80 border border-[#1c1c3a] rounded-xl px-5 py-4">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investor Types */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[#60a5fa] text-sm font-semibold uppercase tracking-widest mb-3">Who It's For</div>
            <h2 className="text-4xl font-bold text-white">Built for All Capital Providers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {investorTypes.map((t) => (
              <div key={t.type} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-xl p-5 text-center card-hover">
                <div className="text-3xl mb-3">{t.icon}</div>
                <h4 className="font-semibold text-white text-sm mb-2">{t.type}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#09091a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[#60a5fa] text-sm font-semibold uppercase tracking-widest mb-3">Platform Features</div>
            <h2 className="text-4xl font-bold text-white">Your Deal Flow Command Center</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-7 card-hover">
                <f.icon size={28} className={`${f.color} mb-5`} />
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Onboarding Flow */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[#60a5fa] text-sm font-semibold uppercase tracking-widest mb-3">Onboarding</div>
            <h2 className="text-4xl font-bold text-white">Set Up Your Investor Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: '01', title: 'Sign Up', desc: 'Register via Email, LinkedIn, or institutional login.' },
              { step: '02', title: 'Define Your Thesis', desc: 'Select investor type, sector interests, stage preference, ticket size, and geography.' },
              { step: '03', title: 'Get Verified', desc: 'Complete our verification process (manual review or KYC-based) to access full platform.' },
              { step: '04', title: 'Start Discovering', desc: 'Access your personalized deal flow dashboard, trending lists, and AI recommendations.' },
            ].map((s) => (
              <div key={s.step} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 card-hover relative">
                <div className="absolute top-4 right-4 text-4xl font-black text-[#1c1c3a]">{s.step}</div>
                <h4 className="font-bold text-white mb-2 pr-10">{s.title}</h4>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Investors */}
      <section className="py-16 bg-[#0a0f0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0f2010] to-[#0f1a10] border border-[#4ade80]/20 rounded-3xl p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="text-[#4ade80] text-sm font-semibold uppercase tracking-wider mb-2">🌱 Impact Investors</div>
                <h3 className="text-3xl font-bold text-white mb-3">Dedicated SDG Discovery Layer</h3>
                <p className="text-gray-300 max-w-lg">
                  Impact investors get a dedicated filter for verified SDG-aligned startups. All impact startups display their SDG tags, impact metrics, and verified badge.
                </p>
              </div>
              <Link to="/impact" className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-[#4ade80] text-black font-bold rounded-xl hover:bg-[#22c55e] transition-colors whitespace-nowrap">
                Explore Impact Startups <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[#60a5fa] text-sm font-semibold uppercase tracking-widest mb-3">Pricing</div>
            <h2 className="text-4xl font-bold text-white">Investor Access Tiers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.tier}
                className={`rounded-2xl p-7 ${
                  tier.highlight
                    ? 'bg-gradient-to-br from-[#0d1a2e] to-[#0f0f1e] border border-[#60a5fa]/30'
                    : 'bg-[#0f0f1e] border border-[#1c1c3a]'
                }`}
              >
                {tier.highlight && (
                  <div className="text-xs font-bold bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] text-black px-2.5 py-1 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-gray-400 text-sm mb-1">{tier.tier}</div>
                <div className="text-3xl font-bold text-white mb-1">
                  {tier.price}
                  <span className="text-gray-500 text-base font-normal">{tier.period}</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">{tier.desc}</p>
                <ul className="space-y-2.5 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} className={tier.highlight ? 'text-[#60a5fa]' : 'text-gray-600'} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={tier.cta === 'Contact Sales' ? '/about' : '/investor-onboarding'}
                  className={`block w-full py-3 rounded-xl font-semibold text-sm transition-all text-center ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] text-black hover:opacity-90'
                      : 'border border-[#1c1c3a] text-gray-300 hover:border-[#60a5fa]/30 hover:text-white'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-[#09091a] border-t border-[#1c1c3a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[#60a5fa] text-sm font-semibold uppercase tracking-widest mb-3">FAQ</div>
            <h2 className="text-4xl font-bold text-white">Common Investor Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                q: 'How are startups ranked?',
                a: 'Startups are ranked using traction, competition performance, investor interest, and profile completeness.',
              },
              {
                q: 'Can I filter by sector and stage?',
                a: 'Yes. You can filter startups by sector, stage, geography, SDG alignment, and more.',
              },
              {
                q: 'Do I need a paid plan to contact founders?',
                a: 'Paid plans unlock full discovery features, pitch deck access, and founder contact workflows.',
              },
              {
                q: 'Can my team access one account?',
                a: 'Yes. Team access is designed for enterprise and fund workflows.',
              },
            ].map((item) => (
              <div key={item.q} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-2">{item.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
