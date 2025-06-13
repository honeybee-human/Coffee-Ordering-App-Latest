import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
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
    
    // If no customizations provided, check for basic favorite (no customizations)
    if (!customizations) {
      return favorites.some(fav => 
        fav.type === type && 
        fav.item.id === itemId &&
        fav.groupId === groupId &&
        (!fav.customizations || 
         (type === 'coffee' && JSON.stringify(fav.customizations) === JSON.stringify({ syrups: [], milk: 'Whole Milk' })) ||
         (type === 'pastry' && JSON.stringify(fav.customizations) === JSON.stringify({ removedIngredients: [] }))) &&
        (!fav.assignedTo || fav.assignedTo === assignedTo)
      );
    }
    
    return favorites.some(fav => 
      fav.type === type && 
      fav.item.id === itemId &&
      fav.groupId === groupId &&
      JSON.stringify(fav.customizations) === JSON.stringify(customizations) &&
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
    const { favorites, isItemFavorited, addToFavorites, removeFromFavorites } = get();
    
    // Normalize customizations for consistent comparison
    const normalizedCustomizations = customizations || (type === 'coffee' ? 
      { syrups: [], milk: 'Whole Milk' } as CoffeeCustomization : 
      { removedIngredients: [] } as PastryCustomization);
    
    const existingFavorite = favorites.find(fav => {
      if (fav.type !== type || fav.item.id !== item.id || fav.groupId !== groupId) return false;
      
      // If no customizations provided, match basic favorites
      if (!customizations) {
        return (!fav.customizations || 
               JSON.stringify(fav.customizations) === JSON.stringify(normalizedCustomizations)) &&
               (!fav.assignedTo || fav.assignedTo === assignedTo);
      }
      
      return JSON.stringify(fav.customizations) === JSON.stringify(customizations) &&
             fav.assignedTo === assignedTo;
    });

    if (existingFavorite) {
      removeFromFavorites(existingFavorite.id);
    } else {
      const newFavorite: FavoriteItem = {
        id: Date.now().toString(),
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
export const useFavorites = () => useFavoritesStore(state => state.favorites);