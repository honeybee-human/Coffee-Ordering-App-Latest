import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { Order } from '@/types';
import { useGroupsStore } from './useGroupsStore';

export interface OrdersStore {
  orderHistory: Order[];
  
  // Actions
  completeOrder: (groupId: string, order: Order) => void;
  reorderItems: (groupId: string, orderId: string) => void;
  clearOrderHistory: () => void;
  removeOrder: (orderId: string) => void;
}

type OrdersPersist = {
  orderHistory: Order[];
};

const storeImplementation: StateCreator<
  OrdersStore,
  [['zustand/persist', unknown]],
  [],
  OrdersStore
> = (set, get) => ({
  orderHistory: [],

  completeOrder: (groupId: string, order: Order) => {
    set((state) => ({
      orderHistory: [...state.orderHistory, order]
    }));
    
    // Clear the cart in the groups store
    useGroupsStore.getState().clearCart(groupId);
  },

  reorderItems: (groupId: string, orderId: string) => {
    const { orderHistory } = get();
    const order = orderHistory.find(o => o.id === orderId);
    if (order) {
      // Add items to cart in the groups store
      const groupsStore = useGroupsStore.getState();
      order.items.forEach(item => {
        groupsStore.addToCart(groupId, item);
      });
    }
  },

  clearOrderHistory: () => {
    set({ orderHistory: [] });
  },

  removeOrder: (orderId: string) => {
    set((state) => ({
      orderHistory: state.orderHistory.filter(order => order.id !== orderId)
    }));
  }
});

export const useOrdersStore = create<OrdersStore>()(
  persist(
    storeImplementation,
    {
      name: 'bean-bite-orders',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        orderHistory: state.orderHistory
      })
    } as PersistOptions<OrdersStore, OrdersPersist>
  )
);

// Selector hooks
export const useOrderHistory = () => useOrdersStore(state => state.orderHistory);