import { Coffee, Pastry } from '@/types';
import { allergenCollection, allergenGroups, individualAllergens } from '@/data/allergenGroups';
import coffeeMenuJson from '@/data/coffee-menu.json';
import pastryMenuJson from '@/data/pastry-menu.json';

export const coffeeMenu: Coffee[] = coffeeMenuJson as Coffee[];
export const pastryMenu: Pastry[] = pastryMenuJson as Pastry[];

// Export the allergen collection for use in components
export { allergenCollection, allergenGroups, individualAllergens };

// Updated common allergens list that includes all possible allergens
export const commonAllergens = [
  ...allergenCollection.groups.flatMap((group: { allergens: string[] }) => group.allergens),
  ...allergenCollection.individualAllergens
].sort();

// Updated milk options for coffee customization
export const milkOptions = [
  'No Milk',
  'Whole Milk',
  'Skim Milk',
  '2% Milk',
  'Oat Milk',
  'Almond Milk',
  'Soy Milk',
  'Coconut Milk'
];

// Syrup flavors for coffee customization
export const syrupOptions = [
  'Vanilla',
  'Caramel',
  'Hazelnut',
  'Cinnamon',
  'Peppermint',
  'Chocolate',
  'Maple',
  'Irish Cream'
];
