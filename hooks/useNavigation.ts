import { useState, useCallback } from 'react';
import { AppState, FavoriteItem } from '../types';

/**
 * Custom hook for managing navigation state and routing
 * Handles: page navigation, mobile menu, and navigation actions
 */
export const useNavigation = () => {
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
  
  const navigateToCoffeeDetail = useCallback((coffeeId: string, initialCustomizations?: any) => {
    setAppState({ currentPage: 'coffee-detail', selectedItemId: coffeeId, initialCustomizations });
    setIsMobileMenuOpen(false);
  }, []);
  
  const navigateToPastryDetail = useCallback((pastryId: string, initialCustomizations?: any) => {
    setAppState({ currentPage: 'pastry-detail', selectedItemId: pastryId, initialCustomizations });
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

  return {
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
  };
};