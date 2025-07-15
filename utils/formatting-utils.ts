import { CartItem, FavoriteItem } from '@/types';

/**
 * Extracts customization strings from item or favorite
 */
const extractCustomizations = (customizations: any): string[] => {
  const parts: string[] = [];

  if (customizations.milk && customizations.milk !== 'Whole Milk') {
    parts.push(`• ${customizations.milk} milk`);
  }

  if (customizations.syrups && Array.isArray(customizations.syrups)) {
    customizations.syrups.forEach((syrup: any) => {
      const syrupCost = syrup.pumps * 0.10;
      parts.push(`• ${syrup.pumps} pump${syrup.pumps !== 1 ? 's' : ''} ${syrup.flavor} (+$${syrupCost.toFixed(2)})`);
    });
  }

  if (customizations.removedIngredients && Array.isArray(customizations.removedIngredients)) {
    customizations.removedIngredients.forEach((ingredient: string) => {
      parts.push(`• No ${ingredient}`);
    });
  }

  return parts;
};

export const formatCustomizations = (item: CartItem): string[] => {
  return extractCustomizations(item.customizations);
};

export const formatFavoriteCustomizations = (favorite: FavoriteItem): string[] => {
  return extractCustomizations(favorite.customizations);
};

/**
 * Utility to chunk an array into pieces of a given size
 */
export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};
