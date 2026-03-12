import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthUser } from '../../types';
import * as authService from '../../services/auth';

/** Map Firebase error codes to user-friendly messages */
function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const code = msg.match(/\(auth\/([^)]+)\)/)?.[1];
  switch (code) {
    case 'invalid-credential':
    case 'wrong-password':
    case 'user-not-found':
      return 'Incorrect email or password. Please try again.';
    case 'email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'invalid-email':
      return 'Please enter a valid email address.';
    case 'user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'network-request-failed':
      return 'Network error. Check your internet connection.';
    case 'requires-recent-login':
      return 'Please sign in again to continue.';
    default:
      return msg.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/[^)]+\)\.?$/, '') || 'Something went wrong. Please try again.';
  }
}

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'startup' | 'investor') => Promise<void>;
  signOut: () => void;
  error: string | null;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    authService
      .getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const u = await authService.signIn({ email, password });
      setUser(u);
    } catch (err) {
      setError(friendlyError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignUp = useCallback(
    async (email: string, password: string, role: 'startup' | 'investor') => {
      setError(null);
      setIsLoading(true);
      try {
        await authService.signUp({ email, password, role });
        const u = await authService.getCurrentUser();
        if (u) setUser(u);
      } catch (err) {
        setError(friendlyError(err));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSignOut = useCallback(() => {
    authService.signOut();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
