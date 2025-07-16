import { create } from 'zustand';
import { AppState, FavoriteItem, CoffeeCustomization, PastryCustomization } from '@/types';

interface NavigationStore {
  // State
  appState: AppState;
  isMobileMenuOpen: boolean;
  returnToPage?: 'cart' | 'favorites'; // Track where to return after editing
  
  // Actions
  setAppState: (state: AppState) => void;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  setReturnToPage: (page: 'cart' | 'favorites' | undefined) => void;
  navigateToMenu: () => void;
  navigateToCart: () => void;
  navigateToGroups: () => void;
  navigateToCoffeeDetail: (
    coffeeId: string, 
    initialCustomizations?: CoffeeCustomization, 
    onSave?: (customizations: CoffeeCustomization) => void,
    returnTo?: 'cart' | 'favorites'
  ) => void;
  navigateToPastryDetail: (
    pastryId: string, 
    initialCustomizations?: PastryCustomization, 
    onSave?: (customizations: PastryCustomization) => void,
    returnTo?: 'cart' | 'favorites'
  ) => void;
  navigateToCheckout: () => void;
  navigateToOrderHistory: () => void;
  navigateToFavorites: () => void;
  navigateToFavoriteDetail: (favorite: FavoriteItem) => void;
  navigateBack: () => void; // Navigate back to the appropriate page
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  // Initial state
  appState: { currentPage: 'menu' },
  isMobileMenuOpen: false,
  returnToPage: undefined,
  
  // Actions
  setAppState: (state: AppState) => set({ appState: state }),
  setIsMobileMenuOpen: (isOpen: boolean) => set({ isMobileMenuOpen: isOpen }),
  setReturnToPage: (page: 'cart' | 'favorites' | undefined) => set({ returnToPage: page }),
  
  // Navigation functions
  navigateToMenu: () => {
    set({ 
      appState: { currentPage: 'menu' },
      isMobileMenuOpen: false,
      returnToPage: undefined
    });
  },
  
  navigateToCart: () => {
    set({ 
      appState: { currentPage: 'cart' },
      isMobileMenuOpen: false,
      returnToPage: undefined
    });
  },
  
  navigateToGroups: () => {
    set({ 
      appState: { currentPage: 'groups' },
      isMobileMenuOpen: false,
      returnToPage: undefined
    });
  },
  
  navigateToCoffeeDetail: (
    coffeeId: string, 
    initialCustomizations?: CoffeeCustomization, 
    onSave?: (customizations: CoffeeCustomization) => void,
    returnTo?: 'cart' | 'favorites'
  ) => {
    set({ 
      appState: { 
        currentPage: 'coffee-detail', 
        selectedItemId: coffeeId, 
        initialCoffeeCustomizations: initialCustomizations,
        onSaveCoffeeCustomizations: onSave
      },
      isMobileMenuOpen: false,
      returnToPage: returnTo
    });
  },
  
  navigateToPastryDetail: (
    pastryId: string, 
    initialCustomizations?: PastryCustomization, 
    onSave?: (customizations: PastryCustomization) => void,
    returnTo?: 'cart' | 'favorites'
  ) => {
    set({ 
      appState: { 
        currentPage: 'pastry-detail', 
        selectedItemId: pastryId, 
        initialPastryCustomizations: initialCustomizations,
        onSavePastryCustomizations: onSave
      },
      isMobileMenuOpen: false,
      returnToPage: returnTo
    });
  },
  
  navigateToCheckout: () => {
    set({ 
      appState: { currentPage: 'checkout' },
      isMobileMenuOpen: false,
      returnToPage: undefined
    });
  },
  
  navigateToOrderHistory: () => {
    set({ 
      appState: { currentPage: 'order-history' },
      isMobileMenuOpen: false,
      returnToPage: undefined
    });
  },
  
  navigateToFavorites: () => {
    set({ 
      appState: { currentPage: 'favorites' },
      isMobileMenuOpen: false,
      returnToPage: undefined
    });
  },
  
  navigateToFavoriteDetail: (favorite: FavoriteItem) => {
    const { navigateToCoffeeDetail, navigateToPastryDetail } = get();
    
    if (favorite.type === 'coffee') {
      navigateToCoffeeDetail(favorite.item.id, favorite.customizations as CoffeeCustomization, undefined, 'favorites');
    } else {
      navigateToPastryDetail(favorite.item.id, favorite.customizations as PastryCustomization, undefined, 'favorites');
    }
  },
  
  navigateBack: () => {
    const { returnToPage } = get();
    if (returnToPage === 'cart') {
      get().navigateToCart();
    } else if (returnToPage === 'favorites') {
      get().navigateToFavorites();
    } else {
      get().navigateToMenu();
    }
  }
}));
