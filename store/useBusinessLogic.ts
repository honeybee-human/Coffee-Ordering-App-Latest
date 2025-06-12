import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from './useAppStore';
import { useNavigationStore } from './useNavigationStore';

import { useAllergensStore } from './useAllergensStore';
import { 
  Group, 
  GroupMember, 
  CartItem, 
  Coffee, 
  Pastry, 
  Order, 
  FavoriteItem, 
  PaymentInfo,
  CoffeeCustomization,
  PastryCustomization
} from '@/types';
import { useModalsStore } from './useModalsStore';

/**
 * Custom hook that provides all business logic functions
 * This centralizes all business operations and makes them available through a single hook
 */
export const useBusinessLogic = () => {
  // Group Management Functions
  const createGroup = (name: string): void => {
    const appStore = useAppStore.getState();
    appStore.createGroup(name);
  };

  const selectGroup = (groupId: string): void => {
    const appStore = useAppStore.getState();
    appStore.selectGroup(groupId);
  };

  const deleteGroup = (groupId: string): void => {
    const appStore = useAppStore.getState();
    appStore.deleteGroup(groupId);
  };

  const renameGroup = (groupId: string, newName: string): void => {
    const appStore = useAppStore.getState();
    appStore.renameGroup(groupId, newName);
  };

  const addGroupMember = (groupId: string, name: string, allergens: string[] = []): void => {
    const appStore = useAppStore.getState();
    const newMember: GroupMember = {
      name,
      allergens
    };
    
    appStore.addGroupMember(groupId, newMember);
  };

  const removeGroupMember = (groupId: string, memberName: string): void => {
    const appStore = useAppStore.getState();
    const group = appStore.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const member = group.members.find(m => m.name === memberName);
    if (!member) return;
    
    appStore.removeGroupMember(groupId, member.name);
  };

  // Cart Management Functions
  const addToCart = (
    item: Coffee | Pastry, 
    type: 'coffee' | 'pastry', 
    quantity: number = 1, 
    assignedTo?: string, 
    customizations?: CoffeeCustomization | PastryCustomization
  ): void => {
    const appStore = useAppStore.getState();
    const activeGroup = appStore.getActiveGroup();
    if (!activeGroup) return;
    
    const newCartItem: CartItem = {
      id: uuidv4(),
      item,
      type,
      quantity,
      assignedTo,
      customizations: customizations || (type === 'coffee' ? 
        { syrups: [], milk: 'whole' } as CoffeeCustomization : 
        { removedIngredients: [] } as PastryCustomization)
    };
    
    appStore.addToCart(activeGroup.id, newCartItem);
    
    // Close the add to cart modal if it's open
    useModalsStore.getState().closeAddToCartModal();
  };

  const removeFromCart = (cartItemId: string): void => {
    const appStore = useAppStore.getState();
    const activeGroup = appStore.getActiveGroup();
    if (!activeGroup) return;
    
    appStore.removeFromCart(activeGroup.id, cartItemId);
  };

  const updateCartItemQuantity = (cartItemId: string, quantity: number): void => {
    const appStore = useAppStore.getState();
    const activeGroup = appStore.getActiveGroup();
    if (!activeGroup) return;
    
    appStore.updateCartQuantity(activeGroup.id, cartItemId, quantity);
  };

  const clearCart = (): void => {
    const appStore = useAppStore.getState();
    const activeGroup = appStore.getActiveGroup();
    if (!activeGroup) return;
    
    appStore.clearCart(activeGroup.id);
  };

  // Favorites Management Functions
  const addToFavorites = (
    item: Coffee | Pastry, 
    type: 'coffee' | 'pastry', 
    customizations?: CoffeeCustomization | PastryCustomization
  ): void => {
    const appStore = useAppStore.getState();
    
    // Check if this item is already in favorites
    if (appStore.isItemFavorited(type, item.id, customizations)) return;
    
    const newFavorite: FavoriteItem = {
      id: uuidv4(),
      item,
      type,
      customizations: customizations || (type === 'coffee' ? 
        { syrups: [], milk: 'whole' } as CoffeeCustomization : 
        { removedIngredients: [] } as PastryCustomization),
      dateAdded: new Date()
    };
    
    appStore.addToFavorites(newFavorite);
  };

  const removeFromFavorites = (favoriteId: string): void => {
    const appStore = useAppStore.getState();
    appStore.removeFromFavorites(favoriteId);
  };

  const createFavoriteItem = (
    item: Coffee | Pastry, 
    type: 'coffee' | 'pastry', 
    customizations?: CoffeeCustomization | PastryCustomization
  ): FavoriteItem => {
    return {
      id: uuidv4(),
      item,
      type,
      customizations: customizations || (type === 'coffee' ? 
        { syrups: [], milk: 'whole' } as CoffeeCustomization : 
        { removedIngredients: [] } as PastryCustomization),
      dateAdded: new Date()
    };
  };

  // Order Management Functions
  const completeOrder = (paymentInfo: PaymentInfo): void => {
    const appStore = useAppStore.getState();
    const activeGroup = appStore.getActiveGroup();
    const navigationStore = useNavigationStore.getState();
    const modalsStore = useModalsStore.getState();
    
    if (!activeGroup || activeGroup.cart.length === 0) return;
    
    const orderNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const estimatedTime = Math.floor(Math.random() * 10) + 5; // 5-15 minutes
    
    const newOrder: Order = {
      id: uuidv4(),
      orderNumber,
      groupId: activeGroup.id,
      groupName: activeGroup.name,
      items: [...activeGroup.cart],
      orderDate: new Date(),
      totalAmount: calculateOrderTotal(activeGroup.cart),
      paymentInfo,
      estimatedTime,
      status: 'pending',
      groupMembers: [...activeGroup.members]
    };
    
    // Add to order history and clear cart
    appStore.completeOrder(activeGroup.id, newOrder);
    
    // Show order complete modal
    modalsStore.showOrderCompleteModal(orderNumber, estimatedTime);
    
    // Navigate to order history after a short delay
    setTimeout(() => {
      navigationStore.navigateToOrderHistory();
    }, 1000);
  };

  const reorderFromHistory = (orderId: string): void => {
    const appStore = useAppStore.getState();
    const activeGroup = appStore.getActiveGroup();
    const navigationStore = useNavigationStore.getState();
    
    if (!activeGroup) return;
    
    const order = appStore.orderHistory.find(o => o.id === orderId);
    if (!order) return;
    
    // Add items to cart
    appStore.reorderItems(activeGroup.id, orderId);
    
    // Navigate to cart
    navigationStore.navigateToCart();
  };

  // Helper Functions
  const isItemFavorited = (type: 'coffee' | 'pastry', itemId: string, customizations?: CoffeeCustomization | PastryCustomization): boolean => {
    const appStore = useAppStore.getState();
    return appStore.isItemFavorited(type, itemId, customizations);
  };

  const findExistingFavorite = (favorites: FavoriteItem[], type: 'coffee' | 'pastry', itemId: string, customizations?: CoffeeCustomization | PastryCustomization): FavoriteItem | undefined => {
    return favorites.find(fav => 
      fav.type === type && 
      fav.item.id === itemId &&
      (!customizations || JSON.stringify(fav.customizations) === JSON.stringify(customizations))
    );
  };

  const calculateOrderTotal = (cartItems: CartItem[]): number => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.item.price * item.quantity;
      // Add any additional costs from customizations if needed
      return total + itemPrice;
    }, 0);
  };

  // Return all business logic functions
  return {
    // Group Management
    createGroup,
    selectGroup,
    deleteGroup,
    renameGroup,
    addGroupMember,
    removeGroupMember,
    
    // Cart Management
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    
    // Favorites Management
    addToFavorites,
    removeFromFavorites,
    createFavoriteItem,
    isItemFavorited,
    findExistingFavorite,
    
    // Order Management
    completeOrder,
    reorderFromHistory,
    
    // Helper Functions
    calculateOrderTotal
  };
};