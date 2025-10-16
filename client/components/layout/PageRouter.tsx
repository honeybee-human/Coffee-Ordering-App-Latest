import React, { useEffect } from 'react';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useModalsStore } from '@/store/useModalsStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useOrdersStore } from '@/store/useOrdersStore';
import { Order } from '@/types';
import { MenuPage } from '@/components/pages/MenuPage';
import { LandingPage } from '@/components/pages/LandingPage';
import { CoffeeDetailPage } from '@/components/pages/CoffeeDetailPage';
import { PastryDetailPage } from '@/components/pages/PastryDetailPage';
import { CheckoutPage } from '@/components/pages/CheckoutPage';
import { FavoritesPage } from '@/components/pages/FavoritesPage';
import { OrderHistoryPage } from '@/components/pages/OrderHistoryPage';
import { GroupManagement } from '@/components/features/GroupManagement';
import { coffeeMenu, pastryMenu } from '@/localDataArchive/menu';
import { Cart } from '@/components/pages/Cart';

export const PageRouter: React.FC = () => {
  const appState = useNavigationStore(state => state.appState);
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const navigateToMenu = useNavigationStore(state => state.navigateToMenu);
  const navigateBack = useNavigationStore(state => state.navigateBack);
  const navigateToCheckout = useNavigationStore(state => state.navigateToCheckout);
  const { showAllergenWarning } = useModalsStore();
  const { completeOrder } = useOrdersStore();
  const { clearCart } = useGroupsStore();

  // Reset scroll position to top whenever the page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [appState.currentPage]);

  const handleOrderComplete = (order: Order) => {
    completeOrder(order);
    clearCart(activeGroup?.id || '');
    navigateToMenu();
  };

  const renderPage = () => {
    switch (appState.currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'menu':
        return <MenuPage />;
      case 'cart':
        return <Cart onNavigateToCheckout={navigateToCheckout} />;
      case 'groups':
        return <GroupManagement />;
      case 'coffee-detail':
        {
          const coffeeId = appState.selectedItemId;
          if (!coffeeId) {
            return (
              <div className="container mx-auto px-4 py-8">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No coffee item selected</p>
                </div>
              </div>
            );
          }
          return (
            <CoffeeDetailPage
              coffeeId={coffeeId}
              onBack={navigateBack}
              initialCustomizations={appState.initialCoffeeCustomizations}
              onSave={appState.onSaveCoffeeCustomizations}
            />
          );
        }
      case 'pastry-detail':
        {
          const pastryId = appState.selectedItemId;
          if (!pastryId) {
            return (
              <div className="container mx-auto px-4 py-8">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pastry item selected</p>
                </div>
              </div>
            );
          }
          return (
            <PastryDetailPage
              pastryId={pastryId}
              onBack={navigateBack}
              initialCustomizations={appState.initialPastryCustomizations}
              onSave={appState.onSavePastryCustomizations}
            />
          );
        }
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
        return <LandingPage />;
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