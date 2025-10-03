import React from 'react';
import { Button } from '@/ui/button';
import { Filter } from 'lucide-react';

interface AllergenFilterTriggerProps {
  excludedAllergens: string[];
  onClick: () => void;
}

export const AllergenFilterTrigger: React.FC<AllergenFilterTriggerProps> = ({
  excludedAllergens,
  onClick
}) => {
  return (
    <Button 
      variant="outline" 
      className="justify-between bg-white transition-all w-full h-10 border border-b-2 border-r-2 hover:shadow-[2px_2px_0_0_#964B00]"
      aria-label="Allergen Filters"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="text-sm">Allergens</span>
      </div>
    </Button>
  );
};