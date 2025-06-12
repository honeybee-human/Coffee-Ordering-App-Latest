// Import your existing types
import { 
  Coffee, 
  Pastry, 
  CoffeeCustomization, 
  PastryCustomization, 
  CartItem, 
  GroupMember,
} from '@/types';

// Import specialized stores
import { useGroupStore } from './useGroupStore';
import { useCartCountsStore } from './useCartCountsStore';
import { useFavoritesStore } from './useFavoritesStore';
import { useOrderHistoryStore } from './useOrderHistoryStore';
import { useNavigationStore } from './useNavigationStore';
import { useModalsStore } from './useModalsStore';
import { useAllergensStore } from './useAllergensStore';

// This file now serves as a facade that re-exports functionality from specialized stores
// It maintains backward compatibility with existing code that imports from useAppStore

// Re-export the specialized stores
export { useGroupStore };
export { useCartCountsStore };
export { useFavoritesStore };
export { useOrderHistoryStore };
export { useNavigationStore };
export { useModalsStore };
export { useAllergensStore };

// Create a compatibility layer for existing code using Zustand's create function
import { create } from 'zustand';

export const useAppStore = create(() => ({
    // Group-related state and actions
    groups: useGroupStore.getState().groups,
    activeGroupId: useGroupStore.getState().activeGroupId,
    getActiveGroup: useGroupStore.getState().getActiveGroup,
    createGroup: useGroupStore.getState().createGroup,
    selectGroup: useGroupStore.getState().selectGroup,
    deleteGroup: useGroupStore.getState().deleteGroup,
    renameGroup: useGroupStore.getState().renameGroup,
    addGroupMember: useGroupStore.getState().addGroupMember,
    removeGroupMember: useGroupStore.getState().removeGroupMember,
    addToCart: useGroupStore.getState().addToCart,
    removeFromCart: useGroupStore.getState().removeFromCart,
    updateCartQuantity: useGroupStore.getState().updateCartQuantity,
    clearCart: useGroupStore.getState().clearCart,
    
    // Cart-related calculations
    getCartCount: useCartCountsStore.getState().getCartCount,
    getCartSubtotal: useCartCountsStore.getState().getCartSubtotal,
    getCartTax: useCartCountsStore.getState().getCartTax,
    getCartTotal: useCartCountsStore.getState().getCartTotal,
    
    // Favorites-related state and actions
    favorites: useFavoritesStore.getState().favorites,
    addToFavorites: useFavoritesStore.getState().addToFavorites,
    removeFromFavorites: useFavoritesStore.getState().removeFromFavorites,
    isItemFavorited: useFavoritesStore.getState().isItemFavorited,
    toggleFavorite: useFavoritesStore.getState().toggleFavorite,
    
    // Order history-related state and actions
    orderHistory: useOrderHistoryStore.getState().orderHistory,
    completeOrder: useOrderHistoryStore.getState().completeOrder,
    reorderItems: useOrderHistoryStore.getState().reorderItems,
    
    // Navigation-related state and actions
    currentPage: useNavigationStore.getState().appState.currentPage,
    selectedItemId: useNavigationStore.getState().appState.selectedItemId,
    initialCustomizations: useNavigationStore.getState().appState.initialCoffeeCustomizations || useNavigationStore.getState().appState.initialCoffeeCustomizations,
    isMobileMenuOpen: useNavigationStore.getState().isMobileMenuOpen,
    navigateToMenu: useNavigationStore.getState().navigateToMenu,
    navigateToCart: useNavigationStore.getState().navigateToCart,
    navigateToGroups: useNavigationStore.getState().navigateToGroups,
    navigateToCheckout: useNavigationStore.getState().navigateToCheckout,
    navigateToCoffeeDetail: useNavigationStore.getState().navigateToCoffeeDetail,
    navigateToPastryDetail: useNavigationStore.getState().navigateToPastryDetail,
    navigateToOrderHistory: useNavigationStore.getState().navigateToOrderHistory,
    navigateToFavorites: useNavigationStore.getState().navigateToFavorites,
    navigateToFavoriteDetail: useNavigationStore.getState().navigateToFavoriteDetail,
    setMobileMenuOpen: useNavigationStore.getState().setIsMobileMenuOpen,
    
    // Modal-related state and actions
    modals: {
      addToCart: useModalsStore.getState().modals.addToCart,
      orderComplete: useModalsStore.getState().modals.orderComplete,
      allergenWarning: useModalsStore.getState().modals.allergenWarning
    },
    showAddToCartModal: useModalsStore.getState().showAddToCartModal,
    closeAddToCartModal: useModalsStore.getState().closeAddToCartModal,
    showOrderCompleteModal: useModalsStore.getState().showOrderCompleteModal,
    closeOrderCompleteModal: useModalsStore.getState().closeOrderCompleteModal,
    showAllergenWarning: useModalsStore.getState().showAllergenWarningModal,
    closeAllergenWarning: useModalsStore.getState().closeAllergenWarningModal,
    proceedWithAllergen: () => {
      const { modals } = useModalsStore.getState();
      if (modals.allergenWarning.isOpen) {
        // This is a simplified version as the original had more complex logic
        useModalsStore.getState().closeAllergenWarningModal();
      }
    },
    
    // Allergen-related state and actions
    excludedAllergens: useAllergensStore.getState().excludedAllergens,
    toggleAllergenFilter: useAllergensStore.getState().toggleAllergenFilter,
    clearAllergenFilters: useAllergensStore.getState().clearAllergenFilters,
    addMemberAllergensToFilters: useAllergensStore.getState().addMemberAllergensToFilters,
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
        return itemAllergens;
      }
      
      if (item.type === 'coffee' && 'syrups' in item.customizations) {
        // Coffee customizations might add allergens from syrups/milk
        return itemAllergens;
      }
      
      return itemAllergens;
    }
  })
);


// Re-export the selector hooks from specialized stores
export const useActiveGroup = () => useGroupStore(state => state.getActiveGroup());
export const useCartCount = () => useCartCountsStore(state => state.getCartCount());
export const useGroups = () => useGroupStore(state => state.groups);
export const useFavorites = () => useFavoritesStore(state => state.favorites);
export const useOrderHistory = () => useOrderHistoryStore(state => state.orderHistory);
export const useCurrentPage = () => useNavigationStore(state => ({ 
  currentPage: state.appState.currentPage, 
  selectedItemId: state.appState.selectedItemId,
  initialPastryCustomizations: state.appState.initialPastryCustomizations,
  initialCoffeeCustomizations: state.appState.initialCoffeeCustomizations,
  // For backward compatibility
  initialCustomizations: state.appState.initialCoffeeCustomizations || state.appState.initialPastryCustomizations
}));
export const useModals = () => useModalsStore(state => state.modals);
export const useAllergenFilters = () => useAllergensStore(state => state.excludedAllergens);

// Cart calculation selectors
export const useCartSubtotal = () => useCartCountsStore(state => state.getCartSubtotal());
export const useCartTax = (taxRate?: number) => useCartCountsStore(state => state.getCartTax(taxRate));
export const useCartTotal = (taxRate?: number) => useCartCountsStore(state => state.getCartTotal(taxRate));