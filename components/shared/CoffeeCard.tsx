import React from 'react';
import { useMemo, useCallback } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { AllergenTag } from '@/components/shared/AllergenTag';
import { Coffee } from '@/types';
import { getComprehensiveAllergens } from '@/utils/allergens';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useCurrentItemStore } from '@/store/useCurrentItemStore';
import { useModalsStore } from '@/store/useModalsStore';

interface CoffeeCardProps {
  coffee: Coffee;
  onSelect: (coffeeId: string) => void;
  groupAllergens?: string[];
}

export const CoffeeCard: React.FC<CoffeeCardProps> = ({
  coffee,
  onSelect,
  groupAllergens = []
}) => {
  const comprehensiveAllergens = getComprehensiveAllergens(coffee);
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isItemFavorited = useFavoritesStore(state => state.isItemFavorited);
  const { showAllergenWarning } = useModalsStore();
  // Add favorites as dependency to force re-render when favorites change
  const favorites = useFavoritesStore(state => state.favorites);
  
  const isFavorited = useMemo(() => {
    return activeGroup ? isItemFavorited('coffee', coffee.id, activeGroup.id) : false;
  }, [activeGroup, isItemFavorited, coffee.id, favorites]);

  // Get group members from active group
  const groupMembers = useMemo(() => {
    return activeGroup?.members || [];
  }, [activeGroup]);

  // Get all allergens for this coffee item (original + detected)
  const allItemAllergens = useMemo(() => {
    return [...coffee.allergens, ...comprehensiveAllergens];
  }, [coffee.allergens, comprehensiveAllergens]);

  // Create a coffee object with comprehensive allergens for the toggle function
  const coffeeWithComprehensiveAllergens = useMemo(() => ({
    ...coffee,
    allergens: allItemAllergens
  }), [coffee, allItemAllergens]);

  // Helper function to execute the favorite toggle
  const executeFavoriteToggle = useCallback(() => {
    if (activeGroup) {
      toggleFavorite('coffee', coffeeWithComprehensiveAllergens, activeGroup.id);
    }
  }, [activeGroup, toggleFavorite, coffeeWithComprehensiveAllergens]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeGroup) return;

    // Check for allergen conflicts
    const affectedMembers = groupMembers.filter(member => {
      if (!member.allergens) return false;
      return allItemAllergens.some(allergen => member.allergens.includes(allergen));
    });

    if (affectedMembers.length > 0) {
      showAllergenWarning(
        allItemAllergens,
        affectedMembers,
        coffee.name,
        executeFavoriteToggle
      );
    } else {
      executeFavoriteToggle();
    }
  }, [activeGroup, groupMembers, allItemAllergens, showAllergenWarning, coffee.name, executeFavoriteToggle]);

  const setCurrentItem = useCurrentItemStore(state => state.setCurrentItem);
  
  return (
    <Card 
className="cursor-pointer rounded-[1px] border border-r-2 border-b-2 hover:border-[#964B00] hover:shadow-[2px_2px_0_0_#964B00] transition-all duration-0.5 overflow-hidden group bg-transparent bg-white"
      onClick={() => {
        setCurrentItem('coffee', coffee);
        onSelect(coffee.id);
      }}
    >
{/* Mobile Layout: Horizontal split */}
<div className="flex md:hidden h-40">
  {/* Image (Left 1/3) */}
  <div className="relative w-1/3 overflow-hidden">
    <ImageWithFallback
      src={coffee.image || '/coffee-icon.svg'}
      alt={coffee.name}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  </div>

  {/* Text (Middle) */}
  <div className="flex-1 p-3 flex flex-col justify-between">
    <div>
      <h3 className="font-bold text-primary line-clamp-1">{coffee.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{coffee.description}</p>
      {comprehensiveAllergens.length > 0 && (
        <div className="mt-2">
          <AllergenTag item={coffee} groupAllergens={groupAllergens} />
        </div>
      )}
    </div>
  </div>

  {/* Price + Favorite (Right) */}
  <div className="flex flex-col justify-between items-end p-3 w-24">
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 hover:bg-accent/20"
      onClick={handleToggleFavorite}
    >
      <Star
        className={`h-3 w-3 transition-colors ${
          isFavorited
            ? 'fill-accent text-accent'
            : 'text-muted-foreground hover:text-accent'
        }`}
      />
    </Button>
    <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm font-semibold shadow-md">
      ${coffee.price.toFixed(2)}
    </div>
  </div>
</div>

      {/* Tablet/Desktop Layout: Vertical */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden">
          <ImageWithFallback
            src={coffee.image || '/coffee-icon.svg'}
            alt={coffee.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-accent/20"
              onClick={handleToggleFavorite}
            >
              <Star 
                className={`h-3 w-3 transition-colors ${
                  isFavorited 
                    ? 'fill-accent text-accent' 
                    : 'text-muted-foreground hover:text-accent'
                }`}
              />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-[1px] text-sm font-semibold shadow-md">
            ${coffee.price.toFixed(2)}
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <h3 className="text-lg font-bold text-primary line-clamp-1">{coffee.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{coffee.description}</p>
          {comprehensiveAllergens.length > 0 && (
            <div className="mt-2">
              <AllergenTag item={coffee} groupAllergens={groupAllergens} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};