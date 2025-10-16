import { CoffeeCustomization } from "@/types";

// Comprehensive list of common allergens for autocomplete
export const COMMON_ALLERGENS = [
  'Almonds',
  'Brazil Nuts',
  'Cashews',
  'Chestnuts',
  'Hazelnuts',
  'Macadamias',
  'Pecans',
  'Pine Nuts',
  'Pistachios',
  'Walnuts',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
  'Gluten',
  'Sesame',
  'Peanuts',
  'Mustard',
  'Celery',
  'Sulphites',
  'Lupin',
  'Molluscs',
  'Apples',
  'Bananas',
  'Berries',
  'Blueberries',
  'Strawberries',
  'Raspberries',
  'Blackberries',
  'Cherries',
  'Grapes',
  'Kiwi',
  'Mango',
  'Melon',
  'Oranges',
  'Peaches',
  'Pears',
  'Pineapple',
  'Plums',
  'Tomatoes',
  'Avocado',
  'Coconut',
  'Latex',
  'Caffeine',
  'Chocolate',
  'Vanilla',
  'Cinnamon',
  'Ginger',
  'Garlic',
  'Onions',
  'Peppers',
  'Corn',
  'Rice',
  'Oats',
  'Barley',
  'Rye',
  'Yeast',
  'Honey',
  'Maple',
  'Artificial Colors',
  'Artificial Flavors',
  'Preservatives',
  'MSG',
  'Aspartame',
  'Carrageenan'
].sort();

// Ingredient-to-allergen mapping for detection
export const INGREDIENT_ALLERGEN_MAP: Record<string, string[]> = {
  // Nuts and seeds
  'almond': ['Almonds'],
  'almonds': ['Almonds'],
  'hazelnut': ['Hazelnuts'],
  'hazelnuts': ['Hazelnuts'],
  'walnut': ['Walnuts'],
  'walnuts': ['Walnuts'],
  'pecan': ['Pecans'],
  'pecans': ['Pecans'],
  'cashew': ['Cashews'],
  'cashews': ['Cashews'],
  'pistachio': ['Pistachios'],
  'pistachios': ['Pistachios'],
  'pine nut': ['Pine Nuts'],
  'pine nuts': ['Pine Nuts'],
  'macadamia': ['Macadamias'],
  'macadamias': ['Macadamias'],
  'brazil nut': ['Brazil Nuts'],
  'brazil nuts': ['Brazil Nuts'],
  'chestnut': ['Chestnuts'],
  'chestnuts': ['Chestnuts'],
  'peanut': ['Peanuts'],
  'peanuts': ['Peanuts'],
  'sesame': ['Sesame'],
  
  // Dairy
  'milk': ['Milk'],
  'dairy': ['Milk'],
  'cream': ['Milk'],
  'butter': ['Milk'],
  'cheese': ['Milk'],
  'yogurt': ['Milk'],
  'whey': ['Milk'],
  'casein': ['Milk'],
  'lactose': ['Milk'],
  
  // Eggs
  'egg': ['Eggs'],
  'eggs': ['Eggs'],
  'mayonnaise': ['Eggs'],
  
  // Grains
  'wheat': ['Wheat', 'Gluten'],
  'flour': ['Wheat', 'Gluten'],
  'gluten': ['Gluten'],
  'barley': ['Barley', 'Gluten'],
  'rye': ['Rye', 'Gluten'],
  'oats': ['Oats'],
  'corn': ['Corn'],
  'rice': ['Rice'],
  
  // Fruits
  'apple': ['Apples'],
  'apples': ['Apples'],
  'banana': ['Bananas'],
  'bananas': ['Bananas'],
  'blueberry': ['Blueberries', 'Berries'],
  'blueberries': ['Blueberries', 'Berries'],
  'strawberry': ['Strawberries', 'Berries'],
  'strawberries': ['Strawberries', 'Berries'],
  'raspberry': ['Raspberries', 'Berries'],
  'raspberries': ['Raspberries', 'Berries'],
  'blackberry': ['Blackberries', 'Berries'],
  'blackberries': ['Blackberries', 'Berries'],
  'cherry': ['Cherries'],
  'cherries': ['Cherries'],
  'grape': ['Grapes'],
  'grapes': ['Grapes'],
  'orange': ['Oranges'],
  'oranges': ['Oranges'],
  'lemon': ['Oranges'], // Citrus family
  'lime': ['Oranges'], // Citrus family
  'peach': ['Peaches'],
  'peaches': ['Peaches'],
  'pear': ['Pears'],
  'pears': ['Pears'],
  'kiwi': ['Kiwi'],
  'mango': ['Mango'],
  'pineapple': ['Pineapple'],
  'coconut': ['Coconut'],
  
  // Soy
  'soy': ['Soy'],
  'soya': ['Soy'],
  'tofu': ['Soy'],
  'tempeh': ['Soy'],
  'miso': ['Soy'],
  
  // Spices and flavorings
  'vanilla': ['Vanilla'],
  'cinnamon': ['Cinnamon'],
  'ginger': ['Ginger'],
  'chocolate': ['Chocolate'],
  'cocoa': ['Chocolate'],
  'caffeine': ['Caffeine'],
  'coffee': ['Caffeine'],
  'espresso': ['Caffeine'],
  
  // Sweeteners
  'honey': ['Honey'],
  'maple': ['Maple'],
  'aspartame': ['Aspartame'],
  
  // Other
  'yeast': ['Yeast'],
  'mustard': ['Mustard'],
  'celery': ['Celery'],
  'garlic': ['Garlic'],
  'onion': ['Onions'],
  'tomato': ['Tomatoes'],
  'tomatoes': ['Tomatoes']
};

