import React, { useState, useMemo } from 'react';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { FavoriteCard } from '../shared/FavoriteCard';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useAllergensStore } from '@/store/useAllergensStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useModalsStore } from '@/store/useModalsStore';
import { AllergenFilter } from '../shared/AllergenFilter';
import { FavoriteItem, CoffeeCustomization, PastryCustomization } from '@/types';
import { getAllUniqueAllergens, getGroupBasedAllergens } from '@/utils/filter-utils';

export const FavoritesPage: React.FC = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const getGroupFavorites = useFavoritesStore(state => state.getGroupFavorites);
  const updateFavorite = useFavoritesStore(state => state.updateFavorite);
  const excludedAllergens = useAllergensStore(state => state.excludedAllergens);
  const toggleAllergenFilter = useAllergensStore(state => state.toggleAllergenFilter);
  const clearAllergenFilters = useAllergensStore(state => state.clearAllergenFilters);
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const { navigateToMenu, navigateToFavoriteDetail, navigateToCoffeeDetail, navigateToPastryDetail } = useNavigationStore();
  const { showAddToCartModal } = useModalsStore();

  const favorites = useMemo(() => {
    return activeGroup ? getGroupFavorites(activeGroup.id) : [];
  }, [activeGroup, getGroupFavorites]);

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
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  const handleEditFavorite = (favorite: FavoriteItem) => {
    // Navigate to the appropriate detail page with the current customizations
    if (favorite.type === 'coffee' && 'syrups' in favorite.customizations) {
      navigateToCoffeeDetail(
        favorite.item.id, 
        {
          ...favorite.customizations as CoffeeCustomization,
          assignedTo: favorite.assignedTo
        },
        (newCustomizations: CoffeeCustomization) => {
          // Only update if customizations or assignment has changed
          if (JSON.stringify(newCustomizations) !== JSON.stringify(favorite.customizations) ||
              newCustomizations.assignedTo !== favorite.assignedTo) {
            updateFavorite(favorite.id, {
              customizations: {
                syrups: newCustomizations.syrups,
                milk: newCustomizations.milk
              },
              assignedTo: newCustomizations.assignedTo
            });
          }
        }
      );
    } else if (favorite.type === 'pastry' && 'removedIngredients' in favorite.customizations) {
      navigateToPastryDetail(
        favorite.item.id, 
        {
          ...favorite.customizations as PastryCustomization,
          assignedTo: favorite.assignedTo
        },
        (newCustomizations: PastryCustomization) => {
          // Only update if customizations or assignment has changed
          if (JSON.stringify(newCustomizations) !== JSON.stringify(favorite.customizations) ||
              newCustomizations.assignedTo !== favorite.assignedTo) {
            updateFavorite(favorite.id, {
              customizations: {
                removedIngredients: newCustomizations.removedIngredients
              },
              assignedTo: newCustomizations.assignedTo
            });
          }
        }
      );
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
              onEdit={() => handleEditFavorite(fav)}
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