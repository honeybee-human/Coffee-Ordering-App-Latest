// PageRouter.tsx - Store-based navigation and modal management
import React from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useModalsStore } from '@/store/useModalsStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useOrdersStore } from '@/store/useOrdersStore';
import { Order } from '@/types';
import { MenuPage } from '@/components/pages/MenuPage';
import { CoffeeDetailPage } from '@/components/pages/CoffeeDetailPage';
import { PastryDetailPage } from '@/components/pages/PastryDetailPage';
import { CheckoutPage } from '@/components/pages/CheckoutPage';
import { FavoritesPage } from '@/components/pages/FavoritesPage';
import { OrderHistoryPage } from '@/components/pages/OrderHistoryPage';
import { GroupManagement } from '@/components/features/GroupManagement';
import { coffeeMenu, pastryMenu } from '@/data/menu';
import { Cart } from '@/components/pages/Cart';

export const PageRouter: React.FC = () => {
  const { appState, navigateToMenu, navigateToCheckout } = useNavigationStore();
  const { showAllergenWarning } = useModalsStore();
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const { completeOrder } = useOrdersStore();
  const { clearCart } = useGroupsStore();

  const handleOrderComplete = (order: Order) => {
    if (activeGroup) {
      completeOrder(activeGroup.id, order);
      clearCart(activeGroup.id);
    }
  };

  const handleAllergenConflict = (allergens: string[], affectedMembers: string[], itemName: string, addCallback: () => void) => {
    const affectedGroupMembers = activeGroup?.members.filter(member => 
      affectedMembers.includes(member.name)
    ) || [];
    
    showAllergenWarning(allergens, affectedGroupMembers, itemName, addCallback);
  };

  switch (appState.currentPage) {
    case 'menu':
      return <MenuPage />;
    case 'coffee-detail':
      const coffee = coffeeMenu.find(c => c.id === appState.selectedItemId);
      if (!coffee) return <MenuPage />;
      return (
        <CoffeeDetailPage
          coffeeId={coffee.id}
          onBack={navigateToMenu}
        />
      );
    case 'pastry-detail':
      return (
        <PastryDetailPage
          pastryId={appState.selectedItemId || ''}
          onBack={navigateToMenu}
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
    case 'favorites':
      return <FavoritesPage />;
    case 'order-history':
      return (
        <OrderHistoryPage
        />
      );
    case 'groups':
      return <GroupManagement />;
    case 'cart':
      return <Cart onNavigateToCheckout={navigateToCheckout} />;
    default:
      return <MenuPage />;
  }
};