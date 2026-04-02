import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import type {
  Competition,
  CompetitionStatus,
  CompetitionUpsertInput,
  CompetitionWinner,
  CompetitionWinnerUpsertInput,
} from '../../types';
import { getDb } from '../../lib/firebase';
import { isFirebaseConfigured } from '../../config/firebase';
import { COMPETITION_SEED, COMPETITION_WINNER_SEED } from './competition.seed';

const COMPETITIONS_COLLECTION = 'competitions';
const WINNERS_COLLECTION = 'competition_winners';
const STATUS_ORDER: Record<CompetitionStatus, number> = {
  upcoming: 0,
  active: 1,
  completed: 2,
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim();
}

function assertCompetitionInput(input: CompetitionUpsertInput): void {
  if (!normalize(input.title)) throw new Error('Competition title is required.');
  if (!normalize(input.host)) throw new Error('Competition host is required.');
  if (!normalize(input.prize)) throw new Error('Competition prize is required.');
  if (!normalize(input.sector)) throw new Error('Competition sector is required.');
  if (!normalize(input.stage)) throw new Error('Competition stage is required.');
  if (!input.status || !(input.status in STATUS_ORDER)) {
    throw new Error('Competition status must be one of: upcoming, active, completed.');
  }
  if (!Number.isFinite(input.applicants) || input.applicants < 0) {
    throw new Error('Applicants must be a non-negative number.');
  }
  if (!Array.isArray(input.criteria)) {
    throw new Error('Criteria must be an array.');
  }
  if (input.status === 'upcoming' && !normalize(input.opensOn)) {
    throw new Error('Upcoming competitions require an opensOn value.');
  }
  if ((input.status === 'active' || input.status === 'completed') && !normalize(input.deadline)) {
    throw new Error('Active/completed competitions require a deadline value.');
  }
}

function assertWinnerInput(input: CompetitionWinnerUpsertInput): void {
  if (!normalize(input.competition)) throw new Error('Winner competition name is required.');
  if (!normalize(input.winner)) throw new Error('Winner startup name is required.');
  if (!normalize(input.prize)) throw new Error('Winner prize is required.');
  if (!normalize(input.raised)) throw new Error('Winner raised amount is required.');
  if (!normalize(input.sector)) throw new Error('Winner sector is required.');
  if (input.place != null && (!Number.isFinite(input.place) || input.place < 1)) {
    throw new Error('Winner place must be a positive number.');
  }
}

function assertTransition(previousStatus: CompetitionStatus, nextStatus: CompetitionStatus): void {
  if (STATUS_ORDER[nextStatus] < STATUS_ORDER[previousStatus]) {
    throw new Error('Invalid status transition. Progression must be upcoming -> active -> completed.');
  }
}

function sortByDateLabel(items: Competition[]): Competition[] {
  return [...items].sort((a, b) => {
    const aDate = Date.parse(a.deadline ?? a.opensOn ?? '');
    const bDate = Date.parse(b.deadline ?? b.opensOn ?? '');
    if (Number.isNaN(aDate) && Number.isNaN(bDate)) return a.title.localeCompare(b.title);
    if (Number.isNaN(aDate)) return 1;
    if (Number.isNaN(bDate)) return -1;
    return aDate - bDate;
  });
}

function mapCompetition(id: string, raw: Partial<Competition>): Competition {
  return {
    id,
    title: raw.title ?? 'Untitled Competition',
    host: raw.host ?? 'Unknown Host',
    prize: raw.prize ?? 'TBD',
    sector: raw.sector ?? 'All Sectors',
    stage: raw.stage ?? 'All Stages',
    applicants: raw.applicants ?? 0,
    criteria: raw.criteria ?? [],
    color: raw.color ?? 'from-[#8b5cf6] to-[#7c3aed]',
    sdg: Boolean(raw.sdg),
    deadline: raw.deadline,
    opensOn: raw.opensOn,
    status: raw.status ?? 'upcoming',
  };
}

function mapWinner(id: string, raw: Partial<CompetitionWinner>): CompetitionWinner {
  return {
    id,
    competition: raw.competition ?? 'Unknown Competition',
    winner: raw.winner ?? 'Unknown Winner',
    prize: raw.prize ?? 'TBD',
    raised: raw.raised ?? 'N/A',
    sector: raw.sector ?? 'Unknown Sector',
    competitionId: raw.competitionId,
    winnerStartupId: raw.winnerStartupId,
    place: raw.place,
  };
}

export async function getCompetitionsByStatus(status: CompetitionStatus): Promise<Competition[]> {
  if (!isFirebaseConfigured()) {
    return sortByDateLabel(COMPETITION_SEED.filter((c) => c.status === status));
  }

  const competitionsQuery = query(
    collection(getDb(), COMPETITIONS_COLLECTION),
    where('status', '==', status)
  );
  const snap = await getDocs(competitionsQuery);
  const items = snap.docs.map((d) => mapCompetition(d.id, d.data() as Partial<Competition>));
  return sortByDateLabel(items);
}

export async function getActiveCompetitions(): Promise<Competition[]> {
  return getCompetitionsByStatus('active');
}

export async function getUpcomingCompetitions(): Promise<Competition[]> {
  return getCompetitionsByStatus('upcoming');
}

export async function getPastCompetitionWinners(limit = 10): Promise<CompetitionWinner[]> {
  if (!isFirebaseConfigured()) {
    return COMPETITION_WINNER_SEED.slice(0, limit);
  }

  const snap = await getDocs(collection(getDb(), WINNERS_COLLECTION));
  return snap.docs
    .map((d) => mapWinner(d.id, d.data() as Partial<CompetitionWinner>))
    .sort((a, b) => (a.place ?? Number.MAX_SAFE_INTEGER) - (b.place ?? Number.MAX_SAFE_INTEGER))
    .slice(0, limit);
}

export async function upsertCompetition(input: CompetitionUpsertInput): Promise<string> {
  assertCompetitionInput(input);

  if (input.id && isFirebaseConfigured()) {
    const existingSnap = await getDoc(doc(getDb(), COMPETITIONS_COLLECTION, input.id));
    if (existingSnap.exists()) {
      const existing = existingSnap.data() as Partial<Competition>;
      const prevStatus = (existing.status ?? 'upcoming') as CompetitionStatus;
      assertTransition(prevStatus, input.status);
    }
  }

  if (!isFirebaseConfigured()) {
    return input.id ?? crypto.randomUUID();
  }

  const id = input.id ?? crypto.randomUUID();
  const payload = mapCompetition(id, input);
  await setDoc(doc(getDb(), COMPETITIONS_COLLECTION, id), payload);
  return id;
}

export async function deleteCompetition(id: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await deleteDoc(doc(getDb(), COMPETITIONS_COLLECTION, id));
}

export async function upsertCompetitionWinner(input: CompetitionWinnerUpsertInput): Promise<string> {
  assertWinnerInput(input);

  if (!isFirebaseConfigured()) {
    return input.id ?? crypto.randomUUID();
  }

  const id = input.id ?? crypto.randomUUID();
  const payload = mapWinner(id, input);
  await setDoc(doc(getDb(), WINNERS_COLLECTION, id), payload);
  return id;
}

export async function deleteCompetitionWinner(id: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await deleteDoc(doc(getDb(), WINNERS_COLLECTION, id));
}
