import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  FavoriteItem, 
  Coffee, 
  Pastry, 
  CoffeeCustomization, 
  PastryCustomization,
  CartItem,
  CartSetFavorite
} from '@/types';
import { useGroupsStore } from './useGroupsStore';
import { calculateItemPrice } from '@/utils/cart-calculations';

export interface FavoritesStore {
  favorites: FavoriteItem[];
  cartSetFavorites: CartSetFavorite[]; // New field for cart sets
  
  // Actions
  addToFavorites: (favorite: FavoriteItem) => void;
  removeFromFavorites: (favoriteId: string) => void;
  updateFavorite: (favoriteId: string, updates: Partial<FavoriteItem>) => void;
  getGroupFavorites: (groupId: string) => FavoriteItem[];
  getMemberFavorites: (memberName: string, groupId: string) => FavoriteItem[]; // Add this
  cleanupMemberFavorites: (memberName: string, groupId: string) => void; // Add this
  transferMemberFavorites: (memberName: string, fromGroupId: string, toGroupId: string) => void; // Add this
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
  hydrate: (payload: { favorites: FavoriteItem[]; cartSetFavorites: CartSetFavorite[] }) => void;
  
  // New cart set actions
  addCartSetToFavorites: (name: string, cartItems: CartItem[], groupId: string) => void;
  removeCartSetFromFavorites: (cartSetId: string) => void;
  getGroupCartSetFavorites: (groupId: string) => CartSetFavorite[];
  updateCartSetName: (cartSetId: string, newName: string) => void;
}

const storeImplementation: StateCreator<FavoritesStore> = (set, get) => ({
  favorites: [],
  cartSetFavorites: [],

  hydrate: ({ favorites, cartSetFavorites }) => {
    set({ favorites, cartSetFavorites });
  },

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
    return favorites.filter(fav => {
      // Include group-level favorites (no assignedTo) for this group
      if (!fav.assignedTo && fav.groupId === groupId) {
        return true;
      }
      // Include personal favorites assigned to members in this group
      if (fav.assignedTo) {
        // Check if the assigned person is in this group
        const groupsStore = useGroupsStore.getState();
        const group = groupsStore.groups.find(g => g.id === groupId);
        return group?.members.some(member => member.name === fav.assignedTo);
      }
      return false;
    });
  },

  getMemberFavorites: (memberName: string) => {
    const { favorites } = get();
    // Return all favorites assigned to this member, regardless of group
    return favorites.filter(fav => fav.assignedTo === memberName);
  },

  cleanupMemberFavorites: (memberName: string, groupId: string) => {
    // Only remove group-level favorites when member leaves group
    // Personal favorites should stay with the member
    set((state) => ({
      favorites: state.favorites.filter(fav => {
        // Keep personal favorites assigned to the member
        if (fav.assignedTo === memberName) {
          return true;
        }
        // Remove group-level favorites only if they're in the specific group
        return !(fav.groupId === groupId && !fav.assignedTo);
      })
    }));
  },

  transferMemberFavorites: (_memberName: string, _fromGroupId: string, _toGroupId: string) => {
    // Personal favorites follow the member via group membership checks.
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
      // Remove from favorites
      removeFromFavorites(existingFavorite.id);
    } else {
      // Add to favorites
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
    set({ favorites: [], cartSetFavorites: [] });
  },

  addCartSetToFavorites: (name: string, cartItems: CartItem[], groupId: string) => {
    const newCartSet: CartSetFavorite = {
      id: uuidv4(),
      name,
      items: cartItems.map(item => ({ ...item })), // Deep copy
      dateAdded: new Date(),
      groupId,
      totalAmount: cartItems.reduce((total, item) => 
        total + (calculateItemPrice(item) * item.quantity), 0
      )
    };
    
    set((state) => ({
      cartSetFavorites: [...state.cartSetFavorites, newCartSet]
    }));
  },

  removeCartSetFromFavorites: (cartSetId: string) => {
    set((state) => ({
      cartSetFavorites: state.cartSetFavorites.filter(set => set.id !== cartSetId)
    }));
  },

  getGroupCartSetFavorites: (groupId: string) => {
    const { cartSetFavorites } = get();
    return cartSetFavorites.filter(set => set.groupId === groupId);
  },

  updateCartSetName: (cartSetId: string, newName: string) => {
    set((state) => ({
      cartSetFavorites: state.cartSetFavorites.map(set =>
        set.id === cartSetId ? { ...set, name: newName } : set
      )
    }));
  },
});

export const useFavoritesStore = create<FavoritesStore>()(storeImplementation);

// selector hooks
export const useFavorites = (activeGroupId?: string) => {
  const getGroupFavorites = useFavoritesStore(state => state.getGroupFavorites);
  return activeGroupId ? getGroupFavorites(activeGroupId) : [];
};

// Hook to get all favorites (for admin purposes)
export const useAllFavorites = () => useFavoritesStore(state => state.favorites);