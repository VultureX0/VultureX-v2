export type CompetitionStatus = 'active' | 'upcoming' | 'completed';

export type Competition = {
  id: string;
  title: string;
  host: string;
  prize: string;
  sector: string;
  stage: string;
  applicants: number;
  criteria: string[];
  color: string;
  sdg: boolean;
  deadline?: string;
  opensOn?: string;
  status: CompetitionStatus;
};

export type CompetitionWinner = {
  id: string;
  competitionId?: string;
  competition: string;
  winner: string;
  winnerStartupId?: string;
  prize: string;
  raised: string;
  sector: string;
  place?: number;
};

export type CompetitionUpsertInput = Omit<Competition, 'id'> & { id?: string };
export type CompetitionWinnerUpsertInput = Omit<CompetitionWinner, 'id'> & { id?: string };
