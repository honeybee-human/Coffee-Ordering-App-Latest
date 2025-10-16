import React, { useEffect } from 'react';
import { reportAPIs } from '@/utils/devLogger';
import { AppContextProvider } from '@/context/AppContext';

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App-level health/reporting
  
  // Report API availability and log results
  useEffect(() => {
    reportAPIs();
  }, []);

  return <AppContextProvider>{children}</AppContextProvider>;
};

export default AppProviders;