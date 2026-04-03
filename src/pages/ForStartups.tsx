import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, BarChart3, Trophy, DollarSign } from 'lucide-react';
import { useStartupMandate } from '../context/StartupMandateContext';

const steps = [
  { num: '01', title: 'Add your details', desc: 'Founder info, company type, sector, and funding stage. Takes about 10 minutes.' },
  { num: '02', title: 'Submit your business data', desc: 'Problem, solution, market, model, traction, team, and projections. All structured.' },
  { num: '03', title: 'Get your pitch deck', desc: 'We auto-generate an investor-ready deck from your data. Edit and export as PDF.' },
  { num: '04', title: 'Get ranked', desc: 'Your score is based on traction, competition results, and investor interest. Updated daily.' },
  { num: '05', title: 'Enter competitions', desc: 'Apply to sector-specific challenges. Win badges, boost rankings, get in front of investors.' },
  { num: '06', title: 'Connect with investors', desc: 'Investors request contact. You approve, schedule, and manage your fundraise.' },
];

const proFeatures = [
  { icon: Zap, title: 'Advanced scoring', desc: 'Deeper analysis with improvement suggestions and benchmark comparisons.' },
  { icon: BarChart3, title: 'Priority discovery', desc: 'Appear higher in investor discovery feeds and search.' },
  { icon: Trophy, title: 'Unlimited competitions', desc: 'Enter as many competitions as you want (vs. 2/month on free).' },
  { icon: BarChart3, title: 'Analytics', desc: 'Profile views, investor demographics, engagement data.' },
];

const impactPerks = [
  'Free Pro subscription',
  '0% success fee',
  'Dedicated Impact discovery feed',
  'SDG badge on your profile',
  'Priority in Impact rankings',
];

const faq = [
  { q: 'What is the success fee?', a: '3% of capital raised, collected only after funds hit your account. Impact startups pay 0%.' },
  { q: 'How is the pitch deck generated?', a: 'From your submitted data. Standard format: Problem, Solution, Market, Model, Traction, Team, Ask.' },
  { q: 'How are rankings calculated?', a: 'AI score (35%), competition performance (25%), investor interest (25%), profile completeness (15%). Updated daily.' },
  { q: 'Is my data private?', a: 'Your profile is visible to verified investors by default. Sensitive financials are only shown with your permission.' },
  { q: 'How do I qualify for 0% fee?', a: 'Apply through Impact Verification. We review SDG alignment, business model, and intended outcomes manually.' },
];

