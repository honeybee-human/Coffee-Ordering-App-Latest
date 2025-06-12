import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { GroupMember } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface GroupAllergensState {
  // Map of groupId -> memberName -> allergens
  groupMemberAllergens: Record<string, Record<string, string[]>>;
  // Count of allergens per group
  allergenCounts: Record<string, Record<string, number>>;
  
  // Actions
  setMemberAllergens: (groupId: string, memberName: string, allergens: string[]) => void;
  removeMemberAllergens: (groupId: string, memberName: string) => void;
  removeGroup: (groupId: string) => void;
  
  // Getters
  getMemberAllergens: (groupId: string, memberName: string) => string[];
  getGroupAllergenCount: (groupId: string) => Record<string, number>;
  getActiveGroupAllergenCount: () => Record<string, number>;
  getAllergenCountForMember: (groupId: string, memberName: string, allergen: string) => number;
  
  // Helper functions
  updateAllergenCounts: (groupId: string) => void;
}

type GroupAllergensPersist = {
  groupMemberAllergens: Record<string, Record<string, string[]>>;
  allergenCounts: Record<string, Record<string, number>>;
};

export const useGroupAllergensStore = create<GroupAllergensState>()(
  persist(
    (set, get) => ({
      // Initial state
      groupMemberAllergens: {},
      allergenCounts: {},
      
      // Actions
      setMemberAllergens: (groupId: string, memberName: string, allergens: string[]) => {
        set((state) => {
          // Create deep copies to avoid direct state mutation
          const newGroupMemberAllergens = { ...state.groupMemberAllergens };
          
          // Initialize group if it doesn't exist
          if (!newGroupMemberAllergens[groupId]) {
            newGroupMemberAllergens[groupId] = {};
          }
          
          // Set member allergens
          newGroupMemberAllergens[groupId][memberName] = [...allergens];
          
          // Update the app store with the new allergens
          const appStore = useAppStore.getState();
          const group = appStore.groups.find(g => g.id === groupId);
          
          if (group) {
            const existingMemberIndex = group.members.findIndex(m => m.name === memberName);
            
            if (existingMemberIndex >= 0) {
              // Update existing member's allergens
              appStore.removeGroupMember(groupId, memberName);
              appStore.addGroupMember(groupId, {
                name: memberName,
                allergens: [...allergens]
              });
            } else {
              // Add new member to the group
              appStore.addGroupMember(groupId, {
                name: memberName,
                allergens: [...allergens]
              });
            }
          }
          
          return { groupMemberAllergens: newGroupMemberAllergens };
        });
        
        // Update allergen counts after setting member allergens
        get().updateAllergenCounts(groupId);
      },
      
      removeMemberAllergens: (groupId: string, memberName: string) => {
        set((state) => {
          const newGroupMemberAllergens = { ...state.groupMemberAllergens };
          
          if (newGroupMemberAllergens[groupId]) {
            // Remove member allergens
            const { [memberName]: _, ...restMembers } = newGroupMemberAllergens[groupId];
            newGroupMemberAllergens[groupId] = restMembers;
          }
          
          return { groupMemberAllergens: newGroupMemberAllergens };
        });
        
        // Update allergen counts after removing member allergens
        get().updateAllergenCounts(groupId);
      },
      
      removeGroup: (groupId: string) => {
        set((state) => {
          const { [groupId]: _, ...restGroups } = state.groupMemberAllergens;
          const { [groupId]: __, ...restCounts } = state.allergenCounts;
          
          return { 
            groupMemberAllergens: restGroups,
            allergenCounts: restCounts
          };
        });
      },
      
      // Getters
      getMemberAllergens: (groupId: string, memberName: string) => {
        const { groupMemberAllergens } = get();
        return groupMemberAllergens[groupId]?.[memberName] || [];
      },
      
      getGroupAllergenCount: (groupId: string) => {
        const { allergenCounts } = get();
        return allergenCounts[groupId] || {};
      },
      
      getActiveGroupAllergenCount: () => {
        const { allergenCounts } = get();
        const activeGroupId = useAppStore.getState().activeGroupId;
        
        if (!activeGroupId) return {};
        return allergenCounts[activeGroupId] || {};
      },
      
      getAllergenCountForMember: (groupId: string, memberName: string, allergen: string) => {
        const memberAllergens = get().getMemberAllergens(groupId, memberName);
        return memberAllergens.includes(allergen) ? 1 : 0;
      },
      
      // Helper functions
      updateAllergenCounts: (groupId: string) => {
        set((state) => {
          const groupMembers = state.groupMemberAllergens[groupId] || {};
          const allergenCount: Record<string, number> = {};
          
          // Count allergens across all members in the group
          Object.values(groupMembers).forEach(memberAllergens => {
            memberAllergens.forEach(allergen => {
              allergenCount[allergen] = (allergenCount[allergen] || 0) + 1;
            });
          });
          
          return {
            allergenCounts: {
              ...state.allergenCounts,
              [groupId]: allergenCount
            }
          };
        });
      }
    }),
    {
      name: 'bean-bite-group-allergens',
      partialize: (state) => ({
        groupMemberAllergens: state.groupMemberAllergens,
        allergenCounts: state.allergenCounts
      })
    } as PersistOptions<GroupAllergensState, GroupAllergensPersist>
  )
);

// Selector hooks for better performance
export const useActiveGroupAllergenCount = () => useGroupAllergensStore(state => state.getActiveGroupAllergenCount());
export const useMemberAllergens = (groupId: string, memberName: string) => 
  useGroupAllergensStore(state => state.getMemberAllergens(groupId, memberName));
export const useGroupAllergenCount = (groupId: string) => 
  useGroupAllergensStore(state => state.getGroupAllergenCount(groupId));