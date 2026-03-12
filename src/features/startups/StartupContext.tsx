import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserStartupProfile } from '../../types';
import { useAuth } from '../auth';
import * as startupService from '../../services/startups';

type StartupContextValue = {
  profile: UserStartupProfile | null;
  isLoading: boolean;
  setProfile: (p: UserStartupProfile) => Promise<void>;
  clearProfile: () => void;
};

const StartupCtx = createContext<StartupContextValue | undefined>(undefined);

export function StartupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState<UserStartupProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'startup') {
      setProfileState(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    startupService
      .getUserStartupProfile(user.id)
      .then((p) => setProfileState(p))
      .catch(() => setProfileState(null))
      .finally(() => setIsLoading(false));
  }, [user]);

  const setProfile = useCallback(
    async (p: UserStartupProfile) => {
      if (!user) return;
      const withDate = { ...p, updatedAt: new Date().toISOString() };
      setProfileState(withDate);
      try {
        await startupService.saveUserStartupProfile(user.id, withDate);
      } catch (err) {
        console.error('Remote save failed (local cache is intact):', err);
        throw err; // let caller decide how to handle
      }
    },
    [user],
  );

  const clearProfile = useCallback(() => {
    setProfileState(null);
    startupService.clearLocalStartupProfile();
  }, []);

  return (
    <StartupCtx.Provider value={{ profile, isLoading, setProfile, clearProfile }}>
      {children}
    </StartupCtx.Provider>
  );
}

export function useStartup() {
  const ctx = useContext(StartupCtx);
  if (!ctx) throw new Error('useStartup must be used within a StartupProvider');
  return ctx;
}
