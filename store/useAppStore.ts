// Import your existing types
import { 
  Coffee, 
  Pastry, 
  CoffeeCustomization, 
  PastryCustomization, 
  CartItem, 
  GroupMember, 
  Group, 
  Order, 
  FavoriteItem, 
  AppData,
  PageType 
} from '@/types'; // Update this path

// store/useStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import type { StateCreator } from 'zustand';


// Define the store interface
export interface AppStore {
  // State
  groups: Group[];
  activeGroupId: string | null;
  favorites: FavoriteItem[];
  orderHistory: Order[];
  excludedAllergens: string[];
  
  // Navigation state
  currentPage: PageType;
  selectedItemId?: string;
  initialCustomizations?: CoffeeCustomization | PastryCustomization;
  
  // Modal state
  modals: {
    addToCart: { isOpen: boolean; itemName: string };
    orderComplete: { isOpen: boolean; orderNumber: string; estimatedTime: number };
    allergenWarning: { 
      isOpen: boolean; 
      allergens: string[]; 
      affectedMembers: GroupMember[]; 
      itemName: string;
      onProceed?: () => void;
    };
  };
  isMobileMenuOpen: boolean;

  // Computed getters
  getActiveGroup: () => Group | undefined;
  getCartCount: () => number;
  
  // Group actions
  createGroup: (name: string) => void;
  selectGroup: (groupId: string) => void;
  deleteGroup: (groupId: string) => void;
  renameGroup: (groupId: string, newName: string) => void;
  addGroupMember: (groupId: string, member: GroupMember) => void;
  removeGroupMember: (groupId: string, memberName: string) => void;
  
  // Cart actions
  addToCart: (groupId: string, item: CartItem) => void;
  removeFromCart: (groupId: string, itemId: string) => void;
  updateCartQuantity: (groupId: string, itemId: string, quantity: number) => void;
  clearCart: (groupId: string) => void;
  
  // Favorites actions
  addToFavorites: (favorite: FavoriteItem) => void;
  removeFromFavorites: (favoriteId: string) => void;
  isItemFavorited: (type: 'coffee' | 'pastry', itemId: string, customizations?: CoffeeCustomization | PastryCustomization) => boolean;
  toggleFavorite: (type: 'coffee' | 'pastry', item: Coffee | Pastry, customizations?: CoffeeCustomization | PastryCustomization) => void;
  
  // Order actions
  completeOrder: (groupId: string, order: Order) => void;
  reorderItems: (groupId: string, orderId: string) => void;
  
  // Navigation actions
  navigateToMenu: () => void;
  navigateToCart: () => void;
  navigateToGroups: () => void;
  navigateToCheckout: () => void;
  navigateToCoffeeDetail: (coffeeId: string, initialCustomizations?: CoffeeCustomization) => void;
  navigateToPastryDetail: (pastryId: string, initialCustomizations?: PastryCustomization) => void;
  navigateToOrderHistory: () => void;
  navigateToFavorites: () => void;
  navigateToFavoriteDetail: (favoriteId: string) => void;
  
  // Modal actions
  showAddToCartModal: (itemName: string) => void;
  closeAddToCartModal: () => void;
  showOrderCompleteModal: (orderNumber: string, estimatedTime: number) => void;
  closeOrderCompleteModal: () => void;
  showAllergenWarning: (allergens: string[], affectedMembers: GroupMember[], itemName: string, onProceed: () => void) => void;
  closeAllergenWarning: () => void;
  proceedWithAllergen: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  
  // Allergen actions
  toggleAllergenFilter: (allergen: string) => void;
  clearAllergenFilters: () => void;
  addMemberAllergensToFilters: (allergens: string[]) => void;
  checkAllergenConflicts: (itemAllergens: string[], members: GroupMember[]) => GroupMember[];
  getAllAllergens: (item: CartItem) => string[];
}

// Define the shape of the persisted state
type AppPersist = {
  groups: Group[];
  activeGroupId: string | null;
  favorites: FavoriteItem[];
  orderHistory: Order[];
  excludedAllergens: string[];
};

// Create the store implementation
const storeImplementation: StateCreator<
  AppStore,
  [['zustand/persist', unknown]],
  [],
  AppStore
