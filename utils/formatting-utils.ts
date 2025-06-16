import { CartItem, FavoriteItem, GroupMember } from '@/types';

/**
 * Formats customizations for display in cart items, checkout, and group orders
 */
export const formatCustomizations = (item: CartItem): string => {
  if (item.type === 'coffee') {
    const customizations = item.customizations as any;
    const parts = [];
    
    if (customizations.milk && customizations.milk !== 'Whole Milk') {
      parts.push(`• ${customizations.milk} milk`);
    }
    
    if (customizations.syrups && customizations.syrups.length > 0) {
      customizations.syrups.forEach((syrup: any) => {
        const syrupCost = syrup.pumps * 0.10;
        parts.push(`• ${syrup.pumps} pump${syrup.pumps !== 1 ? 's' : ''} ${syrup.flavor} (+$${syrupCost.toFixed(2)})`);
      });
    }
    
    return parts.length > 0 ? parts.join('\n') : '';
  } else {
    const customizations = item.customizations as any;
    if (customizations.removedIngredients && customizations.removedIngredients.length > 0) {
      const parts = customizations.removedIngredients.map((ingredient: string) => `• No ${ingredient}`);
      return parts.join('\n');
    }
    return '';
  }
};

/**
 * Formats customizations for favorite items
 */
export const formatFavoriteCustomizations = (favorite: FavoriteItem): string => {
  if (favorite.type === 'coffee') {
    const customizations = favorite.customizations as any;
    const parts = [];
    
    if (customizations.milk && customizations.milk !== 'Whole Milk') {
      parts.push(`• ${customizations.milk} milk`);
    }
    
    if (customizations.syrups && customizations.syrups.length > 0) {
      customizations.syrups.forEach((syrup: any) => {
        const syrupCost = syrup.pumps * 0.10;
        parts.push(`• ${syrup.pumps} pump${syrup.pumps !== 1 ? 's' : ''} ${syrup.flavor} (+$${syrupCost.toFixed(2)})`);
      });
    }
    
    return parts.length > 0 ? parts.join('\n') : '';
  } else {
    const customizations = favorite.customizations as any;
    if (customizations.removedIngredients && customizations.removedIngredients.length > 0) {
      const parts = customizations.removedIngredients.map((ingredient: string) => `• No ${ingredient}`);
      return parts.join('\n');
    }
    return '';
  }
};