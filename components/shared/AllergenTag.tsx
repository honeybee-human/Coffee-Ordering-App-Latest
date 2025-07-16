import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/ui/badge';
import { getComprehensiveAllergens } from '@/utils/allergens';

interface AllergenTagProps {
  item: any;
  groupAllergens?: string[];
}

export const AllergenTag: React.FC<AllergenTagProps> = ({ item, groupAllergens = [] }) => {
  const originalAllergens = item.allergens || [];
  const comprehensiveAllergens = getComprehensiveAllergens(item);
  const detectedAllergens = comprehensiveAllergens.filter(allergen => !originalAllergens.includes(allergen));
  
  // Only show detected allergens that match group member allergies
  const relevantDetectedAllergens = detectedAllergens.filter(allergen => 
    groupAllergens.includes(allergen)
  );

  return (
    <div className="flex flex-wrap gap-2">
      {/* Original allergens */}
      {originalAllergens.map((allergen: string, index: number) => (
        <span key={`original-${allergen}-${index}`} className="flex items-center gap-1  text-destructive">
          <AlertTriangle className="h-3 w-3" />
          {allergen}
        </span>
      ))}
      {/* Detected allergens with different styling - only if group member has that allergen */}
      {relevantDetectedAllergens.map((allergen: string, index: number) => (
        <Badge 
          key={`detected-${allergen}-${index}`} 
          variant="secondary" 
          className="text-xs bg-amber-100 text-amber-800 border-amber-200"
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