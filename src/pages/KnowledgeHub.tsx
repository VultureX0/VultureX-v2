import { useState } from 'react';
import { Search, BookOpen, ArrowRight, Clock } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All', icon: '📚' },
  { id: 'mvp', label: 'Building Your MVP', icon: '⚡' },
  { id: 'legal', label: 'Legal & Compliance', icon: '⚖️' },
  { id: 'fundraising', label: 'Fundraising Basics', icon: '💰' },
  { id: 'pitch', label: 'Pitch Deck', icon: '📊' },
  { id: 'finance', label: 'Financial Modeling', icon: '📈' },
  { id: 'terms', label: 'Term Sheets', icon: '📝' },
  { id: 'cases', label: 'Case Studies', icon: '🎯' },
  { id: 'interviews', label: 'Founder Interviews', icon: '🎙️' },
];

const articles = [
  { title: 'How to Build an MVP in 30 Days', category: 'mvp', readTime: '8 min', level: 'Beginner', excerpt: 'Step-by-step guide to building your minimum viable product without burning cash or time.', featured: true },
  { title: 'Structuring Your Company: LLC vs C-Corp vs LTD', category: 'legal', readTime: '12 min', level: 'Beginner', excerpt: 'Understanding the legal structure that best fits your startup\'s growth trajectory and investor expectations.', featured: false },
  { title: 'The Complete Fundraising Roadmap', category: 'fundraising', readTime: '15 min', level: 'Intermediate', excerpt: 'From pre-seed to Series A — understanding funding stages, what investors expect at each stage, and how to prepare.', featured: true },
  { title: 'The Perfect 10-Slide Pitch Deck', category: 'pitch', readTime: '10 min', level: 'Beginner', excerpt: 'Anatomy of a winning pitch deck: every slide explained with do\'s, don\'ts, and real examples.', featured: false },
  { title: 'Building a 3-Year Financial Model', category: 'finance', readTime: '20 min', level: 'Advanced', excerpt: 'Create investor-ready financial projections: revenue forecasting, unit economics, burn rate, and runway.', featured: true },
  { title: 'Understanding Term Sheets: The Non-Scary Guide', category: 'terms', readTime: '14 min', level: 'Intermediate', excerpt: 'Pre-money valuation, liquidation preferences, pro-rata rights, anti-dilution — explained in plain English.', featured: false },
  { title: 'How SolarAI Raised $2.1M on Vulture X', category: 'cases', readTime: '6 min', level: 'Beginner', excerpt: 'A behind-the-scenes look at how SolarAI structured their profile, won a CleanTech competition, and closed their seed round.', featured: true },
  { title: 'Investor Cold Outreach: Templates That Work', category: 'fundraising', readTime: '7 min', level: 'Beginner', excerpt: 'Proven email templates for cold investor outreach, with real open rates and conversion data.', featured: false },
  { title: 'Founder Interview: Building AgriSense from Zero', category: 'interviews', readTime: '18 min', level: 'All Levels', excerpt: 'Priya Sharma on building a $8M+ company from an idea to Series A — lessons learned, mistakes made, and what she\'d do differently.', featured: false },
  { title: 'Cap Table Management 101', category: 'finance', readTime: '11 min', level: 'Intermediate', excerpt: 'How to structure and manage your capitalization table from founding to IPO, avoiding dilution traps.', featured: false },
  { title: 'What Investors Actually Look For in 2026', category: 'fundraising', readTime: '9 min', level: 'All Levels', excerpt: 'An inside perspective on what modern VCs and angels prioritize — traction, team, market, or all three?', featured: false },
  { title: 'How to Validate Your Idea Before Building', category: 'mvp', readTime: '8 min', level: 'Beginner', excerpt: 'Lean validation frameworks: customer interviews, landing page tests, and smoke tests that save months of wasted effort.', featured: false },
  { title: 'SDG Alignment: Building an Impact-First Startup', category: 'cases', readTime: '10 min', level: 'All Levels', excerpt: 'How to genuinely align your business model with SDGs — and why it opens doors to impact investors and grants.', featured: false },
  { title: 'Reading a Term Sheet: Red Flags to Watch', category: 'terms', readTime: '12 min', level: 'Advanced', excerpt: 'The clauses investors use to protect themselves — and how founders can negotiate fair terms without burning bridges.', featured: false },
  { title: 'Founder Interview: Lessons from NeuralPay', category: 'interviews', readTime: '15 min', level: 'All Levels', excerpt: 'James Okafor on pivoting twice, running out of runway, and rebuilding into a $5M+ FinTech company.', featured: false },
];

