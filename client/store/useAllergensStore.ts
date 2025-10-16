import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { Coffee, Pastry, GroupMember } from '@/types';
import { useGroupsStore } from './useGroupsStore';
import { allergenGroups } from '@/localDataArchive/allergenGroups';

interface GroupAllergensStore {
  // State
  excludedAllergens: string[];
  autoFilterEnabled: boolean;

  // Actions
  setExcludedAllergens: (allergens: string[]) => void;
  toggleAllergenFilter: (allergen: string) => void;
  toggleAutoFilter: () => void;
  clearAllergenFilters: () => void;
  addMemberAllergensToFilters: (memberName: string, groupId: string, allergens: string[]) => void;
  updateFiltersFromGroupMembers: () => void;

  // Helper functions
  getItemAllergens: (item: Coffee | Pastry) => string[];
  hasAllergenConflict: (item: Coffee | Pastry) => boolean;
  checkAllergenConflicts: (itemAllergens: string[], members: GroupMember[]) => GroupMember[];
}

type AllergensPersist = {
  excludedAllergens: string[];
  autoFilterEnabled: boolean;
};

export const useAllergensStore = create<GroupAllergensStore>()(persist(
  (set, get) => ({
    // State
    excludedAllergens: [],
    autoFilterEnabled: false,

    // Actions
    setExcludedAllergens: (allergens: string[]) => {
      set({ excludedAllergens: allergens });
    },

    toggleAllergenFilter: (allergen: string) => {
      set(state => {
        const currentAllergens = state.excludedAllergens;
        const allergenIndex = currentAllergens.indexOf(allergen);
        
        if (allergenIndex === -1) {
          // Adding allergen - check if it's a group name
          const isGroupName = allergenGroups.find(group => 
            group.name.toLowerCase() === allergen.toLowerCase() || group.id === allergen
          );
          
          if (isGroupName) {
            // Adding a group - add all allergens from the group
            const groupAllergens = isGroupName.allergens.filter(
              groupAllergen => !currentAllergens.includes(groupAllergen)
            );
            return { 
              excludedAllergens: [...currentAllergens, ...groupAllergens]
            };
          } else {
            // Adding individual allergen - just add it
            return { 
              excludedAllergens: [...currentAllergens, allergen]
            };
          }
        } else {
          // Removing allergen - check if it belongs to a group
          const belongsToGroup = allergenGroups.find(group => 
            group.allergens.includes(allergen)
          );
          
          if (belongsToGroup) {
            // Check if all allergens from this group are currently selected
            const allGroupSelected = belongsToGroup.allergens.every(groupAllergen => 
              currentAllergens.includes(groupAllergen)
            );
            
            if (allGroupSelected) {
              // Remove all allergens from the group
              const filteredAllergens = currentAllergens.filter(a => 
                !belongsToGroup.allergens.includes(a)
              );
              return { excludedAllergens: filteredAllergens };
            } else {
              // Only remove this specific allergen
              const filteredAllergens = currentAllergens.filter(a => a !== allergen);
              return { excludedAllergens: filteredAllergens };
            }
          } else {
            // Remove individual allergen
            const filteredAllergens = currentAllergens.filter(a => a !== allergen);
            return { excludedAllergens: filteredAllergens };
          }
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
    },

    toggleAutoFilter: () => {
      set(state => ({ autoFilterEnabled: !state.autoFilterEnabled }));
    },

    updateFiltersFromGroupMembers: () => {
      const { autoFilterEnabled } = get();
      if (!autoFilterEnabled) return;
      
      const groupsStore = useGroupsStore.getState();
      const activeGroup = groupsStore.groups.find(g => g.id === groupsStore.activeGroupId);
      
      if (activeGroup && activeGroup.members.length > 0) {
        const allMemberAllergens = activeGroup.members.flatMap(member => member.allergens || []);
        const uniqueAllergens = [...new Set(allMemberAllergens)];
        set({ excludedAllergens: uniqueAllergens });
      } else {
        set({ excludedAllergens: [] });
      }
    },
  }),
  {
    name: 'allergens-storage',
    partialize: (state): AllergensPersist => ({
      excludedAllergens: state.excludedAllergens,
      autoFilterEnabled: state.autoFilterEnabled,
    }),
  } as PersistOptions<GroupAllergensStore, AllergensPersist>
));

export const useAllergenFilters = () => useAllergensStore(state => state.excludedAllergens);
export const useAutoFilterEnabled = () => useAllergensStore(state => state.autoFilterEnabled);
