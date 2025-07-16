import { CartItem, CoffeeCustomization, PastryCustomization, GroupMember } from '@/types';
import { calculateItemPrice } from './cart-calculations';
import { getComprehensiveAllergens } from './allergens';

/**
 * Checks if two cart items have identical customizations
 */
export const haveSameCustomizations = (item1: CartItem, item2: CartItem): boolean => {
  if (item1.type !== item2.type) return false;
  
  if (item1.type === 'coffee') {
    const custom1 = item1.customizations as CoffeeCustomization;
    const custom2 = item2.customizations as CoffeeCustomization;
    
    // Check milk
    if (custom1.milk !== custom2.milk) return false;
    
    // Check syrups
    if (custom1.syrups.length !== custom2.syrups.length) return false;
    
    // Sort syrups to ensure consistent comparison
    const sortedSyrups1 = [...custom1.syrups].sort((a, b) => 
      a.flavor.localeCompare(b.flavor) || a.pumps - b.pumps
    );
    
    const sortedSyrups2 = [...custom2.syrups].sort((a, b) => 
      a.flavor.localeCompare(b.flavor) || a.pumps - b.pumps
    );
    
    // Compare each syrup
    for (let i = 0; i < sortedSyrups1.length; i++) {
      if (sortedSyrups1[i].flavor !== sortedSyrups2[i].flavor || 
          sortedSyrups1[i].pumps !== sortedSyrups2[i].pumps) {
        return false;
      }
    }
    
    return true;
  } else {
    // For pastry
    const custom1 = item1.customizations as PastryCustomization;
    const custom2 = item2.customizations as PastryCustomization;
    
    if (custom1.removedIngredients.length !== custom2.removedIngredients.length) return false;
    
    // Sort removed ingredients for consistent comparison
    const sorted1 = [...custom1.removedIngredients].sort();
    const sorted2 = [...custom2.removedIngredients].sort();
    
    for (let i = 0; i < sorted1.length; i++) {
      if (sorted1[i] !== sorted2[i]) return false;
    }
    
    return true;
  }
};

/**
 * Groups cart items by person and combines identical items with the same customizations
 */
export const groupAndCombineItems = (cartItems: CartItem[], groupMembers: GroupMember[]) => {
  const groups: { [key: string]: CartItem[] } = {
    unassigned: []
  };

  // Initialize groups for each member
  groupMembers.forEach(member => {
    groups[member.name] = [];
  });

  // Process each cart item
  cartItems.forEach(item => {
    const targetGroup = item.assignedTo && groups[item.assignedTo] 
      ? groups[item.assignedTo] 
      : groups.unassigned;
    
    // Check if there's already an identical item in the group
    const existingItemIndex = targetGroup.findIndex(existingItem => 
      existingItem.item.id === item.item.id && haveSameCustomizations(existingItem, item)
    );
    
    if (existingItemIndex >= 0) {
      // Combine with existing item by adding quantities
      targetGroup[existingItemIndex] = {
        ...targetGroup[existingItemIndex],
        quantity: targetGroup[existingItemIndex].quantity + item.quantity
      };
    } else {
      // Add as a new item
      targetGroup.push(item);
    }
  });

  return groups;
};

/**
 * Combines identical cart items with the same customizations
 */
export const combineIdenticalItems = (cartItems: CartItem[]): CartItem[] => {
  const combinedItems: CartItem[] = [];
  
  cartItems.forEach(item => {
    // Check if there's already an identical item in the combined items
    const existingItemIndex = combinedItems.findIndex(existingItem => 
      existingItem.item.id === item.item.id && 
      existingItem.assignedTo === item.assignedTo && 
      haveSameCustomizations(existingItem, item)
    );
    
    if (existingItemIndex >= 0) {
      // Combine with existing item by adding quantities
      combinedItems[existingItemIndex] = {
        ...combinedItems[existingItemIndex],
        quantity: combinedItems[existingItemIndex].quantity + item.quantity
      };
    } else {
      // Add as a new item
      combinedItems.push(item);
    }
  });
  
  return combinedItems;
};

/**
 * Gets the assigned person for a cart item, defaulting to the only member if there's only one
 */
export const getAssignedPerson = (item: CartItem, groupMembers: GroupMember[]): string | undefined => {
  if (item.assignedTo) return item.assignedTo;
  if (groupMembers.length === 1) return groupMembers[0].name;
  return undefined;
};

/**
 * Checks for allergen conflicts for a specific person's items
 */
export const getPersonAllergenConflicts = (items: CartItem[], person: string, groupMembers: GroupMember[]): string[] => {
  const member = groupMembers.find(m => m.name === person);
  if (!member) return [];
  
  const conflicts = new Set<string>();
  items.forEach(item => {
    // Use comprehensive allergens instead of just basic allergens
    const itemAllergens = getComprehensiveAllergens(item.item);
    itemAllergens.forEach(allergen => {
      if (member.allergens.includes(allergen)) {
        conflicts.add(allergen);
      }
    });
  });
  
  return Array.from(conflicts);
};

/**
 * Calculates totals for each person in a group order
 */
export const calculatePersonTotals = (groupedItems: { [key: string]: CartItem[] }): { [key: string]: number } => {
  const totals: { [key: string]: number } = {};
  
  Object.entries(groupedItems).forEach(([person, items]) => {
    totals[person] = items.reduce((total, item) => {
      const itemPrice = calculateItemPrice(item);
      return total + (itemPrice * item.quantity);
    }, 0);
  });
  
  return totals;
};

/**
 * Checks allergen conflicts for a cart item against group members
 */
export const getAllergenConflicts = (item: CartItem, groupMembers: GroupMember[]): { conflicts: string[]; affectedMembers: string[] } => {
  // Use comprehensive allergens instead of just basic allergens
  const itemAllergens = getComprehensiveAllergens(item.item);
  const affectedMembers: string[] = [];
  const conflicts: string[] = [];
  
  groupMembers.forEach(member => {
    const memberConflicts = itemAllergens.filter(allergen => 
      member.allergens.includes(allergen)
    );
    if (memberConflicts.length > 0) {
      affectedMembers.push(member.name);
      memberConflicts.forEach(conflict => {
        if (!conflicts.includes(conflict)) {
          conflicts.push(conflict);
        }
      });
    }
  });
  
  if (item.assignedTo) {
    const person = groupMembers.find(member => member.name === item.assignedTo);
    if (person) {
      const personalConflicts = itemAllergens.filter(allergen => 
        person.allergens.includes(allergen)
      );
      personalConflicts.forEach(conflict => {
        if (!conflicts.includes(conflict)) {
          conflicts.push(conflict);
        }
      });
    }
  }
  
  return { conflicts, affectedMembers };
};