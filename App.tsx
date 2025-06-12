import React from 'react';
import { ShoppingCart, History, Heart, Menu as MenuIcon, Users } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PageRouter } from '@/components/layout/PageRouter';


// Import Zustand stores
import { useAppStore } from '@/store/useAppStore';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useAllergensStore } from '@/store/useAllergensStore';
import { useBusinessLogic } from '@/store/useBusinessLogic';

// Import menu data
import { coffeeMenu, pastryMenu } from '@/data/menu';


import { normalizeAllergens } from '@/utils/allergens';
import { CartItem, FavoriteItem, Order, GroupMember, Coffee, Pastry } from '@/types';
import { useModalsStore } from '@/store/useModalsStore';
import { AddToCartModal } from '@/components/shared/AddToCartModal';
import { AllergenWarning } from '@/components/shared/AllergenWarning';
import { AppProviders } from '@/context';
import { OrderCompleteModal } from '@/components/shared/OrderCompleteModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/ui/dialog';
import { useEffect, useState } from 'react';

/**
 * STORAGE SYSTEM: Bean & Bite now uses Zustand for state management
 * - Data persists within the browser tab/session using sessionStorage
 * - Automatically cleared when the tab is closed
 * - Perfect for group ordering sessions
 * - Centralized state management with Zustand
 */

