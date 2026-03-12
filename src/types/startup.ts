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

export type ExploreStartup = {
  id: number;
  name: string;
  sector: string;
  stage: string;
  score: number;
  sdg: boolean;
  raised: string;
  location: string;
  desc: string;
  rank: number;
  tags: string[];
};
