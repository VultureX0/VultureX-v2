import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Filter, BarChart3, Shield, Target, Trophy, TrendingUp } from 'lucide-react';
import { useInvestor } from '../context/InvestorContext';

const features = [
  { icon: Filter, title: 'Structured deal flow', desc: 'Filter by sector, stage, score, SDG alignment. No more random decks.' },
  { icon: BarChart3, title: 'Standardized scoring', desc: 'Every startup evaluated consistently. Traction, team, market. Bias-free.' },
  { icon: Shield, title: 'Verified startups', desc: 'All data structured and validated. Impact startups manually verified.' },
  { icon: Target, title: 'Smart recommendations', desc: 'Suggestions based on your thesis, sector preferences, and past behavior.' },
  { icon: Trophy, title: 'Host competitions', desc: 'Create themed challenges for curated deal flow aligned to your focus.' },
  { icon: TrendingUp, title: 'Pipeline CRM', desc: 'Save, annotate, track status, schedule meetings. One place.' },
];

const pricingTiers = [
  {
    tier: 'Free',
    price: '$0',
    period: '/month',
    desc: 'Browse and explore',
    features: ['View top 20 startups', 'Basic sector filtering', 'Trending lists', 'Limited profile data'],
    cta: 'Start free',
    highlight: false,
  },
  {
    tier: 'Pro',
    price: '$149',
    period: '/month',
    desc: 'Full discovery and pipeline',
    features: ['Unlimited discovery', 'All filters', 'Full profiles + pitch decks', 'Contact requests', 'Pipeline CRM', 'Analytics', 'Host 1 competition/year'],
    cta: 'Join as Pro',
    highlight: true,
  },
  {
    tier: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For funds and orgs',
    features: ['Everything in Pro', 'Team access', 'Unlimited competitions', 'API access', 'Custom reports', 'Dedicated support'],
    cta: 'Contact us',
    highlight: false,
  },
];

