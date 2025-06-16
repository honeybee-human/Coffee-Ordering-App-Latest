import { CartItem } from '@/types';

/**
 * Calculate the price of a single cart item including customizations
 */
export const calculateItemPrice = (item: CartItem): number => {
  let itemPrice = item.item.price;
  
  // Add syrup costs for coffee items
  if (item.type === 'coffee') {
    const customizations = item.customizations as any;
    if (customizations.syrups && customizations.syrups.length > 0) {
      const syrupCost = customizations.syrups.reduce((cost: number, syrup: any) => 
        cost + (syrup.pumps * 0.10), 0
      );
      itemPrice += syrupCost;
    }
  }
  
  return itemPrice;
};

/**
 * Calculate the subtotal for a cart (before tax)
 */
export const calculateCartSubtotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => {
    const itemPrice = calculateItemPrice(item);
    return total + (itemPrice * item.quantity);
  }, 0);
};

/**
 * Calculate tax amount based on subtotal
 */
export const calculateTax = (subtotal: number, taxRate: number = 0.08): number => {
  return subtotal * taxRate;
};

/**
 * Calculate the final total including tax
 */
export const calculateCartTotal = (cartItems: CartItem[], taxRate: number = 0.08): {
  subtotal: number;
  tax: number;
  total: number;
} => {
  const subtotal = calculateCartSubtotal(cartItems);
  const tax = calculateTax(subtotal, taxRate);
  
  return {
    subtotal,
    tax,
    total: subtotal + tax
  };
};