// Function to normalize allergen names to proper capitalization
export function normalizeAllergens(allergens: string[]): string[] {
  return allergens.map(allergen => {
    const trimmed = allergen.trim();
    if (!trimmed) return '';
    
    // Capitalize first letter and make rest lowercase, except for known acronyms
    const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    
    // Handle special cases
    if (normalized.toLowerCase() === 'msg') return 'MSG';
    
    return normalized;
  }).filter(Boolean);
}

// Function to detect allergens from ingredient lists
export function detectAllergensFromIngredients(ingredients: string[]): string[] {
  const detectedAllergens = new Set<string>();
  
  ingredients.forEach(ingredient => {
    const lowerIngredient = ingredient.toLowerCase().trim();
    
    // Check for direct matches and partial matches
    Object.entries(INGREDIENT_ALLERGEN_MAP).forEach(([key, allergens]) => {
      if (lowerIngredient.includes(key)) {
        allergens.forEach(allergen => detectedAllergens.add(allergen));
      }
    });
  });
  
  return Array.from(detectedAllergens).sort();
}

// Function to get comprehensive allergen list for an item
export function getComprehensiveAllergens(item: any): string[] {
  const originalAllergens = item.allergens || [];
  const ingredients = item.ingredients || item.removableIngredients || [];
  const detectedAllergens = detectAllergensFromIngredients(ingredients);
  
  // Combine and deduplicate
  const allAllergens = new Set([...originalAllergens, ...detectedAllergens]);
  return normalizeAllergens(Array.from(allAllergens));
}

// Function to check if a string matches any allergen patterns
export function matchesAllergenPattern(text: string, allergens: string[]): boolean {
  const lowerText = text.toLowerCase();
  return allergens.some(allergen => {
    const lowerAllergen = allergen.toLowerCase();
    return lowerText.includes(lowerAllergen) || 
           Object.keys(INGREDIENT_ALLERGEN_MAP).some(key => 
             lowerText.includes(key) && INGREDIENT_ALLERGEN_MAP[key].some(a => 
               a.toLowerCase() === lowerAllergen
             )
           );
  });
}