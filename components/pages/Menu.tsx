import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Coffee as CoffeeIcon, Cookie, AlertTriangle, Star, Filter, ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Input } from '@/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Checkbox } from '@/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { coffeeMenu, pastryMenu } from '@/data/menu';
import { getComprehensiveAllergens } from '@/utils/allergens';
import { GroupMember } from '@/types';

interface MenuProps {
  groupMembers: GroupMember[];
  onSelectCoffee: (coffeeId: string) => void;
  onSelectPastry: (pastryId: string) => void;
  onToggleFavorite: (type: 'coffee' | 'pastry', item: any, customizations?: any) => void;
  isItemFavorited: (type: 'coffee' | 'pastry', itemId: string, customizations?: any) => boolean;
  excludedAllergens: string[];
  onToggleAllergenFilter: (allergen: string) => void;
  onClearAllergenFilters: () => void;
}


// Word-start only matching function
const isWordStartMatch = (searchQuery: string, targetText: string): boolean => {
  if (!searchQuery.trim()) return true;
  
  const query = searchQuery.toLowerCase();
  const target = targetText.toLowerCase();
  
  // Split target into words and check if any word starts with the query
  const words = target.split(/\s+/);
  
  return words.some(word => word.startsWith(query));
};

export const Menu: React.FC<MenuProps> = ({ 
  groupMembers, 
  onSelectCoffee, 
  onSelectPastry,
  onToggleFavorite,
  isItemFavorited,
  excludedAllergens,
  onToggleAllergenFilter,
  onClearAllergenFilters
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'name' | 'description'>('name');
  const filterRef = useRef<HTMLDivElement>(null);

  // Click away to close filter
  useEffect(() => {
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
  }, [filtersOpen]);

  const handleFavoriteClick = (e: React.MouseEvent, type: 'coffee' | 'pastry', item: any) => {
    e.stopPropagation(); // Prevent card click
    onToggleFavorite(type, item);
  };

  // Get all group member allergens for filtering detected allergens
  const groupAllergens = useMemo(() => {
    const allergenSet = new Set<string>();
    groupMembers.forEach(member => {
      member.allergens.forEach(allergen => allergenSet.add(allergen));
    });
    return Array.from(allergenSet);
  }, [groupMembers]);

  // Get all unique allergens from both coffee and pastry menus (including detected ones)
  // Remove specific allergens from manual filter options
  const excludedFromManualFilter = ['Blueberries', 'Berries', 'Oranges', 'Walnuts', 'Sesame', 'Cinnamon'];
  
  const allAllergens = useMemo(() => {
    const allergenSet = new Set<string>();
    [...coffeeMenu, ...pastryMenu].forEach(item => {
      const comprehensiveAllergens = getComprehensiveAllergens(item);
      comprehensiveAllergens.forEach(allergen => {
        // Only add to manual filter options if not in excluded list
        if (!excludedFromManualFilter.includes(allergen)) {
          allergenSet.add(allergen);
        }
      });
    });
    return Array.from(allergenSet).sort();
  }, []);

  // Group-based allergens (yellow filters) - allergens that group members have
  const groupBasedAllergens = useMemo(() => {
    return groupAllergens.filter(allergen => !allAllergens.includes(allergen)).sort();
  }, [groupAllergens, allAllergens]);

  // Filter items based on search query and excluded allergens
  const filteredCoffeeMenu = useMemo(() => {
    let filtered = coffeeMenu;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      filtered = filtered.filter(coffee => {
        if (searchMode === 'name') {
          return isWordStartMatch(query, coffee.name);
        } else {
          return isWordStartMatch(query, coffee.description ? coffee.description : 'A delicious brew!');
        }
      });
    }

    // Apply allergen filter
    if (excludedAllergens.length > 0) {
      filtered = filtered.filter(coffee => {
        const comprehensiveAllergens = getComprehensiveAllergens(coffee);
        return !comprehensiveAllergens.some(allergen => excludedAllergens.includes(allergen));
      });
    }

    return filtered;
  }, [searchQuery, searchMode, excludedAllergens]);

  const filteredPastryMenu = useMemo(() => {
    let filtered = pastryMenu;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      filtered = filtered.filter(pastry => {
        if (searchMode === 'name') {
          return isWordStartMatch(query, pastry.name);
        } else {
          return isWordStartMatch(query, pastry.description ? pastry.description : 'A wonderful pastry!');
        }
      });
    }

    // Apply allergen filter
    if (excludedAllergens.length > 0) {
      filtered = filtered.filter(pastry => {
        const comprehensiveAllergens = getComprehensiveAllergens(pastry);
        return !comprehensiveAllergens.some(allergen => excludedAllergens.includes(allergen));
      });
    }

    return filtered;
  }, [searchQuery, searchMode, excludedAllergens]);

  // Count filtered items
  const filteredOutCount = (coffeeMenu.length - filteredCoffeeMenu.length) + (pastryMenu.length - filteredPastryMenu.length);

  // Function to render allergen tags with different styling for original vs detected
  const renderAllergenTags = (item: any) => {
    const originalAllergens = item.allergens || [];
    const comprehensiveAllergens = getComprehensiveAllergens(item);
    const detectedAllergens = comprehensiveAllergens.filter(allergen => !originalAllergens.includes(allergen));
    
    // Only show detected allergens that match group member allergies
    const relevantDetectedAllergens = detectedAllergens.filter(allergen => 
      groupAllergens.includes(allergen)
    );

    return (
      <div className="flex flex-wrap gap-2">
        {/* Original allergens */}
        {originalAllergens.map((allergen: string) => (
          <span key={`original-${allergen}`} className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {allergen}
          </span>
        ))}
        {/* Detected allergens with different styling - only if group member has that allergen */}
        {relevantDetectedAllergens.map((allergen: string) => (
          <Badge 
            key={`detected-${allergen}`} 
            variant="secondary" 
            className="text-xs bg-amber-100 text-amber-800 border-amber-200"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {allergen}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Bar with Mode Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Search by ${searchMode}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted"
            />
          </div>
          <Select value={searchMode} onValueChange={(value: 'name' | 'description') => setSearchMode(value)}>
            <SelectTrigger className="w-full sm:w-48 bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Search by Name</SelectItem>
              <SelectItem value="description">Search by Description</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Allergen Filter */}
        <div className="relative" ref={filterRef}>
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="justify-between bg-muted hover:bg-gray-50 transition-all min-w-60"
              >
                <div className="flex items-center gap-2 ">
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
                {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="absolute top-full right-0 mt-2 z-50">
              <Card className="w-96 bg-white border shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Exclude Items Containing:
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
                <CardContent className="space-y-6">
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
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <Tabs defaultValue="coffee" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="coffee" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CoffeeIcon className="h-5 w-5" />
            Coffee
          </TabsTrigger>
          <TabsTrigger value="pastries" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Cookie className="h-5 w-5" />
            Pastries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coffee" className="space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-primary">Artisan Coffee Selection</h2>
            <p className="text-muted-foreground mx-auto">
              Expertly crafted coffee drinks made with premium beans and endless customization options
            </p>
          </div>
          
          {filteredCoffeeMenu.length === 0 && (searchQuery || excludedAllergens.length > 0) && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg mb-2">
                {searchQuery ? `No coffee options match your ${searchMode} search` : 'No coffee options match your filters'}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {searchQuery && excludedAllergens.length > 0 
                  ? 'Try adjusting your search term or clearing your allergen filters'
                  : searchQuery 
                    ? 'Try different search terms or switch search mode'
                    : 'All coffee items contain one or more of your excluded allergens'
                }
              </div>
              <div className="flex gap-2 justify-center">
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
                {excludedAllergens.length > 0 && (
                  <Button variant="outline" onClick={onClearAllergenFilters}>
                    Clear Allergen Filters
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCoffeeMenu.map((coffee, index) => {
              const isFavorited = isItemFavorited('coffee', coffee.id);
              const comprehensiveAllergens = getComprehensiveAllergens(coffee);
              
              return (
                <Card 
                  key={coffee.id} 
                  className="coffee-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group bg-white/80 backdrop-blur-sm border border-white/20"
                  onClick={() => onSelectCoffee(coffee.id)}
                >
                  {/* Mobile Layout: Horizontal split */}
                  <div className="flex sm:hidden h-40">
                    {/* Image Container - Left Side (40%) */}
                    <div className="relative w-2/5 overflow-hidden">
                      <ImageWithFallback
                        src={coffee.image || '/coffee-icon.svg'}
                        alt={coffee.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-accent/20"
                          onClick={(e) => handleFavoriteClick(e, 'coffee', coffee)}
                        >
                          <Star 
                            className={`h-3 w-3 ${
                              isFavorited 
                                ? 'fill-accent text-accent' 
                                : 'text-muted-foreground hover:text-accent'
                            }`}
                          />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
                        ${coffee.price.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Content Container - Right Side (60%) */}
                    <div className="w-3/5 p-3 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-primary line-clamp-1">{coffee.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{coffee.description}</p>
                      </div>
                      
                      {comprehensiveAllergens.length > 0 && (
                        <div className="mt-2">
                          {renderAllergenTags(coffee)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tablet/Desktop Layout: Vertical */}
                  <div className="hidden sm:block">
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        src={coffee.image || '/coffee-icon.svg'}
                        alt={coffee.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-accent/20"
                          onClick={(e) => handleFavoriteClick(e, 'coffee', coffee)}
                        >
                          <Star 
                            className={`h-4 w-4 ${
                              isFavorited 
                                ? 'fill-accent text-accent' 
                                : 'text-muted-foreground hover:text-accent'
                            }`}
                          />
                        </Button>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm font-semibold shadow-md">
                        ${coffee.price.toFixed(2)}
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-primary">{coffee.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{coffee.description}</p>
                      </div>
                      
                      {comprehensiveAllergens.length > 0 && (
                        <div className="mt-3">
                          {renderAllergenTags(coffee)}
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="pastries" className="space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-primary">Fresh Baked Pastries</h2>
            <p className="text-muted-foreground mx-auto">
              Delicious pastries baked fresh daily with customizable options to suit your preferences
            </p>
          </div>
          
          {filteredPastryMenu.length === 0 && (searchQuery || excludedAllergens.length > 0) && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg mb-2">
                {searchQuery ? `No pastry options match your ${searchMode} search` : 'No pastry options match your filters'}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {searchQuery && excludedAllergens.length > 0 
                  ? 'Try adjusting your search term or clearing your allergen filters'
                  : searchQuery 
                    ? 'Try different search terms or switch search mode'
                    : 'All pastry items contain one or more of your excluded allergens'
                }
              </div>
              <div className="flex gap-2 justify-center">
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
                {excludedAllergens.length > 0 && (
                  <Button variant="outline" onClick={onClearAllergenFilters}>
                    Clear Allergen Filters
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPastryMenu.map((pastry, index) => {
              const isFavorited = isItemFavorited('pastry', pastry.id);
              const comprehensiveAllergens = getComprehensiveAllergens(pastry);
              
              return (
                <Card 
                  key={pastry.id} 
                  className="coffee-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group bg-white/80 backdrop-blur-sm border border-white/20"
                  onClick={() => onSelectPastry(pastry.id)}
                >
                  {/* Mobile Layout: Horizontal split */}
                  <div className="flex sm:hidden h-40">
                    {/* Image Container - Left Side (40%) */}
                    <div className="relative w-2/5 overflow-hidden">
                      <ImageWithFallback
                        src={pastry.image || '/coffee-icon.svg'}
                        alt={pastry.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-accent/20"
                          onClick={(e) => handleFavoriteClick(e, 'pastry', pastry)}
                        >
                          <Star 
                            className={`h-3 w-3 ${
                              isFavorited 
                                ? 'fill-accent text-accent' 
                                : 'text-muted-foreground hover:text-accent'
                            }`}
                          />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
                        ${pastry.price.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Content Container - Right Side (60%) */}
                    <div className="w-3/5 p-3 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-primary line-clamp-1">{pastry.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{pastry.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        {comprehensiveAllergens.length > 0 && renderAllergenTags(pastry)}
                        
                        {pastry.removableIngredients.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Customizable:</p>
                            <div className="flex flex-wrap gap-1">
                              {pastry.removableIngredients.slice(0, 2).map((ingredient: string) => (
                                <Badge key={ingredient} variant="secondary" className="text-xs px-1 py-0">
                                  {ingredient}
                                </Badge>
                              ))}
                              {pastry.removableIngredients.length > 2 && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  +{pastry.removableIngredients.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tablet/Desktop Layout: Vertical */}
                  <div className="hidden sm:block">
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        src={pastry.image || '/coffee-icon.svg'}
                        alt={pastry.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-accent/20"
                          onClick={(e) => handleFavoriteClick(e, 'pastry', pastry)}
                        >
                          <Star 
                            className={`h-4 w-4 ${
                              isFavorited 
                                ? 'fill-accent text-accent' 
                                : 'text-muted-foreground hover:text-accent'
                            }`}
                          />
                        </Button>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm font-semibold shadow-md">
                        ${pastry.price.toFixed(2)}
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl text-primary">{pastry.name}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-3">
                      <p className="text-muted-foreground text-sm line-clamp-2">{pastry.description}</p>
                      {comprehensiveAllergens.length > 0 && renderAllergenTags(pastry)}
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};