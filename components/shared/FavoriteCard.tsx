import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { AllergenTag } from '@/components/shared/AllergenTag';
import { FavoriteItem, CartItem, GroupMember } from '@/types';
import { getComprehensiveAllergens } from '@/utils/allergens';
import { GroupMemberAssignment } from '../features/GroupMemberAssignment';

interface FavoriteCardProps {
  favorite: FavoriteItem;
  groupAllergens: string[];
  groupMembers: GroupMember[];
  assignedTo?: string;
  onAssignToMember?: (favoriteId: string, memberName: string) => void;
  onAddToCart: (item: CartItem) => void;
  onRemoveFromFavorites: (favoriteId: string) => void;
  onNavigateToDetail: (favorite: FavoriteItem) => void;
  formatCustomizations: (favorite: FavoriteItem) => string;
}

export const FavoriteCard: React.FC<FavoriteCardProps> = ({
  favorite,
  groupAllergens,
  groupMembers = [],
  // assignedTo and onAssignToMember are no longer needed
  onAddToCart,
  onRemoveFromFavorites,
  onNavigateToDetail,
  formatCustomizations
}) => {
  const comprehensiveAllergens = getComprehensiveAllergens(favorite.item);
  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: `favorite-${Date.now()}-${Math.random()}`,
      type: favorite.type,
      item: favorite.item,
      customizations: favorite.customizations,
      quantity: 1,
      assignedTo: favorite.assignedTo || undefined
    };
    onAddToCart(cartItem);
  };
  return (
    <Card 
      className="coffee-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group cursor-pointer bg-white/80 backdrop-blur-sm border border-white/20 p-2 sm:p-3 max-w-xs sm:max-w-sm"
      onClick={() => onNavigateToDetail(favorite)}
    >
      {/* Mobile Layout: Horizontal split */}
      <div className="flex sm:hidden h-32">
        {/* Image Container - Left Side (40%) */}
        <div className="relative w-2/5 overflow-hidden">
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
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Custom:</span> {formatCustomizations(favorite)}
              </p>
            )}
            {favorite.assignedTo && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Assigned to:</span> {favorite.assignedTo}
              </p>
            )}
            {comprehensiveAllergens.length > 0 && (
              <div className="mt-1">
                <AllergenTag item={favorite.item} groupAllergens={groupAllergens} />
              </div>
            )}
          </div>
          <div className="flex gap-1 mt-1">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              className="flex-1 text-xs h-7"
              size="sm"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromFavorites(favorite.id);
              }}
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
            >
              <Trash2 className="h-3 w-3" />
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
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-primary">{favorite.item.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="space-y-2">
            {formatCustomizations(favorite) && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Customizations:</span> {formatCustomizations(favorite)}
              </p>
            )}
            {favorite.assignedTo && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Assigned to:</span> {favorite.assignedTo}
              </p>
            )}
            {comprehensiveAllergens.length > 0 && <AllergenTag item={favorite.item} groupAllergens={groupAllergens} />}
          </div>
          <div className="flex gap-2 mt-1">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              className="flex-1"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromFavorites(favorite.id);
              }}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};