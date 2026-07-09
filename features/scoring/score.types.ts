export type ScoreInput = {
  mrr: number;
  monthlyGrowth: number;
  activeUsers: number;
  customers: number;
  fundingRaised: number;
  burnRate: number;
  runwayMonths: number;
  teamSize: number;
  founderBio: string | null;
  founderLinkedin: string | null;
  founderRole: string | null;
  sector: string;
  stage: string;
  profileViews30d: number;
  interestsReceived: number;
  inCompetition: boolean;
};

export type ScoreBreakdown = {
  total: number;
  traction: number;
  financial: number;
  team: number;
  market: number;
  momentum: number;
};
