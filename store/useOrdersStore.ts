import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { Order, CartItem, CoffeeCustomization, PastryCustomization } from '@/types';
import { useGroupsStore } from './useGroupsStore';
import { calculateItemPrice } from '@/utils/cart-calculations';

export interface OrdersStore {
  orders: Order[];
  
  // Actions
  completeOrder: (order: Order) => void;
  reorderItems: (groupId: string, orderId: string) => void;
  clearOrderHistory: () => void;
  removeOrder: (orderId: string) => void;
  getGroupOrders: (groupId: string) => Order[];
  // New bookmark actions
  toggleOrderBookmark: (orderId: string) => void;
  getBookmarkedOrders: () => Order[];
}

type OrdersPersist = {
  orders: Order[];
};

const canCombineItems = (item1: CartItem, item2: CartItem): boolean => {
  if (item1.item.id !== item2.item.id) return false;
  if (item1.assignedTo !== item2.assignedTo) return false;

  // Safe access to customizations - handle cases where it might be undefined or not the expected type
  const c1 = item1.customizations;
  const c2 = item2.customizations;

  // If both have no customizations, they can be combined
  if (!c1 && !c2) return true;
  
  // If one has customizations and the other doesn't, they can't be combined
  if (!c1 || !c2) return false;

  if (item1.type === 'coffee' && item2.type === 'coffee') {
    const coffee1 = c1 as CoffeeCustomization;
    const coffee2 = c2 as CoffeeCustomization;

    // Check if both have the required structure
    if (!coffee1 || !coffee2) return false;
    
    if (coffee1.milk !== coffee2.milk) return false;

    // Safely check syrups arrays
    const syrups1 = coffee1.syrups || [];
    const syrups2 = coffee2.syrups || [];

    if (syrups1.length !== syrups2.length) return false;

    const sortedSyrups1 = [...syrups1].sort((a, b) => a.flavor.localeCompare(b.flavor));
    const sortedSyrups2 = [...syrups2].sort((a, b) => a.flavor.localeCompare(b.flavor));

    for (let i = 0; i < sortedSyrups1.length; i++) {
      if (
        sortedSyrups1[i].flavor !== sortedSyrups2[i].flavor ||
        sortedSyrups1[i].pumps !== sortedSyrups2[i].pumps
      ) {
        return false;
      }
    }

    return true;
  }

  if (item1.type === 'pastry' && item2.type === 'pastry') {
    const pastry1 = c1 as PastryCustomization;
    const pastry2 = c2 as PastryCustomization;

    // Check if both have the required structure
    if (!pastry1 || !pastry2) return false;

    // Safely check removedIngredients arrays
    const r1 = [...(pastry1.removedIngredients || [])].sort();
    const r2 = [...(pastry2.removedIngredients || [])].sort();

    if (r1.length !== r2.length) return false;

    for (let i = 0; i < r1.length; i++) {
      if (r1[i] !== r2[i]) return false;
    }

    return true;
  }

  // If types mismatch or unsupported type
  return false;
};

// Helper function to generate unique item ID
const generateItemId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const storeImplementation: StateCreator<
  OrdersStore,
  [['zustand/persist', unknown]],
  [],
  OrdersStore
> = (set, get) => ({
  orders: [],

  completeOrder: (order: Order) => {
    set(state => ({
      orders: [order, ...state.orders]
    }));
  },

  reorderItems: (groupId: string, orderId: string) => {
    const { orders } = get();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const groupsStore = useGroupsStore.getState();
    const targetGroup = groupsStore.groups.find(g => g.id === groupId);
    
    if (!targetGroup) return;

    // Get current cart items
    const currentCartItems = [...(targetGroup.cart || [])];
    
    // Process each item from the order
    order.items.forEach(orderItem => {
      // Create a new item with proper ID and member assignment
      const newItem: CartItem = {
        ...orderItem,
        id: generateItemId(),
        assignedTo: undefined // Will be set below
      };
      
      // Check if the assigned person still exists in the group
      if (orderItem.assignedTo) {
        const memberExists = targetGroup.members.some(m => m.name === orderItem.assignedTo);
        if (memberExists) {
          newItem.assignedTo = orderItem.assignedTo;
        }
        // If member doesn't exist, assignedTo remains undefined (unassigned)
      }
      
      // Try to find an existing item in cart that can be combined
      const existingItemIndex = currentCartItems.findIndex(cartItem => 
        canCombineItems(cartItem, newItem)
      );
      
      if (existingItemIndex !== -1) {
        // Combine with existing item
        currentCartItems[existingItemIndex] = {
          ...currentCartItems[existingItemIndex],
          quantity: currentCartItems[existingItemIndex].quantity + newItem.quantity
        };
      } else {
        // Add as new item
        currentCartItems.push(newItem);
      }
    });

    // Update the cart with the new items
    groupsStore.setCart(groupId, currentCartItems);
  },

  clearOrderHistory: () => {
    set({ orders: [] });
  },

  removeOrder: (orderId: string) => {
    set((state) => ({
      orders: state.orders.filter(order => order.id !== orderId)
    }));
  },

  getGroupOrders: (groupId: string) => {
    const { orders } = get();
    return orders.filter(order => order.groupId === groupId);
  },

  toggleOrderBookmark: (orderId: string) => {
    set((state) => ({
      orders: state.orders.map(order =>
        order.id === orderId 
          ? { ...order, isBookmarked: !order.isBookmarked }
          : order
      )
    }));
  },

  getBookmarkedOrders: () => {
    const { orders } = get();
    return orders.filter(order => order.isBookmarked);
  },
});

export const useOrdersStore = create<OrdersStore>()(
  persist(
    storeImplementation,
    {
      name: 'bean-bite-orders',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        orders: state.orders
      })
    } as PersistOptions<OrdersStore, OrdersPersist>
  )
);

// Selector hooks
export const useOrderHistory = () => useOrdersStore(state => state.orders);