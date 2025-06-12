import React from 'react';
import { useEffect } from 'react';
// This component initializes the Zustand stores and handles any global side effects
// that were previously managed by the context providers
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Handle storage events for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'bean-bite-app-data') {
        // Reload the page to get the latest data from storage
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Initialize stores if needed
  useEffect(() => {
    // The stores are automatically initialized when imported
    // This effect is just a placeholder for any additional initialization logic
    // that might be needed in the future
  }, []);

  return <>{children}</>;
};

export default AppProviders;