import { create } from 'zustand';
import { CartItem } from '@/types';
import { calculateCartTotal, calculateCartSubtotal, calculateTax } from '@/utils/cart-calculations';
import { useGroupStore } from './useGroupStore';

interface CartState {
  // Computed getters
  getCartCount: () => number;
  getCartSubtotal: () => number;
  getCartTax: (taxRate?: number) => number;
  getCartTotal: (taxRate?: number) => { subtotal: number; tax: number; total: number; };
  
  // Cart actions
  addToCart: (groupId: string, item: CartItem) => void;
  removeFromCart: (groupId: string, itemId: string) => void;
  updateCartQuantity: (groupId: string, itemId: string, quantity: number) => void;
  clearCart: (groupId: string) => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
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

  // Cart actions
  addToCart: (groupId: string, item: CartItem) => {
    useGroupStore.setState((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId 
          ? { ...group, cart: [...group.cart, { ...item, id: Date.now().toString() }] }
          : group
      )
    }));
  },

  removeFromCart: (groupId: string, itemId: string) => {
    useGroupStore.setState((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId 
          ? { ...group, cart: group.cart.filter(item => item.id !== itemId) }
          : group
      )
    }));
  },

  updateCartQuantity: (groupId: string, itemId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(groupId, itemId);
      return;
    }
    
    useGroupStore.setState((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId 
          ? { 
              ...group, 
              cart: group.cart.map(item =>
                item.id === itemId ? { ...item, quantity } : item
              )
            }
          : group
      )
    }));
  },

  clearCart: (groupId: string) => {
    useGroupStore.setState((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId ? { ...group, cart: [] } : group
      )
    }));
  },
}));

// Selector hooks for better performance
export const useCartCount = () => useCartStore(state => state.getCartCount());
export const useCartSubtotal = () => useCartStore(state => state.getCartSubtotal());
export const useCartTax = (taxRate?: number) => useCartStore(state => state.getCartTax(taxRate));
export const useCartTotal = (taxRate?: number) => useCartStore(state => state.getCartTotal(taxRate));