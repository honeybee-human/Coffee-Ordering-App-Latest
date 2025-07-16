import React, { useRef, useEffect, useState, useMemo } from 'react';
import { AlertTriangle, Filter, ChevronUp, ChevronDown, X, Search, Plus } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Checkbox } from '@/ui/checkbox';
import { Input } from '@/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { useIsMobile } from '@/ui/use-mobile';
import { AllergenGroup } from '@/types';
import { allergenGroups, individualAllergens } from '@/data/allergenGroups';
import { coffeeMenu, pastryMenu } from '@/data/menu';

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
    // Animal Products (renamed from Dairy, includes Eggs)
    const animalProducts = {
      id: 'animal-products',
      name: 'Animal Products',
      allergens: ['Milk', 'Cheese', 'Butter', 'Cream', 'Yogurt', 'Whey', 'Casein', 'Lactose', 'Eggs']
    };

    // All Grains (includes Sesame and Soy, renamed)
    const allGrains = {
      id: 'all-grains-extended',
      name: 'Grains & Seeds',
      allergens: ['Wheat', 'Barley', 'Rye', 'Oats', 'Corn', 'Rice', 'Gluten', 'Sesame', 'Soy']
    };

    // Nuts (from existing group)
    const nuts = allergenGroups.find(g => g.id === 'tree-nuts');

    return [animalProducts, nuts, allGrains].filter(Boolean);
  }, []);

  // Get other menu allergens (excluding those in custom groups and nuts/dairy from individual list)
  const otherMenuAllergens = useMemo(() => {
    const groupAllergens = customAllergenGroups.flatMap(group => group?.allergens || []);
    const excludeFromOther = ['Nuts', 'Dairy']; // Remove these from Other section
    
    return menuAllergens.filter(allergen => 
      !groupBasedAllergens.includes(allergen) &&
      !groupAllergens.includes(allergen) &&
      !excludeFromOther.includes(allergen)
    );
  }, [menuAllergens, groupBasedAllergens, customAllergenGroups]);

  // Click away to close filter (only for desktop dropdown)
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

  // Helper function to handle category toggle
  const handleCategoryToggle = (categoryAllergens: string[]) => {
    const menuCategoryAllergens = categoryAllergens.filter(allergen => menuAllergens.includes(allergen));
    const isAllSelected = menuCategoryAllergens.every(allergen => excludedAllergens.includes(allergen));
    
    if (isAllSelected) {
      // Deselect all
      menuCategoryAllergens.forEach(allergen => {
        if (excludedAllergens.includes(allergen)) {
          onToggleAllergenFilter(allergen);
        }
      });
    } else {
      // Select all
      menuCategoryAllergens.forEach(allergen => {
        if (!excludedAllergens.includes(allergen)) {
          onToggleAllergenFilter(allergen);
        }
      });
    }
  };

  // Helper function to get category checkbox state
  const getCategoryCheckboxState = (categoryAllergens: string[]) => {
    const menuCategoryAllergens = categoryAllergens.filter(allergen => menuAllergens.includes(allergen));
    const selectedCount = menuCategoryAllergens.filter(allergen => excludedAllergens.includes(allergen)).length;
    
    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === menuCategoryAllergens.length) return 'checked';
    return 'indeterminate';
  };

  // Search suggestions for adding allergens
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

  // Handle adding allergen from search
  const handleAddAllergenFromSearch = (allergen: string) => {
    if (!excludedAllergens.includes(allergen) && !customAllergens.includes(allergen)) {
      setCustomAllergens(prev => [...prev, allergen]);
      onToggleAllergenFilter(allergen);
    }
    setSearchQuery('');
    setShowSearchSuggestions(false);
  };

  // Handle removing custom allergen
  const handleRemoveCustomAllergen = (allergen: string) => {
    setCustomAllergens(prev => prev.filter(a => a !== allergen));
    if (excludedAllergens.includes(allergen)) {
      onToggleAllergenFilter(allergen);
    }
  };

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
        {hiddenCount > 0 && (
          <Badge variant="secondary" className="bg-muted">
            {hiddenCount} hidden
          </Badge>
        )}
      </div>
      {!isMobile && (filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
    </Button>
  );

  // Filter content
  const FilterContent = (
    <div className="space-y-6">
      {/* Grid layout for larger screens, single column for mobile */}
               <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Add Allergen Filter</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search and add allergens..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(e.target.value.trim().length > 0);
                }}
                onFocus={() => setShowSearchSuggestions(searchQuery.trim().length > 0)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                className="pl-10 bg-muted w-full"
              />
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                  {searchSuggestions.map((suggestion) => (
                    <div
                      key={suggestion}
                      className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer"
                      onClick={() => handleAddAllergenFromSearch(suggestion)}
                    >
                      <span>{suggestion}</span>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Added Allergens */}
          {customAllergens.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">Added Filters</h4>
              <div className="flex flex-wrap gap-2">
                {customAllergens.map(allergen => (
                  <div key={allergen} className="flex items-center space-x-2 bg-muted rounded-md px-3 py-1">
                    <Checkbox
                      id={`custom-${allergen}`}
                      checked={excludedAllergens.includes(allergen)}
                      onCheckedChange={() => onToggleAllergenFilter(allergen)}
                    />
                    <label htmlFor={`custom-${allergen}`} className="text-sm cursor-pointer">
                      {allergen}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCustomAllergen(allergen)}
                      className="h-4 w-4 p-0 hover:bg-destructive/20"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
      <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-4 gap-6'}`}>
        {/* Column 1: Add Allergen Filter and Group Member Allergens */}
        <div className="space-y-6">
          {/* Group Member Allergens */}
          {groupBasedAllergens.length > 0 && (
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
          )}
        </div>

        {/* Columns 2-4: Allergen Categories */}
        {customAllergenGroups.map((group, index) => {
          if (!group) return null;
          const menuGroupAllergens = group.allergens.filter(allergen => menuAllergens.includes(allergen));
          if (menuGroupAllergens.length === 0) return null;

          return (
            <div key={group.id}>
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  id={`category-${group.id}`}
                  checked={getCategoryCheckboxState(group.allergens) === 'checked'}
                 
                  onCheckedChange={() => handleCategoryToggle(group.allergens)}
                  className="h-5 w-5"
                />
                <h4 className="text-sm font-semibold text-red-600">{group.name}</h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {menuGroupAllergens.map(allergen => {
                  const isExcluded = excludedAllergens.includes(allergen);
                  const isFromGroupMember = groupBasedAllergens.includes(allergen);
                  
                  return (
                    <div key={allergen} className="flex items-center space-x-2">
                      <Checkbox
                        id={allergen}
                        checked={isExcluded}
                        onCheckedChange={() => onToggleAllergenFilter(allergen)}
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
        })}

        {/* Column 4: Other Menu Allergens */}
        {otherMenuAllergens.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                id="other-category"
                checked={getCategoryCheckboxState(otherMenuAllergens) === 'checked'}
               
                onCheckedChange={() => handleCategoryToggle(otherMenuAllergens)}
                className="h-5 w-5"
              />
              <h4 className="text-sm font-semibold text-muted-foreground">Other</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {otherMenuAllergens.map(allergen => {
                const isExcluded = excludedAllergens.includes(allergen);
                const isFromGroupMember = groupBasedAllergens.includes(allergen);
                return (
                  <div key={allergen} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergen}
                      checked={isExcluded}
                      onCheckedChange={() => onToggleAllergenFilter(allergen)}
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
        )}
      </div>

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
            <Card className="w-[800px] bg-white border shadow-xl">
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
