import React, { useRef, useEffect } from 'react';
import { AlertTriangle, Filter, ChevronUp, ChevronDown, X } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Checkbox } from '@/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { useIsMobile } from '@/ui/use-mobile';

interface AllergenFilterProps {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  excludedAllergens: string[];
  onToggleAllergenFilter: (allergen: string) => void;
  onClearAllergenFilters: () => void;
  allAllergens: string[];
  groupBasedAllergens: string[];
  filteredOutCount: number;
  filterRef?: React.RefObject<HTMLDivElement>;
}

export const AllergenFilter: React.FC<AllergenFilterProps> = ({
  filtersOpen,
  setFiltersOpen,
  excludedAllergens,
  onToggleAllergenFilter,
  onClearAllergenFilters,
  allAllergens,
  groupBasedAllergens,
  filteredOutCount,
  filterRef: externalFilterRef
}) => {
  const internalFilterRef = useRef<HTMLDivElement>(null);
  const filterRef = externalFilterRef || internalFilterRef;
  const isMobile = useIsMobile();

  // Click away to close filter (only for desktop dropdown)
  useEffect(() => {
    if (isMobile) return; // Don't add click away listener for mobile modal

    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFiltersOpen(false);
      }
    };

    if (filtersOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filtersOpen, setFiltersOpen, isMobile, filterRef]);

  // Filter trigger button
  const FilterTriggerButton = (
    <Button 
      variant="outline" 
      className="justify-between bg-muted hover:bg-gray-50 transition-all min-w-60"
      onClick={() => setFiltersOpen(true)}
    >
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span>Allergen Filters</span>
        {excludedAllergens.length > 0 && (
          <Badge variant="secondary" className="bg-destructive/20 text-destructive">
            {excludedAllergens.length}
          </Badge>
        )}
        {filteredOutCount > 0 && (
          <Badge variant="secondary" className="bg-muted">
            {filteredOutCount} hidden
          </Badge>
        )}
      </div>
      {!isMobile && (filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
    </Button>
  );

  // Filter content
  const FilterContent = (
    <div className="space-y-6">
      {/* Manual Filter Allergens */}
      {allAllergens.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Common Allergens</h4>
          <div className="grid grid-cols-2 gap-3">
            {allAllergens.map(allergen => {
              const isExcluded = excludedAllergens.includes(allergen);
              return (
                <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergen-${allergen}`}
                    checked={isExcluded}
                    onCheckedChange={() => onToggleAllergenFilter(allergen)}
                    className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                  />
                  <label 
                    htmlFor={`allergen-${allergen}`}
                    className={`text-sm cursor-pointer transition-colors ${
                      isExcluded ? 'text-destructive font-medium' : 'text-foreground'
                    }`}
                  >
                    {allergen}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Group-Based Allergens (Yellow) */}
      {groupBasedAllergens.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3 text-amber-700">Group Member Allergens</h4>
          <div className="grid grid-cols-2 gap-3">
            {groupBasedAllergens.map(allergen => {
              const isExcluded = excludedAllergens.includes(allergen);
              return (
                <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-allergen-${allergen}`}
                    checked={isExcluded}
                    onCheckedChange={() => onToggleAllergenFilter(allergen)}
                    className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                  <label 
                    htmlFor={`group-allergen-${allergen}`}
                    className={`text-sm cursor-pointer transition-colors ${
                      isExcluded ? 'text-amber-700 font-medium' : 'text-amber-600'
                    }`}
                  >
                    {allergen}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-destructive" />
            <span>Official allergens</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200 h-4 px-1">
              <AlertTriangle className="h-2 w-2" />
            </Badge>
            <span>Detected from ingredients (only shown for group member allergies)</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render different UI based on screen size
  return (
    <div className="relative" ref={filterRef}>
      {isMobile ? (
        // Mobile: Use Dialog (centered modal)
        <>
          {FilterTriggerButton}
          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DialogContent className="max-w-[95vw] w-[400px] p-4 max-h-[90vh] overflow-auto">
              <DialogHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Exclude:
                  </DialogTitle>
                  {excludedAllergens.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onClearAllergenFilters}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </DialogHeader>
              {FilterContent}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        // Desktop: Use Collapsible (dropdown)
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            {FilterTriggerButton}
          </CollapsibleTrigger>
          <CollapsibleContent className="absolute top-full right-0 mt-2 z-10">
            <Card className="w-96 bg-white border shadow-xl">
              <CardHeader className="">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Exclude:
                  </CardTitle>
                  {excludedAllergens.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onClearAllergenFilters}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {FilterContent}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};