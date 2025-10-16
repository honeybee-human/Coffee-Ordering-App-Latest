import { CartItem } from '@/types';
import { useAppContext } from '@/context/AppContext';

interface CartStoreState {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getAllAllergens: (item: CartItem) => string[];
}

export const useCartStore = (): CartStoreState => {
  const { cart, addToCart, updateCartQuantity, removeFromCart, clearCart } = useAppContext();

  return {
    cartItems: cart,
    addToCart: (item: CartItem) => addToCart(item),
    updateQuantity: (itemId: string, quantity: number) => updateCartQuantity(itemId, quantity),
    removeItem: (itemId: string) => removeFromCart(itemId),
    clearCart: () => clearCart(),
    getAllAllergens: (item: CartItem) => item.item.allergens || [],
  };
};