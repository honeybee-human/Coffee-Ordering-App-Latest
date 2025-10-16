import { v4 as uuidv4 } from 'uuid';
import { 
  FavoriteItem, 
  Coffee, 
  Pastry, 
  CoffeeCustomization, 
  PastryCustomization,
  GroupMember,
  CartItem,
  CartSetFavorite
} from '@/types';
import { useAppContext } from '@/context/AppContext';

export interface FavoritesStore {
  favorites: FavoriteItem[];
  cartSetFavorites: CartSetFavorite[]; // New field for cart sets
  
  // Actions
  addToFavorites: (favorite: FavoriteItem) => void;
  removeFromFavorites: (favoriteId: string) => void;
  updateFavorite: (favoriteId: string, updates: Partial<FavoriteItem>) => void;
  getGroupFavorites: (groupId: string) => FavoriteItem[];
  getMemberFavorites: (memberName: string) => FavoriteItem[]; // Add this
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
  
  // New cart set actions
  addCartSetToFavorites: (name: string, cartItems: CartItem[], groupId: string) => void;
  removeCartSetFromFavorites: (cartSetId: string) => void;
  getGroupCartSetFavorites: (groupId: string) => CartSetFavorite[];
  updateCartSetName: (cartSetId: string, newName: string) => void;
}
// Removed old Zustand store implementation; using AppContext-backed hooks instead.

export const useFavoritesStore = () => {
  const {
    favorites,
    cartSetFavorites,
    addToFavorites,
    removeFromFavorites,
    updateFavorite,
    getGroupFavorites,
    getMemberFavorites,
    cleanupMemberFavorites,
    transferMemberFavorites,
    isItemFavorited,
    toggleFavorite,
    resetFavorites,
    addCartSetToFavorites,
    removeCartSetFromFavorites,
    getGroupCartSetFavorites,
    updateCartSetName,
  } = useAppContext();

  return {
    favorites,
    cartSetFavorites,
    addToFavorites,
    removeFromFavorites,
    updateFavorite,
    getGroupFavorites,
    getMemberFavorites,
    cleanupMemberFavorites,
    transferMemberFavorites,
    isItemFavorited,
    toggleFavorite,
    resetFavorites,
    addCartSetToFavorites,
    removeCartSetFromFavorites,
    getGroupCartSetFavorites,
    updateCartSetName,
  } satisfies FavoritesStore;
};

export const useFavorites = (activeGroupId?: string) => {
  const { getGroupFavorites } = useAppContext();
  return activeGroupId ? getGroupFavorites(activeGroupId) : [];
};

export const useAllFavorites = () => {
  const { favorites } = useAppContext();
  return favorites;
};