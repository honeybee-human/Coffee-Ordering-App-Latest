import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  FavoriteItem, 
  Coffee, 
  Pastry, 
  CoffeeCustomization, 
  PastryCustomization 
} from '@/types';

export interface FavoritesStore {
  favorites: FavoriteItem[];
  
  // Actions
  addToFavorites: (favorite: FavoriteItem) => void;
  removeFromFavorites: (favoriteId: string) => void;
  updateFavorite: (favoriteId: string, updates: Partial<FavoriteItem>) => void;
  getGroupFavorites: (groupId: string) => FavoriteItem[];
  isItemFavorited: (
    type: 'coffee' | 'pastry', 
    itemId: string, 
    groupId: string,
    customizations?: CoffeeCustomization | PastryCustomization, 
    assignedTo?: string
  ) => boolean;
  toggleFavorite: (
    type: 'coffee' | 'pastry', 
    item: Coffee | Pastry, 
    groupId: string,
    customizations?: CoffeeCustomization | PastryCustomization, 
    assignedTo?: string
  ) => void;
  resetFavorites: () => void;
}

type FavoritesPersist = {
  favorites: FavoriteItem[];
};

const storeImplementation: StateCreator<
  FavoritesStore,
  [['zustand/persist', unknown]],
  [],
  FavoritesStore
> = (set, get) => ({
  favorites: [],

  addToFavorites: (favorite: FavoriteItem) => {
    set((state) => ({
      favorites: [...state.favorites, favorite]
    }));
  },

  removeFromFavorites: (favoriteId: string) => {
    set((state) => ({
      favorites: state.favorites.filter(fav => fav.id !== favoriteId)
    }));
  },

  updateFavorite: (favoriteId: string, updates: Partial<FavoriteItem>) => {
    set((state) => ({
      favorites: state.favorites.map(fav => 
        fav.id === favoriteId 
          ? { ...fav, ...updates, dateAdded: new Date() }
          : fav
      )
    }));
  },

  getGroupFavorites: (groupId: string) => {
    const { favorites } = get();
    return favorites.filter(fav => fav.groupId === groupId);
  },

  isItemFavorited: (
    type: 'coffee' | 'pastry', 
    itemId: string, 
    groupId: string,
    customizations?: CoffeeCustomization | PastryCustomization, 
    assignedTo?: string
  ) => {
    const { favorites } = get();
    
    // Normalize customizations for consistent comparison
    const normalizedCustomizations = customizations || (type === 'coffee' ? 
      { syrups: [], milk: 'Whole Milk' } as CoffeeCustomization : 
      { removedIngredients: [] } as PastryCustomization);
    
    return favorites.some(fav => 
      fav.type === type && 
      fav.item.id === itemId &&
      fav.groupId === groupId &&
      JSON.stringify(fav.customizations) === JSON.stringify(normalizedCustomizations) &&
      fav.assignedTo === assignedTo
    );
  },

  toggleFavorite: (
    type: 'coffee' | 'pastry', 
    item: Coffee | Pastry, 
    groupId: string,
    customizations?: CoffeeCustomization | PastryCustomization, 
    assignedTo?: string
  ) => {
    const { favorites, addToFavorites, removeFromFavorites } = get();
    
    // Normalize customizations for consistent comparison
    const normalizedCustomizations = customizations || (type === 'coffee' ? 
      { syrups: [], milk: 'Whole Milk' } as CoffeeCustomization : 
      { removedIngredients: [] } as PastryCustomization);
    
    const existingFavorite = favorites.find(fav => 
      fav.type === type && 
      fav.item.id === item.id && 
      fav.groupId === groupId &&
      JSON.stringify(fav.customizations) === JSON.stringify(normalizedCustomizations) &&
      fav.assignedTo === assignedTo
    );

    if (existingFavorite) {
      removeFromFavorites(existingFavorite.id);
    } else {
      const newFavorite: FavoriteItem = {
        id: uuidv4(),
        item,
        type,
        customizations: normalizedCustomizations,
        dateAdded: new Date(),
        assignedTo,
        groupId
      };
      addToFavorites(newFavorite);
    }
  },

  resetFavorites: () => {
    set({ favorites: [] });
  }
});

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    storeImplementation,
    {
      name: 'bean-bite-favorites',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites
      }),
      serialize: (state) => JSON.stringify(state, (key, value) => {
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      }),
      deserialize: (str) => JSON.parse(str, (key, value) => {
        if (value && typeof value === 'object' && value.__type === 'Date') {
          return new Date(value.value);
        }
        return value;
      })
    } as PersistOptions<FavoritesStore, FavoritesPersist>
  )
);

// selector hooks
export const useFavorites = (activeGroupId?: string) => {
  const getGroupFavorites = useFavoritesStore(state => state.getGroupFavorites);
  return activeGroupId ? getGroupFavorites(activeGroupId) : [];
};

// Hook to get all favorites (for admin purposes)
export const useAllFavorites = () => useFavoritesStore(state => state.favorites);