export default function ForStartups() {
  const { mandate } = useStartupMandate();

  return (
    <div className="min-h-screen pt-14">
      {/* Hero */}
      <section className="py-20 bg-[#06060f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">For Startups</p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-4 max-w-lg leading-tight">
            Build your profile. Get discovered. Raise capital.
          </h1>
          <p className="text-gray-400 text-[15px] max-w-md mb-8 leading-relaxed">
            Turn your startup into a structured, investor-ready profile. Then let verified investors find you instead of the other way around.
          </p>
          {mandate && (
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <CheckCircle size={13} />
              Exclusive mandate signed
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Link
              to={mandate ? '/dashboard' : '/startup-mandate'}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#06060f] font-medium rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              {mandate ? 'Open dashboard' : 'Sign exclusive mandate'} <ArrowRight size={15} />
            </Link>
            <Link to="/explore" className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#2a2a3d] text-gray-300 font-medium rounded-md text-sm hover:border-gray-500 transition-colors">
              Browse startups
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-[#08081a] border-y border-[#1c1c3a]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">How it works</p>
            <h2 className="text-2xl font-semibold text-white">From profile to funding</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1c1c3a]/30 rounded-xl overflow-hidden">
            {steps.map((s) => (
              <div key={s.num} className="bg-[#0a0a1a] p-6">
                <span className="text-xs text-gray-600 font-mono">{s.num}</span>
                <h3 className="text-sm text-white font-medium mt-2 mb-1.5">{s.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro */}
      <section className="py-20 bg-[#06060f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pro subscription</p>
              <h2 className="text-2xl font-semibold text-white mb-3">More visibility, better tools</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Pro gives you advanced scoring, priority discovery, and unlimited competition access. Rankings stay merit-based.
              </p>
              <div className="space-y-3">
                {proFeatures.map((f) => (
                  <div key={f.title} className="flex gap-3">
                    <f.icon size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-white font-medium">{f.title}</div>
                      <div className="text-xs text-gray-500">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-[#0a0a1a] border border-[#1c1c3a]/40 rounded-xl p-6">
                <div className="text-xs text-gray-500 mb-1">Free</div>
                <div className="text-2xl font-semibold text-white mb-3">$0<span className="text-gray-600 text-sm font-normal"> /month</span></div>
                <ul className="space-y-2 mb-5">
                  {['Startup profile', 'Basic scoring', '2 competitions/month', 'Investor notifications'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle size={12} className="text-gray-600" /> {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2 border border-[#1c1c3a] text-gray-400 rounded-md text-xs hover:border-[#2a2a4a] transition-colors">
                  Get started free
                </button>
              </div>
              <div className="bg-[#0a0a1a] border border-[#2a2a4a] rounded-xl p-6 relative">
                <span className="absolute top-4 right-4 text-[10px] bg-white text-[#06060f] font-medium px-2 py-0.5 rounded">Popular</span>
                <div className="text-xs text-gray-500 mb-1">Pro</div>
                <div className="text-2xl font-semibold text-white mb-3">$49<span className="text-gray-600 text-sm font-normal"> /month</span></div>
                <ul className="space-y-2 mb-5">
                  {['Everything in Free', 'Advanced scoring + suggestions', 'Priority discovery', 'Unlimited competitions', 'Analytics dashboard', 'Priority investor intros'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle size={12} className="text-gray-400" /> {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2 bg-white text-[#06060f] font-medium rounded-md text-xs hover:bg-gray-200 transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 bg-[#08081a] border-y border-[#1c1c3a]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0a110a] border border-[#1a2e1a]/50 rounded-xl p-8">
            <p className="text-xs text-emerald-500/70 uppercase tracking-wider mb-2">Impact program</p>
            <h3 className="text-xl font-semibold text-white mb-2">SDG-aligned? Pay nothing.</h3>
            <p className="text-gray-400 text-sm mb-5 max-w-lg leading-relaxed">
              If your startup addresses global challenges aligned with the UN SDGs, you qualify for free Pro access and 0% success fee. Permanently.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5">
              {impactPerks.map((p) => (
                <span key={p} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <CheckCircle size={11} className="text-emerald-500/60" /> {p}
                </span>
              ))}
            </div>
            <Link to="/impact-verification" className="inline-flex items-center gap-1.5 text-sm text-emerald-400/80 hover:text-emerald-300 transition-colors">
              Apply for verification <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Success fee */}
      <section className="py-20 bg-[#06060f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="text-2xl font-semibold text-white">Aligned incentives</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: DollarSign, title: '3% success fee', desc: 'Only charged when you successfully raise through Vulture X. Don\'t raise, don\'t pay.', note: 'Standard' },
              { icon: CheckCircle, title: '0% for impact', desc: 'Verified SDG-aligned startups pay zero. Capital should flow where it\'s needed.', note: 'Impact startups' },
              { icon: Zap, title: 'Signed at onboarding', desc: 'No surprises. The agreement is clear from day one.', note: 'Transparency' },
            ].map((item) => (
              <div key={item.title} className="bg-[#0a0a1a] border border-[#1c1c3a]/40 rounded-xl p-6">
                <item.icon size={16} className="text-gray-500 mb-3" />
                <h3 className="text-sm font-medium text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">{item.desc}</p>
                <span className="text-[10px] text-gray-600">{item.note}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              to="/startup-mandate"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Review exclusive mandate <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#08081a] border-y border-[#1c1c3a]/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-white mb-8">Common questions</h2>
          <div className="space-y-3">
            {faq.map((item) => (
              <div key={item.q} className="bg-[#0a0a1a] border border-[#1c1c3a]/40 rounded-xl p-5">
                <h4 className="text-sm text-white font-medium mb-1.5">{item.q}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#06060f]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">Ready to get discovered?</h2>
          <p className="text-gray-500 text-sm mb-6">Set up your profile. It takes about 10 minutes.</p>
          <Link
            to="/startup-mandate"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#06060f] font-medium rounded-md text-sm hover:bg-gray-200 transition-colors"
          >
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
