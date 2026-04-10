import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Globe } from 'lucide-react';

const sdgs = [
  { number: 1, title: 'No Poverty', color: '#E5243B', emoji: '🏚️' },
  { number: 2, title: 'Zero Hunger', color: '#DDA63A', emoji: '🌾' },
  { number: 3, title: 'Good Health', color: '#4C9F38', emoji: '💊' },
  { number: 4, title: 'Quality Education', color: '#C5192D', emoji: '📚' },
  { number: 5, title: 'Gender Equality', color: '#FF3A21', emoji: '♀️' },
  { number: 6, title: 'Clean Water', color: '#26BDE2', emoji: '💧' },
  { number: 7, title: 'Clean Energy', color: '#FCC30B', emoji: '⚡' },
  { number: 8, title: 'Decent Work', color: '#A21942', emoji: '💼' },
  { number: 9, title: 'Industry & Innovation', color: '#FD6925', emoji: '🏭' },
  { number: 10, title: 'Reduced Inequalities', color: '#DD1367', emoji: '⚖️' },
  { number: 11, title: 'Sustainable Cities', color: '#FD9D24', emoji: '🏙️' },
  { number: 12, title: 'Responsible Consumption', color: '#BF8B2E', emoji: '♻️' },
  { number: 13, title: 'Climate Action', color: '#3F7E44', emoji: '🌍' },
  { number: 14, title: 'Life Below Water', color: '#0A97D9', emoji: '🐋' },
  { number: 15, title: 'Life on Land', color: '#56C02B', emoji: '🌿' },
  { number: 17, title: 'Partnerships', color: '#19486A', emoji: '🤝' },
];

const impactStartups = [
  { name: 'SolarAI', sector: 'CleanTech', sdgs: ['SDG 7', 'SDG 13'], stage: 'MVP', raised: '$2.1M', score: 94, badge: 'Verified', desc: 'AI-driven solar energy optimization for emerging markets' },
  { name: 'AgriSense', sector: 'AgriTech', sdgs: ['SDG 2', 'SDG 8'], stage: 'Scaling', raised: '$8.2M', score: 89, badge: 'Verified', desc: 'IoT sensors and AI analytics for precision farming' },
  { name: 'HealthChain', sector: 'HealthTech', sdgs: ['SDG 3'], stage: 'MVP', raised: '$1.8M', score: 87, badge: 'Verified', desc: 'Blockchain patient records for underserved communities' },
  { name: 'WaterNet', sector: 'CleanTech', sdgs: ['SDG 6', 'SDG 13'], stage: 'MVP', raised: '$900K', score: 83, badge: 'Verified', desc: 'Smart water distribution networks reducing waste by 40%' },
  { name: 'EduBlock', sector: 'EdTech', sdgs: ['SDG 4'], stage: 'Idea', raised: 'Pre-seed', score: 80, badge: 'Verified', desc: 'Decentralized credential verification for African universities' },
  { name: 'RemitSwift', sector: 'FinTech', sdgs: ['SDG 1', 'SDG 10'], stage: 'MVP', raised: '$1.2M', score: 76, badge: 'Pending', desc: 'Low-cost cross-border remittances for migrant workers' },
];

const verificationSteps = [
  { step: '01', title: 'Apply for Verification', desc: 'Submit your application including business model, SDG mapping, and impact metrics.' },
  { step: '02', title: 'Document Review', desc: 'Our team reviews your SDG alignment, evidence of impact activities, and business structure.' },
  { step: '03', title: 'Impact Interview', desc: 'A 30-minute call with our impact verification team to discuss your mission and measurement approach.' },
  { step: '04', title: 'Receive Impact Badge', desc: 'Verified impact startups receive the SDG badge, free Pro access, and 0% success fee.' },
];

const impactInvestors = [
  { name: 'GreenCapital Ventures', focus: 'SDG 7, 13 – Climate & Energy', tickets: '$100K–$2M', portfolio: '42 impact startups' },
  { name: 'UN SDG Capital Fund', focus: 'All SDGs (priority: 1, 3, 4)', tickets: '$50K–$500K', portfolio: '89 impact startups' },
  { name: 'Social Impact Partners', focus: 'SDG 1, 2, 10 – Poverty & Equality', tickets: '$25K–$250K', portfolio: '31 impact startups' },
  { name: 'CleanEarth Fund', focus: 'SDG 6, 13, 14, 15', tickets: '$200K–$5M', portfolio: '18 impact startups' },
];

