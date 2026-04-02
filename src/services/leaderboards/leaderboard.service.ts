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
import { getDb } from '../../lib/firebase';
import { isFirebaseConfigured } from '../../config/firebase';
import type {
  LeaderboardCategory,
  LeaderboardDefinition,
  LeaderboardEntry,
  LeaderboardEntryUpsertInput,
  LeaderboardResult,
} from '../../types';
import { LEADERBOARD_ENTRY_SEED } from './leaderboard.seed';

const LEADERBOARDS_COLLECTION = 'leaderboards';
const LEADERBOARD_ENTRIES_COLLECTION = 'leaderboard_entries';
const VALID_CATEGORIES: LeaderboardCategory[] = [
  'overall',
  'cleantech',
  'fintech',
  'web3',
  'impact',
  'rising',
  'investor',
];

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function assertCategory(category: LeaderboardCategory): void {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error('Invalid leaderboard category.');
  }
}

function assertEntryInput(input: LeaderboardEntryUpsertInput): void {
  assertCategory(input.category);
  if (!Number.isInteger(input.rank) || input.rank < 1) {
    throw new Error('Rank must be a positive integer.');
  }
  if (!input.name.trim()) throw new Error('Startup name is required.');
  if (!input.sector.trim()) throw new Error('Sector is required.');
  if (!input.stage.trim()) throw new Error('Stage is required.');
  if (!Number.isFinite(input.score) || input.score < 0) {
    throw new Error('Score must be a non-negative number.');
  }
  if (!Number.isFinite(input.investors) || input.investors < 0) {
    throw new Error('Investors must be a non-negative number.');
  }
}

async function assertCategoryIntegrity(input: LeaderboardEntryUpsertInput): Promise<void> {
  const snap = await getDocs(
    query(collection(getDb(), LEADERBOARD_ENTRIES_COLLECTION), where('category', '==', input.category))
  );
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Partial<LeaderboardEntry>) }));

  const rankClash = rows.find((row) => row.id !== input.id && row.rank === input.rank);
  if (rankClash) {
    throw new Error(`Rank ${input.rank} is already used in ${input.category}.`);
  }

  const incomingStartupKey = normalize(input.startupId || input.name);
  const duplicateStartup = rows.find((row) => {
    if (row.id === input.id) return false;
    const existingKey = normalize((row.startupId as string | undefined) || (row.name as string | undefined));
    return Boolean(incomingStartupKey && existingKey && incomingStartupKey === existingKey);
  });

  if (duplicateStartup) {
    throw new Error('Duplicate startup row detected for this category.');
  }
}

function sortByRank(items: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...items].sort((a, b) => a.rank - b.rank);
}

function mapEntry(id: string, raw: Partial<LeaderboardEntry>): LeaderboardEntry {
  return {
    id,
    category: (raw.category ?? 'overall') as LeaderboardCategory,
    rank: raw.rank ?? Number.MAX_SAFE_INTEGER,
    startupId: raw.startupId,
    name: raw.name ?? 'Unknown Startup',
    sector: raw.sector ?? 'Unknown Sector',
    stage: raw.stage ?? 'Unknown Stage',
    score: raw.score ?? 0,
    sdg: Boolean(raw.sdg),
    change: raw.change ?? 0,
    desc: raw.desc ?? '',
    investors: raw.investors ?? 0,
  };
}

function mapDefinition(id: string, raw: Partial<LeaderboardDefinition>): LeaderboardDefinition {
  return {
    id,
    title: raw.title ?? id,
    description: raw.description,
    updatedAt: raw.updatedAt,
  };
}

export async function getLeaderboardByCategory(
  category: LeaderboardCategory,
  maxRows = 10
): Promise<LeaderboardResult> {
  assertCategory(category);

  if (!isFirebaseConfigured()) {
    return {
      category,
      entries: sortByRank(
        LEADERBOARD_ENTRY_SEED.filter((entry) => entry.category === category)
      ).slice(0, maxRows),
    };
  }

  const entriesQuery = query(
    collection(getDb(), LEADERBOARD_ENTRIES_COLLECTION),
    where('category', '==', category)
  );
  const snap = await getDocs(entriesQuery);
  const entries = sortByRank(
    snap.docs.map((d) => mapEntry(d.id, d.data() as Partial<LeaderboardEntry>))
  ).slice(0, maxRows);

  const boardMetaSnap = await getDoc(doc(getDb(), LEADERBOARDS_COLLECTION, category));
  const boardMeta = boardMetaSnap.exists()
    ? mapDefinition(boardMetaSnap.id, boardMetaSnap.data() as Partial<LeaderboardDefinition>)
    : null;

  return {
    category,
    updatedAt: boardMeta?.updatedAt,
    entries,
  };
}

export async function upsertLeaderboardDefinition(input: LeaderboardDefinition): Promise<void> {
  assertCategory(input.id as LeaderboardCategory);

  if (!isFirebaseConfigured()) return;
  await setDoc(doc(getDb(), LEADERBOARDS_COLLECTION, input.id), input);
}

export async function upsertLeaderboardEntry(input: LeaderboardEntryUpsertInput): Promise<string> {
  assertEntryInput(input);

  if (!isFirebaseConfigured()) {
    return input.id ?? crypto.randomUUID();
  }

  await assertCategoryIntegrity(input);

  const id = input.id ?? crypto.randomUUID();
  const payload = mapEntry(id, input);
  await setDoc(doc(getDb(), LEADERBOARD_ENTRIES_COLLECTION, id), payload);
  return id;
}

export async function deleteLeaderboardEntry(id: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await deleteDoc(doc(getDb(), LEADERBOARD_ENTRIES_COLLECTION, id));
}
