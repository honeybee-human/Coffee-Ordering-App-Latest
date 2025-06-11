import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { PastryCustomization, Pastry } from '../types';

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
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No customizations available for this item.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remove Ingredients</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
      </CardContent>
    </Card>
  );
};