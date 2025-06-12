import { getComprehensiveAllergens } from './allergens';

// Word-start only matching function for search
export const isWordStartMatch = (searchQuery: string, targetText: string): boolean => {
  if (!searchQuery.trim()) return true;
  
  const query = searchQuery.toLowerCase();
  const target = targetText.toLowerCase();
  
  // Split target into words and check if any word starts with the query
  const words = target.split(/\s+/);
  
  return words.some(word => word.startsWith(query));
};

// Filter items based on search query and excluded allergens
export const filterItems = <T extends { name: string; description?: string; allergens?: string[] }>({
  items,
  searchQuery,
  searchMode,
  excludedAllergens
}: {
  items: T[];
  searchQuery: string;
  searchMode: 'name' | 'description';
  excludedAllergens: string[];
}): T[] => {
  let filtered = [...items];

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.trim();
    filtered = filtered.filter(item => {
      if (searchMode === 'name') {
        return isWordStartMatch(query, item.name);
      } else {
        return isWordStartMatch(query, item.description || '');
      }
    });
  }

  // Apply allergen filter
  if (excludedAllergens.length > 0) {
    filtered = filtered.filter(item => {
      const comprehensiveAllergens = getComprehensiveAllergens(item);
      return !comprehensiveAllergens.some(allergen => excludedAllergens.includes(allergen));
    });
  }

  return filtered;
};

// Get all unique allergens from a list of items
export const getAllUniqueAllergens = <T extends { allergens?: string[] }>({
  items,
  excludedFromManualFilter = []
}: {
  items: T[];
  excludedFromManualFilter?: string[];
}): string[] => {
  const allergenSet = new Set<string>();
  
  items.forEach(item => {
    const comprehensiveAllergens = getComprehensiveAllergens(item);
    comprehensiveAllergens.forEach(allergen => {
      // Only add to manual filter options if not in excluded list
      if (!excludedFromManualFilter.includes(allergen)) {
        allergenSet.add(allergen);
      }
    });
  });
  
  return Array.from(allergenSet).sort();
};

// Get group-based allergens (allergens that group members have but aren't in the common allergens list)
export const getGroupBasedAllergens = ({
  groupAllergens,
  allAllergens
}: {
  groupAllergens: string[];
  allAllergens: string[];
}): string[] => {
  return groupAllergens.filter(allergen => !allAllergens.includes(allergen)).sort();
};