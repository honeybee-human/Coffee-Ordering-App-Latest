import { AppState, FavoriteItem, CoffeeCustomization, PastryCustomization } from '@/types';
import { useAppContext } from '@/context/AppContext';

export const useNavigationStore = () => {
  const {
    appState,
    setAppState,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    returnToPage,
    setReturnToPage,
    navigateToLanding,
    navigateToMenu,
    navigateToCart,
    navigateToGroups,
    navigateToCoffeeDetail,
    navigateToPastryDetail,
    navigateToCheckout,
    navigateToOrderHistory,
    navigateToFavorites,
    navigateBack,
  } = useAppContext();

  return {
    appState,
    isMobileMenuOpen,
    returnToPage,
    setAppState: (state: AppState) => setAppState(state),
    setIsMobileMenuOpen: (isOpen: boolean) => setIsMobileMenuOpen(isOpen),
    setReturnToPage: (page: 'cart' | 'favorites' | undefined) => setReturnToPage(page),
    navigateToLanding,
    navigateToMenu,
    navigateToCart,
    navigateToGroups,
    navigateToCoffeeDetail,
    navigateToPastryDetail,
    navigateToCheckout,
    navigateToOrderHistory,
    navigateToFavorites,
    navigateBack,
    navigateToFavoriteDetail: (favorite: FavoriteItem) => {
      if (favorite.type === 'coffee') {
        const initial: CoffeeCustomization = {
          ...(favorite.customizations as CoffeeCustomization),
          assignedTo: favorite.assignedTo,
        };
        navigateToCoffeeDetail(favorite.item.id, initial, undefined, 'favorites');
      } else {
        const initial: PastryCustomization = {
          ...(favorite.customizations as PastryCustomization),
          assignedTo: favorite.assignedTo,
        };
        navigateToPastryDetail(favorite.item.id, initial, undefined, 'favorites');
      }
    },
  };
};
