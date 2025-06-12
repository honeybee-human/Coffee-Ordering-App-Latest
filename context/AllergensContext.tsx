import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, GroupMember, CoffeeCustomization } from '@/types';
import { containsDairy } from '@/data/menu';
import { normalizeAllergens } from '@/utils/allergens';

interface AllergensContextType {
  excludedAllergens: string[];
  setExcludedAllergens: React.Dispatch<React.SetStateAction<string[]>>;
  getAllAllergens: (item: CartItem) => string[];
  checkAllergenConflicts: (allergens: string[], members: GroupMember[]) => string[];
  toggleAllergenFilter: (allergen: string) => void;
  clearAllergenFilters: () => void;
  addMemberAllergensToFilters: (memberAllergens: string[]) => void;
}

const AllergensContext = createContext<AllergensContextType | undefined>(undefined);

export const AllergensProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  return (
    <AllergensContext.Provider value={{
      excludedAllergens,
      setExcludedAllergens,
      getAllAllergens,
      checkAllergenConflicts,
      toggleAllergenFilter,
      clearAllergenFilters,
      addMemberAllergensToFilters
    }}>
      {children}
    </AllergensContext.Provider>
  );
};

export const useAllergens = (): AllergensContextType => {
  const context = useContext(AllergensContext);
  if (context === undefined) {
    throw new Error('useAllergens must be used within an AllergensProvider');
  }
  return context;
};