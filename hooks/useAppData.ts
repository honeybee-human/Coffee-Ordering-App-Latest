import { useState, useEffect, useCallback } from 'react';
import { AppData, Group } from '@/types';
import { getStoredData, saveToStorage, createDefaultGroup } from '../utils/storage';

/**
 * Custom hook for managing app-wide data state and storage synchronization
 * Handles: groups, favorites, order history, and sessionStorage sync
 */
export const useAppData = () => {
  const [appData, setAppData] = useState<AppData>(() => {
    const data = getStoredData();
    
    // If no groups exist, create a default one
    if (!data.groups || data.groups.length === 0) {
      const defaultGroup = createDefaultGroup();
      return {
        groups: [defaultGroup],
        activeGroupId: defaultGroup.id,
        orderHistory: data.orderHistory || [],
        favorites: data.favorites || []
      };
    }
    
    return data;
  });

  // Sync with sessionStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      const data = getStoredData();
      setAppData(data);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper to update app data and save to storage
  const updateAppData = useCallback((newData: AppData) => {
    setAppData(newData);
    saveToStorage(newData);
  }, []);

  // Get active group
  const activeGroup = appData.groups.find(g => g.id === appData.activeGroupId);

  return {
    appData,
    setAppData,
    updateAppData,
    activeGroup
  };
};