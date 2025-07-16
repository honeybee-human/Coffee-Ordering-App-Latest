import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { Coffee, Pastry, GroupMember } from '@/types';
import { useGroupsStore } from './useGroupsStore';

interface GroupAllergensStore {
  // State
  excludedAllergens: string[];
  
  // Actions
  setExcludedAllergens: (allergens: string[]) => void;
  toggleAllergenFilter: (allergen: string) => void;
  clearAllergenFilters: () => void;
  addMemberAllergensToFilters: (memberName: string, groupId: string, allergens: string[]) => void;
  
  // Helper functions
  getItemAllergens: (item: Coffee | Pastry) => string[];
  hasAllergenConflict: (item: Coffee | Pastry) => boolean;
  checkAllergenConflicts: (itemAllergens: string[], members: GroupMember[]) => GroupMember[];
}

type AllergensPersist = {
  excludedAllergens: string[];
};

export const useAllergensStore = create<GroupAllergensStore>()(  
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
      
      hasAllergenConflict: (item: Coffee | Pastry): boolean => {
        const { excludedAllergens, getItemAllergens } = get();
        if (!excludedAllergens.length) return false;
        
        const itemAllergens = getItemAllergens(item);
        return itemAllergens.some(allergen => excludedAllergens.includes(allergen));
      },

      checkAllergenConflicts: (itemAllergens: string[], members: GroupMember[]) => {
        return members.filter(member =>
          member.allergens.some(allergen => itemAllergens.includes(allergen))
        );
      }
    }),
    {
      name: 'bean-bite-allergens',
      partialize: (state) => ({ excludedAllergens: state.excludedAllergens })
    } as PersistOptions<GroupAllergensStore, AllergensPersist>
  )
);

// Selector hooks
export const useAllergenFilters = () => useAllergensStore(state => state.excludedAllergens);
