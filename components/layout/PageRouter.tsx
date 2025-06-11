import React from 'react';
import { AppState, Group, FavoriteItem, Order, CartItem, GroupMember } from '../../types';
import { CoffeeDetailPage } from '../CoffeeDetailPage';
import { PastryDetailPage } from '../PastryDetailPage';
import { Cart } from '../Cart';
import { CheckoutPage } from '../CheckoutPage';
import { OrderHistoryPage } from '../OrderHistoryPage';
import { FavoritesPage } from '../FavoritesPage';
import { GroupManagement } from '../GroupManagement';
import { MenuPage } from './MenuPage';

interface PageRouterProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
  activeGroup: Group | undefined;
  orderHistory: Order[];
  favorites: FavoriteItem[];
  excludedAllergens: string[];
  
  // Navigation functions
  onNavigateToMenu: () => void;
  onNavigateToCart: () => void;
  onNavigateToCoffeeDetail: (coffeeId: string, initialCustomizations?: any) => void;
  onNavigateToPastryDetail: (pastryId: string, initialCustomizations?: any) => void;
  onNavigateToFavoriteDetail: (favorite: FavoriteItem) => void;
  
  // Business logic handlers
  onAddToCart: (item: CartItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onOrderComplete: (order: Order) => void;
  onReorder: (orderId: string) => void;
  onRemoveFromFavorites: (favoriteId: string) => void;
  onToggleFavorite: (type: 'coffee' | 'pastry', item: any, customizations?: any) => void;
  onAllergenConflict: (allergens: string[], affectedMembers: string[], itemName: string, addCallback: () => void) => void;
  onToggleAllergenFilter: (allergen: string) => void;
  onClearAllergenFilters: () => void;
  
  // Group management
  onCreateGroup: (name: string) => void;
  onSelectGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onAddMember: (groupId: string, member: GroupMember) => void;
  onRemoveMember: (groupId: string, memberId: string) => void;
  
  // Helper functions
  isItemFavorited: (type: 'coffee' | 'pastry', itemId: string, customizations?: any) => boolean;
  getAllAllergens: (item: any) => string[];
  groups: Group[];
  activeGroupId: string | null;
}

export const PageRouter: React.FC<PageRouterProps> = ({
  appState,
  setAppState,
  activeGroup,
  orderHistory,
  favorites,
  excludedAllergens,
  onNavigateToMenu,
  onNavigateToCart,
  onNavigateToCoffeeDetail,
  onNavigateToPastryDetail,
  onNavigateToFavoriteDetail,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onOrderComplete,
  onReorder,
  onRemoveFromFavorites,
  onToggleFavorite,
  onAllergenConflict,
  onToggleAllergenFilter,
  onClearAllergenFilters,
  onCreateGroup,
  onSelectGroup,
  onDeleteGroup,
  onRenameGroup,
  onAddMember,
  onRemoveMember,
  isItemFavorited,
  getAllAllergens,
  groups,
  activeGroupId
}) => {
  const renderCurrentPage = () => {
    switch (appState.currentPage) {
      case 'coffee-detail':
        if (!appState.selectedItemId) {
          setAppState({ currentPage: 'menu' });
          return null;
        }
        return (
          <CoffeeDetailPage
            coffeeId={appState.selectedItemId}
            groupMembers={activeGroup?.members || []}
            onBack={onNavigateToMenu}
            onAddToCart={onAddToCart}
            onAllergenConflict={(allergens, affectedMembers, itemName, addCallback) => {
              // Show allergen warning with proper parameters
              onAllergenConflict(allergens, affectedMembers, itemName, addCallback);
            }}
            onToggleFavorite={onToggleFavorite}
            isItemFavorited={isItemFavorited}
            initialCustomizations={appState.initialCoffeeCustomizations}
          />
        );
      case 'pastry-detail':
        if (!appState.selectedItemId) {
          setAppState({ currentPage: 'menu' });
          return null;
        }
        return (
          <PastryDetailPage
            pastryId={appState.selectedItemId}
            groupMembers={activeGroup?.members || []}
            onBack={onNavigateToMenu}
            onAddToCart={onAddToCart}
            onAllergenConflict={(allergens, affectedMembers, itemName, addCallback) => {
              // Show allergen warning with proper parameters
              onAllergenConflict(allergens, affectedMembers, itemName, addCallback);
            }}
            onToggleFavorite={onToggleFavorite}
            isItemFavorited={isItemFavorited}
            initialCustomizations={appState.initialPastryCustomizations}
          />
        );
      case 'cart':
        return (
          <Cart
            cartItems={activeGroup?.cart || []}
            groupMembers={activeGroup?.members || []}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveFromCart}
            onClearCart={onClearCart}
            onCheckout={() => setAppState({ currentPage: 'checkout' })}
            getAllAllergens={getAllAllergens}
          />
        );
      case 'checkout':
        return (
          <CheckoutPage
            cartItems={activeGroup?.cart || []}
            groupMembers={activeGroup?.members || []}
            onBack={onNavigateToCart}
            onOrderComplete={onOrderComplete}
          />
        );
      case 'order-history':
        return (
          <OrderHistoryPage
            orders={orderHistory}
            onBack={onNavigateToMenu}
            onReorder={onReorder}
          />
        );
      case 'favorites':
        return (
          <FavoritesPage
            favorites={favorites}
            groupMembers={activeGroup?.members || []}
            onBack={onNavigateToMenu}
            onRemoveFromFavorites={onRemoveFromFavorites}
            onAddToCart={onAddToCart}
            onNavigateToDetail={onNavigateToFavoriteDetail}
            excludedAllergens={excludedAllergens}
            onToggleAllergenFilter={onToggleAllergenFilter}
            onClearAllergenFilters={onClearAllergenFilters}
          />
        );
      case 'groups':
        return (
          <GroupManagement
            groups={groups}
            activeGroupId={activeGroupId}
            onCreateGroup={onCreateGroup}
            onSelectGroup={onSelectGroup}
            onDeleteGroup={onDeleteGroup}
            onRenameGroup={onRenameGroup}
            onAddMember={onAddMember}
            onRemoveMember={onRemoveMember}
          />
        );
      case 'menu':
      default:
        return (
          <MenuPage
            activeGroup={activeGroup}
            onSelectCoffee={onNavigateToCoffeeDetail}
            onSelectPastry={onNavigateToPastryDetail}
            onToggleFavorite={onToggleFavorite}
            isItemFavorited={isItemFavorited}
            excludedAllergens={excludedAllergens}
            onToggleAllergenFilter={onToggleAllergenFilter}
            onClearAllergenFilters={onClearAllergenFilters}
          />
        );
    }
  };

  return <>{renderCurrentPage()}</>;
};