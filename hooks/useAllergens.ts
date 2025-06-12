import { useState, useCallback } from 'react';
import { CartItem, GroupMember, CoffeeCustomization } from '@/types';
import { containsDairy } from '../data/menu';
import { normalizeAllergens } from '../utils/allergens';

/**
 * Custom hook for managing allergen filtering and conflict detection
 * Handles: allergen filters, conflict checking, and allergen normalization
 */
export const useAllergens = () => {
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);

  // Helper function to get all allergens for an item including customizations
  const getAllAllergens = useCallback((item: CartItem): string[] => {
    const baseAllergens = [...item.item.allergens];
    
    // Add milk allergen if the item uses dairy milk
    if (item.type === 'coffee') {
      const customizations = item.customizations as CoffeeCustomization;
      if (customizations.milk && containsDairy(customizations.milk)) {
        if (!baseAllergens.includes('Milk')) {
          baseAllergens.push('Milk');
        }
      }
    }
    
    return normalizeAllergens(baseAllergens);
  }, []);

  // Helper function to check allergen conflicts
  const checkAllergenConflicts = useCallback((allergens: string[], members: GroupMember[]): string[] => {
    return members
      .filter(member => allergens.some(allergen => member.allergens.includes(allergen)))
      .map(member => member.name);
  }, []);

  // Allergen filter handlers
  const toggleAllergenFilter = useCallback((allergen: string) => {
    setExcludedAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  }, []);

  const clearAllergenFilters = useCallback(() => {
    setExcludedAllergens([]);
  }, []);

  // Auto-add member allergens to filters
  const addMemberAllergensToFilters = useCallback((memberAllergens: string[]) => {
    const newAllergensToExclude = memberAllergens.filter(
      allergen => !excludedAllergens.includes(allergen)
    );
    
    if (newAllergensToExclude.length > 0) {
      setExcludedAllergens(prev => [...prev, ...newAllergensToExclude]);
    }
  }, [excludedAllergens]);

  return {
    excludedAllergens,
    setExcludedAllergens,
    getAllAllergens,
    checkAllergenConflicts,
    toggleAllergenFilter,
    clearAllergenFilters,
    addMemberAllergensToFilters
  };
};