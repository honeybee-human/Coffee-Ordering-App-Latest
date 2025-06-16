import { create } from 'zustand';
import { GroupMember } from '@/types';

interface GroupMemberAssignmentStore {
  selectedPerson: string;
  setSelectedPerson: (person: string) => void;
  resetToUnassigned: () => void;
  resetForNewItem: (groupMembers: GroupMember[]) => void;
  hasAllergenConflict: (member: GroupMember, itemAllergens: string[]) => boolean;
  getSortedMembers: (members: GroupMember[], itemAllergens: string[]) => GroupMember[];
  getConflictingAllergens: (member: GroupMember, itemAllergens: string[]) => string[];
}

export const useGroupMemberAssignmentStore = create<GroupMemberAssignmentStore>((set, get) => ({
  selectedPerson: '',

  setSelectedPerson: (person) => set({ selectedPerson: person }),

  resetToUnassigned: () => set({ selectedPerson: '' }),

  resetForNewItem: (groupMembers) => {
    // If there's only one person in the group, assign to them
    // Otherwise, reset to unassigned
    if (groupMembers.length === 1) {
      set({ selectedPerson: groupMembers[0].name });
    } else {
      set({ selectedPerson: '' });
    }
  },

  hasAllergenConflict: (member, itemAllergens) => {
    if (!member.allergens || member.allergens.length === 0 || itemAllergens.length === 0) {
      return false;
    }
    return member.allergens.some(allergen => 
      itemAllergens.some(itemAllergen => 
        itemAllergen.toLowerCase().includes(allergen.toLowerCase()) ||
        allergen.toLowerCase().includes(itemAllergen.toLowerCase())
      )
    );
  },

  getSortedMembers: (members, itemAllergens) => {
    const { hasAllergenConflict } = get();
    return [...members].sort((a, b) => {
      const aHasConflict = hasAllergenConflict(a, itemAllergens);
      const bHasConflict = hasAllergenConflict(b, itemAllergens);
      
      if (aHasConflict && !bHasConflict) return 1;
      if (!aHasConflict && bHasConflict) return -1;
      return a.name.localeCompare(b.name);
    });
  },

  getConflictingAllergens: (member, itemAllergens) => {
    if (!member.allergens || member.allergens.length === 0 || itemAllergens.length === 0) {
      return [];
    }
    return member.allergens.filter(allergen =>
      itemAllergens.some(itemAllergen =>
        itemAllergen.toLowerCase().includes(allergen.toLowerCase()) ||
        allergen.toLowerCase().includes(itemAllergen.toLowerCase())
      )
    );
  }
}));