import { Coffee, Pastry } from '@/types';
import { allergenCollection, allergenGroups, individualAllergens } from '@/data/allergenGroups';

export const coffeeMenu: Coffee[] = [
  {
    id: 'espresso',
    name: 'Espresso',
    price: 2.50,
    allergens: [],
    description: 'Rich, bold shot of pure coffee perfection',
    image: '/Espresso.png'
  },
  {
    id: 'americano',
    name: 'Americano',
    price: 3.00,
    allergens: [],
    description: 'Espresso with hot water for a clean, strong flavor',
    image: '/Americano.png'
  },
  {
    id: 'latte',
    name: 'Latte',
    price: 4.50,
    allergens: [],
    description: 'Smooth espresso with steamed  and a light foam layer',
    image: '/Latte.png'
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    price: 4.25,
    allergens: [],
    description: 'Equal parts espresso, steamed , and rich foam',
    image: '/Capuccino.png'
  },
  {
    id: 'macchiato',
    name: 'Macchiato',
    price: 4.75,
    allergens: [],
    description: 'Espresso "marked" with a dollop of foamed ',
    image: '/Macchiato.png'
  },
  {
    id: 'mocha',
    name: 'Mocha',
    price: 5.00,
    allergens: [ 'Soy'],
    description: 'Rich chocolate and espresso blend with steamed ',
    image: '/Mocha.png'
  },
  {
    id: 'flat-white',
    name: 'Flat White',
    price: 4.75,
    allergens: [],
    description: 'Strong espresso with microfoam steamed ',
    image: '/Flat White.png'
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew',
    price: 3.75,
    allergens: [],
    description: 'Smooth, less acidic coffee steeped in cold water',
    image: '/Cold Brew.png'
  },
  {
    id: 'frappuccino',
    name: 'Frappuccino',
    price: 5.50,
    allergens: [ 'Soy'],
    description: 'Blended coffee drink with ice, , and flavored syrups',
    image: '/Frappucino.png'
  }
];

export const pastryMenu: Pastry[] = [
  {
    id: 'croissant',
    name: 'Butter Croissant',
    price: 3.25,
    allergens: ['Gluten',  'Eggs'],
    ingredients: ['Wheat flour', 'Butter', 'Eggs', 'Yeast', 'Salt', 'Sugar'],
    removableIngredients: ['Butter glaze'],
    description: 'Flaky, buttery French pastry perfect with coffee',
    image: '/Butter Croissant.png'
  },
  {
    id: 'chocolate-croissant',
    name: 'Chocolate Croissant',
    price: 3.75,
    allergens: ['Gluten',  'Eggs', 'Soy'],
    ingredients: ['Wheat flour', 'Butter', 'Eggs', 'Dark chocolate', 'Soy lecithin', 'Yeast', 'Salt', 'Sugar'],
    removableIngredients: ['Chocolate filling'],
    description: 'Buttery croissant filled with rich dark chocolate',
    image: '/Chocolate Croissant.png'
  },
  {
    id: 'blueberry-muffin',
    name: 'Blueberry Muffin',
    price: 2.95,
    allergens: ['Gluten',  'Eggs'],
    ingredients: ['Wheat flour', 'Blueberries', 'Eggs', 'Butter', 'Sugar', 'Baking powder', 'Vanilla', 'Lemon zest'],
    removableIngredients: ['Sugar topping', 'Lemon zest'],
    description: 'Moist muffin bursting with fresh blueberries',
    image: '/Blueberry Muffin.png'
  },
  {
    id: 'banana-bread',
    name: 'Banana Bread',
    price: 3.50,
    allergens: ['Gluten',  'Eggs', 'Walnuts'],
    ingredients: ['Wheat flour', 'Ripe bananas', 'Walnuts', 'Eggs', 'Butter', 'Sugar', 'Baking soda', 'Vanilla'],
    removableIngredients: ['Walnuts'],
    description: 'Sweet, moist bread made with ripe bananas and walnuts',
    image: '/Banana Bread.png'
  },
  {
    id: 'scone',
    name: 'Cranberry Scone',
    price: 3.25,
    allergens: ['Gluten', ],
    ingredients: ['Wheat flour', 'Dried cranberries', 'Butter', 'Sugar', 'Baking powder', 'Orange zest', 'Salt'],
    removableIngredients: ['Cranberries', 'Orange zest', 'Sugar glaze'],
    description: 'Traditional British scone with tart cranberries',
    image: '/Cranberry Scone.png'
  },
  {
    id: 'danish',
    name: 'Cheese Danish',
    price: 3.95,
    allergens: ['Gluten',  'Eggs', 'Cheese'],
    ingredients: ['Wheat flour', 'Cheese', 'Butter', 'Eggs', 'Sugar', 'Yeast', 'Vanilla', 'Fruit preserves'],
    removableIngredients: ['Cream cheese filling', 'Fruit topping'],
    description: 'Flaky pastry filled with sweet cream cheese',
    image: '/Cheese Danish.png'
  },
  {
    id: 'bagel',
    name: 'Everything Bagel',
    price: 2.50,
    allergens: ['Gluten', 'Sesame'],
    ingredients: ['Wheat flour', 'Sesame seeds', 'Poppy seeds', 'Dried garlic', 'Dried onion', 'Salt', 'Yeast', 'Water'],
    removableIngredients: ['Everything seasoning', 'Sesame seeds', 'Poppy seeds'],
    description: 'Classic bagel topped with savory everything seasoning',
    image: '/Everything Bagel.png'
  },
  {
    id: 'cinnamon-roll',
    name: 'Cinnamon Roll',
    price: 4.25,
    allergens: ['Gluten',  'Eggs', 'Pecans'],
    ingredients: ['Wheat flour', 'Cinnamon', 'Pecans', 'Butter', 'Eggs', 'Sugar', 'Yeast', 'Vanilla', 'Powdered sugar'],
    removableIngredients: ['Cinnamon filling', 'Icing', 'Pecans'],
    description: 'Warm, gooey roll with cinnamon and sweet icing',
    image: '/Cinnamon Roll.png'
  }
];

// Export the allergen collection for use in components
export { allergenCollection, allergenGroups, individualAllergens };

// Updated common allergens list that includes all possible allergens
export const commonAllergens = [
  ...allergenCollection.groups.flatMap((group: { allergens: any; }) => group.allergens),
  ...allergenCollection.individualAllergens
].sort();

//  options for coffee customization
export const milkOptions = [
  'Whole ',
  'Skim ', 
  '2% ',
  'Oat ',
  'Almond ',
  'Soy ',
  'Coconut '
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
