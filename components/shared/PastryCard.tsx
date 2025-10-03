import React from 'react';
import { useMemo, useCallback } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { AllergenTag } from '@/components/shared/AllergenTag';
import { Pastry } from '@/types';
import { getComprehensiveAllergens } from '@/utils/allergens';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useCurrentItemStore } from '@/store/useCurrentItemStore';
import { useModalsStore } from '@/store/useModalsStore';

interface PastryCardProps {
  pastry: Pastry;
  onSelect: (pastryId: string) => void;
  groupAllergens?: string[];
}

export const PastryCard: React.FC<PastryCardProps> = ({
  pastry,
  onSelect,
  groupAllergens = []
}) => {
  const comprehensiveAllergens = getComprehensiveAllergens(pastry);
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isItemFavorited = useFavoritesStore(state => state.isItemFavorited);
  const { showAllergenWarning } = useModalsStore();
  // Add favorites as dependency to force re-render when favorites change
  const favorites = useFavoritesStore(state => state.favorites);
  
  const isFavorited = useMemo(() => {
    return activeGroup ? isItemFavorited('pastry', pastry.id, activeGroup.id) : false;
  }, [activeGroup, isItemFavorited, pastry.id, favorites]);

  // Get group members from active group
  const groupMembers = useMemo(() => {
    return activeGroup?.members || [];
  }, [activeGroup]);

  // Get all allergens for this pastry item (original + detected)
  const allItemAllergens = useMemo(() => {
    // Deduplicate to prevent double-rendering on saved cards
    return Array.from(new Set([...pastry.allergens, ...comprehensiveAllergens]));
  }, [pastry.allergens, comprehensiveAllergens]);

  // Helper function to execute the favorite toggle
  const executeFavoriteToggle = useCallback(() => {
    if (activeGroup) {
      // Create pastry object with comprehensive allergens
      const pastryWithComprehensiveAllergens = {
        ...pastry,
        // Save deduplicated comprehensive allergens only
        allergens: comprehensiveAllergens
      };
      toggleFavorite('pastry', pastryWithComprehensiveAllergens, activeGroup.id);
    }
  }, [activeGroup, toggleFavorite, pastry, allItemAllergens]);

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
        pastry.name,
        executeFavoriteToggle
      );
    } else {
      executeFavoriteToggle();
    }
  }, [activeGroup, groupMembers, allItemAllergens, showAllergenWarning, pastry.name, executeFavoriteToggle]);

  const setCurrentItem = useCurrentItemStore(state => state.setCurrentItem);
  
  return (
    <Card 
className="cursor-pointer rounded-[1px] border border-r-2 border-b-2 hover:border-[#964B00] hover:shadow-[2px_2px_0_0_#964B00] transition-all duration-0.5 overflow-hidden group bg-white"
      onClick={() => {
        setCurrentItem('pastry', pastry);
        onSelect(pastry.id);
      }}
    >
      {/* Mobile Layout: Horizontal split (match CoffeeCard) */}
      <div className="flex md:hidden h-40">
        {/* Image (Left 1/3) */}
        <div className="relative w-1/3 overflow-hidden">
          <ImageWithFallback
            src={pastry.image || '/coffee-icon.svg'}
            alt={pastry.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Text (Middle) */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-primary line-clamp-1">{pastry.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{pastry.description}</p>
            {comprehensiveAllergens.length > 0 && (
              <div className="mt-2">
                <AllergenTag item={pastry} groupAllergens={groupAllergens} compact maxVisible={2} />
              </div>
            )}
          </div>
          {pastry.removableIngredients.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {pastry.removableIngredients.slice(0, 2).map(i => (
                <Badge key={i} variant="secondary" className="text-xs px-1 py-0">{i}</Badge>
              ))}
              {pastry.removableIngredients.length > 2 && (
                <span className="text-xs text-muted-foreground">+{pastry.removableIngredients.length - 2} more</span>
              )}
            </div>
          )}
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
            ${pastry.price.toFixed(2)}
          </div>
        </div>
      </div>

{/* Tablet/Desktop */}

      {/* Tablet/Desktop Layout: Vertical */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden">
          <ImageWithFallback
            src={pastry.image || '/coffee-icon.svg'}
            alt={pastry.name}
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
            ${pastry.price.toFixed(2)}
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <h3 className="text-lg font-bold text-primary line-clamp-1">{pastry.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{pastry.description}</p>
          {comprehensiveAllergens.length > 0 && (
            <div className="mt-2">
              <AllergenTag item={pastry} groupAllergens={groupAllergens} compact maxVisible={2} />
            </div>
          )}
          {pastry.removableIngredients.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Customizable:</p>
              <div className="flex flex-wrap gap-1 ">
                {pastry.removableIngredients.slice(0, 2).map((ingredient: string) => (
                  <Badge key={ingredient} variant="secondary" className="text-xs px-1 py-0">
                    {ingredient}
                  </Badge>
                ))}
                {pastry.removableIngredients.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{pastry.removableIngredients.length - 2} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};