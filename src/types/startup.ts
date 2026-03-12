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

/** The logged-in startup user's own profile (stored in Firestore `startup_profiles/{uid}`) */
export type UserStartupProfile = {
  // Basic info
  companyName: string;
  tagline: string;
  sector: string;
  location: string;
  stage: string;
  website: string;
  // Founder info
  founderName: string;
  founderRole: string;
  founderBio: string;
  founderLinkedIn: string;
  // Team
  team: Founder[];
  // Traction
  mrr: string;
  activeUsers: string;
  customers: string;
  monthlyGrowthPercent: string;
  // Financials
  fundingRaised: string;
  runway: string;
  burnRate: string;
  cashInBank: string;
  // Pitch
  problemStatement: string;
  solutionDescription: string;
  pitchDeckUrl: string;
  demoVideoUrl: string;
  // Meta
  updatedAt?: string;
};

export const defaultUserStartupProfile: UserStartupProfile = {
  companyName: '',
  tagline: '',
  sector: '',
  location: '',
  stage: '',
  website: '',
  founderName: '',
  founderRole: '',
  founderBio: '',
  founderLinkedIn: '',
  team: [],
  mrr: '',
  activeUsers: '',
  customers: '',
  monthlyGrowthPercent: '',
  fundingRaised: '',
  runway: '',
  burnRate: '',
  cashInBank: '',
  problemStatement: '',
  solutionDescription: '',
  pitchDeckUrl: '',
  demoVideoUrl: '',
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
