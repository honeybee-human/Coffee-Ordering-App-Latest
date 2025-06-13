import React, { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/ui/button';
import { FavoriteCard } from '../shared/FavoriteCard';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useAllergensStore } from '@/store/useAllergensStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useModalsStore } from '@/store/useModalsStore';
import { AllergenFilter } from '../shared/AllergenFilter';
import { FavoriteItem } from '@/types';
import { getAllUniqueAllergens, getGroupBasedAllergens } from '@/utils/filter-utils';

export const FavoritesPage: React.FC = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const favorites = useFavoritesStore(state => state.favorites);
  const removeFromFavorites = useFavoritesStore(state => state.removeFromFavorites);
  const excludedAllergens = useAllergensStore(state => state.excludedAllergens);
  const toggleAllergenFilter = useAllergensStore(state => state.toggleAllergenFilter);
  const clearAllergenFilters = useAllergensStore(state => state.clearAllergenFilters);
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const { navigateToMenu, navigateToFavoriteDetail } = useNavigationStore();
  const { showAddToCartModal } = useModalsStore();

  const groupAllergens = useMemo(() => {
    const allergenSet = new Set<string>();
    activeGroup?.members.forEach(member => {
      member.allergens.forEach(allergen => allergenSet.add(allergen));
    });
    return Array.from(allergenSet);
  }, [activeGroup?.members]);

  const allAllergens = useMemo(() => {
    return getAllUniqueAllergens({ items: favorites.map(f => f.item) });
  }, [favorites]);

  const groupBasedAllergens = useMemo(() => {
    return getGroupBasedAllergens({
      groupAllergens,
      allAllergens
    });
  }, [groupAllergens, allAllergens]);

  const filteredFavorites = useMemo(() => {
    if (!excludedAllergens.length) return favorites;
    return favorites.filter(favorite =>
      !favorite.item.allergens?.some(allergen => excludedAllergens.includes(allergen))
    );
  }, [favorites, excludedAllergens]);

  const filteredOutCount = favorites.length - filteredFavorites.length;

  const handleAddToCart = (favorite: FavoriteItem) => {
    if (activeGroup) {
      const cartItem = {
        id: `favorite-${Date.now()}-${Math.random()}`,
        type: favorite.type,
        item: favorite.item,
        customizations: favorite.customizations,
        quantity: 1,
        assignedTo: favorite.assignedTo
      };
      useGroupsStore.getState().addToCart(activeGroup.id, cartItem);
      showAddToCartModal(favorite.item.name);
    }
  };

  return (
    <div className="px-4 pb-16">
      <div className="flex items-center gap-2 py-4">
        <Button variant="ghost" size="icon" onClick={navigateToMenu}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Favorites</h1>
      </div>

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

      {filteredFavorites.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No favorites match the selected filters.
        </div>
      ) : (
        <div className="grid gap-4 pt-4">
          {filteredFavorites.map(fav => (
            <FavoriteCard
              key={fav.id}
              favorite={fav}
              groupAllergens={groupAllergens}
              groupMembers={activeGroup?.members || []}
              onAddToCart={() => handleAddToCart(fav)}
              onNavigateToDetail={() => navigateToFavoriteDetail(fav)}
              formatCustomizations={(favorite) => {
                if (favorite.type === 'coffee') {
                  const customizations = favorite.customizations as any;
                  const parts = [];
                  
                  if (customizations.milk && customizations.milk !== 'Whole Milk') {
                    parts.push(`• ${customizations.milk}`);
                  }
                  
                  if (customizations.syrups?.length > 0) {
                    customizations.syrups.forEach((syrup: any) => {
                      parts.push(`• ${syrup.pumps} pump${syrup.pumps !== 1 ? 's' : ''} ${syrup.flavor}`);
                    });
                  }
                  
                  return parts.join('\n');
                } else {
                  const customizations = favorite.customizations as any;
                  if (customizations.removedIngredients?.length > 0) {
                    return customizations.removedIngredients.map((ingredient: string) => `• No ${ingredient}`).join('\n');
                  }
                  return '';
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};


