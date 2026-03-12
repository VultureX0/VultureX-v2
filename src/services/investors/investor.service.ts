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
  // If Firebase is configured, always try Firestore first for fresh data
  if (isFirebaseConfigured() && email) {
    try {
      const snap = await getDoc(doc(getDb(), COLLECTION, email));
      if (snap.exists()) {
        const profile = snap.data() as InvestorProfile;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        } catch { /* ignore */ }
        return profile;
      }
    } catch {
      // Firestore failed — fall through to localStorage cache
    }
  }

  // Fallback to localStorage cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as InvestorProfile;
  } catch { /* ignore */ }

  return null;
}

/** Clear local investor profile cache */
export function clearLocalInvestorProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
