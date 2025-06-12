import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { ImageWithFallback } from '@/components/imageFallBacks/ImageWithFallback';
import { AllergenTag } from '@/components/shared/AllergenTag';
import { Coffee } from '@/types';
import { getComprehensiveAllergens } from '@/utils/allergens';

interface CoffeeCardProps {
  coffee: Coffee;
  onSelect: (coffeeId: string) => void;
  onToggleFavorite: (e: React.MouseEvent, type: 'coffee', item: Coffee) => void;
  isFavorited: boolean;
  groupAllergens?: string[];
}

export const CoffeeCard: React.FC<CoffeeCardProps> = ({
  coffee,
  onSelect,
  onToggleFavorite,
  isFavorited,
  groupAllergens = []
}) => {
  const comprehensiveAllergens = getComprehensiveAllergens(coffee);
  
  return (
    <Card 
      className="coffee-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group bg-white/80 backdrop-blur-sm border border-white/20"
      onClick={() => onSelect(coffee.id)}
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
              onClick={(e) => onToggleFavorite(e, 'coffee', coffee)}
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
              <AllergenTag item={coffee} groupAllergens={groupAllergens} />
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
              onClick={(e) => onToggleFavorite(e, 'coffee', coffee)}
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
        
        <div className="p-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-primary">{coffee.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{coffee.description}</p>
          </div>
          
          {comprehensiveAllergens.length > 0 && (
            <div className="mt-3">
              <AllergenTag item={coffee} groupAllergens={groupAllergens} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};