> = (set, get) => ({
  // Initial state
  groups: [],
  activeGroupId: null,
  favorites: [],
  orderHistory: [],
  excludedAllergens: [],
  currentPage: 'menu',
  selectedItemId: undefined,
  initialCustomizations: undefined,
  modals: {
    addToCart: { isOpen: false, itemName: '' },
    orderComplete: { isOpen: false, orderNumber: '', estimatedTime: 0 },
    allergenWarning: { 
      isOpen: false, 
      allergens: [], 
      affectedMembers: [], 
      itemName: '',
      onProceed: undefined
    }
  },
  isMobileMenuOpen: false,

  // Computed getters
  getActiveGroup: () => {
    const { groups, activeGroupId } = get();
    return groups.find(group => group.id === activeGroupId);
  },

  getCartCount: () => {
    const activeGroup = get().getActiveGroup();
    return activeGroup?.cart.reduce((sum, item) => sum + item.quantity, 0) || 0;
  },

  // Group actions
  createGroup: (name: string) => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      members: [],
      cart: [],
      dateCreated: new Date()
    };
    
    set((state) => ({
      groups: [...state.groups, newGroup],
      activeGroupId: newGroup.id
    }));
  },

  selectGroup: (groupId: string) => {
    set({ activeGroupId: groupId });
  },

  deleteGroup: (groupId: string) => {
    set((state) => {
      const newGroups = state.groups.filter(group => group.id !== groupId);
      const newActiveGroupId = state.activeGroupId === groupId 
        ? (newGroups.length > 0 ? newGroups[0].id : null)
        : state.activeGroupId;
      
      return {
        groups: newGroups,
        activeGroupId: newActiveGroupId
      };
    });
  },

  renameGroup: (groupId: string, newName: string) => {
    set((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId ? { ...group, name: newName } : group
      )
    }));
  },

  addGroupMember: (groupId: string, member: GroupMember) => {
    set((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId 
          ? { ...group, members: [...group.members, member] }
          : group
      )
    }));
  },

  removeGroupMember: (groupId: string, memberName: string) => {
    set((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId 
          ? { ...group, members: group.members.filter(m => m.name !== memberName) }
          : group
      )
    }));
  },

  // Cart actions
  addToCart: (groupId: string, item: CartItem) => {
    set((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId 
          ? { ...group, cart: [...group.cart, { ...item, id: Date.now().toString() }] }
          : group
      )
    }));
  },

  removeFromCart: (groupId: string, itemId: string) => {
    set((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId 
          ? { ...group, cart: group.cart.filter(item => item.id !== itemId) }
          : group
      )
    }));
  },

  updateCartQuantity: (groupId: string, itemId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(groupId, itemId);
      return;
    }
    
    set((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId 
          ? { 
              ...group, 
              cart: group.cart.map(item =>
                item.id === itemId ? { ...item, quantity } : item
              )
            }
          : group
      )
    }));
  },

  clearCart: (groupId: string) => {
    set((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId ? { ...group, cart: [] } : group
      )
    }));
  },

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

  // Order actions
  completeOrder: (groupId: string, order: Order) => {
    set((state) => ({
      orderHistory: [...state.orderHistory, order],
      groups: state.groups.map(group =>
        group.id === groupId ? { ...group, cart: [] } : group
      )
    }));
  },

  reorderItems: (groupId: string, orderId: string) => {
    const { orderHistory } = get();
    const order = orderHistory.find(o => o.id === orderId);
    if (order) {
      set((state) => ({
        groups: state.groups.map(group =>
          group.id === groupId 
            ? { ...group, cart: [...group.cart, ...order.items] }
            : group
        )
      }));
    }
  },

  // Navigation actions
  navigateToMenu: () => set({ 
    currentPage: 'menu', 
    selectedItemId: undefined, 
    initialCustomizations: undefined 
  }),
  navigateToCart: () => set({ 
    currentPage: 'cart', 
    selectedItemId: undefined, 
    initialCustomizations: undefined 
  }),
  navigateToGroups: () => set({ 
    currentPage: 'groups', 
    selectedItemId: undefined, 
    initialCustomizations: undefined 
  }),
  navigateToCheckout: () => set({ 
    currentPage: 'checkout', 
    selectedItemId: undefined, 
    initialCustomizations: undefined 
  }),
  navigateToCoffeeDetail: (coffeeId: string, initialCustomizations?: CoffeeCustomization) => set({ 
    currentPage: 'coffee-detail', 
    selectedItemId: coffeeId, 
    initialCustomizations 
  }),
  navigateToPastryDetail: (pastryId: string, initialCustomizations?: PastryCustomization) => set({ 
    currentPage: 'pastry-detail', 
    selectedItemId: pastryId, 
    initialCustomizations 
  }),
  navigateToOrderHistory: () => set({ 
    currentPage: 'order-history', 
    selectedItemId: undefined, 
    initialCustomizations: undefined 
  }),
  navigateToFavorites: () => set({ 
    currentPage: 'favorites', 
    selectedItemId: undefined, 
    initialCustomizations: undefined 
  }),
  navigateToFavoriteDetail: (favoriteId: string) => set({ 
    currentPage: 'favorites', 
    selectedItemId: favoriteId, 
    initialCustomizations: undefined 
  }),

  // Modal actions
  showAddToCartModal: (itemName: string) => {
    set((state) => ({
      modals: {
        ...state.modals,
        addToCart: { isOpen: true, itemName }
      }
    }));
  },

  closeAddToCartModal: () => {
    set((state) => ({
      modals: {
        ...state.modals,
        addToCart: { isOpen: false, itemName: '' }
      }
    }));
  },

  showOrderCompleteModal: (orderNumber: string, estimatedTime: number) => {
    set((state) => ({
      modals: {
        ...state.modals,
        orderComplete: { isOpen: true, orderNumber, estimatedTime }
      }
    }));
  },

  closeOrderCompleteModal: () => {
    set((state) => ({
      modals: {
        ...state.modals,
        orderComplete: { isOpen: false, orderNumber: '', estimatedTime: 0 }
      }
    }));
  },

  showAllergenWarning: (allergens: string[], affectedMembers: GroupMember[], itemName: string, onProceed: () => void) => {
    set((state) => ({
      modals: {
        ...state.modals,
        allergenWarning: {
          isOpen: true,
          allergens,
          affectedMembers,
          itemName,
          onProceed
        }
      }
    }));
  },

  closeAllergenWarning: () => {
    set((state) => ({
      modals: {
        ...state.modals,
        allergenWarning: {
          isOpen: false,
          allergens: [],
          affectedMembers: [],
          itemName: '',
          onProceed: undefined
        }
      }
    }));
  },

  proceedWithAllergen: () => {
    const { modals } = get();
    if (modals.allergenWarning.onProceed) {
      modals.allergenWarning.onProceed();
    }
    get().closeAllergenWarning();
  },

  setMobileMenuOpen: (isOpen: boolean) => {
    set({ isMobileMenuOpen: isOpen });
  },

  // Allergen actions
  toggleAllergenFilter: (allergen: string) => {
    set((state) => ({
      excludedAllergens: state.excludedAllergens.includes(allergen)
        ? state.excludedAllergens.filter(a => a !== allergen)
        : [...state.excludedAllergens, allergen]
    }));
  },

  clearAllergenFilters: () => {
    set({ excludedAllergens: [] });
  },

  addMemberAllergensToFilters: (allergens: string[]) => {
    set((state) => ({
      excludedAllergens: [...new Set([...state.excludedAllergens, ...allergens])]
    }));
  },

  checkAllergenConflicts: (itemAllergens: string[], members: GroupMember[]) => {
    return members.filter(member =>
      member.allergens.some(allergen => itemAllergens.includes(allergen))
    );
  },

  getAllAllergens: (item: CartItem) => {
    const itemAllergens = item.item.allergens || [];
    
    // Add allergens from customizations if needed
    if (item.type === 'pastry' && 'removedIngredients' in item.customizations) {
      // Pastry customizations might reduce allergens by removing ingredients
      // This would need your specific business logic
      return itemAllergens;
    }
    
    if (item.type === 'coffee' && 'syrups' in item.customizations) {
      // Coffee customizations might add allergens from syrups/milk
      // This would need your specific business logic for syrup allergens
      return itemAllergens;
    }
    
    return itemAllergens;
  }
});

// Create the store with persist middleware
export const useAppStore = create<AppStore>()(  
  persist(
    storeImplementation,
    {
      name: 'bean-bite-storage',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist certain parts of the state
      partialize: (state) => ({
        groups: state.groups,
        activeGroupId: state.activeGroupId,
        favorites: state.favorites,
        orderHistory: state.orderHistory,
        excludedAllergens: state.excludedAllergens
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
    } as PersistOptions<AppStore, AppPersist>
  )
);

// Selector hooks for better performance
export const useActiveGroup = () => useAppStore(state => state.getActiveGroup());
export const useCartCount = () => useAppStore(state => state.getCartCount());
export const useGroups = () => useAppStore(state => state.groups);
export const useFavorites = () => useAppStore(state => state.favorites);
export const useOrderHistory = () => useAppStore(state => state.orderHistory);
export const useCurrentPage = () => useAppStore(state => ({ 
  currentPage: state.currentPage, 
  selectedItemId: state.selectedItemId,
  initialCustomizations: state.initialCustomizations
}));
export const useModals = () => useAppStore(state => state.modals);
export const useAllergenFilters = () => useAppStore(state => state.excludedAllergens);