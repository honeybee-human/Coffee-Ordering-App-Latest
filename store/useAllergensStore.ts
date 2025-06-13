import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { Coffee, Pastry, Group, GroupMember, CartItem, CoffeeCustomization } from '@/types';
import { useGroupsStore } from './useGroupsStore';
import { containsDairy } from '@/data/menu';
import { normalizeAllergens } from '@/utils/allergens';

interface AllergensStore {
  // State
  excludedAllergens: string[];
  
  // Actions
  setExcludedAllergens: (allergens: string[]) => void;
  toggleAllergenFilter: (allergen: string) => void;
  clearAllergenFilters: () => void;
  addMemberAllergensToFilters: (memberName: string, groupId:string, allergens:string[]) => void;
  
  // Helper functions
  getItemAllergens: (item: Coffee | Pastry) => string[];
  getAllAllergens: (item: CartItem) => string[];
  hasAllergenConflict: (item: Coffee | Pastry) => boolean;
  checkAllergenConflicts: (allergens: string[], members: GroupMember[]) => string[];
}

// Define the shape of the persisted state
type AllergensPersist = {
  excludedAllergens: string[];
};

export const useAllergensStore = create<AllergensStore>()(  
  persist(
    (set, get) => ({
      // Initial state
      excludedAllergens: [],
      
      // Actions
      setExcludedAllergens: (allergens: string[]) => {
        set({ excludedAllergens: allergens });
      },
      
      toggleAllergenFilter: (allergen: string) => {
        set(state => {
          const currentAllergens = state.excludedAllergens;
          const allergenIndex = currentAllergens.indexOf(allergen);
          
          if (allergenIndex === -1) {
            // Add allergen to excluded list
            return { excludedAllergens: [...currentAllergens, allergen] };
          } else {
            // Remove allergen from excluded list
            return { 
              excludedAllergens: [
                ...currentAllergens.slice(0, allergenIndex),
                ...currentAllergens.slice(allergenIndex + 1)
              ] 
            };
          }
        });
      },
      
      clearAllergenFilters: () => {
        set({ excludedAllergens: [] });
      },
      
      addMemberAllergensToFilters: (memberName: string, groupId: string, allergens: string[]) => {
        // Get the current app state to access groups
        const appStore = useGroupsStore.getState();
        const group = appStore.groups.find(g => g.id === groupId);
        if (!group) return;
        
        // Check if the member already exists in the group
        const existingMemberIndex = group.members.findIndex((m: { name: string; }) => m.name === memberName);
        
        if (existingMemberIndex >= 0) {
          // Update existing member's allergens
          const updatedMember = {
            ...group.members[existingMemberIndex],
            allergens: allergens
          };
          
          // Remove the member first
          appStore.removeGroupMember(groupId, memberName);
          
          // Then add the updated member back
          appStore.addGroupMember(groupId, updatedMember);
        } else {
          // Add new member to the group
          const newMember: GroupMember = {
            name: memberName,
            allergens: allergens
          };
          
          appStore.addGroupMember(groupId, newMember);
        }
        
        // Add the allergens to the excluded filters
        set(state => {
          const currentAllergens = new Set(state.excludedAllergens);
          allergens.forEach(allergen => currentAllergens.add(allergen));
          return { excludedAllergens: Array.from(currentAllergens) };
        });
      },
      
      // Helper functions
      getItemAllergens: (item: Coffee | Pastry): string[] => {
        return item.allergens || [];
      },

      getAllAllergens: (item: CartItem): string[] => {
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
      },
      
      hasAllergenConflict: (item: Coffee | Pastry): boolean => {
        const { excludedAllergens, getItemAllergens } = get();
        if (!excludedAllergens.length) return false;
        
        const itemAllergens = getItemAllergens(item);
        return itemAllergens.some(allergen => excludedAllergens.includes(allergen));
      },

      checkAllergenConflicts: (allergens: string[], members: GroupMember[]): string[] => {
        return members
          .filter(member => allergens.some(allergen => member.allergens.includes(allergen)))
          .map(member => member.name);
      }
    }),
    {
      name: 'bean-bite-allergens',
      partialize: (state) => ({ excludedAllergens: state.excludedAllergens })
    } as PersistOptions<AllergensStore, AllergensPersist>
  )
);