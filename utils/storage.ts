import { AppData, Group } from '../types';

/**
 * STORAGE IMPLEMENTATION: Bean & Bite uses sessionStorage
 * 
 * Why sessionStorage instead of localStorage?
 * - Perfect for temporary group ordering sessions
 * - Data automatically clears when tab closes
 * - Prevents old group data from cluttering future sessions
 * - More secure for group ordering (no persistent data)
 * 
 * Why not Redux/Zustand?
 * - Simple state management with React useState is sufficient
 * - No complex state sharing between distant components
 * - Easier to understand and maintain
 * - Less bundle size
 */

const STORAGE_KEY = 'bean-bite-app-data';

export const getStoredData = (): AppData => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
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
  
  // Return default structure
  return {
    groups: [],
    activeGroupId: null,
    orderHistory: [],
    favorites: []
  };
};

export const saveToStorage = (data: AppData): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to storage:', error);
  }
};

export const createDefaultGroup = (): Group => {
  return {
    id: `group-${Date.now()}`,
    name: 'My Group',
    members: [],
    cart: [],
    dateCreated: new Date()
  };
};