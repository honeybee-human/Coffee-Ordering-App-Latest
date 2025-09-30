// AppContent.tsx - Final ultra-clean version
import React from 'react';
import { ShoppingCart, History, Heart, Menu as MenuIcon, Users } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PageRouter } from '@/components/layout/PageRouter';
import { Footer } from '@/components/shared/Footer';
import { AddToCartModal } from '@/components/modals/AddToCartModal';
import { OrderCompleteModal } from '@/components/modals/OrderCompleteModal';
import { PaymentCompleteModal } from '@/components/modals/PaymentCompleteModal';
import { useModalsStore } from '@/store/useModalsStore';
import OnboardingModal from '@/components/modals/OnboardingModal';
import { AllergenWarning } from '@/components/shared/AllergenWarning';
// Store imports
import { useFavorites } from '@/store/useFavoritesStore';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useGroupsStore, useActiveGroup, useCartCount, useGroups } from './store/useGroupsStore';

export function AppContent() {
  // Navigation state from store
  const { 
    appState, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen,
    navigateToLanding,
    navigateToMenu,
    navigateToCart,
    navigateToCheckout,
    navigateToGroups,
    navigateToOrderHistory,
    navigateToFavorites
  } = useNavigationStore();

  // Data subscriptions for counts only
  const activeGroup = useActiveGroup();
  const cartCount = useCartCount();
  const groups = useGroups();
  const selectGroup = useGroupsStore(state => state.selectGroup);
  const favorites = useFavorites(activeGroup?.id);

  // Count calculations for navigation
  const counts = {
    cart: cartCount,
    groups: groups.length,
    orderHistory: 0, // Components will get this from their own store hooks
    favorites: favorites.length
  };

  // Mobile navigation items
  const mobileNavItems = [
    { icon: MenuIcon, label: 'Menu', page: 'menu', count: null, action: navigateToMenu },
    { icon: ShoppingCart, label: 'Cart', page: 'cart', count: counts.cart, action: navigateToCart, isCart: true },
    { icon: Users, label: 'Groups', page: 'groups', count: counts.groups, action: navigateToGroups },
    { icon: History, label: 'Orders', page: 'order-history', count: counts.orderHistory, action: navigateToOrderHistory },
    { icon: Heart, label: 'Favorites', page: 'favorites', count: counts.favorites, action: navigateToFavorites }
  ];

  // Local onboarding modal state
  const [onboardingOpen, setOnboardingOpen] = React.useState(true);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        activeGroup={activeGroup || undefined}
        appState={{
          ...appState,
          groups: groups
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onNavigateToLanding={navigateToLanding}
        onNavigateToMenu={navigateToMenu}
        onNavigateToCart={navigateToCart}
        onNavigateToGroups={navigateToGroups}
        onNavigateToFavorites={navigateToFavorites}
        onNavigateToOrderHistory={navigateToOrderHistory}
      />
      
      <div className="py-16 px-20 flex-1">
        <PageRouter />
      </div>
      
      <Footer />
      
      <div className="fixed inset-0 pointer-events-none">
        <AddToCartModal/>
        <OrderCompleteModal/>
        <PaymentCompleteModal/>
        <AllergenWarning/>
        <OnboardingModal open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
      </div>
    </div>
  );
}