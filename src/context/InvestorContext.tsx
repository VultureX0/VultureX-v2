import React, { createContext, useContext, useEffect, useState } from 'react';

export type InvestorType = 'vc' | 'angel' | 'family_office' | 'corporate_vc';

export type InvestorProfile = {
  // Section 1
  fullName: string;
  email: string;
  phone: string;
  linkedIn: string;
  location: string;
  // Section 2
  investorType: InvestorType;
  firmName: string;
  firmWebsite: string;
  fundSize: string;
  stageFocus: string[];
  investingAsIndividual: boolean;
  syndicateMember: string;
  // Section 3
  checkSizeMin: number;
  checkSizeMax: number;
  preferredSectors: string[];
  geographyFocus: string;
  portfolioCompanies: string;
  // Section 4
  investmentThesis: string;
  lookingTo: 'lead' | 'co_invest' | 'passive';
  openToColdPitches: boolean;
  submittedAt?: string;
};

const defaultProfile: InvestorProfile = {
  fullName: '',
  email: '',
  phone: '',
  linkedIn: '',
  location: '',
  investorType: 'angel',
  firmName: '',
  firmWebsite: '',
  fundSize: '',
  stageFocus: [],
  investingAsIndividual: true,
  syndicateMember: '',
  checkSizeMin: 0,
  checkSizeMax: 500,
  preferredSectors: [],
  geographyFocus: '',
  portfolioCompanies: '',
  investmentThesis: '',
  lookingTo: 'co_invest',
  openToColdPitches: false,
};

const STORAGE_KEY = 'vx-investor-profile';

type InvestorContextValue = {
  profile: InvestorProfile | null;
  setProfile: (p: InvestorProfile) => void;
  clearProfile: () => void;
};

const InvestorContext = createContext<InvestorContextValue | undefined>(undefined);

export function InvestorProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<InvestorProfile | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as InvestorProfile;
        setProfileState(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const setProfile = (p: InvestorProfile) => {
    const withDate = { ...p, submittedAt: new Date().toISOString() };
    setProfileState(withDate);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withDate));
      }
    } catch {
      // ignore
    }
  };

  const clearProfile = () => {
    setProfileState(null);
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <InvestorContext.Provider value={{ profile, setProfile, clearProfile }}>
      {children}
    </InvestorContext.Provider>
  );
}

export function useInvestor() {
  const ctx = useContext(InvestorContext);
  if (!ctx) throw new Error('useInvestor must be used within InvestorProvider');
  return ctx;
}

export { defaultProfile };
