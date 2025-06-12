import React, { ReactNode } from 'react';
import { AppProvider } from '@/context/AppContext';
import { NavigationProvider } from '@/context/NavigationContext';
import { ModalsProvider } from '@/context/ModalsContext';
import { AllergensProvider } from '@/context/AllergensContext';

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
      <NavigationProvider>
        <ModalsProvider>
          <AllergensProvider>
            {children}
          </AllergensProvider>
        </ModalsProvider>
      </NavigationProvider>
    </AppProvider>
  );
};