export default function ForInvestors() {
  const { profile } = useInvestor();

  return (
    <div className="min-h-screen pt-14">
      {/* Hero */}
      <section className="py-20 bg-[linear-gradient(180deg,#f3eefb_0%,#f6f6f2_100%)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-600 uppercase tracking-wider mb-4">For Investors</p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#111111] mb-4 max-w-lg leading-tight">
            Better deal flow. Less noise.
          </h1>
          <p className="text-gray-600 text-[15px] max-w-md mb-8 leading-relaxed">
            Stop swimming through unstructured decks. Get scored, filtered, structured deal flow from a curated startup ecosystem.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              to={profile ? '/investor-dashboard' : '/investor-onboarding'}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white font-medium rounded-md text-sm hover:bg-[#222222] transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            >
              {profile ? 'Open dashboard' : 'Join as investor'} <ArrowRight size={15} />
            </Link>
            {profile ? (
              <Link to="/investor-onboarding" className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#d5d5ce] text-gray-700 font-medium rounded-md text-sm hover:border-[#bdbdb4] transition-colors">
                Edit profile
              </Link>
            ) : (
              <Link to="/explore" className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#d5d5ce] text-gray-700 font-medium rounded-md text-sm hover:border-[#bdbdb4] transition-colors">
                Browse startups
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-8 pt-6 border-t border-[#e8e8e2]/40">
            {[
              { value: '200+', label: 'Startups in discovery' },
              { value: '50+', label: 'Verified investors' },
              { value: '12', label: 'Competitions hosted' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-lg font-semibold text-[#111111]">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-20 bg-[#f4f0fb] border-y border-[#e8e8e2]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Who it's for</p>
            <h2 className="text-2xl font-semibold text-[#111111]">All types of capital providers</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { type: 'Angel Investors', desc: 'Early-stage, high-growth opportunities' },
              { type: 'Venture Capital', desc: 'Institutional deal flow across sectors' },
              { type: 'Impact Investors', desc: 'SDG-focused, measurable returns' },
              { type: 'Corporate VC', desc: 'Strategic partnerships, innovation' },
              { type: 'CSR Programs', desc: 'Funding impact startups' },
            ].map((t) => (
              <div key={t.type} className="bg-[#fdfbff] border border-[#e8e8e2] shadow-[0_10px_24px_rgba(17,17,17,0.06)] rounded-2xl p-4">
                <h4 className="text-xs font-medium text-[#111111] mb-1">{t.type}</h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[linear-gradient(180deg,#f6f6f2_0%,#f2edf8_100%)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Features</p>
            <h2 className="text-2xl font-semibold text-[#111111]">Your deal flow dashboard</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e8e8e2]/30 rounded-2xl overflow-hidden">
            {features.map((f) => (
              <div key={f.title} className="bg-[#fcfaff] p-6">
                <f.icon size={18} className="text-gray-600 mb-3" />
                <h3 className="text-sm text-[#111111] font-medium mb-1.5">{f.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Onboarding */}
      <section className="py-20 bg-[#f6f1fb] border-y border-[#e8e8e2]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Getting started</p>
            <h2 className="text-2xl font-semibold text-[#111111]">Set up in 4 steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: '01', title: 'Sign up', desc: 'Email, LinkedIn, or institutional login.' },
              { num: '02', title: 'Define your thesis', desc: 'Investor type, sectors, stage, ticket size, geography.' },
              { num: '03', title: 'Get verified', desc: 'Manual review or KYC-based verification.' },
              { num: '04', title: 'Start discovering', desc: 'Personalized deal flow, trending lists, recommendations.' },
            ].map((s) => (
              <div key={s.num} className="bg-[#fdfbff] border border-[#e8e8e2] shadow-[0_10px_24px_rgba(17,17,17,0.06)] rounded-2xl p-5">
                <span className="text-xs text-gray-600 font-mono">{s.num}</span>
                <h4 className="text-sm font-medium text-[#111111] mt-2 mb-1">{s.title}</h4>
                <p className="text-xs text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 bg-[#f2edf8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f3f8f3] border border-[#d2e6d2] rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xs text-emerald-700 uppercase tracking-wider mb-1.5">Impact investors</p>
              <h3 className="text-lg font-semibold text-[#111111] mb-1.5">Dedicated SDG discovery</h3>
              <p className="text-gray-600 text-sm max-w-md">
                Filter for verified SDG-aligned startups. Impact metrics, verified badges, alignment tags.
              </p>
            </div>
            <Link to="/impact" className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800 transition-colors whitespace-nowrap">
              Explore impact startups <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-[#f3eff9] border-y border-[#e8e8e2]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="text-2xl font-semibold text-[#111111]">Investor access tiers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
            {pricingTiers.map((tier) => (
              <div
                key={tier.tier}
                className={`rounded-2xl p-6 ${
                  tier.highlight
                    ? 'bg-[linear-gradient(180deg,#ffffff_0%,#f6f0ff_100%)] border border-[#d5d5ce] relative shadow-[0_12px_30px_rgba(17,17,17,0.09)]'
                    : 'bg-[#fdfbff] border border-[#e8e8e2] shadow-[0_10px_24px_rgba(17,17,17,0.06)]'
                }`}
              >
                {tier.highlight && (
                  <span className="absolute top-4 right-4 text-[10px] bg-[#111111] text-white font-medium px-2 py-0.5 rounded">Popular</span>
                )}
                <div className="text-xs text-gray-600 mb-1">{tier.tier}</div>
                <div className="text-2xl font-semibold text-[#111111] mb-0.5">
                  {tier.price}<span className="text-gray-600 text-sm font-normal">{tier.period}</span>
                </div>
                <p className="text-xs text-gray-600 mb-5">{tier.desc}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle size={12} className={tier.highlight ? 'text-gray-600' : 'text-gray-600'} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={tier.cta === 'Contact us' ? '/about' : '/investor-onboarding'}
                  className={`block w-full py-2 rounded-md text-xs font-medium text-center transition-colors ${
                    tier.highlight
                      ? 'bg-[#111111] text-white hover:bg-[#222222]'
                      : 'border border-[#e8e8e2] text-gray-600 hover:border-[#d5d5ce] hover:text-[#111111]'
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
      <section className="py-16 bg-[linear-gradient(180deg,#f2edf8_0%,#f6f6f2_100%)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-[#111111] mb-8">Common questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { q: 'How are startups ranked?', a: 'Traction, competition performance, investor interest, and profile completeness.' },
              { q: 'Can I filter by sector?', a: 'Yes. Sector, stage, geography, SDG alignment, and more.' },
              { q: 'Do I need a paid plan to contact founders?', a: 'Pro unlocks full discovery, pitch deck access, and contact workflows.' },
              { q: 'Can my team access one account?', a: 'Yes. Team access is available on Enterprise.' },
            ].map((item) => (
              <div key={item.q} className="bg-[#fdfbff] border border-[#e8e8e2] shadow-[0_10px_24px_rgba(17,17,17,0.06)] rounded-2xl p-5">
                <h3 className="text-sm text-[#111111] font-medium mb-1.5">{item.q}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
