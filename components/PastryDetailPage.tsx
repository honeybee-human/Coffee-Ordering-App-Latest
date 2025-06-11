import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Star, AlertTriangle, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PastryCustomizationComponent } from './PastryCustomization';
import { pastryMenu } from '../data/menu';
import { pastryImages } from './Menu';
import { CartItem, GroupMember, PastryCustomization as PastryCustomizationType } from '../types';
import { getComprehensiveAllergens } from '../utils/allergens';

interface PastryDetailPageProps {
  pastryId: string;
  groupMembers: GroupMember[];
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
  onAllergenConflict: (allergens: string[], affectedMembers: string[], itemName: string, addCallback: () => void) => void;
  onToggleFavorite: (type: 'coffee' | 'pastry', item: any, customizations?: any) => void;
  isItemFavorited: (type: 'coffee' | 'pastry', itemId: string, customizations?: any) => boolean;
  initialCustomizations?: PastryCustomizationType;
}

export const PastryDetailPage: React.FC<PastryDetailPageProps> = ({
  pastryId,
  groupMembers,
  onBack,
  onAddToCart,
  onAllergenConflict,
  onToggleFavorite,
  isItemFavorited,
  initialCustomizations
}) => {
  const pastry = pastryMenu.find(p => p.id === pastryId);
  const [customizations, setCustomizations] = useState<PastryCustomizationType>(
    initialCustomizations || {
      removedIngredients: []
    }
  );

  useEffect(() => {
    if (initialCustomizations) {
      setCustomizations(initialCustomizations);
    }
  }, [initialCustomizations]);

  const groupAllergens = useMemo(() => {
    const allergenSet = new Set<string>();
    groupMembers.forEach(member => {
      member.allergens.forEach(allergen => allergenSet.add(allergen));
    });
    return Array.from(allergenSet);
  }, [groupMembers]);

  if (!pastry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Pastry not found</p>
        </div>
      </div>
    );
  }

  const pastryIndex = pastryMenu.findIndex(p => p.id === pastryId);
  const imageUrl = pastryImages[pastryIndex % pastryImages.length];
  
  const comprehensiveAllergens = getComprehensiveAllergens({
    ...pastry,
    allergens: pastry.allergens
  });

  const relevantDetectedAllergens = comprehensiveAllergens.filter(allergen => 
    !pastry.allergens.includes(allergen) && groupAllergens.includes(allergen)
  );

  const isFavorited = isItemFavorited('pastry', pastry.id, customizations);

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: `pastry-${Date.now()}-${Math.random()}`,
      type: 'pastry',
      item: pastry,
      customizations,
      quantity: 1
    };
    onAddToCart(cartItem);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite('pastry', pastry, customizations);
  };

  // Function to render allergen tags with the same styling as product cards
  const renderAllergenTags = () => {
    const originalAllergens = pastry.allergens || [];
    
    return (
      <div className="flex flex-wrap gap-2">
        {/* Original allergens */}
        {originalAllergens.map((allergen: string) => (
          <span key={`original-${allergen}`} className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {allergen}
          </span>
        ))}
        {/* Detected allergens with different styling - only if group member has that allergen */}
        {relevantDetectedAllergens.map((allergen: string) => (
          <Badge 
            key={`detected-${allergen}`} 
            variant="secondary" 
            className="text-xs bg-amber-100 text-amber-800 border-amber-200"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {allergen}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <Button
          variant="ghost"
          onClick={handleToggleFavorite}
          className="flex items-center gap-2"
        >
          <Star 
            className={`h-5 w-5 ${
              isFavorited 
                ? 'fill-accent text-accent' 
                : 'text-muted-foreground'
            }`}
          />
          {isFavorited ? 'Favorited' : 'Add to Favorites'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image & Basic Info */}
        <div className="space-y-6">
          <div className="aspect-square rounded-2xl overflow-hidden">
            <ImageWithFallback
              src={imageUrl}
              alt={pastry.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">{pastry.name}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{pastry.description}</p>
            </div>

            {/* Ingredients */}
            {pastry.ingredients && pastry.ingredients.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {pastry.ingredients.map((ingredient: string) => (
                      <Badge 
                        key={ingredient} 
                        variant="secondary" 
                        className={`text-xs ${
                          customizations.removedIngredients.includes(ingredient)
                            ? 'bg-muted text-muted-foreground line-through'
                            : ''
                        }`}
                      >
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Allergen Information - same style as product cards */}
            {(pastry.allergens.length > 0 || relevantDetectedAllergens.length > 0) && (
              <div className="pt-3">
                {renderAllergenTags()}
              </div>
            )}
          </div>
        </div>

        {/* Customization & Order */}
        <div className="space-y-6">
          {/* Direct customization without extra card wrapper - only show if there are removable ingredients */}
          {pastry.removableIngredients && pastry.removableIngredients.length > 0 && (
            <PastryCustomizationComponent
              pastry={pastry}
              customization={customizations}
              onChange={setCustomizations}
            />
          )}

          {/* Price & Add to Cart */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg">Price:</span>
                  <span className="text-2xl font-bold text-primary">${pastry.price.toFixed(2)}</span>
                </div>

                <Button 
                  onClick={handleAddToCart}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{pastry.name}</span>
                <span>${pastry.price.toFixed(2)}</span>
              </div>
              
              {customizations.removedIngredients.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Removed ingredients:</p>
                  {customizations.removedIngredients.map((ingredient, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • No {ingredient}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customization Options Info */}
          {pastry.removableIngredients && pastry.removableIngredients.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Customization Options</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  The following ingredients can be removed from your pastry:
                </p>
                <div className="flex flex-wrap gap-2">
                  {pastry.removableIngredients.map((ingredient: string) => (
                    <Badge 
                      key={ingredient} 
                      variant="outline" 
                      className="text-xs"
                    >
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};