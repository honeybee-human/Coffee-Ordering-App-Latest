import { Coffee, Pastry } from '@/types';

export const coffeeMenu: Coffee[] = [
  {
    id: 'espresso',
    name: 'Espresso',
    price: 2.50,
    allergens: [],
    description: 'Rich, bold shot of pure coffee perfection'
  },
  {
    id: 'americano',
    name: 'Americano',
    price: 3.00,
    allergens: [],
    description: 'Espresso with hot water for a clean, strong flavor'
  },
  {
    id: 'latte',
    name: 'Latte',
    price: 4.50,
    allergens: ['Milk'],
    description: 'Smooth espresso with steamed milk and a light foam layer'
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    price: 4.25,
    allergens: ['Milk'],
    description: 'Equal parts espresso, steamed milk, and rich foam'
  },
  {
    id: 'macchiato',
    name: 'Macchiato',
    price: 4.75,
    allergens: ['Milk'],
    description: 'Espresso "marked" with a dollop of foamed milk'
  },
  {
    id: 'mocha',
    name: 'Mocha',
    price: 5.00,
    allergens: ['Milk', 'Soy'],
    description: 'Rich chocolate and espresso blend with steamed milk'
  },
  {
    id: 'flat-white',
    name: 'Flat White',
    price: 4.75,
    allergens: ['Milk'],
    description: 'Strong espresso with microfoam steamed milk'
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew',
    price: 3.75,
    allergens: [],
    description: 'Smooth, less acidic coffee steeped in cold water'
  },
  {
    id: 'frappuccino',
    name: 'Frappuccino',
    price: 5.50,
    allergens: ['Milk', 'Soy'],
    description: 'Blended coffee drink with ice, milk, and flavored syrups'
  }
];

export const pastryMenu: Pastry[] = [
  {
    id: 'croissant',
    name: 'Butter Croissant',
    price: 3.25,
    allergens: ['Gluten', 'Milk', 'Eggs'],
    removableIngredients: ['Butter glaze'],
    description: 'Flaky, buttery French pastry perfect with coffee'
  },
  {
    id: 'chocolate-croissant',
    name: 'Chocolate Croissant',
    price: 3.75,
    allergens: ['Gluten', 'Milk', 'Eggs', 'Soy'],
    removableIngredients: ['Chocolate filling'],
    description: 'Buttery croissant filled with rich dark chocolate'
  },
  {
    id: 'blueberry-muffin',
    name: 'Blueberry Muffin',
    price: 2.95,
    allergens: ['Gluten', 'Milk', 'Eggs'],
    removableIngredients: ['Blueberries', 'Sugar topping', 'Lemon zest'],
    description: 'Moist muffin bursting with fresh blueberries'
  },
  {
    id: 'banana-bread',
    name: 'Banana Bread',
    price: 3.50,
    allergens: ['Gluten', 'Milk', 'Eggs', 'Nuts'],
    removableIngredients: ['Walnuts', 'Chocolate chips'],
    description: 'Sweet, moist bread made with ripe bananas and walnuts'
  },
  {
    id: 'scone',
    name: 'Cranberry Scone',
    price: 3.25,
    allergens: ['Gluten', 'Milk'],
    removableIngredients: ['Cranberries', 'Orange zest', 'Sugar glaze'],
    description: 'Traditional British scone with tart cranberries'
  },
  {
    id: 'danish',
    name: 'Cheese Danish',
    price: 3.95,
    allergens: ['Gluten', 'Milk', 'Eggs'],
    removableIngredients: ['Cream cheese filling', 'Fruit topping'],
    description: 'Flaky pastry filled with sweet cream cheese'
  },
  {
    id: 'bagel',
    name: 'Everything Bagel',
    price: 2.50,
    allergens: ['Gluten', 'Sesame'],
    removableIngredients: ['Everything seasoning', 'Sesame seeds', 'Poppy seeds'],
    description: 'Classic bagel topped with savory everything seasoning'
  },
  {
    id: 'cinnamon-roll',
    name: 'Cinnamon Roll',
    price: 4.25,
    allergens: ['Gluten', 'Milk', 'Eggs'],
    removableIngredients: ['Cinnamon filling', 'Icing', 'Pecans'],
    description: 'Warm, gooey roll with cinnamon and sweet icing'
  }
];

// Common allergen list for reference
export const commonAllergens = [
  'Milk',
  'Eggs',
  'Gluten',
  'Nuts',
  'Peanuts',
  'Soy',
  'Sesame',
  'Fish',
  'Shellfish'
];

// Milk options for coffee customization
export const milkOptions = [
  'Whole Milk',
  'Skim Milk', 
  '2% Milk',
  'Oat Milk',
  'Almond Milk',
  'Soy Milk',
  'Coconut Milk',
  'Rice Milk'
];

// Syrup options for coffee customization
export const syrupOptions = [
  'Vanilla',
  'Caramel',
  'Hazelnut',
  'Cinnamon',
  'Peppermint',
  'Chocolate',
  'Toffee',
  'Lavender',
  'Maple',
  'Irish Cream'
];

// Function to check if a milk type contains dairy
export const containsDairy = (milkType: string): boolean => {
  return ['Whole Milk', 'Skim Milk', '2% Milk'].includes(milkType);
};

// Legacy export for backwards compatibility
export const milkTypes = milkOptions;