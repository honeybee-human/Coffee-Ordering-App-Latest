import React from 'react';
import { ShoppingCart, History, Heart, Menu as MenuIcon, Users } from 'lucide-react';
import { AllergenWarning } from './components/AllergenWarning';
import { AddToCartModal } from './components/AddToCartModal';
import { OrderCompleteModal } from './components/OrderCompleteModal';
import { Header } from './components/layout/Header';
import { PageRouter } from './components/layout/PageRouter';
import { useAppData } from './hooks/useAppData';
import { useNavigation } from './hooks/useNavigation';
import { useModals } from './hooks/useModals';
import { useAllergens } from './hooks/useAllergens';
import { CartItem, FavoriteItem, Order, GroupMember } from './types';
import {
  createGroup,
  selectGroup,
  deleteGroup,
  renameGroup,
  addGroupMember,
  removeGroupMember,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  addToFavorites,
  removeFromFavorites,
  createFavoriteItem,
  completeOrder,
  reorderItems,
  isItemFavorited,
  findExistingFavorite
} from './utils/business-logic';
import { normalizeAllergens } from './utils/allergens';

/**
 * STORAGE SYSTEM: Bean & Bite uses sessionStorage for data persistence
 * - Data persists within the browser tab/session
 * - Automatically cleared when the tab is closed
 * - Perfect for group ordering sessions
 * - No external state management (Redux, Zustand, etc.) needed
 */

