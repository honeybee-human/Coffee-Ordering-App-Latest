// Instead of useBusinessLogic hook, create utility functions
// utils/businessLogic.ts

import { v4 as uuidv4 } from 'uuid';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useModalsStore } from '@/store/useModalsStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useOrdersStore } from '@/store/useOrdersStore';

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

// Pure utility functions that work with store state
export const businessLogic = {
  // Group Management Functions
  createGroup: (name: string): void => {
    useGroupsStore.getState().createGroup(name);
  },

  selectGroup: (groupId: string): void => {
    useGroupsStore.getState().selectGroup(groupId);
  },

  deleteGroup: (groupId: string): void => {
    useGroupsStore.getState().deleteGroup(groupId);
  },

  renameGroup: (groupId: string, newName: string): void => {
    useGroupsStore.getState().renameGroup(groupId, newName);
  },

  addGroupMember: (groupId: string, name: string, allergens: string[] = []): void => {
    const newMember: GroupMember = {
      name,
      allergens
    };
    useGroupsStore.getState().addGroupMember(groupId, newMember);
  },

  removeGroupMember: (groupId: string, memberName: string): void => {
    const { groups } = useGroupsStore.getState();
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    const member = group.members.find(m => m.name === memberName);
    if (!member) return;
    
    useGroupsStore.getState().removeGroupMember(groupId, member.name);
  },

  // Cart Management Functions
  addToCart: (
    item: Coffee | Pastry, 
    type: 'coffee' | 'pastry', 
    quantity: number = 1, 
    assignedTo?: string, 
    customizations?: CoffeeCustomization | PastryCustomization
  ): void => {
    const { getActiveGroup } = useGroupsStore.getState();
    const activeGroup = getActiveGroup();
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
    
    useGroupsStore.getState().addToCart(activeGroup.id, newCartItem);
    useModalsStore.getState().closeAddToCartModal();
  },

  removeFromCart: (cartItemId: string): void => {
    const { getActiveGroup } = useGroupsStore.getState();
    const activeGroup = getActiveGroup();
    if (!activeGroup) return;
    
    useGroupsStore.getState().removeFromCart(activeGroup.id, cartItemId);
  },

  updateCartItemQuantity: (cartItemId: string, quantity: number): void => {
    const { getActiveGroup } = useGroupsStore.getState();
    const activeGroup = getActiveGroup();
    if (!activeGroup) return;
    
    useGroupsStore.getState().updateCartQuantity(activeGroup.id, cartItemId, quantity);
  },

  clearCart: (): void => {
    const { getActiveGroup } = useGroupsStore.getState();
    const activeGroup = getActiveGroup();
    if (!activeGroup) return;
    
    useGroupsStore.getState().clearCart(activeGroup.id);
  },

  // Favorites Management Functions
  addToFavorites: (
    item: Coffee | Pastry, 
    type: 'coffee' | 'pastry', 
    customizations?: CoffeeCustomization | PastryCustomization,
    assignedTo?: string
  ): void => {
    const { isItemFavorited, addToFavorites } = useFavoritesStore.getState();
    
    if (isItemFavorited(type, item.id, customizations, assignedTo)) return;
    
    const newFavorite: FavoriteItem = {
      id: uuidv4(),
      item,
      type,
      customizations: customizations || (type === 'coffee' ? 
        { syrups: [], milk: 'whole' } as CoffeeCustomization : 
        { removedIngredients: [] } as PastryCustomization),
      dateAdded: new Date(),
      assignedTo
    };
    addToFavorites(newFavorite);
  },

  removeFromFavorites: (favoriteId: string): void => {
    useFavoritesStore.getState().removeFromFavorites(favoriteId);
  },

  // Order Management Functions
  completeOrder: (paymentInfo: PaymentInfo): void => {
    const { getActiveGroup } = useGroupsStore.getState();
    const activeGroup = getActiveGroup();
    if (!activeGroup || activeGroup.cart.length === 0) return;
    
    const orderNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const estimatedTime = Math.floor(Math.random() * 10) + 5;
    
    const newOrder: Order = {
      id: uuidv4(),
      orderNumber,
      groupId: activeGroup.id,
      groupName: activeGroup.name,
      items: [...activeGroup.cart],
      orderDate: new Date(),
      totalAmount: businessLogic.calculateOrderTotal(activeGroup.cart),
      paymentInfo,
      estimatedTime,
      status: 'pending',
      groupMembers: [...activeGroup.members]
    };
    
    useOrdersStore.getState().completeOrder(activeGroup.id, newOrder);
    useModalsStore.getState().showPaymentCompleteModal(orderNumber, estimatedTime);
    
    // Note: Navigation is now handled by the PaymentCompleteModal user interaction
  },

  reorderFromHistory: (orderId: string): void => {
    const { getActiveGroup } = useGroupsStore.getState();
    const activeGroup = getActiveGroup();
    if (!activeGroup) return;
    
    const { orderHistory, reorderItems } = useOrdersStore.getState();
    const order = orderHistory.find(o => o.id === orderId);
    if (!order) return;
    
    reorderItems(activeGroup.id, orderId);
    useNavigationStore.getState().navigateToCart();
  },

  // Helper Functions
  calculateOrderTotal: (cartItems: CartItem[]): number => {
    return cartItems.reduce((total, item) => {
      return total + (item.item.price * item.quantity);
    }, 0);
  }
};

// Example of how to use in components:
/*
// In your React component:
import { businessLogic } from '@/utils/businessLogic';
import { useGroupsStore } from '@/store/useGroupsStore';

export function MyComponent() {
  // Use hooks for reactive state
  const { groups, activeGroupId } = useGroupsStore();
  
  // Use utility functions for actions
  const handleAddToCart = (item, type) => {
    businessLogic.addToCart(item, type, 1);
  };
  
  const handleCreateGroup = (name) => {
    businessLogic.createGroup(name);
  };
  
  return (
    <div>
      {groups.map(group => (
        <div key={group.id}>
          <span>{group.name}</span>
          <button onClick={() => businessLogic.selectGroup(group.id)}>
            Select
          </button>
        </div>
      ))}
    </div>
  );
}
*/