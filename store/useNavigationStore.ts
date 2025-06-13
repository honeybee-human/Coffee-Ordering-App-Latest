import { create } from 'zustand';
import { AppState, FavoriteItem, CoffeeCustomization, PastryCustomization } from '@/types';

interface NavigationStore {
  // State
  appState: AppState;
  isMobileMenuOpen: boolean;
  
  // Actions
  setAppState: (state: AppState) => void;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  navigateToMenu: () => void;
  navigateToCart: () => void;
  navigateToGroups: () => void;
  navigateToCoffeeDetail: (coffeeId: string, initialCustomizations?: CoffeeCustomization) => void;
  navigateToPastryDetail: (pastryId: string, initialCustomizations?: PastryCustomization) => void;
  navigateToCheckout: () => void;
  navigateToOrderHistory: () => void;
  navigateToFavorites: () => void;
  navigateToFavoriteDetail: (favorite: FavoriteItem) => void;
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  // Initial state
  appState: { currentPage: 'menu' },
  isMobileMenuOpen: false,
  
  // Actions
  setAppState: (state: AppState) => set({ appState: state }),
  setIsMobileMenuOpen: (isOpen: boolean) => set({ isMobileMenuOpen: isOpen }),
  
  // Navigation functions
  navigateToMenu: () => {
    set({ 
      appState: { currentPage: 'menu' },
      isMobileMenuOpen: false
    });
  },
  
  navigateToCart: () => {
    set({ 
      appState: { currentPage: 'cart' },
      isMobileMenuOpen: false
    });
  },
  
  navigateToGroups: () => {
    set({ 
      appState: { currentPage: 'groups' },
      isMobileMenuOpen: false
    });
  },
  
  navigateToCoffeeDetail: (coffeeId: string, initialCoffeeCustomizations?: CoffeeCustomization) => {
    set({ 
      appState: { 
        currentPage: 'coffee-detail', 
        selectedItemId: coffeeId, 
        initialCoffeeCustomizations 
      },
      isMobileMenuOpen: false
    });
  },
  
  navigateToPastryDetail: (pastryId: string, initialPastryCustomizations?: PastryCustomization) => {
    set({ 
      appState: { 
        currentPage: 'pastry-detail', 
        selectedItemId: pastryId, 
        initialPastryCustomizations 
      },
      isMobileMenuOpen: false
    });
  },
  
  navigateToCheckout: () => {
    set({ 
      appState: { currentPage: 'checkout' },
      isMobileMenuOpen: false
    });
  },
  
  navigateToOrderHistory: () => {
    set({ 
      appState: { currentPage: 'order-history' },
      isMobileMenuOpen: false
    });
  },
  
  navigateToFavorites: () => {
    set({ 
      appState: { currentPage: 'favorites' },
      isMobileMenuOpen: false
    });
  },
  
  navigateToFavoriteDetail: (favorite: FavoriteItem) => {
    const { navigateToCoffeeDetail, navigateToPastryDetail } = get();
    
    if (favorite.type === 'coffee') {
      navigateToCoffeeDetail(favorite.item.id, favorite.customizations as CoffeeCustomization);
    } else {
      navigateToPastryDetail(favorite.item.id, favorite.customizations as PastryCustomization);
    }
  }
}));