export default function App() {
  // Custom hooks for state management
  const { appData, updateAppData, activeGroup } = useAppData();
  const {
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
  } = useNavigation();
  const {
    modalState,
    allergenWarning,
    showAddToCartModal,
    closeAddToCartModal,
    showOrderCompleteModal,
    closeOrderCompleteModal,
    showAllergenWarning,
    proceedWithAllergen,
    closeAllergenWarning
  } = useModals();
  const {
    excludedAllergens,
    getAllAllergens,
    checkAllergenConflicts,
    toggleAllergenFilter,
    clearAllergenFilters,
    addMemberAllergensToFilters
  } = useAllergens();

  // Helper function to check if an item is favorited
  const checkItemFavorited = (type: 'coffee' | 'pastry', itemId: string, customizations?: any): boolean => {
    return isItemFavorited(appData.favorites, type, itemId, customizations);
  };

  // Favorites management functions
  const handleAddToFavorites = (favorite: FavoriteItem) => {
    const newData = addToFavorites(appData, favorite);
    updateAppData(newData);
  };

  const handleRemoveFromFavorites = (favoriteId: string) => {
    const newData = removeFromFavorites(appData, favoriteId);
    updateAppData(newData);
  };

  // Helper function to toggle favorite status
  const toggleFavorite = (type: 'coffee' | 'pastry', item: any, customizations?: any) => {
    const existingFavorite = findExistingFavorite(appData.favorites, type, item.id, customizations);

    if (existingFavorite) {
      handleRemoveFromFavorites(existingFavorite.id);
    } else {
      const favorite = createFavoriteItem(type, item, customizations);
      handleAddToFavorites(favorite);
    }
  };

  // Group Management Functions
  const handleCreateGroup = (name: string) => {
    const newData = createGroup(appData, name);
    updateAppData(newData);
  };

  const handleSelectGroup = (groupId: string) => {
    const newData = selectGroup(appData, groupId);
    updateAppData(newData);
  };

  const handleDeleteGroup = (groupId: string) => {
    const newData = deleteGroup(appData, groupId);
    updateAppData(newData);
  };

  const handleRenameGroup = (groupId: string, newName: string) => {
    const newData = renameGroup(appData, groupId, newName);
    updateAppData(newData);
  };

  const handleAddGroupMember = (groupId: string, member: GroupMember) => {
    const newData = addGroupMember(appData, groupId, member);
    updateAppData(newData);

    // Auto-filter: If adding to active group, add member's allergens to excluded filters
    if (groupId === appData.activeGroupId) {
      const normalizedAllergens = normalizeAllergens(member.allergens);
      if (normalizedAllergens.length > 0) {
        addMemberAllergensToFilters(normalizedAllergens);
      }
    }
  };

  const handleRemoveGroupMember = (groupId: string, memberName: string) => {
    const newData = removeGroupMember(appData, groupId, memberName);
    updateAppData(newData);
  };

  const handleAddToCart = (item: CartItem) => {
    if (!activeGroup) return;
    
    // Check for allergen conflicts with all group members
    const itemAllergens = getAllAllergens(item);
    const affectedMembers = checkAllergenConflicts(itemAllergens, activeGroup.members);
    
    const addToCartCallback = () => {
      const newData = addToCart(appData, activeGroup.id, item);
      updateAppData(newData);
      showAddToCartModal(item.item.name);
    };

    // If there are allergen conflicts, show warning
    if (affectedMembers.length > 0) {
      showAllergenWarning(itemAllergens, affectedMembers, item.item.name, addToCartCallback);
    } else {
      addToCartCallback();
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    if (!activeGroup) return;
    const newData = removeFromCart(appData, activeGroup.id, itemId);
    updateAppData(newData);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    if (!activeGroup) return;
    const newData = updateCartQuantity(appData, activeGroup.id, itemId, quantity);
    updateAppData(newData);
  };

  const handleClearCart = () => {
    if (!activeGroup) return;
    const newData = clearCart(appData, activeGroup.id);
    updateAppData(newData);
  };

  const handleOrderComplete = (order: Order) => {
    if (!activeGroup) return;
    const newData = completeOrder(appData, activeGroup.id, order, activeGroup.name);
    updateAppData(newData);
    showOrderCompleteModal(order.id, order.estimatedTime || 15);
  };

  const handleReorder = (orderId: string) => {
    if (!activeGroup) return;
    const newData = reorderItems(appData, activeGroup.id, orderId);
    updateAppData(newData);
    setAppState({ currentPage: 'menu' });
  };

  // Safe calculation with fallbacks
  const cartItemCount = activeGroup?.cart.reduce((total, item) => total + item.quantity, 0) || 0;
  const favoritesCount = appData.favorites.length;
  const orderHistoryCount = appData.orderHistory.length;
  const groupsCount = appData.groups.length;

  // Navigation items for mobile menu
  const navigationItems = [
    {
      icon: MenuIcon,
      label: 'Menu',
      page: 'menu',
      count: null,
      action: navigateToMenu
    },
    {
      icon: Users,
      label: 'Groups',
      page: 'groups',
      count: groupsCount,
      action: navigateToGroups
    },
    {
      icon: ShoppingCart,
      label: 'Cart',
      page: 'cart',
      count: cartItemCount,
      action: navigateToCart,
      isCart: true
    },
    {
      icon: Heart,
      label: 'Favorites',
      page: 'favorites',
      count: favoritesCount,
      action: navigateToFavorites
    },
    {
      icon: History,
      label: 'Orders',
      page: 'order-history',
      count: orderHistoryCount,
      action: navigateToOrderHistory
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeGroup={activeGroup}
        appState={appState}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navigationItems={navigationItems}
        onNavigateToMenu={navigateToMenu}
        onNavigateToCheckout={navigateToCheckout}
        cartItemCount={cartItemCount}
      />

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <PageRouter
          appState={appState}
          setAppState={setAppState}
          activeGroup={activeGroup}
          orderHistory={appData.orderHistory}
          favorites={appData.favorites}
          excludedAllergens={excludedAllergens}
          onNavigateToMenu={navigateToMenu}
          onNavigateToCart={navigateToCart}
          onNavigateToCoffeeDetail={navigateToCoffeeDetail}
          onNavigateToPastryDetail={navigateToPastryDetail}
          onNavigateToFavoriteDetail={navigateToFavoriteDetail}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onOrderComplete={handleOrderComplete}
          onReorder={handleReorder}
          onRemoveFromFavorites={handleRemoveFromFavorites}
          onToggleFavorite={toggleFavorite}
          onAllergenConflict={showAllergenWarning}
          onToggleAllergenFilter={toggleAllergenFilter}
          onClearAllergenFilters={clearAllergenFilters}
          onCreateGroup={handleCreateGroup}
          onSelectGroup={handleSelectGroup}
          onDeleteGroup={handleDeleteGroup}
          onRenameGroup={handleRenameGroup}
          onAddMember={handleAddGroupMember}
          onRemoveMember={handleRemoveGroupMember}
          isItemFavorited={checkItemFavorited}
          getAllAllergens={getAllAllergens}
          groups={appData.groups}
          activeGroupId={appData.activeGroupId}
        />
      </main>

      {/* Modals */}
      <AddToCartModal
        isOpen={modalState.addToCart.isOpen}
        onClose={closeAddToCartModal}
        itemName={modalState.addToCart.itemName}
        onViewCart={navigateToCart}
      />

      <OrderCompleteModal
        isOpen={modalState.orderComplete.isOpen}
        onClose={closeOrderCompleteModal}
        orderNumber={modalState.orderComplete.orderNumber}
        estimatedTime={modalState.orderComplete.estimatedTime}
        onBackToMenu={navigateToMenu}
      />

      <AllergenWarning
        isOpen={allergenWarning.isOpen}
        onClose={closeAllergenWarning}
        onProceed={proceedWithAllergen}
        allergens={allergenWarning.allergens}
        affectedMembers={allergenWarning.affectedMembers}
        itemName={allergenWarning.itemName}
      />
    </div>
  );
}