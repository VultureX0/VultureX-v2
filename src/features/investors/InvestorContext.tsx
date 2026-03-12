import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { InvestorProfile } from '../../types';
import { defaultInvestorProfile } from '../../types';
import * as investorService from '../../services/investors';

type InvestorContextValue = {
  profile: InvestorProfile | null;
  isLoading: boolean;
  setProfile: (p: InvestorProfile) => Promise<void>;
  clearProfile: () => void;
};

const InvestorContext = createContext<InvestorContextValue | undefined>(undefined);

export function InvestorProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<InvestorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    investorService
      .getInvestorProfile()
      .then((p) => setProfileState(p))
      .catch(() => setProfileState(null))
      .finally(() => setIsLoading(false));
  }, []);

  const setProfile = useCallback(async (p: InvestorProfile) => {
    const withDate = { ...p, submittedAt: new Date().toISOString() };
    setProfileState(withDate);
    try {
      await investorService.saveInvestorProfile(withDate);
    } catch (err) {
      console.error('Remote save failed (local cache is intact):', err);
      throw err;
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(null);
    investorService.clearLocalInvestorProfile();
  }, []);

  return (
    <InvestorContext.Provider value={{ profile, isLoading, setProfile, clearProfile }}>
      {children}
    </InvestorContext.Provider>
  );
}

export function useInvestor() {
  const ctx = useContext(InvestorContext);
  if (!ctx) throw new Error('useInvestor must be used within InvestorProvider');
  return ctx;
}

export { defaultInvestorProfile };
