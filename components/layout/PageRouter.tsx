// PageRouter.tsx - Store-based navigation and modal management
import React from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useModalsStore } from '@/store/useModalsStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useOrdersStore } from '@/store/useOrdersStore';
import { Order, CoffeeCustomization, PastryCustomization } from '@/types';
import { MenuPage } from '@/components/pages/MenuPage';
import { CoffeeDetailPage } from '@/components/pages/CoffeeDetailPage';
import { PastryDetailPage } from '@/components/pages/PastryDetailPage';
import { CheckoutPage } from '@/components/pages/CheckoutPage';
import { FavoritesPage } from '@/components/pages/FavoritesPage';
import { OrderHistoryPage } from '@/components/pages/OrderHistoryPage';
import { GroupManagement } from '@/components/features/GroupManagement';
import { coffeeMenu, pastryMenu } from '@/data/menu';
import { Cart } from '@/components/pages/Cart';
import { Header } from '@/components/layout/Header';

export const PageRouter: React.FC = () => {
  const appState = useNavigationStore(state => state.appState);
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const isMobileMenuOpen = useNavigationStore(state => state.isMobileMenuOpen);
  const setIsMobileMenuOpen = useNavigationStore(state => state.setIsMobileMenuOpen);
  const navigateToMenu = useNavigationStore(state => state.navigateToMenu);
  const navigateToCart = useNavigationStore(state => state.navigateToCart);
  const navigateToGroups = useNavigationStore(state => state.navigateToGroups);
  const navigateToFavorites = useNavigationStore(state => state.navigateToFavorites);
  const navigateToOrderHistory = useNavigationStore(state => state.navigateToOrderHistory);
  const { showAllergenWarning } = useModalsStore();
  const { completeOrder } = useOrdersStore();
  const { clearCart } = useGroupsStore();

  const handleOrderComplete = (order: Order) => {
    completeOrder(order);
    clearCart(activeGroup?.id || '');
    navigateToMenu();
  };

  const handleAllergenConflict = (allergens: string[], affectedMembers: string[], itemName: string, addCallback: () => void) => {
    const affectedGroupMembers = activeGroup?.members.filter(member => 
      affectedMembers.includes(member.name)
    ) || [];
    
    showAllergenWarning(allergens, affectedGroupMembers, itemName, addCallback);
  };

  const renderPage = () => {
    switch (appState.currentPage) {
      case 'menu':
        return <MenuPage />;
      case 'cart':
        return <Cart />;
      case 'groups':
        return <GroupManagement />;
      case 'coffee-detail':
        const coffee = coffeeMenu.find(c => c.id === appState.selectedItemId);
        if (!coffee) return null;
        return (
          <CoffeeDetailPage
            coffeeId={coffee.id}
            onBack={navigateToMenu}
            initialCustomizations={appState.initialCoffeeCustomizations}
            onSave={appState.onSaveCoffeeCustomizations}
          />
        );
      case 'pastry-detail':
        const pastry = pastryMenu.find(p => p.id === appState.selectedItemId);
        if (!pastry) return null;
        return (
          <PastryDetailPage
            pastryId={pastry.id}
            onBack={navigateToMenu}
            initialCustomizations={appState.initialPastryCustomizations}
            onSave={appState.onSavePastryCustomizations}
          />
        );
      case 'checkout':
        return (
          <CheckoutPage
            cartItems={activeGroup?.cart || []}
            onBack={navigateToMenu}
            onOrderComplete={handleOrderComplete}
          />
        );
      case 'order-history':
        return <OrderHistoryPage />;
      case 'favorites':
        return <FavoritesPage />;
      default:
        return <MenuPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <main className="container mx-auto px-4 py-6">
        {renderPage()}
      </main>
    </div>
  );
};