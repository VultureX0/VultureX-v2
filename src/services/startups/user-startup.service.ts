import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { isFirebaseConfigured } from '../../config/firebase';
import type { UserStartupProfile } from '../../types';

const COLLECTION = 'startup_profiles';
const STORAGE_KEY = 'vx-my-startup';

/** Save the current user's startup profile. Writes to Firestore keyed by UID. */
export async function saveUserStartupProfile(uid: string, profile: UserStartupProfile): Promise<void> {
  const withDate = { ...profile, updatedAt: new Date().toISOString() };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withDate));
  } catch { /* ignore */ }

  if (!isFirebaseConfigured() || !uid) return;
  await setDoc(doc(getDb(), COLLECTION, uid), withDate);
}

/** Load the current user's startup profile by UID. Falls back to localStorage. */
export async function getUserStartupProfile(uid?: string): Promise<UserStartupProfile | null> {
  // Try localStorage cache first
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UserStartupProfile;
  } catch { /* ignore */ }

  if (!isFirebaseConfigured() || !uid) return null;

  const snap = await getDoc(doc(getDb(), COLLECTION, uid));
  if (!snap.exists()) return null;

  const profile = snap.data() as UserStartupProfile;
  // Cache locally
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch { /* ignore */ }

  return profile;
}

/** Clear local cache (used on sign-out). */
export function clearLocalStartupProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}
