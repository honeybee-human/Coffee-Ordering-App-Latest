import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';

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
      className="justify-between bg-muted hover:bg-gray-50 transition-all min-w-60"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span>Allergen Filters</span>
        {excludedAllergens.length > 0 && (
          <Badge variant="secondary" className="bg-destructive/20 text-destructive">
            {excludedAllergens.length}
          </Badge>
        )}
        {hiddenCount > 0 && (
          <Badge variant="secondary" className="bg-muted">
            {hiddenCount} hidden
          </Badge>
        )}
      </div>
    </Button>
  );
};