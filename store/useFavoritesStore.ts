import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FavoriteItem, Coffee, Pastry, CoffeeCustomization, PastryCustomization } from '@/types';

interface FavoritesState {
  // State
  favorites: FavoriteItem[];
  
  // Favorites actions
  addToFavorites: (favorite: FavoriteItem) => void;
  removeFromFavorites: (favoriteId: string) => void;
  isItemFavorited: (type: 'coffee' | 'pastry', itemId: string, customizations?: CoffeeCustomization | PastryCustomization) => boolean;
  toggleFavorite: (type: 'coffee' | 'pastry', item: Coffee | Pastry, customizations?: CoffeeCustomization | PastryCustomization) => void;
}

interface FavoritesPersist {
  favorites: FavoriteItem[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Initial state
      favorites: [],

      // Favorites actions
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

      isItemFavorited: (type: 'coffee' | 'pastry', itemId: string, customizations?: CoffeeCustomization | PastryCustomization) => {
        const { favorites } = get();
        return favorites.some(fav => 
          fav.type === type && 
          fav.item.id === itemId &&
          JSON.stringify(fav.customizations) === JSON.stringify(customizations)
        );
      },

      toggleFavorite: (type: 'coffee' | 'pastry', item: Coffee | Pastry, customizations?: CoffeeCustomization | PastryCustomization) => {
        const { favorites, isItemFavorited, addToFavorites, removeFromFavorites } = get();
        
        if (isItemFavorited(type, item.id, customizations)) {
          // Find and remove existing favorite
          const existingFavorite = favorites.find(fav => 
            fav.type === type && 
            fav.item.id === item.id &&
            JSON.stringify(fav.customizations) === JSON.stringify(customizations || (type === 'coffee' ? { syrups: [], milk: 'whole' } : { removedIngredients: [] }))
          );
          if (existingFavorite) {
            removeFromFavorites(existingFavorite.id);
          }
        } else {
          // Add new favorite
          const newFavorite: FavoriteItem = {
            id: Date.now().toString(),
            type,
            item,
            customizations: customizations || (type === 'coffee' ? { syrups: [], milk: 'whole' } : { removedIngredients: [] }),
            dateAdded: new Date()
          };
          addToFavorites(newFavorite);
        }
      },
    }),
    {
      name: 'bean-bite-favorites',
      partialize: (state) => ({
        favorites: state.favorites,
      }),
      // Handle Date objects in serialization
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
    }
  )
);

// Selector hooks for better performance
export const useFavorites = () => useFavoritesStore(state => state.favorites);