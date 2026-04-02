import React, { createContext, useContext, useEffect, useState } from 'react';

export type StartupMandate = {
  founderName: string;
  startupName: string;
  workEmail: string;
  country: string;
  signatoryTitle: string;
  fundraisingRound: string;
  signature: string;
  acceptedExclusivity: boolean;
  acceptedSuccessFee: boolean;
  acceptedNonCircumvention: boolean;
  acceptedReporting: boolean;
  signedAt: string;
};

type StartupMandateContextValue = {
  mandate: StartupMandate | null;
  signMandate: (mandate: Omit<StartupMandate, 'signedAt'>) => void;
  clearMandate: () => void;
};

const STORAGE_KEY = 'vx-startup-mandate';
const StartupMandateContext = createContext<StartupMandateContextValue | undefined>(undefined);

export function StartupMandateProvider({ children }: { children: React.ReactNode }) {
  const [mandate, setMandate] = useState<StartupMandate | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        setMandate(JSON.parse(raw) as StartupMandate);
      }
    } catch {
      // ignore
    }
  }, []);

  const signMandate = (nextMandate: Omit<StartupMandate, 'signedAt'>) => {
    const signedMandate: StartupMandate = {
      ...nextMandate,
      signedAt: new Date().toISOString(),
    };
    setMandate(signedMandate);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(signedMandate));
      }
    } catch {
      // ignore
    }
  };

  const clearMandate = () => {
    setMandate(null);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  };

  return (
    <StartupMandateContext.Provider value={{ mandate, signMandate, clearMandate }}>
      {children}
    </StartupMandateContext.Provider>
  );
}

export function useStartupMandate() {
  const ctx = useContext(StartupMandateContext);
  if (!ctx) {
    throw new Error('useStartupMandate must be used within StartupMandateProvider');
  }
  return ctx;
}

