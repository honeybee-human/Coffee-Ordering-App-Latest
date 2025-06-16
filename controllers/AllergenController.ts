import { GroupMember } from '@/types';
import { normalizeAllergens } from '@/utils/allergens';

export class AllergenController {
  static hasAllergenConflict(member: GroupMember, itemAllergens: string[]): boolean {
    if (!member.allergens || member.allergens.length === 0 || itemAllergens.length === 0) {
      return false;
    }
    const normalizedMemberAllergens = normalizeAllergens(member.allergens);
    const normalizedItemAllergens = normalizeAllergens(itemAllergens);
    
    return normalizedMemberAllergens.some(allergen => 
      normalizedItemAllergens.some(itemAllergen => 
        itemAllergen.toLowerCase().includes(allergen.toLowerCase()) ||
        allergen.toLowerCase().includes(itemAllergen.toLowerCase())
      )
    );
  }

  static getConflictingAllergens(member: GroupMember, itemAllergens: string[]): string[] {
    if (!member.allergens || member.allergens.length === 0) return [];
    
    return member.allergens.filter(allergen =>
      itemAllergens.some(itemAllergen =>
        itemAllergen.toLowerCase().includes(allergen.toLowerCase()) ||
        allergen.toLowerCase().includes(itemAllergen.toLowerCase())
      )
    );
  }

  static sortMembersByAllergenConflict(members: GroupMember[], itemAllergens: string[]): GroupMember[] {
    return [...members].sort((a, b) => {
      const aHasConflict = this.hasAllergenConflict(a, itemAllergens);
      const bHasConflict = this.hasAllergenConflict(b, itemAllergens);
      
      if (aHasConflict && !bHasConflict) return 1;
      if (!aHasConflict && bHasConflict) return -1;
      return 0;
    });
  }

  static getAllGroupAllergens(members: GroupMember[]): string[] {
    const allAllergens = members.flatMap(member => member.allergens || []);
    return [...new Set(normalizeAllergens(allAllergens))];
  }
}