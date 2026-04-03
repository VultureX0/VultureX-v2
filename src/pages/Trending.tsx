import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Flame, ArrowUp } from 'lucide-react';
import { useAuth } from '../features/auth';

const categories = [
  { id: 'overall', label: 'Top 10 Overall', icon: '🏆' },
  { id: 'cleantech', label: 'Top 10 CleanTech', icon: '🌿' },
  { id: 'fintech', label: 'Top 10 FinTech', icon: '💰' },
  { id: 'web3', label: 'Top 10 Web3', icon: '⛓️' },
  { id: 'impact', label: 'Top 10 Impact', icon: '🌱' },
  { id: 'rising', label: 'Fastest Rising', icon: '🚀' },
  { id: 'investor', label: 'Most Investor Interest', icon: '👀' },
];

const data: Record<string, Array<{ name: string; sector: string; stage: string; score: number; sdg: boolean; change: number; desc: string; investors: number }>> = {
  overall: [
    { name: 'SolarAI', sector: 'CleanTech', stage: 'MVP', score: 94, sdg: true, change: +2, desc: 'AI-driven solar energy optimization for emerging markets', investors: 47 },
    { name: 'NeuralPay', sector: 'FinTech', stage: 'Revenue', score: 91, sdg: false, change: 0, desc: 'Neural network fraud detection for mobile payments', investors: 38 },
    { name: 'AgriSense', sector: 'AgriTech', stage: 'Scaling', score: 89, sdg: true, change: +1, desc: 'IoT sensors and AI analytics for precision farming', investors: 62 },
    { name: 'HealthChain', sector: 'HealthTech', stage: 'MVP', score: 87, sdg: true, change: +3, desc: 'Blockchain patient records and telemedicine', investors: 29 },
    { name: 'CodeStream', sector: 'SaaS', stage: 'Revenue', score: 85, sdg: false, change: -1, desc: 'Developer collaboration with AI code review', investors: 55 },
    { name: 'WaterNet', sector: 'CleanTech', stage: 'MVP', score: 83, sdg: true, change: +5, desc: 'Smart water distribution networks', investors: 21 },
    { name: 'EduBlock', sector: 'EdTech', stage: 'Idea', score: 80, sdg: true, change: +4, desc: 'Decentralized credential verification', investors: 14 },
    { name: 'QuantumLend', sector: 'FinTech', stage: 'Revenue', score: 79, sdg: false, change: -2, desc: 'Alternative credit scoring with ML', investors: 43 },
    { name: 'GreenFreight', sector: 'DeepTech', stage: 'MVP', score: 77, sdg: true, change: +1, desc: 'Electric freight routing optimization', investors: 18 },
    { name: 'MediAlert', sector: 'HealthTech', stage: 'Idea', score: 75, sdg: false, change: +6, desc: 'AI early disease detection via wearables', investors: 12 },
  ],
  cleantech: [
    { name: 'SolarAI', sector: 'CleanTech', stage: 'MVP', score: 94, sdg: true, change: +1, desc: 'AI-driven solar optimization', investors: 47 },
    { name: 'WaterNet', sector: 'CleanTech', stage: 'MVP', score: 83, sdg: true, change: +3, desc: 'Smart water distribution', investors: 21 },
    { name: 'GreenFreight', sector: 'DeepTech', stage: 'MVP', score: 77, sdg: true, change: +2, desc: 'Electric freight routing', investors: 18 },
    { name: 'WindMapper', sector: 'CleanTech', stage: 'Idea', score: 72, sdg: true, change: +4, desc: 'Wind energy site assessment AI', investors: 9 },
    { name: 'CarbonTrace', sector: 'CleanTech', stage: 'Revenue', score: 70, sdg: true, change: +1, desc: 'Enterprise carbon footprint tracking', investors: 31 },
    { name: 'OceanClean', sector: 'CleanTech', stage: 'MVP', score: 68, sdg: true, change: +2, desc: 'Autonomous ocean plastic collection', investors: 16 },
    { name: 'EcoMesh', sector: 'CleanTech', stage: 'Idea', score: 65, sdg: true, change: +3, desc: 'Renewable energy microgrids for villages', investors: 7 },
    { name: 'AirSense', sector: 'CleanTech', stage: 'MVP', score: 63, sdg: true, change: 0, desc: 'Urban air quality monitoring network', investors: 11 },
    { name: 'BiogasAI', sector: 'CleanTech', stage: 'Idea', score: 60, sdg: true, change: +1, desc: 'Smart biogas plant optimization', investors: 5 },
    { name: 'SoilTech', sector: 'AgriTech', stage: 'MVP', score: 58, sdg: true, change: +2, desc: 'Soil health sensors for carbon farming', investors: 8 },
  ],
  fintech: [
    { name: 'NeuralPay', sector: 'FinTech', stage: 'Revenue', score: 91, sdg: false, change: 0, desc: 'Neural network fraud detection', investors: 38 },
    { name: 'QuantumLend', sector: 'FinTech', stage: 'Revenue', score: 79, sdg: false, change: -1, desc: 'Alternative credit scoring', investors: 43 },
    { name: 'RemitSwift', sector: 'FinTech', stage: 'MVP', score: 76, sdg: true, change: +2, desc: 'Low-cost cross-border remittances', investors: 24 },
    { name: 'PensionTech', sector: 'FinTech', stage: 'Revenue', score: 74, sdg: false, change: +1, desc: 'Automated pension management', investors: 19 },
    { name: 'TrustScore', sector: 'FinTech', stage: 'Idea', score: 70, sdg: false, change: +3, desc: 'On-chain credit identity for DeFi', investors: 14 },
    { name: 'PayGrid', sector: 'FinTech', stage: 'Scaling', score: 68, sdg: false, change: -2, desc: 'Payment infrastructure for SMEs', investors: 52 },
    { name: 'MicroFund', sector: 'FinTech', stage: 'MVP', score: 65, sdg: true, change: +2, desc: 'Micro-investment platform for millennials', investors: 8 },
    { name: 'InsureAI', sector: 'FinTech', stage: 'MVP', score: 62, sdg: false, change: 0, desc: 'AI-powered microinsurance for farmers', investors: 11 },
    { name: 'CryptoKYC', sector: 'FinTech', stage: 'Revenue', score: 60, sdg: false, change: +1, desc: 'Automated KYC compliance for exchanges', investors: 27 },
    { name: 'WealthOS', sector: 'FinTech', stage: 'Idea', score: 57, sdg: false, change: +4, desc: 'Personal wealth management OS', investors: 6 },
  ],
  web3: [
    { name: 'ChainVault', sector: 'Web3', stage: 'MVP', score: 88, sdg: false, change: +3, desc: 'Decentralized asset custody protocol', investors: 34 },
    { name: 'NFTicket', sector: 'Web3', stage: 'Revenue', score: 82, sdg: false, change: -1, desc: 'NFT-based event ticketing platform', investors: 28 },
    { name: 'DAOgov', sector: 'Web3', stage: 'Idea', score: 79, sdg: false, change: +2, desc: 'DAO governance tooling for communities', investors: 17 },
    { name: 'GreenNFT', sector: 'Web3', stage: 'MVP', score: 76, sdg: true, change: +4, desc: 'Carbon credit NFT marketplace', investors: 21 },
    { name: 'MetaID', sector: 'Web3', stage: 'Idea', score: 73, sdg: false, change: +1, desc: 'Decentralized identity verification', investors: 12 },
    { name: 'DeFiSafe', sector: 'Web3', stage: 'Revenue', score: 71, sdg: false, change: -2, desc: 'Smart contract audit automation', investors: 39 },
    { name: 'Web3Pay', sector: 'Web3', stage: 'MVP', score: 68, sdg: false, change: +2, desc: 'Web3 payroll and invoicing system', investors: 15 },
    { name: 'LayerDAO', sector: 'Web3', stage: 'Idea', score: 65, sdg: false, change: +3, desc: 'Layer 2 governance infrastructure', investors: 9 },
    { name: 'TokenLaunch', sector: 'Web3', stage: 'Revenue', score: 62, sdg: false, change: 0, desc: 'Token sale compliance platform', investors: 22 },
    { name: 'P2PExchange', sector: 'Web3', stage: 'MVP', score: 59, sdg: false, change: +1, desc: 'Peer-to-peer crypto exchange', investors: 7 },
  ],
  impact: [
    { name: 'SolarAI', sector: 'CleanTech', stage: 'MVP', score: 94, sdg: true, change: +1, desc: 'AI-driven solar optimization for emerging markets', investors: 47 },
    { name: 'AgriSense', sector: 'AgriTech', stage: 'Scaling', score: 89, sdg: true, change: +2, desc: 'IoT sensors for precision farming', investors: 62 },
    { name: 'HealthChain', sector: 'HealthTech', stage: 'MVP', score: 87, sdg: true, change: +3, desc: 'Blockchain patient records for underserved communities', investors: 29 },
    { name: 'WaterNet', sector: 'CleanTech', stage: 'MVP', score: 83, sdg: true, change: +4, desc: 'Smart water distribution networks', investors: 21 },
    { name: 'EduBlock', sector: 'EdTech', stage: 'Idea', score: 80, sdg: true, change: +5, desc: 'Decentralized credential verification', investors: 14 },
    { name: 'GreenFreight', sector: 'DeepTech', stage: 'MVP', score: 77, sdg: true, change: +2, desc: 'Electric freight routing optimization', investors: 18 },
    { name: 'RemitSwift', sector: 'FinTech', stage: 'MVP', score: 76, sdg: true, change: +3, desc: 'Low-cost cross-border remittances', investors: 24 },
    { name: 'GreenNFT', sector: 'Web3', stage: 'MVP', score: 76, sdg: true, change: +1, desc: 'Carbon credit NFT marketplace', investors: 21 },
    { name: 'MicroFund', sector: 'FinTech', stage: 'MVP', score: 65, sdg: true, change: +2, desc: 'Micro-investment for millennials', investors: 8 },
    { name: 'ChainCrop', sector: 'AgriTech', stage: 'MVP', score: 73, sdg: true, change: +4, desc: 'Blockchain crop insurance for smallholder farmers', investors: 11 },
  ],
  rising: [
    { name: 'MediAlert', sector: 'HealthTech', stage: 'Idea', score: 75, sdg: false, change: +12, desc: 'AI early disease detection via wearables', investors: 12 },
    { name: 'EduBlock', sector: 'EdTech', stage: 'Idea', score: 80, sdg: true, change: +9, desc: 'Decentralized credential verification', investors: 14 },
    { name: 'WindMapper', sector: 'CleanTech', stage: 'Idea', score: 72, sdg: true, change: +8, desc: 'Wind energy site assessment AI', investors: 9 },
    { name: 'WaterNet', sector: 'CleanTech', stage: 'MVP', score: 83, sdg: true, change: +7, desc: 'Smart water distribution networks', investors: 21 },
    { name: 'DAOgov', sector: 'Web3', stage: 'Idea', score: 79, sdg: false, change: +7, desc: 'DAO governance tooling', investors: 17 },
    { name: 'GreenNFT', sector: 'Web3', stage: 'MVP', score: 76, sdg: true, change: +6, desc: 'Carbon credit NFT marketplace', investors: 21 },
    { name: 'HealthChain', sector: 'HealthTech', stage: 'MVP', score: 87, sdg: true, change: +5, desc: 'Blockchain patient records', investors: 29 },
    { name: 'ChainCrop', sector: 'AgriTech', stage: 'MVP', score: 73, sdg: true, change: +5, desc: 'Blockchain crop insurance', investors: 11 },
    { name: 'CarbonTrace', sector: 'CleanTech', stage: 'Revenue', score: 70, sdg: true, change: +4, desc: 'Enterprise carbon footprint tracking', investors: 31 },
    { name: 'RemitSwift', sector: 'FinTech', stage: 'MVP', score: 76, sdg: true, change: +4, desc: 'Low-cost remittances', investors: 24 },
  ],
  investor: [
    { name: 'AgriSense', sector: 'AgriTech', stage: 'Scaling', score: 89, sdg: true, change: +1, desc: 'IoT sensors for precision farming', investors: 62 },
    { name: 'CodeStream', sector: 'SaaS', stage: 'Revenue', score: 85, sdg: false, change: 0, desc: 'Developer collaboration platform', investors: 55 },
    { name: 'PayGrid', sector: 'FinTech', stage: 'Scaling', score: 68, sdg: false, change: -1, desc: 'Payment infrastructure for SMEs', investors: 52 },
    { name: 'SolarAI', sector: 'CleanTech', stage: 'MVP', score: 94, sdg: true, change: +2, desc: 'AI-driven solar optimization', investors: 47 },
    { name: 'QuantumLend', sector: 'FinTech', stage: 'Revenue', score: 79, sdg: false, change: -1, desc: 'Alternative credit scoring', investors: 43 },
    { name: 'NeuralPay', sector: 'FinTech', stage: 'Revenue', score: 91, sdg: false, change: 0, desc: 'Neural network fraud detection', investors: 38 },
    { name: 'ChainVault', sector: 'Web3', stage: 'MVP', score: 88, sdg: false, change: +2, desc: 'Decentralized asset custody', investors: 34 },
    { name: 'CryptoKYC', sector: 'FinTech', stage: 'Revenue', score: 60, sdg: false, change: +1, desc: 'Automated KYC compliance', investors: 27 },
    { name: 'RemitSwift', sector: 'FinTech', stage: 'MVP', score: 76, sdg: true, change: +1, desc: 'Cross-border remittances', investors: 24 },
    { name: 'NFTicket', sector: 'Web3', stage: 'Revenue', score: 82, sdg: false, change: -2, desc: 'NFT-based event ticketing', investors: 28 },
  ],
};

