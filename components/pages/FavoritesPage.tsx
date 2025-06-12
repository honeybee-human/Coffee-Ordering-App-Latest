import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { SearchBar } from '@/components/shared/SearchBar';
import { AllergenFilter } from '@/components/shared/AllergenFilter';
import { FavoriteCard } from '@/components/shared/FavoriteCard';
import { FavoriteAssignmentModal } from '@/components/features/FavoriteAssignmentModal';
import { FavoriteItem, GroupMember, CartItem, Group } from '@/types';
import { getComprehensiveAllergens } from '@/utils/allergens';
import { filterItems, getAllUniqueAllergens, getGroupBasedAllergens } from '@/utils/filter-utils';
import { useFavoritesStore } from '@/store/useFavoritesStore';

interface FavoritesPageProps {
  favorites: FavoriteItem[];
  groupMembers: GroupMember[];
  groups: Group[];
  onBack: () => void;
  onRemoveFromFavorites: (favoriteId: string) => void;
  onAddToCart: (item: CartItem) => void;
  onNavigateToDetail: (favorite: FavoriteItem) => void;
  excludedAllergens: string[];
  onToggleAllergenFilter: (allergen: string) => void;
  onClearAllergenFilters: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  favorites,
  groupMembers,
  groups,
  onBack,
  onRemoveFromFavorites,
  onAddToCart,
  onNavigateToDetail,
  excludedAllergens,
  onToggleAllergenFilter,
  onClearAllergenFilters
}) => {
  const { updateFavoriteAssignment } = useFavoritesStore();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'name' | 'description'>('name');
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteItem | null>(null);

  const handleAssignFavorite = (favorite: FavoriteItem) => {
    setSelectedFavorite(favorite);
    setAssignmentModalOpen(true);
  };

  // Get all group member allergens for filtering detected allergens
  const groupAllergens = useMemo(() => {
    const allergenSet = new Set<string>();
    groupMembers.forEach(member => {
      member.allergens.forEach(allergen => allergenSet.add(allergen));
    });
    return Array.from(allergenSet);
  }, [groupMembers]);

  // Get all unique allergens from favorites (including detected ones)
  const excludedFromManualFilter = ['Blueberries', 'Berries', 'Oranges', 'Walnuts', 'Sesame', 'Cinnamon'];
  
  const allAllergens = useMemo(() => {
    return getAllUniqueAllergens({
      items: favorites.map(favorite => favorite.item),
      excludedFromManualFilter
    });
  }, [favorites]);

  // Group-based allergens (yellow filters) - allergens that group members have
  const groupBasedAllergens = useMemo(() => {
    return getGroupBasedAllergens({
      groupAllergens,
      allAllergens
    });
  }, [groupAllergens, allAllergens]);

  // Filter favorites based on search query and excluded allergens
  const filteredFavorites = useMemo(() => {
    return filterItems({
      items: favorites.map(favorite => favorite.item),
      searchQuery,
      searchMode,
      excludedAllergens
    }).map(item => favorites.find(fav => fav.item === item)).filter(Boolean) as FavoriteItem[];
  }, [favorites, searchQuery, searchMode, excludedAllergens]);

  // Count filtered items
  const filteredOutCount = favorites.length - filteredFavorites.length;

  // Format customizations for display
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
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchMode={searchMode}
          onSearchModeChange={setSearchMode}
          placeholder={`Search favorites by ${searchMode}...`}
        />

        {/* Allergen Filter */}
        <AllergenFilter
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          excludedAllergens={excludedAllergens}
           onToggleAllergenFilter={onToggleAllergenFilter}
           onClearAllergenFilters={onClearAllergenFilters}
           allAllergens={allAllergens}
           groupBasedAllergens={groupBasedAllergens}
           filteredOutCount={filteredOutCount}
         />
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
        {filteredFavorites.map((favorite) => (
          <FavoriteCard
            key={favorite.id}
            favorite={favorite}
            groupAllergens={groupAllergens}
            onAddToCart={onAddToCart}
            onRemoveFromFavorites={onRemoveFromFavorites}
            onNavigateToDetail={onNavigateToDetail}
            onAssignToGroup={handleAssignFavorite}
            formatCustomizations={formatCustomizations}
          />
        ))}
      </div>
      
      <FavoriteAssignmentModal
        isOpen={assignmentModalOpen}
        onClose={() => {
          setAssignmentModalOpen(false);
          setSelectedFavorite(null);
        }}
        onConfirm={(assignedToGroup, assignedToMember) => {
          if (selectedFavorite) {
            updateFavoriteAssignment(selectedFavorite.id, assignedToGroup, assignedToMember);
          }
        }}
        groups={groups}
        favoriteItem={selectedFavorite || undefined}
      />
    </div>
  );
};