import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirebaseAuth, getDb } from '../../lib/firebase';
import { isFirebaseConfigured } from '../../config/firebase';
import type { AuthUser, SignUpInput, SignInInput, ConfirmSignUpInput } from '../../types';

const STORAGE_KEY = 'vx-auth-user';

function persistUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

function loadPersistedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function firebaseUserToAuthUser(fbUser: User, role: AuthUser['role'] = 'startup'): AuthUser {
  return {
    id: fbUser.uid,
    email: fbUser.email ?? '',
    role,
    emailVerified: fbUser.emailVerified,
  };
}

/** Sign up a new user */
export async function signUp(input: SignUpInput): Promise<void> {
  if (!isFirebaseConfigured()) {
    const mockUser: AuthUser = {
      id: crypto.randomUUID(),
      email: input.email,
      role: input.role,
      emailVerified: false,
    };
    persistUser(mockUser);
    return;
  }

  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);

  // Store role in Firestore user profile
  const db = getDb();
  await setDoc(doc(db, 'users', credential.user.uid), {
    email: input.email,
    role: input.role,
    createdAt: new Date().toISOString(),
  });

  // Send verification email
  await sendEmailVerification(credential.user);

  persistUser(firebaseUserToAuthUser(credential.user, input.role));
}

/** Confirm sign up — Firebase auto-verifies via email link, so this is a no-op/check */
export async function confirmSignUp(_input: ConfirmSignUpInput): Promise<void> {
  if (!isFirebaseConfigured()) {
    const user = loadPersistedUser();
    if (user) persistUser({ ...user, emailVerified: true });
    return;
  }
  // Firebase handles email verification via links, not codes.
  // If you need code-based verification, use a Cloud Function.
  // For now, just reload to pick up verified status.
  const auth = getFirebaseAuth();
  if (auth.currentUser) {
    await auth.currentUser.reload();
    const role = await getUserRole(auth.currentUser.uid);
    persistUser(firebaseUserToAuthUser(auth.currentUser, role));
  }
}

/** Sign in */
export async function signIn(input: SignInInput): Promise<AuthUser> {
  if (!isFirebaseConfigured()) {
    const existing = loadPersistedUser();
    const mockUser: AuthUser = {
      id: existing?.id ?? crypto.randomUUID(),
      email: input.email,
      role: existing?.role ?? 'startup',
      emailVerified: true,
    };
    persistUser(mockUser);
    return mockUser;
  }

  const auth = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(auth, input.email, input.password);
  const role = await getUserRole(credential.user.uid);
  const user = firebaseUserToAuthUser(credential.user, role);
  persistUser(user);
  return user;
}

/** Sign out */
export function signOut(): void {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    firebaseSignOut(auth);
  }
  persistUser(null);
  // Clear all cached profile data
  try {
    localStorage.removeItem('vx-investor-profile');
    localStorage.removeItem('vx-my-startup');
  } catch { /* ignore */ }
}

/** Check if there's a valid current session and return the user */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isFirebaseConfigured()) {
    return loadPersistedUser();
  }

  const auth = getFirebaseAuth();
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: User | null) => {
      unsubscribe();
      if (!fbUser) {
        persistUser(null);
        resolve(null);
        return;
      }
      const role = await getUserRole(fbUser.uid);
      const user = firebaseUserToAuthUser(fbUser, role);
      persistUser(user);
      resolve(user);
    });
  });
}

/** Initiate forgot password flow */
export async function forgotPassword(email: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
}

/** Confirm new password with reset code */
export async function confirmPassword(_email: string, code: string, newPassword: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const auth = getFirebaseAuth();
  await confirmPasswordReset(auth, code, newPassword);
}

/** Helper: fetch role from Firestore users collection */
async function getUserRole(uid: string): Promise<AuthUser['role']> {
  try {
    const db = getDb();
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return (snap.data().role as AuthUser['role']) ?? 'startup';
    }
  } catch {
    // ignore
  }
  return 'startup';
}
