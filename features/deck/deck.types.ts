export type Slide = {
  type: string;
  headline: string;
  body: string;
  bullets?: string[];
  metric?: { value: string; label: string };
};

export type DeckInput = {
  name: string;
  tagline: string | null;
  sector: string;
  stage: string;
  problem: string | null;
  solution: string | null;
  mrr: number;
  monthlyGrowth: number;
  activeUsers: number;
  customers: number;
  fundingRaised: number;
  burnRate: number;
  runwayMonths: number;
  teamSize: number;
  founderName: string | null;
  founderRole: string | null;
  founderBio: string | null;
};
