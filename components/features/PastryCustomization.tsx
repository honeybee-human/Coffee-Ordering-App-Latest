import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/ui/button';
import { Checkbox } from '@/ui/checkbox';
import { Pastry, PastryCustomization } from '@/types';

interface PastryCustomizationProps {
  pastry: Pastry;
  customization: PastryCustomization;
  onChange: (customization: PastryCustomization) => void;
}

export const PastryCustomizationComponent: React.FC<PastryCustomizationProps> = ({
  pastry,
  customization,
  onChange
}) => {
  const toggleIngredient = (ingredient: string) => {
    const isRemoved = customization.removedIngredients.includes(ingredient);
    if (isRemoved) {
      onChange({
        ...customization,
        removedIngredients: customization.removedIngredients.filter(i => i !== ingredient)
      });
    } else {
      onChange({
        ...customization,
        removedIngredients: [...customization.removedIngredients, ingredient]
      });
    }
  };

  if (pastry.removableIngredients.length === 0) {
    return (
      <div>
        <p className="text-muted-foreground text-center">No customizations available for this item.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Remove Ingredients</h2>
      <div className="space-y-3">
        {pastry.removableIngredients.map(ingredient => (
          <div key={ingredient} className="flex items-center space-x-2">
            <Checkbox
              id={ingredient}
              checked={customization.removedIngredients.includes(ingredient)}
              onCheckedChange={() => toggleIngredient(ingredient)}
            />
            <label htmlFor={ingredient} className="text-sm cursor-pointer">
              Remove {ingredient}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};