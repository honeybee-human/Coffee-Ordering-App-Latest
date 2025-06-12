import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '@/types';
import { useGroupStore } from './useGroupStore';

interface OrderHistoryState {
  // State
  orderHistory: Order[];
  
  // Order actions
  completeOrder: (groupId: string, order: Order) => void;
  reorderItems: (groupId: string, orderId: string) => void;
}

interface OrderHistoryPersist {
  orderHistory: Order[];
}

export const useOrderHistoryStore = create<OrderHistoryState>()(
  persist(
    (set, get) => ({
      // Initial state
      orderHistory: [],

      // Order actions
      completeOrder: (groupId: string, order: Order) => {
        set((state) => ({
          orderHistory: [...state.orderHistory, order]
        }));
        
        // Clear the cart after completing the order
        useGroupStore.setState((state) => ({
          groups: state.groups.map(group =>
            group.id === groupId ? { ...group, cart: [] } : group
          )
        }));
      },

      reorderItems: (groupId: string, orderId: string) => {
        const { orderHistory } = get();
        const order = orderHistory.find(o => o.id === orderId);
        if (order) {
          useGroupStore.setState((state) => ({
            groups: state.groups.map(group =>
              group.id === groupId 
                ? { ...group, cart: [...group.cart, ...order.items] }
                : group
            )
          }));
        }
      },
    }),
    {
      name: 'bean-bite-order-history',
      partialize: (state) => ({
        orderHistory: state.orderHistory,
      }),
      // Handle Date objects in serialization
      serialize: (state) => JSON.stringify(state, (key, value) => {
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      }),
      deserialize: (str) => JSON.parse(str, (key, value) => {
        if (value && typeof value === 'object' && value.__type === 'Date') {
          return new Date(value.value);
        }
        return value;
      })
    }
  )
);

// Selector hooks for better performance
export const useOrderHistory = () => useOrderHistoryStore(state => state.orderHistory);