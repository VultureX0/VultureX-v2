import { collection, doc, getCountFromServer, getDoc, query, where } from 'firebase/firestore';
import { isFirebaseConfigured } from '../config/firebase';
import { getDb } from '../lib/firebase';

export type PlatformStats = {
  activeFounders: number;
  verifiedInvestors: number;
  dealsClosed: number;
};

const fallbackStats: PlatformStats = {
  activeFounders: 0,
  verifiedInvestors: 0,
  dealsClosed: 0,
};

function asCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

async function getActiveFoundersCount(): Promise<number | null> {
  try {
    const response = await fetch('/api/platform-stats');
    if (!response.ok) return null;
    const data = (await response.json()) as { activeFounders?: unknown };
    return asCount(data.activeFounders);
  } catch {
    return null;
  }
}

async function getCollectionCount(collectionName: string): Promise<number | null> {
  if (!isFirebaseConfigured()) return null;

  try {
    const snapshot = await getCountFromServer(collection(getDb(), collectionName));
    return snapshot.data().count;
  } catch {
    return null;
  }
}

async function getDealsClosedCount(): Promise<number | null> {
  if (!isFirebaseConfigured()) return null;

  try {
    const statsDoc = await getDoc(doc(getDb(), 'platform_stats', 'landing'));
    const count = asCount(statsDoc.data()?.dealsClosed);
    if (count !== null) return count;
  } catch {
    // Fall back to counting closed deal documents if the summary doc is not available.
  }

  try {
    const snapshot = await getCountFromServer(
      query(collection(getDb(), 'deals'), where('status', '==', 'closed')),
    );
    return snapshot.data().count;
  } catch {
    return null;
  }
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [activeFounders, verifiedInvestors, dealsClosed] = await Promise.all([
    getActiveFoundersCount(),
    getCollectionCount('investors'),
    getDealsClosedCount(),
  ]);

  return {
    activeFounders: activeFounders ?? fallbackStats.activeFounders,
    verifiedInvestors: verifiedInvestors ?? fallbackStats.verifiedInvestors,
    dealsClosed: dealsClosed ?? fallbackStats.dealsClosed,
  };
}
