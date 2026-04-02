import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, BarChart3, Trophy, Star, DollarSign } from 'lucide-react';
import { useStartupMandate } from '../context/StartupMandateContext';

const steps = [
  { step: '01', title: 'Sign Up & Add Founder Details', desc: 'Create your account via email, Google, or LinkedIn. Enter founder details, company type, sector, and funding stage.' },
  { step: '02', title: 'Submit Structured Business Data', desc: 'Fill in problem statement, solution, market size, business model, traction metrics, team details, and financial projections.' },
  { step: '03', title: 'Receive AI-Generated Pitch Deck', desc: 'Our AI automatically generates a structured, investor-ready pitch deck from your data. Edit sections, export as PDF.' },
  { step: '04', title: 'Get Ranked & Discovered', desc: 'Your startup is ranked based on AI score, competition performance, and investor interest. Visibility is persistent — not event-based.' },
  { step: '05', title: 'Enter Competitions & Win', desc: 'Apply to themed competitions aligned to your sector. Win badges, boost rankings, and get in front of investors at scale.' },
  { step: '06', title: 'Connect With Investors', desc: 'Investors can request contact. Approve, schedule meetings, and manage your fundraising process through the platform.' },
];

const proFeatures = [
  { icon: Zap, title: 'AI Advanced Scoring', desc: 'Deeper AI analysis with improvement suggestions and benchmark comparisons.', color: 'text-[#8b5cf6]' },
  { icon: BarChart3, title: 'Priority Discovery Boost', desc: 'Appear higher in investor discovery feeds and search results.', color: 'text-[#60a5fa]' },
  { icon: Trophy, title: 'Unlimited Competition Entries', desc: 'Enter unlimited competitions vs. 2/month on free tier.', color: 'text-[#a78bfa]' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Detailed profile view breakdowns, investor demographics, engagement data.', color: 'text-[#4ade80]' },
  { icon: Star, title: 'Profile Highlight Badge', desc: 'Pro badge on your profile for increased investor trust and credibility.', color: 'text-[#f472b6]' },
];

const impactPerks = [
  'Free Pro subscription (post verification)',
  '0% success fee when you raise capital',
  'Dedicated Impact Investor discovery feed',
  'SDG alignment badge on your profile',
  'Priority listing in Impact rankings',
  'Featured in Impact investor reports',
];

const faq = [
  { q: 'What is the success fee?', a: '3% of capital raised, collected only after funds are received in your account. Impact startups verified under our SDG program pay 0%.' },
  { q: 'How is the AI pitch deck generated?', a: 'Our AI processes your submitted business data and auto-generates a structured deck following the standard investor format: Problem → Solution → Market → Model → Traction → Team → Ask.' },
  { q: 'How are rankings calculated?', a: 'Rankings are based on: AI Evaluation Score (35%), Competition Performance (25%), Investor Interest (25%), and Profile Completeness (15%). They update every 24 hours.' },
  { q: 'Is my data private?', a: 'You control visibility. Your profile is public to verified investors by default, but you can set it to private. Sensitive financial data is only shown with your explicit permission.' },
  { q: 'How do impact startups qualify for 0% fee?', a: 'Apply through our Impact Verification process. Our team manually reviews your SDG alignment, business model, and intended social/environmental outcomes. Approved startups get free Pro + 0% success fee.' },
];

export default function ForStartups() {
  const { mandate } = useStartupMandate();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="bg-[#09091a] border-b border-[#1c1c3a] py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-4">For Startups</div>
          <h1 className="text-5xl font-bold text-white mb-6 max-w-2xl">
            Build Your Identity.<br />
            <span className="gradient-text">Compete. Get Funded.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-xl mb-10">
            Vulture X transforms your raw idea into a structured, investor-ready profile — then makes sure the right investors find you.
          </p>
          {mandate && (
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
              <CheckCircle size={14} />
              Exclusive mandate signed
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={mandate ? '/dashboard' : '/startup-mandate'}
              className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              {mandate ? 'Open Startup Dashboard' : 'Sign Exclusive Mandate'} <ArrowRight size={18} />
            </Link>
            <Link to="/explore" className="flex items-center gap-2 px-7 py-3.5 bg-white/5 border border-[#1c1c3a] text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
              Explore Other Startups
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-3">How It Works</div>
            <h2 className="text-4xl font-bold text-white">Your Journey from Profile to Funding</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((s) => (
              <div key={s.step} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 card-hover relative">
                <div className="absolute top-4 right-4 text-4xl font-black text-[#1c1c3a]">{s.step}</div>
                <h3 className="font-bold text-white mb-2 pr-12">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Subscription */}
      <section className="py-20 bg-[#09091a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-4">Pro Subscription</div>
              <h2 className="text-4xl font-bold text-white mb-4">Premium Tools for Serious Founders</h2>
              <p className="text-gray-400 text-lg mb-8">
                Pro unlocks advanced visibility, AI tools, and competition access — without distorting merit-based rankings.
              </p>
              <div className="space-y-4 mb-8">
                {proFeatures.map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-[#0f0f1e] border border-[#1c1c3a] flex items-center justify-center flex-shrink-0`}>
                      <f.icon size={18} className={f.color} />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">{f.title}</div>
                      <div className="text-gray-400 text-sm">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {/* Pricing Cards */}
              <div className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-7">
                <div className="text-gray-400 text-sm mb-1">Free Tier</div>
                <div className="text-3xl font-bold text-white mb-3">$0 <span className="text-gray-500 text-base font-normal">/ month</span></div>
                <ul className="space-y-2 mb-6">
                  {['Create startup profile', 'Basic AI score', '2 competition entries/month', 'Standard visibility', 'Investor interest notifications'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle size={14} className="text-gray-600" /> {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2.5 border border-[#1c1c3a] text-gray-300 rounded-xl text-sm hover:border-[#8b5cf6]/30 hover:text-white transition-all">
                  Get Started Free
                </button>
              </div>
              <div className="bg-[#0f0f1e] border border-[#8b5cf6]/20 rounded-2xl p-7 relative overflow-hidden">
                <div className="absolute top-4 right-4 px-2 py-1 bg-[#8b5cf6] text-black text-xs font-bold rounded-full">POPULAR</div>
                <div className="text-[#8b5cf6] text-sm mb-1">Pro Tier</div>
                <div className="text-3xl font-bold text-white mb-3">$49 <span className="text-gray-400 text-base font-normal">/ month</span></div>
                <ul className="space-y-2 mb-6">
                  {['Everything in Free', 'Advanced AI scoring + suggestions', 'Priority discovery boost', 'Unlimited competition entries', 'Advanced analytics dashboard', 'Profile highlight badge', 'Priority investor introductions'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} className="text-[#8b5cf6]" /> {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-black font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Startups */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0f2010] to-[#10200f] border border-[#4ade80]/20 rounded-3xl p-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🌱</span>
              <div>
                <div className="text-[#4ade80] text-sm font-semibold uppercase tracking-wider">Impact Startup Program</div>
                <h3 className="text-3xl font-bold text-white">SDG-Aligned? Pay Nothing.</h3>
              </div>
            </div>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl">
              If your startup addresses global challenges aligned with the UN SDGs, you qualify for free Pro access and 0% success fee — permanently.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {impactPerks.map((p) => (
                <div key={p} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle size={14} className="text-[#4ade80] flex-shrink-0" /> {p}
                </div>
              ))}
            </div>
            <Link to="/impact-verification" className="inline-flex items-center gap-2 px-6 py-3 bg-[#4ade80] text-black font-semibold rounded-xl hover:bg-[#22c55e] transition-colors">
              Apply for Impact Verification <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Success Fee */}
      <section className="py-20 bg-[#09091a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-3">Our Model</div>
            <h2 className="text-4xl font-bold text-white">Aligned Incentives</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: DollarSign, title: '3% Success Fee', desc: 'Only charged after you successfully raise capital through Vulture X. If you don\'t raise, you pay nothing.', color: 'text-[#8b5cf6]', note: 'Standard startups' },
              { icon: CheckCircle, title: '0% for Impact', desc: 'Verified SDG-aligned impact startups pay zero success fee. Capital should flow to where it\'s needed most.', color: 'text-[#4ade80]', note: 'Impact startups' },
              { icon: Star, title: 'Agreement at Signup', desc: 'Success fee agreement is signed at onboarding so there are no surprises. Full transparency from day one.', color: 'text-[#60a5fa]', note: 'Full transparency' },
            ].map((item) => (
              <div key={item.title} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-7 text-center card-hover">
                <item.icon size={28} className={`${item.color} mx-auto mb-4`} />
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
                <span className="text-xs text-gray-500 italic">{item.note}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/startup-mandate"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#8b5cf6]/30 text-[#c4b5fd] rounded-xl hover:bg-[#8b5cf6]/10 transition-colors"
            >
              Review and sign exclusive mandate <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faq.map((item) => (
              <div key={item.q} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-xl p-6">
                <h4 className="text-white font-semibold mb-2">{item.q}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-[#09091a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Start Your Fundraising Journey</h2>
          <p className="text-gray-400 text-xl mb-10">Join 2,400+ startups already discovered by investors on Vulture X.</p>
          <Link
            to="/startup-mandate"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-black font-bold rounded-xl hover:opacity-90 transition-opacity text-lg mx-auto"
          >
            Sign Exclusive Mandate <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
