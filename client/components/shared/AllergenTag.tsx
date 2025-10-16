import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/ui/badge';
import { getComprehensiveAllergens, normalizeAllergens } from '@/utils/allergens';

interface AllergenTagProps {
  item: any;
  groupAllergens?: string[];
  compact?: boolean;
  maxVisible?: number;
}

export const AllergenTag: React.FC<AllergenTagProps> = ({ item, groupAllergens = [], compact = false, maxVisible = 2 }) => {
  const originalAllergens = item.allergens || [];
  // Normalize and deduplicate original allergens to prevent duplicates
  const originalUnique = Array.from(new Set(normalizeAllergens(originalAllergens)));
  const comprehensiveAllergens = getComprehensiveAllergens(item);
  const detectedAllergens = comprehensiveAllergens.filter(allergen => !originalUnique.includes(allergen));
  
  // Split detected allergens into group-related and non-group
  const groupDetectedAllergens = detectedAllergens.filter(allergen => groupAllergens.includes(allergen));
  const nonGroupDetectedAllergens = detectedAllergens.filter(allergen => !groupAllergens.includes(allergen));

  if (compact) {
    // Prioritize allergens that any group member is allergic to
    const groupOriginal = originalUnique
      .filter(a => groupAllergens.includes(a))
      .map(a => ({ allergen: a, type: 'original' as const }));
    const nonGroupOriginal = originalUnique
      .filter(a => !groupAllergens.includes(a))
      .map(a => ({ allergen: a, type: 'original' as const }));
    const groupDetected = groupDetectedAllergens.map(a => ({ allergen: a, type: 'detected-group' as const }));
    const nonGroupDetected = nonGroupDetectedAllergens.map(a => ({ allergen: a, type: 'detected-non-group' as const }));

    const combined = [
      ...groupOriginal,
      ...groupDetected,
      ...nonGroupDetected,
      ...nonGroupOriginal,
    ];

    const visibleCount = Math.min(maxVisible, combined.length);
    const visibleItems = combined.slice(0, visibleCount);
    const remainingCount = combined.length - visibleCount;

    return (
      <div className="flex flex-wrap gap-2 items-center">
        {visibleItems.map((item, index) => (
          item.type === 'original' || item.type === 'detected-non-group' ? (
            <span key={`compact-red-${item.allergen}-${index}`} className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-3 w-3" />
              {item.allergen}
            </span>
          ) : (
            <Badge
              key={`compact-amber-${item.allergen}-${index}`}
              variant="secondary"
              className="bg-amber-100 text-amber-800 border-amber-200"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {item.allergen}
            </Badge>
          )
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-destructive">+{remainingCount} more</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Original allergens */}
      {originalUnique.map((allergen: string, index: number) => (
        <span key={`original-${allergen}-${index}`} className="flex items-center gap-1  text-destructive">
          <AlertTriangle className="h-3 w-3" />
          {allergen}
        </span>
      ))}
      {/* Non-group detected allergens - red */}
      {nonGroupDetectedAllergens.map((allergen: string, index: number) => (
        <span key={`detected-non-group-${allergen}-${index}`} className="flex items-center gap-1 text-destructive">
          <AlertTriangle className="h-3 w-3" />
          {allergen}
        </span>
      ))}
      {/* Group detected allergens - amber */}
      {groupDetectedAllergens.map((allergen: string, index: number) => (
        <Badge 
          key={`detected-group-${allergen}-${index}`} 
          variant="secondary" 
          className="bg-amber-100 text-amber-800 border-amber-200"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          {allergen}
        </Badge>
      ))}
    </div>
  );
};

// Helper function to get all group member allergens
export const getGroupAllergens = (groupMembers: any[]): string[] => {
  const allergenSet = new Set<string>();
  groupMembers.forEach(member => {
    member.allergens.forEach((allergen: string) => allergenSet.add(allergen));
  });
  return Array.from(allergenSet);
};