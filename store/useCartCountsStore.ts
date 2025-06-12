import { create } from 'zustand';
import { calculateCartTotal, calculateCartSubtotal, calculateTax } from '@/utils/cart-calculations';
import { useGroupStore } from './useGroupStore';

interface CartCountsStore {
  // Computed getters
  getCartCount: () => number;
  getCartSubtotal: () => number;
  getCartTax: (taxRate?: number) => number;
  getCartTotal: (taxRate?: number) => { subtotal: number; tax: number; total: number; };
}

export const useCartCountsStore = create<CartCountsStore>((set, get) => ({
  // Computed getters
  getCartCount: () => {
    const activeGroup = useGroupStore.getState().getActiveGroup();
    return activeGroup?.cart.reduce((sum, item) => sum + item.quantity, 0) || 0;
  },
  
  getCartSubtotal: () => {
    const activeGroup = useGroupStore.getState().getActiveGroup();
    return activeGroup ? calculateCartSubtotal(activeGroup.cart) : 0;
  },
  
  getCartTax: (taxRate = 0.08) => {
    const subtotal = get().getCartSubtotal();
    return calculateTax(subtotal, taxRate);
  },
  
  getCartTotal: (taxRate = 0.08) => {
    const activeGroup = useGroupStore.getState().getActiveGroup();
    return activeGroup ? calculateCartTotal(activeGroup.cart, taxRate) : { subtotal: 0, tax: 0, total: 0 };
  },
}));

// Selector hooks for better performance
export const useCartCount = () => useCartCountsStore(state => state.getCartCount());
export const useCartSubtotal = () => useCartCountsStore(state => state.getCartSubtotal());
export const useCartTax = (taxRate?: number) => useCartCountsStore(state => state.getCartTax(taxRate));
export const useCartTotal = (taxRate?: number) => useCartCountsStore(state => state.getCartTotal(taxRate));