const levelColors: Record<string, string> = {
  'Beginner': 'bg-[#1a2e1a] text-[#4ade80] border-[#4ade80]/20',
  'Intermediate': 'bg-[#1a2040] text-[#60a5fa] border-[#60a5fa]/20',
  'Advanced': 'bg-[#2a1a2a] text-[#c35c5c] border-[#c35c5c]/20',
  'All Levels': 'bg-[#2a1a00] text-[#d14343] border-[#d14343]/20',
};

export default function KnowledgeHub() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = articles.filter((a) => {
    const matchCat = activeCategory === 'all' || a.category === activeCategory;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.filter((a) => a.featured);
  const rest = filtered.filter((a) => !a.featured);

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-[#f9f9f7] border-b border-[#e8e8e2] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[#d14343] text-sm font-semibold uppercase tracking-widest mb-2">📚 Knowledge Hub</div>
          <h1 className="text-4xl font-bold text-[#111111] mb-2">The Startup Bible</h1>
          <p className="text-gray-600 mb-8">Everything founders need — from validating an idea to closing a Series A.</p>
          <div className="max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides, case studies, interviews..."
              className="w-full bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl pl-9 pr-4 py-3 text-sm text-[#111111] placeholder-gray-500 focus:outline-none focus:border-[#d14343]/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium border transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#d14343]/10 border-[#d14343]/30 text-[#d14343]'
                  : 'bg-[#ffffff] border-[#e8e8e2] text-gray-600 hover:text-[#111111] hover:border-[#d5d5ce]'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-[#111111] mb-5">Featured Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featured.slice(0, 4).map((article) => (
                <div key={article.title} className="bg-gradient-to-br from-[#ffffff] to-[#0f0f1f] border border-[#d14343]/20 rounded-2xl p-6 card-hover cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 text-xs border rounded-full ${levelColors[article.level]}`}>{article.level}</span>
                    <span className="text-gray-600 text-xs flex items-center gap-1"><Clock size={11} /> {article.readTime} read</span>
                  </div>
                  <h3 className="text-[#111111] font-bold text-lg mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                  <span className="text-[#d14343] text-sm font-medium flex items-center gap-1 hover:underline cursor-pointer">
                    Read Guide <ArrowRight size={14} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Articles */}
        <div>
          <h2 className="text-xl font-bold text-[#111111] mb-5">
            {activeCategory === 'all' ? 'All Resources' : categories.find(c => c.id === activeCategory)?.label}
            <span className="text-gray-600 font-normal text-sm ml-2">({filtered.length} articles)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((article) => (
              <div key={article.title} className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-5 card-hover cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 text-xs border rounded-full ${levelColors[article.level]}`}>{article.level}</span>
                  <span className="text-gray-600 text-xs flex items-center gap-1"><Clock size={11} /> {article.readTime}</span>
                </div>
                <h3 className="text-[#111111] font-semibold mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.excerpt}</p>
                <span className="text-[#d14343] text-sm font-medium flex items-center gap-1 hover:underline">
                  Read <ArrowRight size={13} />
                </span>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <BookOpen size={40} className="text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#111111] mb-2">No articles found</h3>
              <p className="text-gray-600">Try a different search or category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

