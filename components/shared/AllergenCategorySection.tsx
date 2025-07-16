import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/ui/checkbox';
import { Badge } from '@/ui/badge';

interface AllergenCategorySectionProps {
  id: string;
  name: string;
  allergens: string[];
  menuAllergens: string[];
  excludedAllergens: string[];
  groupBasedAllergens: string[];
  getCategoryCheckboxState: (allergens: string[]) => 'checked' | 'unchecked' | 'indeterminate';
  onCategoryToggle: (allergens: string[]) => void;
  onToggleAllergen: (allergen: string) => void;
  className?: string;
}

export const AllergenCategorySection: React.FC<AllergenCategorySectionProps> = ({
  id,
  name,
  allergens,
  menuAllergens,
  excludedAllergens,
  groupBasedAllergens,
  getCategoryCheckboxState,
  onCategoryToggle,
  onToggleAllergen,
  className = ""
}) => {
  const menuCategoryAllergens = allergens.filter(allergen => menuAllergens.includes(allergen));
  
  if (menuCategoryAllergens.length === 0) return null;

  const checkboxState = getCategoryCheckboxState(allergens);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Checkbox
          id={`category-${id}`}
          checked={checkboxState === 'checked'}
          onCheckedChange={() => onCategoryToggle(allergens)}
          className={`h-5 w-5 ${className}`}
        />
        <h4 className="text-sm font-semibold text-red-600">{name}</h4>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {menuCategoryAllergens.map(allergen => {
          const isExcluded = excludedAllergens.includes(allergen);
          const isFromGroupMember = groupBasedAllergens.includes(allergen);
          
          return (
            <div key={allergen} className="flex items-center space-x-2">
              <Checkbox
                id={allergen}
                checked={isExcluded}
                onCheckedChange={() => onToggleAllergen(allergen)}
                className={isFromGroupMember ? "data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600" : ""}
              />
              <label 
                htmlFor={allergen} 
                className={`text-sm cursor-pointer flex items-center gap-1 ${
                  isFromGroupMember 
                    ? (isExcluded ? 'text-amber-700 font-medium' : 'text-amber-600')
                    : ''
                }`}
              >
                {allergen}
                {isFromGroupMember && (
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200 h-4 px-1 ml-1">
                    <AlertTriangle className="h-2 w-2" />
                  </Badge>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};