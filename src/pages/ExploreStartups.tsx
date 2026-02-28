import { useState } from 'react';
import { Search, Filter, Grid, List, Star, TrendingUp, MapPin } from 'lucide-react';

const sectors = ['All', 'SaaS', 'CleanTech', 'FinTech', 'HealthTech', 'AgriTech', 'Web3', 'EdTech', 'DeepTech'];
const stages = ['All', 'Idea', 'MVP', 'Revenue', 'Scaling'];

const startups = [
  { name: 'SolarAI', sector: 'CleanTech', stage: 'MVP', score: 94, sdg: true, raised: '$2.1M', location: 'Nairobi, Kenya', team: 6, desc: 'AI-driven solar energy optimization platform for emerging markets.', rank: 1, tags: ['SDG 7', 'SDG 13'] },
  { name: 'NeuralPay', sector: 'FinTech', stage: 'Revenue', score: 91, sdg: false, raised: '$5.4M', location: 'Lagos, Nigeria', team: 12, desc: 'Neural network-powered fraud detection for mobile payments across Africa.', rank: 2, tags: [] },
  { name: 'AgriSense', sector: 'AgriTech', stage: 'Scaling', score: 89, sdg: true, raised: '$8.2M', location: 'Accra, Ghana', team: 24, desc: 'IoT sensors and AI analytics for precision farming and yield optimization.', rank: 3, tags: ['SDG 2', 'SDG 8'] },
  { name: 'HealthChain', sector: 'HealthTech', stage: 'MVP', score: 87, sdg: true, raised: '$1.8M', location: 'Cairo, Egypt', team: 8, desc: 'Blockchain-based patient records and telemedicine for underserved communities.', rank: 4, tags: ['SDG 3'] },
  { name: 'CodeStream', sector: 'SaaS', stage: 'Revenue', score: 85, sdg: false, raised: '$3.6M', location: 'Cape Town, SA', team: 15, desc: 'Developer collaboration platform with AI code review and team analytics.', rank: 5, tags: [] },
  { name: 'WaterNet', sector: 'CleanTech', stage: 'MVP', score: 83, sdg: true, raised: '$900K', location: 'Dar es Salaam, TZ', team: 5, desc: 'Smart water distribution networks reducing waste by up to 40%.', rank: 6, tags: ['SDG 6', 'SDG 13'] },
  { name: 'EduBlock', sector: 'EdTech', stage: 'Idea', score: 80, sdg: true, raised: 'Pre-seed', location: 'Kampala, Uganda', team: 4, desc: 'Decentralized credential verification system for African universities.', rank: 7, tags: ['SDG 4'] },
  { name: 'QuantumLend', sector: 'FinTech', stage: 'Revenue', score: 79, sdg: false, raised: '$4.2M', location: 'Casablanca, Morocco', team: 18, desc: 'Alternative credit scoring using ML to unlock lending for the unbanked.', rank: 8, tags: [] },
  { name: 'GreenFreight', sector: 'DeepTech', stage: 'MVP', score: 77, sdg: true, raised: '$1.2M', location: 'Tunis, Tunisia', team: 7, desc: 'Electric freight routing optimization for last-mile logistics networks.', rank: 9, tags: ['SDG 11', 'SDG 13'] },
  { name: 'MediAlert', sector: 'HealthTech', stage: 'Idea', score: 75, sdg: false, raised: 'Pre-seed', location: 'Johannesburg, SA', team: 3, desc: 'AI-powered early disease detection via wearable biosensors.', rank: 10, tags: [] },
  { name: 'ChainCrop', sector: 'AgriTech', stage: 'MVP', score: 73, sdg: true, raised: '$600K', location: 'Nairobi, Kenya', team: 6, desc: 'Blockchain-enabled crop insurance and supply chain for smallholder farmers.', rank: 11, tags: ['SDG 1', 'SDG 2'] },
  { name: 'MetaWork', sector: 'SaaS', stage: 'Revenue', score: 71, sdg: false, raised: '$2.8M', location: 'Lagos, Nigeria', team: 20, desc: 'Virtual workspace platform built for remote-first African teams.', rank: 12, tags: [] },
];

