import React, { useRef, useEffect, useState, useMemo } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { useIsMobile } from '@/ui/use-mobile';
import { allergenGroups, individualAllergens } from '@/data/allergenGroups';
import { coffeeMenu, pastryMenu } from '@/data/menu';
import { AllergenFilterTrigger } from './AllergenFilterTrigger';
import { AllergenSearchBar } from './AllergenSearchBar';
import { AllergenCategorySection } from './AllergenCategorySection';
import { Badge } from '@/ui/badge';
import { Checkbox } from '@/ui/checkbox';

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
  filterRef: externalFilterRef,
}) => {
  const internalFilterRef = useRef<HTMLDivElement>(null);
  const filterRef = externalFilterRef || internalFilterRef;
  const isMobile = useIsMobile();
  
  // Search state for adding allergens
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [customAllergens, setCustomAllergens] = useState<string[]>([]);

  // Get all allergens from menu items
  const menuAllergens = useMemo(() => {
    const coffeeAllergens = coffeeMenu.flatMap(item => item.allergens || []);
    const pastryAllergens = pastryMenu.flatMap(item => item.allergens || []);
    return [...new Set([...coffeeAllergens, ...pastryAllergens])].sort();
  }, []);

  // Calculate hidden count based on currently checked allergens that exist in menu
  const hiddenCount = useMemo(() => {
    return excludedAllergens.filter(allergen => menuAllergens.includes(allergen)).length;
  }, [excludedAllergens, menuAllergens]);

  // Define custom allergen groups with reorganized categories
  const customAllergenGroups = useMemo(() => {
    const animalProducts = {
      id: 'animal-products',
      name: 'Animal Products',
      allergens: ['Milk', 'Butter', 'Cream', 'Eggs']
    };

    const grains = {
      id: 'grains-seeds',
      name: 'Grains & Seeds',
      allergens: ['Wheat', 'Gluten', 'Sesame', 'Soy']
    };

    const nuts = {
      id: 'nuts',
      name: 'Nuts',
      allergens: ['Almonds', 'Walnuts', 'Pecans']
    };

    return [animalProducts, nuts, grains];
  }, []);

  // Get other menu allergens
  const otherMenuAllergens = useMemo(() => {
    const groupAllergens = customAllergenGroups.flatMap(group => group.allergens);
    
    return menuAllergens.filter(allergen => 
      !groupBasedAllergens.includes(allergen) &&
      !groupAllergens.includes(allergen)
    );
  }, [menuAllergens, groupBasedAllergens, customAllergenGroups]);

  // Click away to close filter
  useEffect(() => {
    if (isMobile) return;

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

  // Helper functions
  const handleCategoryToggle = (categoryAllergens: string[]) => {
    const menuCategoryAllergens = categoryAllergens.filter(allergen => menuAllergens.includes(allergen));
    const isAllSelected = menuCategoryAllergens.every(allergen => excludedAllergens.includes(allergen));
    
    if (isAllSelected) {
      menuCategoryAllergens.forEach(allergen => {
        if (excludedAllergens.includes(allergen)) {
          onToggleAllergenFilter(allergen);
        }
      });
    } else {
      menuCategoryAllergens.forEach(allergen => {
        if (!excludedAllergens.includes(allergen)) {
          onToggleAllergenFilter(allergen);
        }
      });
    }
  };

  const getCategoryCheckboxState = (categoryAllergens: string[]) => {
    const menuCategoryAllergens = categoryAllergens.filter(allergen => menuAllergens.includes(allergen));
    const selectedCount = menuCategoryAllergens.filter(allergen => excludedAllergens.includes(allergen)).length;
    
    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === menuCategoryAllergens.length) return 'checked';
    return 'indeterminate';
  };

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const allPossibleAllergens = [
      ...allergenGroups.flatMap(group => group.allergens),
      ...individualAllergens
    ];
    
    return [...new Set(allPossibleAllergens)]
      .filter(allergen => 
        allergen.toLowerCase().includes(query) && 
        !excludedAllergens.includes(allergen) &&
        !customAllergens.includes(allergen)
      )
      .slice(0, 8);
  }, [searchQuery, excludedAllergens, customAllergens]);

  const handleAddAllergenFromSearch = (allergen: string) => {
    if (!excludedAllergens.includes(allergen) && !customAllergens.includes(allergen)) {
      setCustomAllergens(prev => [...prev, allergen]);
      onToggleAllergenFilter(allergen);
    }
    setSearchQuery('');
    setShowSearchSuggestions(false);
  };

  // Add function to handle removing custom allergens
  const handleRemoveCustomAllergen = (allergen: string) => {
    setCustomAllergens(prev => prev.filter(a => a !== allergen));
    if (excludedAllergens.includes(allergen)) {
      onToggleAllergenFilter(allergen);
    }
  };

  const FilterContent = (
    <div className="space-y-6">
      <AllergenSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSearchSuggestions={showSearchSuggestions}
        setShowSearchSuggestions={setShowSearchSuggestions}
        searchSuggestions={searchSuggestions}
        onAddAllergen={handleAddAllergenFromSearch}
      />
        {/* Custom Allergens - Integrated without heading */}
        {customAllergens.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-4">
              {customAllergens.map(allergen => {
                const isExcluded = excludedAllergens.includes(allergen);
                return (
                  <div key={allergen} className="flex items-center space-x-2 bg-secondary p-1">
                    <Checkbox
                      id={`custom-allergen-${allergen}`}
                      checked={isExcluded}
                      onCheckedChange={() => onToggleAllergenFilter(allergen)}
                      className=""
                    />
                    <label
                      htmlFor={`custom-allergen-${allergen}`}
                      className={`text-sm cursor-pointer transition-colors flex items-center gap-1`}
                    >
                      {allergen}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCustomAllergen(allergen)}
                        className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-4 gap-6'}`}>
        {/* Group Member Allergens */}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                id="group-member-category"
                checked={getCategoryCheckboxState(groupBasedAllergens) === 'checked'}
                onCheckedChange={() => handleCategoryToggle(groupBasedAllergens)}
                className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 h-5 w-5"
              />
              <h4 className="text-sm font-semibold text-amber-700">Member Allergens</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
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
                      className={`text-sm cursor-pointer transition-colors flex items-center gap-1 ${
                        isExcluded ? 'text-amber-700 font-medium' : 'text-amber-600'
                      }`}
                    >
                      {allergen}
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200 h-4 px-1 ml-1">
                        <AlertTriangle className="h-2 w-2" />
                      </Badge>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        



        {/* Other Categories */}
        {customAllergenGroups.map((group) => (
          <AllergenCategorySection
            key={group.id}
            id={group.id}
            name={group.name}
            allergens={group.allergens}
            menuAllergens={menuAllergens}
            excludedAllergens={excludedAllergens}
            groupBasedAllergens={groupBasedAllergens}
            getCategoryCheckboxState={getCategoryCheckboxState}
            onCategoryToggle={handleCategoryToggle}
            onToggleAllergen={onToggleAllergenFilter}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative" ref={filterRef}>
      {isMobile ? (
        <>
          <AllergenFilterTrigger
            excludedAllergens={excludedAllergens}
            hiddenCount={hiddenCount}
            onClick={() => setFiltersOpen(true)}
          />
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
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <AllergenFilterTrigger
              excludedAllergens={excludedAllergens}
              hiddenCount={hiddenCount}
              onClick={() => setFiltersOpen(true)}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="absolute top-full right-0 mt-2 z-10">
            <Card className="w-[800px] bg-white border shadow-xl">
              <CardHeader>
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
