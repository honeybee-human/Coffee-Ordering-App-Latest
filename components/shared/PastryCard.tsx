import React from 'react';
import { useMemo } from 'react';
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
  // Add favorites as dependency to force re-render when favorites change
  const favorites = useFavoritesStore(state => state.favorites);
  
  const isFavorited = useMemo(() => {
    return activeGroup ? isItemFavorited('pastry', pastry.id, activeGroup.id) : false;
  }, [activeGroup, isItemFavorited, pastry.id, favorites]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeGroup) {
      toggleFavorite('pastry', pastry, activeGroup.id);
    }
  };
  const setCurrentItem = useCurrentItemStore(state => state.setCurrentItem);
  
  return (
    <Card 
      className="coffee-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group bg-white/80 backdrop-blur-sm border border-white/20"
      onClick={() => {
        setCurrentItem('pastry', pastry);
        onSelect(pastry.id);
      }}
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
            {comprehensiveAllergens.length > 0 && <AllergenTag item={pastry} groupAllergens={groupAllergens} />}
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
                    <span className="text-xs text-muted-foreground">+{pastry.removableIngredients.length - 2} more</span>
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
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
            ${pastry.price.toFixed(2)}
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <h3 className="text-lg font-bold text-primary line-clamp-1">{pastry.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{pastry.description}</p>
          {comprehensiveAllergens.length > 0 && (
            <div className="mt-2">
              <AllergenTag item={pastry} groupAllergens={groupAllergens} />
            </div>
          )}
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