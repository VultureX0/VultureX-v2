import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Grid, List, MapPin, Eye } from 'lucide-react';
import { getExploreStartups } from '../services/startups';
import type { ExploreStartup } from '../types';
import StartupProfileModal from '../components/startupProfile/StartupProfileModal';

const sectors = ['All', 'SaaS', 'CleanTech', 'FinTech', 'HealthTech', 'AgriTech', 'Web3', 'EdTech', 'DeepTech'];
const stages = ['All', 'Idea', 'MVP', 'Revenue', 'Scaling'];

export default function ExploreStartups() {
  const [startups, setStartups] = useState<ExploreStartup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sdgOnly, setSdgOnly] = useState(false);
  const [modalStartupId, setModalStartupId] = useState<number | null>(null);

  useEffect(() => {
    getExploreStartups().then(setStartups);
  }, []);

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
      <div className="bg-[#f9f9f7] border-b border-[#e8e8e2] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[#d14343] text-sm font-semibold uppercase tracking-widest mb-2">Discovery</div>
          <h1 className="text-4xl font-bold text-[#111111] mb-2">Explore Startups</h1>
          <p className="text-gray-600">Browse {startups.length}+ startups ranked by AI score, traction, and competition performance.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-[#f6f6f2]/95 backdrop-blur border-b border-[#e8e8e2] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px] max-w-sm relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search startups..."
                className="w-full bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-xl pl-9 pr-4 py-2 text-sm text-[#111111] placeholder-gray-500 focus:outline-none focus:border-[#d14343]/50"
              />
            </div>

            {/* Sector */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-xl px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#d14343]/50"
            >
              {sectors.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Sectors' : s}</option>)}
            </select>

            {/* Stage */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-xl px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#d14343]/50"
            >
              {stages.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Stages' : s}</option>)}
            </select>

            {/* SDG Toggle */}
            <button
              onClick={() => setSdgOnly(!sdgOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${sdgOnly ? 'bg-[#1a2e1a] border-[#4ade80]/40 text-[#4ade80]' : 'bg-[#ffffff] border-[#e8e8e2] text-gray-600 hover:text-[#111111]'}`}
            >
              🌱 Impact Only
            </button>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-gray-600 text-sm">{filtered.length} results</span>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl ${viewMode === 'grid' ? 'bg-[#e8e8e2] text-[#111111]' : 'text-gray-600 hover:text-[#111111]'}`}>
                <Grid size={16} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl ${viewMode === 'list' ? 'bg-[#e8e8e2] text-[#111111]' : 'text-gray-600 hover:text-[#111111]'}`}>
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
              <div
                key={startup.id}
                className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6 card-hover cursor-pointer group relative"
              >
                <Link to={`/startup/profile/${startup.id}`} className="block absolute inset-0 z-0" aria-label={`View ${startup.name} profile`} />
                <div className="relative z-10 pointer-events-none">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#d14343]/20 to-[#b73535]/20 border border-[#d14343]/20 rounded-2xl flex items-center justify-center text-[#d14343] font-bold text-lg">
                      {startup.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-[#111111] flex items-center gap-2">
                        {startup.name}
                        {startup.sdg && <span className="text-[#4ade80] text-xs">🌱</span>}
                      </div>
                      <div className="text-gray-600 text-xs">#{startup.rank} Overall</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#d14343] font-bold text-lg">{startup.score}</div>
                    <div className="text-gray-600 text-xs">AI Score</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{startup.desc}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 text-xs bg-[#e8e8e2] text-gray-700 rounded-full">{startup.sector}</span>
                  <span className={`px-2.5 py-1 text-xs rounded-full ${
                    startup.stage === 'Scaling' ? 'bg-[#1a2e1a] text-[#4ade80]' :
                    startup.stage === 'Revenue' ? 'bg-[#1a2040] text-[#60a5fa]' :
                    startup.stage === 'MVP' ? 'bg-[#2a1a00] text-[#d14343]' :
                    'bg-[#2a2a2a] text-gray-200'
                  }`}>{startup.stage}</span>
                  {startup.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 text-xs bg-[#1a2e1a] text-[#4ade80] rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#e8e8e2]">
                  <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                    <MapPin size={12} />
                    {startup.location}
                  </div>
                  <div className="text-[#d14343] text-sm font-semibold">{startup.raised}</div>
                </div>
                </div>
                <div className="relative z-10 pt-3 flex justify-end pointer-events-auto">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalStartupId(startup.id); }}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#d14343] transition-colors"
                  >
                    <Eye size={14} /> Quick view
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((startup) => (
              <div key={startup.id} className="flex items-center gap-5 bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl px-6 py-4 card-hover cursor-pointer group">
              <Link to={`/startup/profile/${startup.id}`} className="flex flex-1 items-center gap-5 min-w-0" aria-label={`View ${startup.name}`}>
                <div className={`text-xl font-black min-w-[2.5rem] text-center ${startup.rank <= 3 ? 'text-[#d14343]' : 'text-gray-600'}`}>
                  #{startup.rank}
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[#d14343]/20 to-[#b73535]/20 border border-[#d14343]/20 rounded-xl flex items-center justify-center text-[#d14343] font-bold">
                  {startup.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#111111]">{startup.name}</span>
                    {startup.sdg && <span className="text-[#4ade80] text-xs">🌱</span>}
                    <span className="px-2 py-0.5 text-xs bg-[#e8e8e2] text-gray-700 rounded-full">{startup.sector}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-0.5 line-clamp-1">{startup.desc}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-gray-600">{startup.stage}</div>
                  <div className="text-gray-600 flex items-center gap-1"><MapPin size={12} />{startup.location.split(',')[1]?.trim() || startup.location}</div>
                  <div className="text-[#111111] font-medium">{startup.raised}</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-[#e8e8e2] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#d14343] to-[#b73535] rounded-full" style={{ width: `${startup.score}%` }} />
                    </div>
                    <span className="text-[#d14343] font-bold">{startup.score}</span>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setModalStartupId(startup.id)}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#d14343] transition-colors shrink-0"
              >
                <Eye size={14} /> Quick view
              </button>
              </div>
            ))}
          </div>
        )}

        <StartupProfileModal startupId={modalStartupId} onClose={() => setModalStartupId(null)} />

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">No startups found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
