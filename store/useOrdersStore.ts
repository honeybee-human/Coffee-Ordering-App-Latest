import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { Order } from '@/types';
import { useGroupsStore } from './useGroupsStore';

export interface OrdersStore {
  orders: Order[];
  
  // Actions
  completeOrder: (order: Order) => void;
  reorderItems: (groupId: string, orderId: string) => void;
  clearOrderHistory: () => void;
  removeOrder: (orderId: string) => void;
  getGroupOrders: (groupId: string) => Order[];
}

type OrdersPersist = {
  orders: Order[];
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
    if (order) {
      // Add items to cart in the groups store
      const groupsStore = useGroupsStore.getState();
      order.items.forEach(item => {
        groupsStore.addToCart(groupId, item);
      });
    }
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
  }
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