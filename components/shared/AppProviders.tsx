import React, { useEffect } from 'react';
import { useGroupsStore } from '@/store/useGroupsStore';

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Handle storage events for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'groups-store') {
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
    // Initialize the groups store to create default group if none exist
    useGroupsStore.getState().initialize();
  }, []);

  return <>{children}</>;
};

export default AppProviders;