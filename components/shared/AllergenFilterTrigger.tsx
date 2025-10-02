import React from 'react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Filter } from 'lucide-react';

interface AllergenFilterTriggerProps {
  excludedAllergens: string[];
  hiddenCount: number;
  onClick: () => void;
}

export const AllergenFilterTrigger: React.FC<AllergenFilterTriggerProps> = ({
  excludedAllergens,
  hiddenCount,
  onClick
}) => {
  return (
    <Button 
      variant="outline" 
      className="justify-between bg-white transition-all w-full max-w-full"
      aria-label="Allergen Filters"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="text-sm">Allergens</span>
        {excludedAllergens.length > 0 && (
          <Badge variant="secondary" className="bg-destructive/20 text-destructive">
            {excludedAllergens.length}
          </Badge>
        )}
        {hiddenCount > 0 && (
          <Badge variant="secondary" className="bg-white">
            {hiddenCount} hidden
          </Badge>
        )}
      </div>
    </Button>
  );
};