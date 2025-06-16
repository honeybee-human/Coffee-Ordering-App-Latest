import React, { useState, useMemo } from 'react';
import { Coffee as CoffeeIcon, Cookie, AlertTriangle } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { CoffeeCard } from '@/components/shared/CoffeeCard';
import { PastryCard } from '@/components/shared/PastryCard';
import { SearchBar } from '@/components/shared/SearchBar';
import { AllergenFilter } from '@/components/shared/AllergenFilter';
import { coffeeMenu, pastryMenu } from '@/data/menu';
import { getComprehensiveAllergens } from '@/utils/allergens';
import { filterItems, getAllUniqueAllergens, getGroupBasedAllergens } from '@/utils/filter-utils';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useAllergensStore } from '@/store/useAllergensStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useNavigationStore } from '@/store/useNavigationStore';

export const Menu: React.FC = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'name' | 'description'>('name');
  
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const groupMembers = useGroupsStore(state => {
    const activeGroupId = state.activeGroupId;
    return activeGroupId ? state.groups.find(g => g.id === activeGroupId)?.members || [] : [];
  });
  
  const { excludedAllergens, toggleAllergenFilter, clearAllergenFilters } = useAllergensStore();
  const { toggleFavorite, isItemFavorited } = useFavoritesStore();
  const { navigateToCoffeeDetail, navigateToPastryDetail } = useNavigationStore();

  const handleFavoriteClick = (e: React.MouseEvent, type: 'coffee' | 'pastry', item: any) => {
    e.stopPropagation(); // Prevent card click
    if (activeGroup) {
      toggleFavorite(type, item, activeGroup.id);
    }
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
  const excludedFromManualFilter = ['Blueberries', 'Berries', 'Oranges', 'Walnuts', 'Sesame', 'Cinnamon'];
  
  const allAllergens = useMemo(() => {
    return getAllUniqueAllergens({
      items: [...coffeeMenu, ...pastryMenu],
      excludedFromManualFilter
    });
  }, []);

  // Group-based allergens (yellow filters) - allergens that group members have
  const groupBasedAllergens = useMemo(() => {
    return getGroupBasedAllergens({
      groupAllergens,
      allAllergens
    });
  }, [groupAllergens, allAllergens]);

  // Filter items based on search query and excluded allergens
  const filteredCoffeeMenu = useMemo(() => {
    return filterItems({
      items: coffeeMenu,
      searchQuery,
      searchMode,
      excludedAllergens
    });
  }, [searchQuery, searchMode, excludedAllergens]);

  const filteredPastryMenu = useMemo(() => {
    return filterItems({
      items: pastryMenu,
      searchQuery,
      searchMode,
      excludedAllergens
    });
  }, [searchQuery, searchMode, excludedAllergens]);

  // Count filtered items
  const filteredOutCount = (coffeeMenu.length - filteredCoffeeMenu.length) + (pastryMenu.length - filteredPastryMenu.length);

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Bar with Mode Toggle */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchMode={searchMode}
          onSearchModeChange={setSearchMode}
        />

        {/* Allergen Filter */}
        <AllergenFilter
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          excludedAllergens={excludedAllergens}
          onToggleAllergenFilter={toggleAllergenFilter}
          onClearAllergenFilters={clearAllergenFilters}
          allAllergens={allAllergens}
          groupBasedAllergens={groupBasedAllergens}
          filteredOutCount={filteredOutCount}
        />
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
          <div className="text-center space-y-2 mb-8 mt-8">
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
                  <Button variant="outline" onClick={clearAllergenFilters}>
                    Clear Allergen Filters
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCoffeeMenu.map((coffee, index) => {
              return (
                <CoffeeCard
                  key={coffee.id}
                  coffee={coffee}
                  onSelect={navigateToCoffeeDetail}
                  groupAllergens={groupAllergens}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="pastries" className="space-y-6">
          <div className="text-center space-y-2 mb-8 mt-8">
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
                  <Button variant="outline" onClick={clearAllergenFilters}>
                    Clear Allergen Filters
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPastryMenu.map((pastry, index) => {
              return (
                <PastryCard
                  key={pastry.id}
                  pastry={pastry}
                  onSelect={navigateToPastryDetail}
                  groupAllergens={groupAllergens}
                />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};