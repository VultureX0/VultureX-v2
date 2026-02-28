export type Founder = {
  name: string;
  role: string;
  linkedIn: string;
  bio: string;
};

export type Milestone = {
  date: string;
  title: string;
};

export type StartupProfileData = {
  id: number;
  name: string;
  tagline: string;
  logoLetter: string;
  sector: string;
  location: string;
  stage: string;
  fundingRaised: string;
  description: string;
  problem: string;
  solution: string;
  revenue: string;
  monthlyGrowthPercent: number;
  activeUsers: string;
  customers: string;
  milestones: Milestone[];
  burnRate: string;
  runway: string;
  unitEconomics: string;
  team: Founder[];
  pitchDeckUrl: string | null;
  demoVideoUrl: string | null;
  investorsOnboard: string[];
  interestedInvestorsCount: number;
  matchScore: number | null;
  sdg: boolean;
  score: number;
};

export const STARTUP_PROFILES: StartupProfileData[] = [
  {
    id: 1,
    name: 'SolarAI',
    tagline: 'AI-driven solar energy optimization for emerging markets',
    logoLetter: 'S',
    sector: 'CleanTech',
    location: 'Nairobi, Kenya',
    stage: 'MVP',
    fundingRaised: '$2.1M',
    description: 'SolarAI combines satellite imagery, weather data, and machine learning to optimize solar panel placement and energy output for off-grid and minigrid operators across Africa. Our platform has already increased energy yield by 18% for pilot sites in Kenya and Nigeria.',
    problem: 'Off-grid and minigrid operators lack tools to optimize panel placement and predict output, leading to underperformance and higher LCOE.',
    solution: 'We provide a SaaS platform that ingests site data and delivers optimal layout recommendations, real-time output forecasting, and maintenance alerts.',
    revenue: '$380K ARR',
    monthlyGrowthPercent: 12,
    activeUsers: '2,400+',
    customers: '34 minigrid operators',
    milestones: [
      { date: 'Q4 2024', title: 'Closed $2.1M seed led by GreenCapital' },
      { date: 'Q3 2024', title: 'Launched in Nigeria & Tanzania' },
      { date: 'Q2 2024', title: '18% yield improvement validated with 5 pilots' },
      { date: 'Q1 2024', title: 'First paying customers in Kenya' },
    ],
    burnRate: '$42K/mo',
    runway: '17 months',
    unitEconomics: 'CAC $8K, LTV $45K, payback 14 months',
    team: [
      { name: 'Amina Okafor', role: 'CEO & Co-founder', linkedIn: 'https://linkedin.com/in/amina-okafor', bio: 'Ex-ENGIE, 10 years in renewable energy across Africa.' },
      { name: 'David Mwangi', role: 'CTO & Co-founder', linkedIn: 'https://linkedin.com/in/david-mwangi', bio: 'Former ML lead at Safaricom, Stanford MS.' },
    ],
    pitchDeckUrl: '#',
    demoVideoUrl: null,
    investorsOnboard: ['GreenCapital Ventures', 'Acumen'],
    interestedInvestorsCount: 47,
    matchScore: 94,
    sdg: true,
    score: 94,
  },
  {
    id: 2,
    name: 'NeuralPay',
    tagline: 'Neural network-powered fraud detection for mobile payments',
    logoLetter: 'N',
    sector: 'FinTech',
    location: 'Lagos, Nigeria',
    stage: 'Revenue',
    fundingRaised: '$5.4M',
    description: 'NeuralPay provides real-time fraud detection and transaction scoring for mobile money and payment providers. Our models reduce false positives by 40% while catching 99.2% of fraudulent transactions.',
    problem: 'Mobile money operators lose millions to fraud and block legitimate users with overly aggressive rules.',
    solution: 'ML-powered transaction scoring that adapts to local patterns and integrates via API with existing switches.',
    revenue: '$1.2M ARR',
    monthlyGrowthPercent: 8,
    activeUsers: 'N/A',
    customers: '12 payment providers',
    milestones: [
      { date: 'Q4 2024', title: 'Series A $5.4M' },
      { date: 'Q3 2024', title: 'Live in 6 countries' },
      { date: 'Q2 2024', title: '99.2% fraud detection rate certified' },
    ],
    burnRate: '$85K/mo',
    runway: '24 months',
    unitEconomics: 'Per-transaction pricing, 70% gross margin',
    team: [
      { name: 'Chidi Nnamdi', role: 'CEO', linkedIn: 'https://linkedin.com/in/chidi-nnamdi', bio: 'Ex-Visa, led fraud products for SSA.' },
      { name: 'Fatima Bello', role: 'CPO', linkedIn: 'https://linkedin.com/in/fatima-bello', bio: 'Former Flutterwave, 8 years in payments.' },
    ],
    pitchDeckUrl: '#',
    demoVideoUrl: '#',
    investorsOnboard: ['TLcom', 'Flutterwave Ventures'],
    interestedInvestorsCount: 38,
    matchScore: 91,
    sdg: false,
    score: 91,
  },
  {
    id: 3,
    name: 'AgriSense',
    tagline: 'IoT sensors and AI analytics for precision farming',
    logoLetter: 'A',
    sector: 'AgriTech',
    location: 'Accra, Ghana',
    stage: 'Scaling',
    fundingRaised: '$8.2M',
    description: 'AgriSense deploys low-cost soil and weather sensors with an AI layer that delivers planting, irrigation, and harvest recommendations to smallholder cooperatives and agribusinesses.',
    problem: 'Smallholder farmers lack access to precision agriculture tools that large farms use, limiting yields and resilience.',
    solution: 'Sensor network + mobile app + AI recommendations at a fraction of traditional precision-ag cost.',
    revenue: '$2.1M ARR',
    monthlyGrowthPercent: 5,
    activeUsers: '45,000+ farmers',
    customers: '28 cooperatives, 3 agribusinesses',
    milestones: [
      { date: 'Q4 2024', title: 'Series A $8.2M' },
      { date: 'Q3 2024', title: '45K farmers on platform' },
      { date: 'Q2 2024', title: 'Yield uplift 22% avg in trials' },
    ],
    burnRate: '$120K/mo',
    runway: '22 months',
    unitEconomics: 'Subscription per hectare, 65% gross margin',
    team: [
      { name: 'Priya Sharma', role: 'CEO & Co-founder', linkedIn: 'https://linkedin.com/in/priya-sharma', bio: 'Ex-Syngenta, agtech across India and Africa.' },
      { name: 'Kwame Asante', role: 'COO', linkedIn: 'https://linkedin.com/in/kwame-asante', bio: 'Former OCP, supply chain and farmer networks.' },
    ],
    pitchDeckUrl: '#',
    demoVideoUrl: null,
    investorsOnboard: ['Acumen', 'IFC', 'Novastar'],
    interestedInvestorsCount: 62,
    matchScore: 89,
    sdg: true,
    score: 89,
  },
  {
    id: 4,
    name: 'HealthChain',
    tagline: 'Blockchain-based patient records and telemedicine',
    logoLetter: 'H',
    sector: 'HealthTech',
    location: 'Cairo, Egypt',
    stage: 'MVP',
    fundingRaised: '$1.8M',
    description: 'HealthChain provides a portable, consent-based health record that travels with the patient and integrates with clinics and telemedicine providers. We focus on underserved communities where records are paper-based or siloed.',
    problem: 'Patient records are fragmented and inaccessible across facilities, leading to重复 tests and poor continuity of care.',
    solution: 'Patient-owned health record on a permissioned blockchain with APIs for clinics and telehealth apps.',
    revenue: '$180K ARR',
    monthlyGrowthPercent: 18,
    activeUsers: '8,200',
    customers: '14 clinics, 2 telehealth partners',
    milestones: [
      { date: 'Q4 2024', title: 'Seed $1.8M' },
      { date: 'Q3 2024', title: 'Pilot with 14 clinics in Egypt' },
      { date: 'Q2 2024', title: 'HIPAA-aligned architecture certified' },
    ],
    burnRate: '$38K/mo',
    runway: '18 months',
    unitEconomics: 'B2B SaaS per clinic + per-consult fee',
    team: [
      { name: 'Omar Hassan', role: 'CEO', linkedIn: 'https://linkedin.com/in/omar-hassan', bio: 'Ex-IBM Health, healthcare IT in MENA.' },
      { name: 'Layla Ibrahim', role: 'CTO', linkedIn: 'https://linkedin.com/in/layla-ibrahim', bio: 'Blockchain and identity, 6 years.' },
    ],
    pitchDeckUrl: '#',
    demoVideoUrl: '#',
    investorsOnboard: [],
    interestedInvestorsCount: 29,
    matchScore: 87,
    sdg: true,
    score: 87,
  },
  {
    id: 5,
    name: 'CodeStream',
    tagline: 'Developer collaboration with AI code review',
    logoLetter: 'C',
    sector: 'SaaS',
    location: 'Cape Town, SA',
    stage: 'Revenue',
    fundingRaised: '$3.6M',
    description: 'CodeStream brings AI-powered code review and async collaboration to distributed engineering teams. We integrate with GitHub/GitLab and reduce review cycles by 35% on average.',
    problem: 'Remote dev teams suffer from slow review cycles and context loss in async workflows.',
    solution: 'AI-assisted review suggestions, inline comments, and structured handoffs in one place.',
    revenue: '$720K ARR',
    monthlyGrowthPercent: 10,
    activeUsers: '4,200 developers',
    customers: '89 teams',
    milestones: [
      { date: 'Q4 2024', title: 'Seed $3.6M' },
      { date: 'Q3 2024', title: '89 paying teams' },
      { date: 'Q2 2024', title: '35% faster review cycle (internal benchmark)' },
    ],
    burnRate: '$55K/mo',
    runway: '20 months',
    unitEconomics: 'Per-seat subscription, 80% gross margin',
    team: [
      { name: 'James Okonkwo', role: 'CEO', linkedIn: 'https://linkedin.com/in/james-okonkwo', bio: 'Ex-Atlassian, dev tools for 8 years.' },
      { name: 'Sarah Chen', role: 'CTO', linkedIn: 'https://linkedin.com/in/sarah-chen', bio: 'ML for code, former Google.' },
    ],
    pitchDeckUrl: '#',
    demoVideoUrl: null,
    investorsOnboard: ['Knife Capital', '4Di Capital'],
    interestedInvestorsCount: 55,
    matchScore: 85,
    sdg: false,
    score: 85,
  },
];

// Snapshot for Explore list/grid (subset)
export function getExploreStartups() {
  return STARTUP_PROFILES.map((p) => ({
    id: p.id,
    name: p.name,
    sector: p.sector,
    stage: p.stage,
    score: p.score,
    sdg: p.sdg,
    raised: p.fundingRaised,
    location: p.location,
    desc: p.tagline,
    rank: p.id,
    tags: p.sdg ? ['SDG'] : [],
  }));
}

export function getStartupById(id: number | string): StartupProfileData | undefined {
  const num = typeof id === 'string' ? parseInt(id, 10) : id;
  if (Number.isNaN(num)) return undefined;
  return STARTUP_PROFILES.find((s) => s.id === num);
}
