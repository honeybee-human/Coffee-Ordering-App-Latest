import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { useAppStore } from '@/store/useAppStore';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useModalsStore } from '@/store/useModalsStore';

import {
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

/**
 * Business logic store that provides all business logic functions
 * This centralizes all business operations and makes them available through a single store
 */
export const useBusinessLogic = create(() => ({
  // Group Management Functions
  createGroup: (name: string): void => {
    const appStore = useAppStore.getState();
    appStore.createGroup(name);
  },

  selectGroup: (groupId: string): void => {
    const appStore = useAppStore.getState();
    appStore.selectGroup(groupId);
  },

  deleteGroup: (groupId: string): void => {
    const appStore = useAppStore.getState();
    appStore.deleteGroup(groupId);
  },

  renameGroup: (groupId: string, newName: string): void => {
    const appStore = useAppStore.getState();
    appStore.renameGroup(groupId, newName);
  },

  addGroupMember: (groupId: string, member: GroupMember): void => {
    const appStore = useAppStore.getState();
    appStore.addGroupMember(groupId, member);
  },

  removeGroupMember: (groupId: string, memberName: string): void => {
    const appStore = useAppStore.getState();
    const group = appStore.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const member = group.members.find(m => m.name === memberName);
    if (!member) return;
    
    appStore.removeGroupMember(groupId, member.name);
  },

  // Cart Management Functions
  addToCart: (
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
  },

  removeFromCart: (cartItemId: string): void => {
    const appStore = useAppStore.getState();
    const activeGroup = appStore.getActiveGroup();
    if (!activeGroup) return;
    
    appStore.removeFromCart(activeGroup.id, cartItemId);
  },

  updateCartItemQuantity: (cartItemId: string, quantity: number): void => {
    const appStore = useAppStore.getState();
    const activeGroup = appStore.getActiveGroup();
    if (!activeGroup) return;
    
    appStore.updateCartQuantity(activeGroup.id, cartItemId, quantity);
  },

  clearCart: (): void => {
    const appStore = useAppStore.getState();
    const activeGroup = appStore.getActiveGroup();
    if (!activeGroup) return;
    
    appStore.clearCart(activeGroup.id);
  },

  // Favorites Management Functions
  addToFavorites: (
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
  },

  removeFromFavorites: (favoriteId: string): void => {
    const appStore = useAppStore.getState();
    appStore.removeFromFavorites(favoriteId);
  },

  createFavoriteItem: (
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
  },

  // Order Management Functions
  completeOrder: (paymentInfo: PaymentInfo): void => {
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
      totalAmount: useBusinessLogic.getState().calculateOrderTotal(activeGroup.cart),
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
  },

  reorderFromHistory: (orderId: string): void => {
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
  },

  // Helper Functions
  isItemFavorited: (type: 'coffee' | 'pastry', itemId: string, customizations?: CoffeeCustomization | PastryCustomization): boolean => {
    const appStore = useAppStore.getState();
    return appStore.isItemFavorited(type, itemId, customizations);
  },

  findExistingFavorite: (favorites: FavoriteItem[], type: 'coffee' | 'pastry', itemId: string, customizations?: CoffeeCustomization | PastryCustomization): FavoriteItem | undefined => {
    return favorites.find(fav => 
      fav.type === type && 
      fav.item.id === itemId &&
      (!customizations || JSON.stringify(fav.customizations) === JSON.stringify(customizations))
    );
  },

  calculateOrderTotal: (cartItems: CartItem[]): number => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.item.price * item.quantity;
      // Add any additional costs from customizations if needed
      return total + itemPrice;
    }, 0);
  }
}));