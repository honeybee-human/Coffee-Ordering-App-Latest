import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, Group } from '@/types';
import { createDefaultGroup } from '@/utils/storage';

interface AppContextType {
  appData: AppData;
  updateAppData: (newData: AppData) => void;
  activeGroup: Group | undefined;
}

const defaultAppData: AppData = {
  groups: [],
  activeGroupId: null,
  orderHistory: [],
  favorites: []
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useState<AppData>(() => {
    try {
      // Initialize with data from sessionStorage if available
      const stored = sessionStorage.getItem('bean-bite-app-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Migrate old data structure if needed
        if (parsed.groupOrder && !parsed.groups) {
          const defaultGroup: Group = {
            id: 'default-group',
            name: 'My Group',
            members: parsed.groupOrder.members || [],
            cart: parsed.groupOrder.cart || [],
            dateCreated: new Date()
          };
          
          return {
            groups: [defaultGroup],
            activeGroupId: defaultGroup.id,
            orderHistory: parsed.orderHistory || [],
            favorites: parsed.favorites || []
          };
        }
        
        // Convert date strings back to Date objects
        if (parsed.groups) {
          parsed.groups = parsed.groups.map((group: any) => ({
            ...group,
            dateCreated: new Date(group.dateCreated)
          }));
        }
        
        if (parsed.orderHistory) {
          parsed.orderHistory = parsed.orderHistory.map((order: any) => ({
            ...order,
            orderDate: new Date(order.orderDate)
          }));
        }
        
        if (parsed.favorites) {
          parsed.favorites = parsed.favorites.map((favorite: any) => ({
            ...favorite,
            dateAdded: new Date(favorite.dateAdded)
          }));
        }
        
        return parsed;
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
    
    // If no data or error, create a default group
    const defaultGroup = createDefaultGroup();
    return {
      groups: [defaultGroup],
      activeGroupId: defaultGroup.id,
      orderHistory: [],
      favorites: []
    };
  });

  // Sync with sessionStorage when appData changes
  useEffect(() => {
    try {
      sessionStorage.setItem('bean-bite-app-data', JSON.stringify(appData));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }, [appData]);

  // Sync with sessionStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = sessionStorage.getItem('bean-bite-app-data');
        if (stored) {
          const parsed = JSON.parse(stored);
          setAppData(parsed);
        }
      } catch (error) {
        console.error('Error handling storage change:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper to update app data
  const updateAppData = (newData: AppData) => {
    setAppData(newData);
  };

  // Get active group
  const activeGroup = appData.groups.find(g => g.id === appData.activeGroupId);

  return (
    <AppContext.Provider value={{ appData, updateAppData, activeGroup }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};