'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface BetRefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const BetRefreshContext = createContext<BetRefreshContextType | undefined>(
  undefined
);

export function BetRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <BetRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </BetRefreshContext.Provider>
  );
}

export function useBetRefresh() {
  const context = useContext(BetRefreshContext);
  if (context === undefined) {
    throw new Error('useBetRefresh must be used within a BetRefreshProvider');
  }
  return context;
}
