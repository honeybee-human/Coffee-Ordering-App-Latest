import { create } from 'zustand';
import { Order } from '@/types';

interface OrderHistoryStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  reorder: (orderId: string) => void;
}

export const useOrderHistoryStore = create<OrderHistoryStore>((set, get) => ({
  orders: [],
  
  addOrder: (order: Order) => {
    set(state => ({
      orders: [order, ...state.orders]
    }));
  },
  
  reorder: (orderId: string) => {
    const order = get().orders.find(o => o.id === orderId);
    if (order) {
      // Implement reorder logic here
      // This should probably trigger a cart update or similar
    }
  }
})); 