function AppContent() {
  // Show instructional modal on first load
  const [showInstructional, setShowInstructional] = useState(true);
  // Access Zustand store values
  const { groups, activeGroupId, orderHistory, favorites, getActiveGroup } = useAppStore();
  const activeGroup = getActiveGroup();
  
  const {
    appState,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setAppState,
    navigateToMenu,
    navigateToCart,
    navigateToGroups,
    navigateToCoffeeDetail,
    navigateToPastryDetail,
    navigateToCheckout,
    navigateToOrderHistory,
    navigateToFavorites,
    navigateToFavoriteDetail
  } = useNavigationStore();
  
  const {
    modals,
    showAddToCartModal,
    closeAddToCartModal,
    showOrderCompleteModal,
    closeOrderCompleteModal,
    showAllergenWarningModal,
    closeAllergenWarningModal
  } = useModalsStore();
  
  const {
    excludedAllergens,
    toggleAllergenFilter,
    clearAllergenFilters,
    addMemberAllergensToFilters,
    getItemAllergens,
    hasAllergenConflict
  } = useAllergensStore();

  // Import business logic functions
  const {
    createGroup,
    selectGroup,
    deleteGroup,
    renameGroup,
    addGroupMember,
    removeGroupMember,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    completeOrder,
    reorderFromHistory,
    addToFavorites,
    removeFromFavorites,
    findExistingFavorite
  } = useBusinessLogic();

  // Helper function to check allergen conflicts with group members
  const checkAllergenConflicts = (allergens: string[], members: GroupMember[]) => {
    return members.filter(member => 
      member.allergens.some(allergen => allergens.includes(allergen))
    ).map(member => member.name);
  };

  // Helper function to check if an item is favorited
  const checkItemFavorited = (type: 'coffee' | 'pastry', itemId: string, customizations?: any): boolean => {
    const existingFavorite = findExistingFavorite(favorites, type, itemId, customizations);
    return !!existingFavorite;
  };

  // Helper function to toggle favorite status
  const toggleFavorite = (type: 'coffee' | 'pastry', item: Coffee | Pastry, customizations?: any, assignedTo?: string) => {
    const existingFavorite = findExistingFavorite(favorites, type, item.id, customizations, assignedTo);
    if (existingFavorite) {
      removeFromFavorites(existingFavorite.id);
    } else {
      addToFavorites(item, type, customizations, assignedTo);
    }
  };

  // Group Management Functions
  const handleCreateGroup = (name: string) => {
    createGroup(name);
  };

  const handleSelectGroup = (groupId: string) => {
    selectGroup(groupId);
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteGroup(groupId);
  };

  const handleRenameGroup = (groupId: string, newName: string) => {
    renameGroup(groupId, newName);
  };

  const handleAddGroupMember = (groupId: string, member: GroupMember) => {
    addGroupMember(groupId, member.name, member.allergens);

    // Auto-filter: If adding to active group, add member's allergens to excluded filters
    if (groupId === activeGroupId) {
      const normalizedAllergens = normalizeAllergens(member.allergens);
      if (normalizedAllergens.length > 0) {
        addMemberAllergensToFilters(member.name, groupId, member.allergens);
      }
    }
  };

  const handleRemoveGroupMember = (groupId: string, memberId: string) => {
    removeGroupMember(groupId, memberId);
  };

  const handleAddToCart = (item: CartItem) => {
    if (!activeGroup) return;
    
    // Check for allergen conflicts with all group members
    const itemAllergens = getItemAllergens(item.item);
    const affectedMembers = checkAllergenConflicts(itemAllergens, activeGroup.members);
    
    const addToCartCallback = () => {
      addToCart(
        item.item,
        item.type,
        item.quantity,
        item.assignedTo,
        item.customizations
      );
      showAddToCartModal(item.item.id, item.type, item.customizations);
    };

    // If there are allergen conflicts, show warning
    if (affectedMembers.length > 0) {
      showAllergenWarningModal(item.item.id, item.type, itemAllergens);
    } else {
      addToCartCallback();
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    if (!activeGroup) return;
    removeFromCart(itemId);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    if (!activeGroup) return;
    updateCartItemQuantity(itemId, quantity);
  };

  const handleClearCart = () => {
    if (!activeGroup) return;
    clearCart();
  };

  const handleOrderComplete = (order: Order) => {
    if (!activeGroup) return;
    if (order.paymentInfo) {
      completeOrder(order.paymentInfo);
    }
  };

  const handleReorder = (orderId: string) => {
    if (!activeGroup) return;
    reorderFromHistory(orderId);
  };

  // Calculate counts for navigation
  const cartCount = activeGroup?.cart.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const favoritesCount = favorites.length;
  const orderHistoryCount = orderHistory.length;
  const groupsCount = groups.length;

  // Mobile navigation items
  const mobileNavItems = [
    { icon: MenuIcon, label: 'Menu', page: 'menu', count: null, action: navigateToMenu },
    { icon: ShoppingCart, label: 'Cart', page: 'cart', count: cartCount, action: navigateToCart, isCart: true },
    { icon: Users, label: 'Groups', page: 'groups', count: groupsCount, action: navigateToGroups },
    { icon: History, label: 'Orders', page: 'order-history', count: orderHistoryCount, action: navigateToOrderHistory },
    { icon: Heart, label: 'Favorites', page: 'favorites', count: favoritesCount, action: navigateToFavorites }
  ];

  // Create a reference to store the current callback
  const [allergenCallback, setAllergenCallback] = React.useState<(() => void) | null>(null);

  // Function to handle proceeding with allergen warning
  const proceedWithAllergen = () => {
    // If we have a stored callback, execute it instead of the default behavior
    if (allergenCallback) {
      allergenCallback();
      setAllergenCallback(null);
      closeAllergenWarningModal();
      
      
    // Default behavior if no callback is stored
    // Get the current allergen warning data
    const { itemId, itemType } = modals.allergenWarning;
    // Add the item to cart despite allergen warnings
    if (itemType === 'coffee') {
      const coffee = coffeeMenu.find(c => c.id === itemId);
      if (coffee) {
        addToCart(coffee, 'coffee', 1, undefined, undefined);
        showAddToCartModal(coffee.name, 'coffee', undefined);
      }
    } else if (itemType === 'pastry') {
      const pastry = pastryMenu.find(p => p.id === itemId);
      if (pastry) {
        addToCart(pastry, 'pastry', 1, undefined, undefined);
        showAddToCartModal(pastry.name, 'pastry', undefined);
      }
    }
    closeAllergenWarningModal();
  }
};

  // Function to handle allergen conflicts
  const handleAllergenConflict = (allergens: string[], affectedMembers: string[], itemName: string, addCallback: () => void) => {
    // Only show allergens that affect group members
    const filteredAllergens = allergens.filter(allergen => {
      return activeGroup && activeGroup.members.some(member => member.allergens.includes(allergen));
    });
    setAllergenCallback(() => addCallback);
    // Determine if the item is a coffee or pastry based on the name
    const itemType = itemName.toLowerCase().includes('coffee') ? 'coffee' : 'pastry';
    // Find the item ID from the menu based on the name
    let itemId = itemName;
    if (itemType === 'coffee') {
      const coffee = coffeeMenu.find(c => c.name === itemName);
      if (coffee) itemId = coffee.id;
    } else {
      const pastry = pastryMenu.find(p => p.name === itemName);
      if (pastry) itemId = pastry.id;
    }
    // Show the allergen warning modal with the filtered allergens
    showAllergenWarningModal(itemId, itemType, filteredAllergens);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        activeGroup={activeGroup}
        appState={appState}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navigationItems={mobileNavItems}
        onNavigateToMenu={navigateToMenu}
        onNavigateToCheckout={navigateToCheckout}
        cartItemCount={cartCount}
      />
      <div className="py-16 px-20">
      <PageRouter
        appState={appState}
        setAppState={setAppState}
        activeGroup={activeGroup}
        orderHistory={orderHistory}
        favorites={favorites}
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
        onRemoveFromFavorites={removeFromFavorites}
        onToggleFavorite={toggleFavorite}
        onAllergenConflict={(allergens, affectedMembers, itemName, addCallback) => {
          // Use the handler function
          handleAllergenConflict(allergens, affectedMembers, itemName, addCallback);
        }}
        onToggleAllergenFilter={toggleAllergenFilter}
        onClearAllergenFilters={clearAllergenFilters}
        onCreateGroup={handleCreateGroup}
        onSelectGroup={handleSelectGroup}
        onDeleteGroup={handleDeleteGroup}
        onRenameGroup={handleRenameGroup}
        onAddMember={handleAddGroupMember}
        onRemoveMember={handleRemoveGroupMember}
        isItemFavorited={checkItemFavorited}
        getAllAllergens={getItemAllergens}
        groups={groups}
        activeGroupId={activeGroupId}
      />
      
      {/* Modals */}
      <AddToCartModal 
        isOpen={modals.addToCart.isOpen} 
        itemName={modals.addToCart.itemName} 
        onClose={closeAddToCartModal} 
        onViewCart={navigateToCart}
      />
      
      <OrderCompleteModal 
        isOpen={modals.orderComplete.isOpen} 
        orderNumber={modals.orderComplete.orderNumber} 
        estimatedTime={modals.orderComplete.estimatedTime} 
        onClose={closeOrderCompleteModal} 
        onBackToMenu={navigateToOrderHistory}
      />
      
      <AllergenWarning 
        isOpen={modals.allergenWarning.isOpen} 
        allergens={modals.allergenWarning.allergens} 
        affectedMembers={activeGroup ? checkAllergenConflicts(modals.allergenWarning.allergens, activeGroup.members) : []} 
        itemName={modals.allergenWarning.itemId} 
        onProceed={proceedWithAllergen} 
        onClose={closeAllergenWarningModal} 
      />
      {/* Instructional Modal */}
      <Dialog open={showInstructional} onOpenChange={setShowInstructional}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2">
                <Users className="inline-block h-6 w-6 text-primary" />
                Welcome to Group Ordering!
              </span>
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                <p className="mb-4 text-muted-foreground">
                  On entry, you have a group with just you as the member, where you can set your allergens and order for yourself. You can create groups and add members, specify the allergens for each member, then go through the menu and add their favorites to their group or assign an item to a member. If a member has any conflicting allergies, we'll let you know! On addition of a member with allergies to the group, we automatically filter out the menu, but you can clear the filter selections if needed!
                </p>
                <div className="flex flex-col gap-2 text-base">
                  <span className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> <span>Create or join a group</span></span>
                  <span className="flex items-center gap-2"><MenuIcon className="h-5 w-5 text-primary" /> <span>Add members and set allergens</span></span>
                  <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> <span>Add items to the group cart or assign to members</span></span>
                  <span className="flex items-center gap-2"><History className="h-5 w-5 text-destructive" /> <span>Get notified of allergen conflicts</span></span>
                  <span className="flex items-center gap-2"><Heart className="h-5 w-5 text-success" /> <span>Checkout and enjoy your order!</span></span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <button className="btn btn-primary" onClick={() => setShowInstructional(false)}>Got it!</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}