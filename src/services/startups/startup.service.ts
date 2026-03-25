import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { isFirebaseConfigured } from '../../config/firebase';
import type { StartupProfileData, ExploreStartup } from '../../types';
import { STARTUP_PROFILES } from './startup.seed';

const COLLECTION = 'startups';

/** Get all startups. Falls back to seed data when Firebase is not configured. */
export async function getAllStartups(): Promise<StartupProfileData[]> {
  if (!isFirebaseConfigured()) return STARTUP_PROFILES;

  const snap = await getDocs(collection(getDb(), COLLECTION));
  if (snap.empty) return STARTUP_PROFILES;
  return snap.docs.map((d: { data: () => unknown }) => d.data() as StartupProfileData);
}

/** Get a single startup by ID */
export async function getStartupById(id: number | string): Promise<StartupProfileData | null> {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) return null;

  if (!isFirebaseConfigured()) {
    return STARTUP_PROFILES.find((s) => s.id === numId) ?? null;
  }

  const snap = await getDoc(doc(getDb(), COLLECTION, String(numId)));
  if (!snap.exists()) {
    return STARTUP_PROFILES.find((s) => s.id === numId) ?? null;
  }
  return snap.data() as StartupProfileData;
}

/** Get simplified startup list for the explore page */
export async function getExploreStartups(): Promise<ExploreStartup[]> {
  const startups = await getAllStartups();
  return startups.map((p) => ({
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

/** Save or update a startup profile */
export async function saveStartup(startup: StartupProfileData): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await setDoc(doc(getDb(), COLLECTION, String(startup.id)), startup);
}
