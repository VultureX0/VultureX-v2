import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { isFirebaseConfigured } from '../../config/firebase';
import type { InvestorProfile } from '../../types';

const COLLECTION = 'investors';
const STORAGE_KEY = 'vx-investor-profile';

/** Save investor profile. Persists to Firestore when configured, localStorage as fallback. */
export async function saveInvestorProfile(profile: InvestorProfile): Promise<void> {
  const withDate = { ...profile, submittedAt: new Date().toISOString() };

  // Always save to localStorage as cache
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withDate));
  } catch {
    // ignore
  }

  if (!isFirebaseConfigured() || !withDate.email) return;

  await setDoc(doc(getDb(), COLLECTION, withDate.email), withDate);
}

/** Load investor profile by email. Falls back to localStorage. */
export async function getInvestorProfile(email?: string): Promise<InvestorProfile | null> {
  // Try localStorage first (cache / offline fallback)
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as InvestorProfile;
      if (!email || cached.email === email) return cached;
    }
  } catch {
    // ignore
  }

  if (!isFirebaseConfigured() || !email) return null;

  const snap = await getDoc(doc(getDb(), COLLECTION, email));
  return snap.exists() ? (snap.data() as InvestorProfile) : null;
}

/** Clear local investor profile cache */
export function clearLocalInvestorProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
