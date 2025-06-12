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
  toggleFavorite: (type: 'coffee' | 'pastry', item: Coffee | Pastry, customizations?: CoffeeCustomization | PastryCustomization, assignedToGroup?: string, assignedToMember?: string) => void;
  updateFavoriteAssignment: (favoriteId: string, assignedToGroup?: string, assignedToMember?: string) => void;
  getFavoritesByGroup: (groupId: string) => FavoriteItem[];
  getFavoritesByMember: (groupId: string, memberName: string) => FavoriteItem[];
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

      toggleFavorite: (type: 'coffee' | 'pastry', item: Coffee | Pastry, customizations?: CoffeeCustomization | PastryCustomization, assignedToGroup?: string, assignedToMember?: string) => {
        const { favorites, isItemFavorited, addToFavorites, removeFromFavorites } = get();
        
        if (isItemFavorited(type, item.id, customizations)) {
          // Find and remove the favorite
          const favoriteToRemove = favorites.find(fav => 
            fav.type === type && 
            fav.item.id === item.id &&
            JSON.stringify(fav.customizations) === JSON.stringify(customizations)
          );
          if (favoriteToRemove) {
            removeFromFavorites(favoriteToRemove.id);
          }
        } else {
          // Add to favorites
          const newFavorite: FavoriteItem = {
            id: Date.now().toString(),
            type,
            item,
            customizations: customizations || (type === 'coffee' ? { syrups: [], milk: 'Regular' } : { removedIngredients: [] }),
            dateAdded: new Date(),
            assignedToGroup,
            assignedToMember
          };
          addToFavorites(newFavorite);
        }
      },

      updateFavoriteAssignment: (favoriteId: string, assignedToGroup?: string, assignedToMember?: string) => {
        set((state) => ({
          favorites: state.favorites.map(fav => 
            fav.id === favoriteId 
              ? { ...fav, assignedToGroup, assignedToMember }
              : fav
          )
        }));
      },

      getFavoritesByGroup: (groupId: string) => {
        const { favorites } = get();
        return favorites.filter(fav => fav.assignedToGroup === groupId);
      },

      getFavoritesByMember: (groupId: string, memberName: string) => {
        const { favorites } = get();
        return favorites.filter(fav => 
          fav.assignedToGroup === groupId && fav.assignedToMember === memberName
        );
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