export default function Impact() {
  return (
    <div className="min-h-screen pt-20">
      <section className="relative overflow-hidden border-b border-[#e8e8e2] py-20 bg-[linear-gradient(180deg,#f7fbf7_0%,#f3f0fa_100%)]">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[620px] h-[420px] bg-[#4ade80]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -right-24 bottom-0 w-[460px] h-[300px] bg-[#8d7cf5]/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="text-sm font-semibold uppercase tracking-widest text-emerald-700 mb-4">Impact & SDG</div>
          <h1 className="text-5xl font-bold text-[#111111] mb-5">
            Build returns and <span className="bg-gradient-to-r from-emerald-700 to-[#5f68a3] bg-clip-text text-transparent">real impact</span>
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-10">
            SDG-aligned startups get faster discovery, free Pro access, and 0% success fee after verification. Investors get a curated impact pipeline with measurable outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/impact-verification" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#111111] text-white font-semibold rounded-2xl hover:bg-[#222222] transition-colors">
              Apply for Impact Verification <ArrowRight size={18} />
            </Link>
            <Link to="/explore" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/80 border border-[#d7e8d7] text-[#111111] font-semibold rounded-2xl hover:bg-white transition-colors">
              Browse Impact Startups
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#f6f4fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '✅', title: '0% Success Fee', desc: 'Impact-verified startups pay zero when they raise capital through Vulture X.', color: 'border-[#cfe7cf] bg-white' },
              { icon: '🚀', title: 'Free Pro Access', desc: 'Verified impact startups unlock full Pro features with no subscription cost.', color: 'border-[#d9d3f3] bg-white' },
              { icon: '🎯', title: 'Dedicated Discovery', desc: 'Impact investors can discover verified SDG startups in a focused feed.', color: 'border-[#d9d3f3] bg-white' },
            ].map((item) => (
              <div key={item.title} className={`border rounded-2xl p-7 shadow-[0_8px_24px_rgba(17,17,17,0.05)] ${item.color}`}>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-[#111111] mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDG Framework */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-emerald-700 text-sm font-semibold uppercase tracking-widest mb-3">
              <Globe size={14} className="inline mr-1" /> SDG Framework
            </div>
            <h2 className="text-4xl font-bold text-[#111111]">UN Sustainable Development Goals</h2>
            <p className="text-gray-600 mt-3 max-w-xl mx-auto">
              Startups can tag their SDG alignment during onboarding. Verification is available for startups with genuine, measurable impact.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {sdgs.map((sdg) => (
              <div
                key={sdg.number}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: `${sdg.color}15`, border: `1px solid ${sdg.color}30` }}
              >
                <div className="text-2xl mb-1">{sdg.emoji}</div>
                <div className="text-xs font-bold text-[#111111]">SDG {sdg.number}</div>
                <div className="text-xs text-gray-600 leading-tight mt-0.5">{sdg.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#f5f9f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-emerald-700 text-sm font-semibold uppercase tracking-widest mb-2">Verified Impact</div>
              <h2 className="text-4xl font-bold text-[#111111]">Impact Startup Showcase</h2>
            </div>
            <Link to="/explore" className="flex items-center gap-1.5 text-emerald-700 text-sm hover:underline">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {impactStartups.map((startup) => (
              <div key={startup.name} className="bg-white border border-[#d2e6d2] rounded-2xl p-6 card-hover cursor-pointer shadow-[0_8px_24px_rgba(17,17,17,0.05)]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/20 border border-[#4ade80]/20 rounded-2xl flex items-center justify-center text-emerald-700 font-bold">
                      {startup.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-[#111111] flex items-center gap-1.5">
                        {startup.name}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border ${startup.badge === 'Verified' ? 'bg-[#ecf8ec] text-emerald-700 border-[#bde0bd]' : 'bg-[#fff3ec] text-[#c35c5c] border-[#f0cdc0]'}`}>
                          {startup.badge === 'Verified' ? '✅' : '⏳'} {startup.badge}
                        </span>
                      </div>
                      <div className="text-gray-600 text-xs">{startup.sector} · {startup.stage}</div>
                    </div>
                  </div>
                  <div className="text-[#d14343] font-bold">{startup.score}</div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{startup.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {startup.sdgs.map((sdg) => (
                    <span key={sdg} className="px-2 py-0.5 text-xs bg-[#ecf8ec] text-emerald-700 border border-[#bde0bd] rounded-full">{sdg}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#e8e8e2]">
                  <span className="text-gray-600 text-sm">Raised</span>
                  <span className="text-emerald-700 font-semibold">{startup.raised}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-emerald-700 text-sm font-semibold uppercase tracking-widest mb-3">Verification</div>
            <h2 className="text-4xl font-bold text-[#111111]">How to Get Impact Verified</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
            {verificationSteps.map((s) => (
              <div key={s.step} className="bg-white border border-[#d2e6d2] rounded-2xl p-6 relative shadow-[0_8px_24px_rgba(17,17,17,0.05)]">
                <div className="absolute top-4 right-4 text-4xl font-black text-[#e8e8e2]">{s.step}</div>
                <h4 className="font-bold text-[#111111] mb-2 pr-10">{s.title}</h4>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/impact-verification" className="inline-flex items-center gap-2 px-8 py-4 bg-[#111111] text-white font-semibold rounded-2xl hover:bg-[#222222] transition-colors mx-auto">
              Apply for Impact Verification <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#f6f4fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-emerald-700 text-sm font-semibold uppercase tracking-widest mb-3">Impact Capital</div>
            <h2 className="text-4xl font-bold text-[#111111]">Active Impact Investors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {impactInvestors.map((inv) => (
              <div key={inv.name} className="bg-white border border-[#d2e6d2] rounded-2xl p-6 card-hover shadow-[0_8px_24px_rgba(17,17,17,0.05)]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[#111111] font-bold">{inv.name}</h4>
                  <span className="px-2.5 py-1 text-xs bg-[#ecf8ec] text-emerald-700 border border-[#bde0bd] rounded-full">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600 text-xs mb-0.5">SDG Focus</div>
                    <div className="text-gray-700">{inv.focus}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xs mb-0.5">Ticket Size</div>
                    <div className="text-[#d14343] font-medium">{inv.tickets}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#e8e8e2]">
                  <div className="flex items-center gap-1.5 text-emerald-700 text-sm">
                    <CheckCircle size={13} /> {inv.portfolio}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
