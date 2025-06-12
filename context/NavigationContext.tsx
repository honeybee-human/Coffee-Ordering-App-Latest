import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppState, FavoriteItem } from '@/types';

interface NavigationContextType {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navigateToMenu: () => void;
  navigateToCart: () => void;
  navigateToGroups: () => void;
  navigateToCoffeeDetail: (coffeeId: string, initialCustomizations?: any) => void;
  navigateToPastryDetail: (pastryId: string, initialCustomizations?: any) => void;
  navigateToCheckout: () => void;
  navigateToOrderHistory: () => void;
  navigateToFavorites: () => void;
  navigateToFavoriteDetail: (favorite: FavoriteItem) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'menu'
  });
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation functions
  const navigateToMenu = useCallback(() => {
    setAppState({ currentPage: 'menu' });
    setIsMobileMenuOpen(false);
  }, []);
  
  const navigateToCart = useCallback(() => {
    setAppState({ currentPage: 'cart' });
    setIsMobileMenuOpen(false);
  }, []);
  
  const navigateToGroups = useCallback(() => {
    setAppState({ currentPage: 'groups' });
    setIsMobileMenuOpen(false);
  }, []);
  
  const navigateToCoffeeDetail = useCallback((coffeeId: string, initialCoffeeCustomizations?: any) => {
    setAppState({ currentPage: 'coffee-detail', selectedItemId: coffeeId, initialCoffeeCustomizations });
    setIsMobileMenuOpen(false);
  }, []);
  
  const navigateToPastryDetail = useCallback((pastryId: string, initialPastryCustomizations?: any) => {
    setAppState({ currentPage: 'pastry-detail', selectedItemId: pastryId, initialPastryCustomizations });
    setIsMobileMenuOpen(false);
  }, []);
  
  const navigateToCheckout = useCallback(() => {
    setAppState({ currentPage: 'checkout' });
    setIsMobileMenuOpen(false);
  }, []);
  
  const navigateToOrderHistory = useCallback(() => {
    setAppState({ currentPage: 'order-history' });
    setIsMobileMenuOpen(false);
  }, []);
  
  const navigateToFavorites = useCallback(() => {
    setAppState({ currentPage: 'favorites' });
    setIsMobileMenuOpen(false);
  }, []);

  // Navigation from favorites with customizations
  const navigateToFavoriteDetail = useCallback((favorite: FavoriteItem) => {
    if (favorite.type === 'coffee') {
      navigateToCoffeeDetail(favorite.item.id, favorite.customizations);
    } else {
      navigateToPastryDetail(favorite.item.id, favorite.customizations);
    }
  }, [navigateToCoffeeDetail, navigateToPastryDetail]);

  return (
    <NavigationContext.Provider value={{
      appState,
      setAppState,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      navigateToMenu,
      navigateToCart,
      navigateToGroups,
      navigateToCoffeeDetail,
      navigateToPastryDetail,
      navigateToCheckout,
      navigateToOrderHistory,
      navigateToFavorites,
      navigateToFavoriteDetail
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};