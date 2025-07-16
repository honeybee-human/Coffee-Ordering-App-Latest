import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { Coffee, Pastry, Group, GroupMember, CartItem, CoffeeCustomization } from '@/types';
import { useGroupsStore } from './useGroupsStore';
import { containsDairy } from '@/data/menu';
import { normalizeAllergens } from '@/utils/allergens';

interface AllergensStore {
  // State
  excludedAllergens: string[];
  autoFilterEnabled: boolean; // New toggle state
  
  // Actions
  setExcludedAllergens: (allergens: string[]) => void;
  toggleAllergenFilter: (allergen: string) => void;
  clearAllergenFilters: () => void;
  addMemberAllergensToFilters: (memberName: string, groupId: string, allergens: string[]) => void;
  updateFiltersFromGroupMembers: () => void;
  toggleAutoFilter: () => void; // New action
  
  // Helper functions
  getItemAllergens: (item: Coffee | Pastry) => string[];
  getAllAllergens: (item: CartItem) => string[];
  hasAllergenConflict: (item: Coffee | Pastry) => boolean;
  checkAllergenConflicts: (allergens: string[], members: GroupMember[]) => string[];
}

// Define the shape of the persisted state
type AllergensPersist = {
  excludedAllergens: string[];
  autoFilterEnabled: boolean; // Persist the toggle state
};

export const useAllergensStore = create<AllergensStore>()(  
  persist(
    (set, get) => ({
      // Initial state
      excludedAllergens: [],
      autoFilterEnabled: false, // Default to disabled
      
      // Actions
      setExcludedAllergens: (allergens: string[]) => {
        set({ excludedAllergens: allergens });
      },
      
      toggleAllergenFilter: (allergen: string) => {
        set(state => {
          const currentAllergens = state.excludedAllergens;
          const allergenIndex = currentAllergens.indexOf(allergen);
          
          if (allergenIndex === -1) {
            return { excludedAllergens: [...currentAllergens, allergen] };
          } else {
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
      
      toggleAutoFilter: () => {
        set(state => {
          const newAutoFilterEnabled = !state.autoFilterEnabled;
          
          // If enabling auto-filter, immediately update filters
          if (newAutoFilterEnabled) {
            const { updateFiltersFromGroupMembers } = get();
            // Use setTimeout to ensure state is updated first
            setTimeout(() => updateFiltersFromGroupMembers(), 0);
          }
          
          return { autoFilterEnabled: newAutoFilterEnabled };
        });
      },
      
      addMemberAllergensToFilters: (memberName: string, groupId: string, allergens: string[]) => {
        const appStore = useGroupsStore.getState();
        const group = appStore.groups.find(g => g.id === groupId);
        if (!group) return;
        
        const existingMemberIndex = group.members.findIndex((m: { name: string; }) => m.name === memberName);
        
        if (existingMemberIndex >= 0) {
          const updatedMember = {
            ...group.members[existingMemberIndex],
            allergens: allergens
          };
          appStore.removeGroupMember(groupId, memberName);
          appStore.addGroupMember(groupId, updatedMember);
        } else {
          const newMember: GroupMember = {
            name: memberName,
            allergens: allergens
          };
          appStore.addGroupMember(groupId, newMember);
        }
        
        // Only auto-add to filters if auto-filter is enabled
        const { autoFilterEnabled } = get();
        if (autoFilterEnabled) {
          set(state => {
            const currentAllergens = new Set(state.excludedAllergens);
            allergens.forEach(allergen => currentAllergens.add(allergen));
            return { excludedAllergens: Array.from(currentAllergens) };
          });
        }
      },
      
      updateFiltersFromGroupMembers: () => {
        const { autoFilterEnabled } = get();
        if (!autoFilterEnabled) return; // Don't update if auto-filter is disabled
        
        const { groups } = useGroupsStore.getState();
        const activeGroupId = useGroupsStore.getState().activeGroupId;
        
        if (!activeGroupId) return;
        
        const activeGroup = groups.find(g => g.id === activeGroupId);
        if (!activeGroup) return;
        
        // Collect all allergens from group members
        const groupAllergens = new Set<string>();
        activeGroup.members.forEach(member => {
          if (member.allergens && member.allergens.length > 0) {
            member.allergens.forEach(allergen => groupAllergens.add(allergen));
          }
        });
        
        // Update excluded allergens to include all group member allergens
        set(state => {
          const currentAllergens = new Set(state.excludedAllergens);
          groupAllergens.forEach(allergen => currentAllergens.add(allergen));
          return { excludedAllergens: Array.from(currentAllergens) };
        });
      },
      
      // Helper functions
      getItemAllergens: (item: Coffee | Pastry): string[] => {
        return item.allergens || [];
      },

      getAllAllergens: (item: CartItem): string[] => {
        const baseAllergens = [...item.item.allergens];
        
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
      partialize: (state) => ({ 
        excludedAllergens: state.excludedAllergens,
        autoFilterEnabled: state.autoFilterEnabled 
      })
    } as PersistOptions<AllergensStore, AllergensPersist>
  )
);

// Selector hooks
export const useAllergenFilters = () => useAllergensStore(state => state.excludedAllergens);
export const useAutoFilterEnabled = () => useAllergensStore(state => state.autoFilterEnabled);