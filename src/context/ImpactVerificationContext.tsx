import React, { createContext, useContext, useEffect, useState } from 'react';

export type ImpactVerificationApplication = {
  startupName: string;
  founderName: string;
  workEmail: string;
  sector: string;
  location: string;
  sdgs: string[];
  problem: string;
  impactModel: string;
  impactMetrics: string;
  evidence: string;
  status: 'pending' | 'verified';
  submittedAt: string;
};

type ImpactVerificationContextValue = {
  application: ImpactVerificationApplication | null;
  submitApplication: (application: Omit<ImpactVerificationApplication, 'status' | 'submittedAt'>) => void;
  clearApplication: () => void;
};

const STORAGE_KEY = 'vx-impact-verification';
const ImpactVerificationContext = createContext<ImpactVerificationContextValue | undefined>(undefined);

export function ImpactVerificationProvider({ children }: { children: React.ReactNode }) {
  const [application, setApplication] = useState<ImpactVerificationApplication | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        setApplication(JSON.parse(raw) as ImpactVerificationApplication);
      }
    } catch {
      // ignore
    }
  }, []);

  const submitApplication = (nextApplication: Omit<ImpactVerificationApplication, 'status' | 'submittedAt'>) => {
    const saved: ImpactVerificationApplication = {
      ...nextApplication,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setApplication(saved);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      }
    } catch {
      // ignore
    }
  };

  const clearApplication = () => {
    setApplication(null);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  };

  return (
    <ImpactVerificationContext.Provider value={{ application, submitApplication, clearApplication }}>
      {children}
    </ImpactVerificationContext.Provider>
  );
}

export function useImpactVerification() {
  const ctx = useContext(ImpactVerificationContext);
  if (!ctx) {
    throw new Error('useImpactVerification must be used within ImpactVerificationProvider');
  }
  return ctx;
}

