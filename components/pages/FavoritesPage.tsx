import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft, Trash2, Plus, AlertTriangle, Filter, ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Input } from '@/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Checkbox } from '@/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { FavoriteItem, GroupMember, CartItem } from '@/types';
import { getComprehensiveAllergens } from '@/utils/allergens';

interface FavoritesPageProps {
  favorites: FavoriteItem[];
  groupMembers: GroupMember[];
  onBack: () => void;
  onRemoveFromFavorites: (favoriteId: string) => void;
  onAddToCart: (item: CartItem) => void;
  onNavigateToDetail: (favorite: FavoriteItem) => void;
  excludedAllergens: string[];
  onToggleAllergenFilter: (allergen: string) => void;
  onClearAllergenFilters: () => void;
}

// Word-start only matching function (same as in Menu component)
const isWordStartMatch = (searchQuery: string, targetText: string): boolean => {
  if (!searchQuery.trim()) return true;
  
  const query = searchQuery.toLowerCase();
  const target = targetText.toLowerCase();
  
  // Split target into words and check if any word starts with the query
  const words = target.split(/\s+/);
  
  return words.some(word => word.startsWith(query));
};

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  favorites,
  groupMembers,
  onBack,
  onRemoveFromFavorites,
  onAddToCart,
  onNavigateToDetail,
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

  // Get all group member allergens for filtering detected allergens
  const groupAllergens = useMemo(() => {
    const allergenSet = new Set<string>();
    groupMembers.forEach(member => {
      member.allergens.forEach(allergen => allergenSet.add(allergen));
    });
    return Array.from(allergenSet);
  }, [groupMembers]);

  // Get all unique allergens from favorites (including detected ones)
  // Remove specific allergens from manual filter options
  const excludedFromManualFilter = ['Blueberries', 'Berries', 'Oranges', 'Walnuts', 'Sesame', 'Cinnamon'];
  
  const allAllergens = useMemo(() => {
    const allergenSet = new Set<string>();
    favorites.forEach(favorite => {
      const comprehensiveAllergens = getComprehensiveAllergens(favorite.item);
      comprehensiveAllergens.forEach(allergen => {
        // Only add to manual filter options if not in excluded list
        if (!excludedFromManualFilter.includes(allergen)) {
          allergenSet.add(allergen);
        }
      });
    });
    return Array.from(allergenSet).sort();
  }, [favorites]);

  // Group-based allergens (yellow filters) - allergens that group members have
  const groupBasedAllergens = useMemo(() => {
    return groupAllergens.filter(allergen => !allAllergens.includes(allergen)).sort();
  }, [groupAllergens, allAllergens]);

  // Filter favorites based on search query and excluded allergens
  const filteredFavorites = useMemo(() => {
    let filtered = favorites;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      filtered = filtered.filter(favorite => {
        if (searchMode === 'name') {
          return isWordStartMatch(query, favorite.item.name);
        } else {
          return isWordStartMatch(query, favorite.item.description || '');
        }
      });
    }

    // Apply allergen filter
    if (excludedAllergens.length > 0) {
      filtered = filtered.filter(favorite => {
        const comprehensiveAllergens = getComprehensiveAllergens(favorite.item);
        return !comprehensiveAllergens.some(allergen => excludedAllergens.includes(allergen));
      });
    }

    return filtered;
  }, [favorites, searchQuery, searchMode, excludedAllergens]);

  // Count filtered items
  const filteredOutCount = favorites.length - filteredFavorites.length;

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

  const formatCustomizations = (favorite: FavoriteItem): string => {
    if (favorite.type === 'coffee') {
      const custom = favorite.customizations as any;
      const parts: string[] = [];
      
      if (custom.milk !== 'Whole Milk') {
        parts.push(`${custom.milk}`);
      }
      
      if (custom.syrups && custom.syrups.length > 0) {
        const syrupText = custom.syrups
          .map((s: any) => `${s.pumps} pump${s.pumps !== 1 ? 's' : ''} ${s.flavor}`)
          .join(', ');
        parts.push(syrupText);
      }
      
      return parts.join(', ');
    } else {
      const custom = favorite.customizations as any;
      if (custom.removedIngredients && custom.removedIngredients.length > 0) {
        return `No ${custom.removedIngredients.join(', ')}`;
      }
      return '';
    }
  };


  const handleAddToCart = (favorite: FavoriteItem) => {
    const cartItem: CartItem = {
      id: `favorite-${Date.now()}-${Math.random()}`,
      type: favorite.type,
      item: favorite.item,
      customizations: favorite.customizations,
      quantity: 1
    };
    onAddToCart(cartItem);
  };

  if (favorites.length === 0) {
    return (
      <div className="space-y-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg mb-2">No Favorites Yet</h3>
              <p className="text-muted-foreground mb-4">
                Items you mark as favorites will appear here for quick reordering.
              </p>
              <Button onClick={onBack}>Browse Menu</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Menu
      </Button>

      <div>
        <h2 className="text-xl mb-2">Your Favorites</h2>
        <p className="text-muted-foreground">
          {favorites.length} favorite item{favorites.length !== 1 ? 's' : ''}
          {filteredFavorites.length !== favorites.length && ` • ${filteredFavorites.length} shown`}
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Bar with Mode Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Search favorites by ${searchMode}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <Select value={searchMode} onValueChange={(value: 'name' | 'description') => setSearchMode(value)}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
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
                className="justify-between bg-white hover:bg-gray-50 transition-all border min-w-60"
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
                    <p className="mt-2">
                      Select allergens to hide all favorite items that contain them. Yellow allergens are specific to your group members&apos; allergies.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {filteredFavorites.length === 0 && (searchQuery || excludedAllergens.length > 0) && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">
            {searchQuery ? `No favorites match your ${searchMode} search` : 'No favorites match your filters'}
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            {searchQuery && excludedAllergens.length > 0 
              ? 'Try adjusting your search term or clearing your allergen filters'
              : searchQuery 
                ? 'Try different search terms or switch search mode'
                : 'Try clearing your allergen filters'
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
        {filteredFavorites.map((favorite, index) => {
          const comprehensiveAllergens = getComprehensiveAllergens(favorite.item);
          
          return (
            <Card 
              key={favorite.id} 
              className="coffee-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group cursor-pointer"
              onClick={() => onNavigateToDetail(favorite)}
            >
              {/* Mobile Layout: Horizontal split */}
              <div className="flex sm:hidden h-36">
                {/* Image Container - Left Side (40%) */}
                <div className="relative w-2/5 overflow-hidden">
                  <img
                    src={favorite.item.image}
                    alt={favorite.item.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-2 left-2 bg-primary/90 backdrop-blur-sm text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold">
                    ${favorite.item.price.toFixed(2)}
                  </div>
                </div>
                
                {/* Content Container - Right Side (60%) */}
                <div className="w-3/5 p-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-primary line-clamp-1">{favorite.item.name}</h3>
                    {formatCustomizations(favorite) && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Custom:</span> {formatCustomizations(favorite)}
                      </p>
                    )}
                    {comprehensiveAllergens.length > 0 && (
                      <div className="mt-1">
                        {renderAllergenTags(favorite.item)}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(favorite);
                      }}
                      className="flex-1 text-xs h-7"
                      size="sm"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromFavorites(favorite.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tablet/Desktop Layout: Vertical */}
              <div className="hidden sm:block">
                <div className="relative overflow-hidden">

                  <div className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full">
                    <span className="font-semibold">${favorite.item.price.toFixed(2)}</span>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-primary">{favorite.item.name}</CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  <div className="space-y-3">
                    {formatCustomizations(favorite) && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Customizations:</span> {formatCustomizations(favorite)}
                      </p>
                    )}
                    
                    {comprehensiveAllergens.length > 0 && renderAllergenTags(favorite.item)}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(favorite);
                      }}
                      className="flex-1"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromFavorites(favorite.id);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};