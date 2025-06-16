import { create } from 'zustand';
import { CartItem } from '@/types';

interface CartStoreState {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getAllAllergens: (item: CartItem) => string[];
}

export const useCartStore = create<CartStoreState>((set, get) => ({
  cartItems: [],
  addToCart: (item) => set(state => ({ cartItems: [...state.cartItems, item] })),
  updateQuantity: (itemId, quantity) => set(state => ({
    cartItems: state.cartItems.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    )
  })),
  removeItem: (itemId) => set(state => ({
    cartItems: state.cartItems.filter(item => item.id !== itemId)
  })),
  clearCart: () => set({ cartItems: [] }),
  getAllAllergens: (item) => item.item.allergens || []
}));