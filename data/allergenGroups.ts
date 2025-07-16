import { AllergenGroup, AllergenCollection } from '@/types';

// Define allergen groups with their constituent allergens
export const allergenGroups: AllergenGroup[] = [
  {
    id: 'tree-nuts',
    name: 'Tree Nuts',
    description: 'All tree nuts including almonds, walnuts, pecans, etc.',
    allergens: [
      'Almonds',
      'Brazil Nuts',
      'Cashews',
      'Chestnuts',
      'Hazelnuts',
      'Macadamias',
      'Pecans',
      'Pine Nuts',
      'Pistachios',
      'Walnuts'
    ],
    icon: '🥜'
  },
  {
    id: 'fruits',
    name: 'Fruits',
    description: 'All fruits including berries, citrus, stone fruits, etc.',
    allergens: [
      'Apples',
      'Bananas', 
      'Citrus',
      'Grapes',
      'Strawberries'
    ],
    icon: '🍎'
  },
  {
    id: 'berries',
    name: 'Berries',
    description: 'All berries including strawberries, blueberries, raspberries, etc.',
    allergens: [
      'Blueberries',
      'Blackberries',
      'Cranberries',
      'Raspberries',
      'Strawberries'
    ],
    icon: '🫐'
  },
  {
    id: 'citrus',
    name: 'Citrus Fruits',
    description: 'Citrus fruits like oranges, lemons, limes',
    allergens: [
      'Oranges',
      'Lemons',
      'Limes',
      'Grapefruits'
    ],
    icon: '🍊'
  },
  {
    id: 'dairy',
    name: 'Dairy Products',
    description: 'All dairy and milk-based products',
    allergens: [
      'Milk',
      'Cheese',
      'Butter',
      'Cream',
      'Yogurt',
      'Whey',
      'Casein',
      'Lactose'
    ],
    icon: '🥛'
  },
  {
    id: 'gluten-grains',
    name: 'Gluten-Containing Grains',
    description: 'Grains that contain gluten',
    allergens: [
      'Wheat',
      'Barley',
      'Rye',
      'Gluten'
    ],
    icon: '🌾'
  },
  {
    id: 'all-grains',
    name: 'All Grains',
    description: 'All grains including gluten-free options',
    allergens: [
      'Wheat',
      'Barley',
      'Rye',
      'Oats',
      'Corn',
      'Rice',
      'Gluten'
    ],
    icon: '🌾'
  },
  {
    id: 'seafood',
    name: 'Seafood',
    description: 'All fish and shellfish',
    allergens: [
      'Fish',
      'Shellfish',
      'Molluscs'
    ],
    icon: '🐟'
  },
  {
    id: 'spices',
    name: 'Spices & Seasonings',
    description: 'Common spices and seasonings',
    allergens: [
      'Vanilla',
      'Cinnamon',
      'Ginger',
      'Garlic',
      'Onions',
      'Peppers',
      'Mustard',
      'Celery'
    ],
    icon: '🌶️'
  },
  {
    id: 'artificial-additives',
    name: 'Artificial Additives',
    description: 'Artificial colors, flavors, and preservatives',
    allergens: [
      'Artificial Colors',
      'Artificial Flavors',
      'Preservatives',
      'MSG',
      'Aspartame',
      'Carrageenan'
    ],
    icon: '🧪'
  },
  {
    id: 'sweeteners',
    name: 'Natural Sweeteners',
    description: 'Natural sweetening agents',
    allergens: [
      'Honey',
      'Maple'
    ],
    icon: '🍯'
  }
];

// Individual allergens that don't belong to groups
export const individualAllergens: string[] = [
  'Eggs',
  'Peanuts', // Technically a legume, not a tree nut
  'Soy',
  'Sesame',
  'Tomatoes',
  'Latex',
  'Caffeine',
  'Chocolate',
  'Yeast',
  'Sulphites',
  'Lupin'
];

// Complete allergen collection
export const allergenCollection: AllergenCollection = {
  groups: allergenGroups,
  individualAllergens
};

// Helper function to get all allergens from selected groups and individuals
export function getExpandedAllergens(selectedGroups: string[], selectedIndividuals: string[]): string[] {
  const groupAllergens = selectedGroups.flatMap(groupId => {
    const group = allergenGroups.find(g => g.id === groupId);
    return group ? group.allergens : [];
  });
  
  const allAllergens = [...groupAllergens, ...selectedIndividuals];
  return [...new Set(allAllergens)].sort();
}

// Helper function to get group by allergen
export function getGroupsContainingAllergen(allergen: string): AllergenGroup[] {
  return allergenGroups.filter(group => 
    group.allergens.some(a => a.toLowerCase() === allergen.toLowerCase())
  );
}

// Helper function to check if an allergen is in any group
export function isAllergenInGroup(allergen: string): boolean {
  return allergenGroups.some(group => 
    group.allergens.some(a => a.toLowerCase() === allergen.toLowerCase())
  );
}

// Helper function to get suggested groups based on current allergens
export function getSuggestedGroups(currentAllergens: string[]): AllergenGroup[] {
  const suggestions: { group: AllergenGroup; matchCount: number }[] = [];
  
  allergenGroups.forEach(group => {
    const matchCount = group.allergens.filter(allergen => 
      currentAllergens.some(current => current.toLowerCase() === allergen.toLowerCase())
    ).length;
    
    if (matchCount > 0) {
      suggestions.push({ group, matchCount });
    }
  });
  
  // Sort by match count (descending) and return groups
  return suggestions
    .sort((a, b) => b.matchCount - a.matchCount)
    .map(s => s.group);
}

// Helper function to optimize allergen list by suggesting groups
export function optimizeAllergenSelection(allergens: string[]): {
  suggestedGroups: AllergenGroup[];
  remainingIndividuals: string[];
} {
  const suggestedGroups: AllergenGroup[] = [];
  const usedAllergens = new Set<string>();
  
  // Find groups where most allergens are selected
  allergenGroups.forEach(group => {
    const groupMatches = group.allergens.filter(allergen => 
      allergens.some(a => a.toLowerCase() === allergen.toLowerCase())
    );
    
    // If more than 50% of group allergens are selected, suggest the group
    if (groupMatches.length > group.allergens.length * 0.5) {
      suggestedGroups.push(group);
      group.allergens.forEach(allergen => usedAllergens.add(allergen.toLowerCase()));
    }
  });
  
  // Remaining individual allergens
  const remainingIndividuals = allergens.filter(allergen => 
    !usedAllergens.has(allergen.toLowerCase())
  );
  
  return {
    suggestedGroups,
    remainingIndividuals
  };
}