export default function Trending() {
  const [activeCategory, setActiveCategory] = useState('overall');
  const list = data[activeCategory] || data.overall;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStartupClick = (startup: (typeof list)[0]) => {
    if (isAuthenticated) {
      navigate(`/startup/view/${encodeURIComponent(startup.name)}`, { state: { startup } });
    } else {
      navigate('/login', {
        state: {
          from: '/trending',
          message: 'Please log in to view startup details.',
          startup,
          returnToStartup: true,
        },
      });
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="bg-[#09091a] border-b border-[#1c1c3a] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-2">
            <Flame size={16} /> Live Rankings
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Trending Startups</h1>
          <p className="text-gray-400">Dynamic merit-based rankings updated in real-time based on AI score, traction, and investor interest.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#8b5cf6]'
                  : 'bg-[#0f0f1e] border-[#1c1c3a] text-gray-400 hover:text-white hover:border-[#2d2d50]'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {list.map((startup, i) => (
            <div
              key={startup.name}
              role="button"
              tabIndex={0}
              onClick={() => handleStartupClick(startup)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartupClick(startup)}
              className={`flex items-center gap-5 bg-[#0f0f1e] rounded-2xl px-6 py-5 card-hover cursor-pointer border transition-all ${
                i === 0 ? 'border-[#8b5cf6]/30 amber-glow' : i === 1 ? 'border-gray-400/20' : i === 2 ? 'border-[#cd7f32]/20' : 'border-[#1c1c3a]'
              }`}
            >
              {/* Rank */}
              <div className={`text-3xl font-black min-w-[3rem] text-center ${
                i === 0 ? 'text-[#8b5cf6]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-[#cd7f32]' : 'text-gray-600'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>

              {/* Logo */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                i === 0 ? 'bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-black' :
                'bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/20 border border-[#8b5cf6]/20 text-[#8b5cf6]'
              }`}>
                {startup.name[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-lg">{startup.name}</span>
                  {startup.sdg && <span className="px-2 py-0.5 text-xs bg-[#1a2e1a] text-[#4ade80] border border-[#4ade80]/20 rounded-full">🌱 Impact</span>}
                  <span className="px-2 py-0.5 text-xs bg-[#1c1c3a] text-gray-400 rounded-full">{startup.sector}</span>
                </div>
                <p className="text-gray-500 text-sm mt-0.5">{startup.desc}</p>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-8">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-0.5">AI Score</div>
                  <div className="text-[#8b5cf6] font-bold text-xl">{startup.score}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-0.5">Investors</div>
                  <div className="text-white font-semibold">{startup.investors}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-0.5">Change</div>
                  <div className={`flex items-center gap-1 font-semibold text-sm ${
                    startup.change > 0 ? 'text-[#4ade80]' : startup.change < 0 ? 'text-red-400' : 'text-gray-500'
                  }`}>
                    {startup.change > 0 ? <ArrowUp size={12} /> : startup.change < 0 ? <ArrowUp size={12} className="rotate-180" /> : null}
                    {startup.change > 0 ? `+${startup.change}` : startup.change === 0 ? '—' : startup.change}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How ranking works */}
        <div className="mt-14 bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-8">
          <div className="flex items-center gap-2 text-[#8b5cf6] mb-4">
            <TrendingUp size={18} />
            <h3 className="font-bold text-lg text-white">How Rankings Work</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'AI Evaluation Score', weight: '35%', color: 'from-[#8b5cf6] to-[#7c3aed]' },
              { label: 'Competition Performance', weight: '25%', color: 'from-[#60a5fa] to-[#a78bfa]' },
              { label: 'Investor Interest', weight: '25%', color: 'from-[#4ade80] to-[#22c55e]' },
              { label: 'Profile Completeness', weight: '15%', color: 'from-[#f472b6] to-[#ec4899]' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>{item.weight}</div>
                <div className="text-gray-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-6">
            Rankings recalculate every 24 hours. Pro subscribers receive a visibility boost, but the core score remains merit-based.
          </p>
        </div>
      </div>
    </div>
  );
}
