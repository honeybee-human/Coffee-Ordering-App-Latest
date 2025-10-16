import { GroupMember } from '@/types';
import { AllergenController } from '@/controllers/AllergenController';

export const memberAssignmentUtils = {
  getDefaultAssignment(members: GroupMember[]): string {
    return members.length === 1 ? members[0].name : '';
  },

  getBestMemberForItem(members: GroupMember[], itemAllergens: string[]): string {
    const sortedMembers = AllergenController.sortMembersByAllergenConflict(members, itemAllergens);
    return sortedMembers.length > 0 ? sortedMembers[0].name : '';
  },

  validateMemberAssignment(members: GroupMember[], memberName: string, itemAllergens: string[]): {
    isValid: boolean;
    conflicts: string[];
    warnings: string[];
  } {
    const member = members.find(m => m.name === memberName);
    if (!member) {
      return { isValid: false, conflicts: ['Member not found'], warnings: [] };
    }

    const conflicts = AllergenController.getConflictingAllergens(member, itemAllergens);
    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings: conflicts.length > 0 ? [`${memberName} has allergen conflicts`] : []
    };
  }
};