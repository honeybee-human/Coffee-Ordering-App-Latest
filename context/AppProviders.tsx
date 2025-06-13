import React, { ReactNode } from 'react';
import { AppProvider } from '@/context/AppContext';

import { ModalsProvider } from '@/context/ModalsContext';


interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Combined provider component that wraps all context providers
 * This simplifies the provider nesting in the main App component
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AppProvider>
      <ModalsProvider>
        {children}
      </ModalsProvider>
    </AppProvider>
  );
};