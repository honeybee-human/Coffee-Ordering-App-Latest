import { optimizeAllergenSelection, getExpandedAllergens } from '@/localDataArchive/allergenGroups';
import { allergenGroups } from '@/localDataArchive/menu';
import { AllergenGroup } from '@/types';

export class AllergenGroupManager {
  /**
   * Convert a flat allergen list to groups + individuals
   */
  static convertToGroupSelection(allergens: string[]): {
    selectedGroups: string[];
    selectedIndividuals: string[];
  } {
    const optimization = optimizeAllergenSelection(allergens);
    return {
      selectedGroups: optimization.suggestedGroups.map((g: { id: any; }) => g.id),
      selectedIndividuals: optimization.remainingIndividuals
    };
  }

  /**
   * Convert group selection back to flat allergen list
   */
  static convertToFlatList(selectedGroups: string[], selectedIndividuals: string[]): string[] {
    return getExpandedAllergens(selectedGroups, selectedIndividuals);
  }

  /**
   * Check if selecting a group would be more efficient than individual selections
   */
  static shouldSuggestGroup(allergens: string[], groupId: string): boolean {
    const group = allergenGroups.find((g: { id: string; }) => g.id === groupId);
    if (!group) return false;

    const matchCount = group.allergens.filter((allergen: string) => 
      allergens.some(a => a.toLowerCase() === allergen.toLowerCase())
    ).length;

    return matchCount >= Math.ceil(group.allergens.length * 0.6); // 60% threshold
  }

  /**
   * Get conflicting allergens between groups and individuals
   */
  static getConflicts(selectedGroups: string[], selectedIndividuals: string[]): string[] {
    const groupAllergens = selectedGroups.flatMap(groupId => {
      const group = allergenGroups.find((g: { id: string; }) => g.id === groupId);
      return group ? group.allergens : [];
    });

    return selectedIndividuals.filter(individual => 
      groupAllergens.some(group => group.toLowerCase() === individual.toLowerCase())
    );
  }
}