import React from 'react';
import { Plus, Trash2, Edit2, ShoppingCart } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { AllergenTag } from '@/components/shared/AllergenTag';
import { AllergenWarning } from '@/components/shared/AllergenWarning';
import { FavoriteItem, CartItem, GroupMember } from '@/types';
import { getComprehensiveAllergens } from '@/utils/allergens';
import { useFavoritesStore } from '@/store/useFavoritesStore';

interface FavoriteCardProps {
  favorite: FavoriteItem & { type: 'coffee' | 'pastry' };
  groupAllergens: string[];
  groupMembers: GroupMember[];
  onAddToCart: (item: CartItem) => void;
  onNavigateToDetail: (favorite: FavoriteItem) => void;
  onEdit: (favorite: FavoriteItem) => void;
  formatCustomizations: (favorite: FavoriteItem) => string;
}

export const FavoriteCard: React.FC<FavoriteCardProps> = ({
  favorite,
  groupAllergens,
  groupMembers = [],
  onAddToCart,
  onNavigateToDetail,
  onEdit,
  formatCustomizations
}) => {
  const comprehensiveAllergens = getComprehensiveAllergens(favorite.item);
  const removeFromFavorites = useFavoritesStore(state => state.removeFromFavorites);

  const hasAllergenConflict = comprehensiveAllergens.some(allergen => 
    groupAllergens.includes(allergen)
  );

  const customizationText = formatCustomizations(favorite);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: favorite.type,
      item: favorite.item,
      customizations: favorite.customizations,
      quantity: 1,
      assignedTo: favorite.assignedTo || undefined
    };
    onAddToCart(cartItem);
  };

  const handleRemoveFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    removeFromFavorites(favorite.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit(favorite);
  };

  return (
    <Card 
className="cursor-pointer rounded-lg border border-r-2 border-b-2 hover:border-[#964B00] hover:shadow-[2px_2px_0_0_#964B00] transition-all duration-0.5 overflow-hidden group !bg-transparent"
      onClick={() => onNavigateToDetail(favorite)}
    >
      {/* Mobile Layout: Horizontal split */}
      <div className="flex md:hidden h-40">
        {/* Image (Left 1/3) */}
        <div className="relative w-1/3 overflow-hidden">
          <ImageWithFallback
            src={favorite.item.image}
            alt={favorite.item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hasAllergenConflict && (
            <div className="absolute top-2 left-2">
              <AllergenWarning />
            </div>
          )}
        </div>

        {/* Text (Middle) */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-primary line-clamp-1">{favorite.item.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">${favorite.item.price.toFixed(2)}</p>
            {customizationText && (
              <div className="text-xs text-muted-foreground bg-gray-50 p-1 rounded mt-1">
                <pre className="whitespace-pre-wrap font-sans line-clamp-2">{customizationText}</pre>
              </div>
            )}
            {comprehensiveAllergens.length > 0 && (
              <div className="mt-1">
                <AllergenTag item={favorite.item} groupAllergens={groupAllergens} />
              </div>
            )}
          </div>
        </div>

        {/* Actions (Right) */}
        <div className="flex flex-col justify-between items-end p-3 w-20">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-accent/20"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-accent/20"
              onClick={handleEdit}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-50"
              onClick={handleRemoveFavorite}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tablet/Desktop Layout: Vertical */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden">
          <ImageWithFallback
            src={favorite.item.image}
            alt={favorite.item.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hasAllergenConflict && (
            <div className="absolute top-2 left-2">
              <AllergenWarning />
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm font-semibold shadow-md">
            ${favorite.item.price.toFixed(2)}
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-accent/20"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-3 w-3" />
              </Button>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-accent/20"
                onClick={handleEdit}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-50"
                onClick={handleRemoveFavorite}
              >
                <Trash2 className="h-3 w-3 text-red-600" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <h3 className="text-lg font-bold text-primary line-clamp-1">{favorite.item.name}</h3>
          {customizationText && (
            <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
              <pre className="whitespace-pre-wrap font-sans">{customizationText}</pre>
            </div>
          )}
          {comprehensiveAllergens.length > 0 && (
            <div className="mt-1">
              <AllergenTag item={favorite.item} groupAllergens={groupAllergens} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};