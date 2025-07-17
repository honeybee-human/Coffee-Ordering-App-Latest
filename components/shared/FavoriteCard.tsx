import React from 'react';
import { Plus, Trash2, Edit2, ShoppingCart } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { AllergenTag } from '@/components/shared/AllergenTag';
import { AllergenWarning } from '@/components/shared/AllergenWarning';
import { FavoriteItem, CartItem, GroupMember } from '@/types';
import { getComprehensiveAllergens } from '@/utils/allergens';
import { useFavoritesStore } from '@/store/useFavoritesStore';

interface FavoriteCardProps {
  favorite: FavoriteItem & { type: 'coffee' | 'pastry' }; // Exclude cart-set type
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

  // Check for allergen conflicts
  const hasAllergenConflict = comprehensiveAllergens.some(allergen => 
    groupAllergens.includes(allergen)
  );

  // Get customization text
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
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="relative">
        <ImageWithFallback
          src={favorite.item.image}
          alt={favorite.item.name}
          className="w-full h-32 object-cover"
        />
        {hasAllergenConflict && (
          <div className="absolute top-2 right-2">
            <AllergenWarning />
          </div>
        )}
      </div>
      
      <div className="p-3 space-y-2">
        <div>
          <h4 className="font-medium text-sm leading-tight">{favorite.item.name}</h4>
          <p className="text-xs text-muted-foreground">${favorite.item.price.toFixed(2)}</p>
        </div>
        
        {customizationText && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
            <pre className="whitespace-pre-wrap font-sans">{customizationText}</pre>
          </div>
        )}
        
        <div className="flex gap-1 pt-1">
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="flex-1 h-8 text-xs"
          >
            <ShoppingCart className="h-3 w-3 md:mr-1" />
            <span className="hidden md:inline">Add</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleEdit}
            className="flex-1 h-8 text-xs"
          >
            <Edit2 className="h-3 w-3 md:mr-1" />
            <span className="hidden md:inline">Edit</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRemoveFavorite}
            className="h-8 text-xs px-2"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};