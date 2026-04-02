export type LeaderboardCategory =
  | 'overall'
  | 'cleantech'
  | 'fintech'
  | 'web3'
  | 'impact'
  | 'rising'
  | 'investor';

export type LeaderboardDefinition = {
  id: string;
  title: string;
  description?: string;
  updatedAt?: string;
};

export type LeaderboardEntry = {
  id: string;
  category: LeaderboardCategory;
  rank: number;
  startupId?: string;
  name: string;
  sector: string;
  stage: string;
  score: number;
  sdg: boolean;
  change: number;
  desc: string;
  investors: number;
};

export type LeaderboardResult = {
  category: LeaderboardCategory;
  updatedAt?: string;
  entries: LeaderboardEntry[];
};

export type LeaderboardEntryUpsertInput = Omit<LeaderboardEntry, 'id'> & { id?: string };
