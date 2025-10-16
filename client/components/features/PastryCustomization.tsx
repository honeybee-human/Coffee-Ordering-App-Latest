import React from 'react';
import { Checkbox } from '@/ui/checkbox';
import { Pastry, PastryCustomization } from '@/types';

interface PastryCustomizationProps {
  pastry: Pastry;
  customizations: PastryCustomization;
  setCustomizations: (customizations: PastryCustomization) => void;
}

export const PastryCustomizationComponent: React.FC<PastryCustomizationProps> = ({
  pastry,
  customizations,
  setCustomizations
}) => {
  const toggleIngredient = (ingredient: string) => {
    const isRemoved = customizations.removedIngredients.includes(ingredient);
    if (isRemoved) {
      setCustomizations({
        ...customizations,
        removedIngredients: customizations.removedIngredients.filter(i => i !== ingredient)
      });
    } else {
      setCustomizations({
        ...customizations,
        removedIngredients: [...customizations.removedIngredients, ingredient]
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
      <h2 className="text-lg font-semibold mb-3">Removable Ingredients</h2>
      <div className="space-y-3">
        {pastry.removableIngredients.map(ingredient => (
          <div key={ingredient} className="flex items-center space-x-2">
            <Checkbox
              id={ingredient}
              checked={customizations.removedIngredients.includes(ingredient)}
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