import React from 'react';
import { Plus, Trash2, Edit2, ShoppingCart } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { AllergenTag } from '@/components/shared/AllergenTag';
import { FavoriteItem, CartItem, GroupMember } from '@/types';
import { getComprehensiveAllergens } from '@/utils/allergens';
import { useFavoritesStore } from '@/store/useFavoritesStore';

interface FavoriteCardProps {
  favorite: FavoriteItem;
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
    // Use removeFromFavorites directly instead of toggleFavorite
    removeFromFavorites(favorite.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit(favorite);
  };

  return (
    <Card 
      className="coffee-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02]  group cursor-pointer bg-white/80 backdrop-blur-sm border border-white/20 p-2 sm:p-3"
      onClick={() => onNavigateToDetail(favorite)}
    >
      {/* Mobile Layout: Horizontal split */}
      <div className="flex sm:hidden">
        {/* Image Container - Left Side (40%) */}
        <div className="relative ">
          <ImageWithFallback
            src={favorite.item.image || '/coffee-icon.svg'}
            alt={favorite.item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
            ${favorite.item.price.toFixed(2)}
          </div>
        </div>
        {/* Content Container - Right Side (60%) */}
        <div className="w-3/5 p-2 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-primary line-clamp-1">{favorite.item.name}</h3>
            {formatCustomizations(favorite) && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Custom:</span>
                <div className="mt-1 whitespace-pre-line">{formatCustomizations(favorite)}</div>
              </div>
            )}

            {comprehensiveAllergens.length > 0 && (
              <div className="mt-1">
                <AllergenTag item={favorite.item} groupAllergens={groupAllergens} />
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              onClick={handleAddToCart}
              className="flex-1 text-xs h-7"
              size="lg"
            >
              <Plus className="h-3 w-3 mr-1" />
            </Button>
            <Button
              onClick={handleEdit}
              variant="outline"
              className="flex-1 text-xs h-7"
              size="lg"
            >
              <Edit2 className="h-3 w-3 mr-1" />
            </Button>
            <Button
              onClick={handleRemoveFavorite}
              variant="outline"
              className="flex-1 text-xs h-7"
              size="lg"
            >
              <Trash2 className="h-3 w-3 mr-1" />
            </Button>
          </div>
        </div>
      </div>
      {/* Tablet/Desktop Layout: Vertical */}
      <div className="hidden sm:block">
        <div className="relative overflow-hidden">
          <ImageWithFallback
            src={favorite.item.image || '/coffee-icon.svg'}
            alt={favorite.item.name}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full shadow-md">
            <span className="font-semibold">${favorite.item.price.toFixed(2)}</span>
          </div>
        </div>
        <CardHeader className="">
          <CardTitle className="text-base text-primary">{favorite.item.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
                    <div className="flex gap-2">
            <Button
              onClick={handleAddToCart}
              variant="default"
              size="sm"
            >
              <Plus className="" />
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleEdit}
              variant="outline"
              size="sm"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleRemoveFavorite}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {formatCustomizations(favorite) && (
              <div className="text-muted-foreground">
                <p className="text-sm font-medium">Customizations:</p>
                <div className="mt-1 whitespace-pre-line">{formatCustomizations(favorite)}</div>
              </div>
            )}
            {comprehensiveAllergens.length > 0 && <AllergenTag item={favorite.item} groupAllergens={groupAllergens} />}
          </div>

        </CardContent>
      </div>
    </Card>
  );
};