export default function ExploreStartups() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sdgOnly, setSdgOnly] = useState(false);

  const filtered = startups.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSector = selectedSector === 'All' || s.sector === selectedSector;
    const matchStage = selectedStage === 'All' || s.stage === selectedStage;
    const matchSdg = !sdgOnly || s.sdg;
    return matchSearch && matchSector && matchStage && matchSdg;
  });

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-[#09091a] border-b border-[#1c1c3a] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-2">Discovery</div>
          <h1 className="text-4xl font-bold text-white mb-2">Explore Startups</h1>
          <p className="text-gray-400">Browse {startups.length}+ startups ranked by AI score, traction, and competition performance.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-[#06060f]/95 backdrop-blur border-b border-[#1c1c3a] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px] max-w-sm relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search startups..."
                className="w-full bg-[#0f0f1e] border border-[#1c1c3a] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6]/50"
              />
            </div>

            {/* Sector */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#8b5cf6]/50"
            >
              {sectors.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Sectors' : s}</option>)}
            </select>

            {/* Stage */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#8b5cf6]/50"
            >
              {stages.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Stages' : s}</option>)}
            </select>

            {/* SDG Toggle */}
            <button
              onClick={() => setSdgOnly(!sdgOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${sdgOnly ? 'bg-[#1a2e1a] border-[#4ade80]/40 text-[#4ade80]' : 'bg-[#0f0f1e] border-[#1c1c3a] text-gray-400 hover:text-white'}`}
            >
              🌱 Impact Only
            </button>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-gray-500 text-sm">{filtered.length} results</span>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#1c1c3a] text-white' : 'text-gray-500 hover:text-white'}`}>
                <Grid size={16} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#1c1c3a] text-white' : 'text-gray-500 hover:text-white'}`}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((startup) => (
              <div key={startup.name} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 card-hover cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/20 border border-[#8b5cf6]/20 rounded-xl flex items-center justify-center text-[#8b5cf6] font-bold text-lg">
                      {startup.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {startup.name}
                        {startup.sdg && <span className="text-[#4ade80] text-xs">🌱</span>}
                      </div>
                      <div className="text-gray-500 text-xs">#{startup.rank} Overall</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#8b5cf6] font-bold text-lg">{startup.score}</div>
                    <div className="text-gray-500 text-xs">AI Score</div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{startup.desc}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 text-xs bg-[#1c1c3a] text-gray-300 rounded-full">{startup.sector}</span>
                  <span className={`px-2.5 py-1 text-xs rounded-full ${
                    startup.stage === 'Scaling' ? 'bg-[#1a2e1a] text-[#4ade80]' :
                    startup.stage === 'Revenue' ? 'bg-[#1a2040] text-[#60a5fa]' :
                    startup.stage === 'MVP' ? 'bg-[#2a1a00] text-[#8b5cf6]' :
                    'bg-[#2a2a2a] text-gray-400'
                  }`}>{startup.stage}</span>
                  {startup.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 text-xs bg-[#1a2e1a] text-[#4ade80] rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#1c1c3a]">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <MapPin size={12} />
                    {startup.location}
                  </div>
                  <div className="text-[#8b5cf6] text-sm font-semibold">{startup.raised}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((startup) => (
              <div key={startup.name} className="flex items-center gap-5 bg-[#0f0f1e] border border-[#1c1c3a] rounded-xl px-6 py-4 card-hover cursor-pointer">
                <div className={`text-xl font-black min-w-[2.5rem] text-center ${startup.rank <= 3 ? 'text-[#8b5cf6]' : 'text-gray-600'}`}>
                  #{startup.rank}
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/20 border border-[#8b5cf6]/20 rounded-lg flex items-center justify-center text-[#8b5cf6] font-bold">
                  {startup.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white">{startup.name}</span>
                    {startup.sdg && <span className="text-[#4ade80] text-xs">🌱</span>}
                    <span className="px-2 py-0.5 text-xs bg-[#1c1c3a] text-gray-400 rounded-full">{startup.sector}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{startup.desc}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-gray-400">{startup.stage}</div>
                  <div className="text-gray-400 flex items-center gap-1"><MapPin size={12} />{startup.location.split(',')[1]?.trim() || startup.location}</div>
                  <div className="text-white font-medium">{startup.raised}</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-[#1c1c3a] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] rounded-full" style={{ width: `${startup.score}%` }} />
                    </div>
                    <span className="text-[#8b5cf6] font-bold">{startup.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No startups found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
