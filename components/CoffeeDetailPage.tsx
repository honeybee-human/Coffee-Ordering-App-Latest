import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Star, AlertTriangle, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CoffeeCustomizationComponent } from './CoffeeCustomization';
import { coffeeMenu } from '../data/menu';
import { coffeeImages } from './Menu';
import { CartItem, GroupMember, CoffeeCustomization as CoffeeCustomizationType } from '../types';
import { getComprehensiveAllergens } from '../utils/allergens';

interface CoffeeDetailPageProps {
  coffeeId: string;
  groupMembers: GroupMember[];
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
  onAllergenConflict: (allergens: string[], affectedMembers: string[], itemName: string, addCallback: () => void) => void;
  onToggleFavorite: (type: 'coffee' | 'pastry', item: any, customizations?: any) => void;
  isItemFavorited: (type: 'coffee' | 'pastry', itemId: string, customizations?: any) => boolean;
  initialCustomizations?: CoffeeCustomizationType;
}

export const CoffeeDetailPage: React.FC<CoffeeDetailPageProps> = ({
  coffeeId,
  groupMembers,
  onBack,
  onAddToCart,
  onAllergenConflict,
  onToggleFavorite,
  isItemFavorited,
  initialCustomizations
}) => {
  const coffee = coffeeMenu.find(c => c.id === coffeeId);
  const [customizations, setCustomizations] = useState<CoffeeCustomizationType>(
    initialCustomizations || {
      syrups: [],
      milk: 'Whole Milk'
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

  if (!coffee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Coffee not found</p>
        </div>
      </div>
    );
  }

  const coffeeIndex = coffeeMenu.findIndex(c => c.id === coffeeId);
  const imageUrl = coffeeImages[coffeeIndex % coffeeImages.length];
  
  const comprehensiveAllergens = getComprehensiveAllergens({
    ...coffee,
    allergens: coffee.allergens
  });

  const relevantDetectedAllergens = comprehensiveAllergens.filter(allergen => 
    !coffee.allergens.includes(allergen) && groupAllergens.includes(allergen)
  );

  const isFavorited = isItemFavorited('coffee', coffee.id, customizations);

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: `coffee-${Date.now()}-${Math.random()}`,
      type: 'coffee',
      item: coffee,
      customizations,
      quantity: 1
    };
    
    // Check for allergen conflicts
    const itemAllergens = comprehensiveAllergens;
    const affectedMemberNames = groupMembers
      .filter(member => member.allergens.some(allergen => itemAllergens.includes(allergen)))
      .map(member => member.name);
    
    if (affectedMemberNames.length > 0) {
      // If there are allergen conflicts, show the warning
      onAllergenConflict(itemAllergens, affectedMemberNames, coffee.name, () => {
        // This callback will be executed if the user proceeds despite the warning
        onAddToCart(cartItem);
      });
    } else {
      // No conflicts, add to cart directly
      onAddToCart(cartItem);
    }
  };

  const handleToggleFavorite = () => {
    onToggleFavorite('coffee', coffee, customizations);
  };

  // Fixed syrup pricing to $0.10 per pump
  const totalPrice = coffee.price + customizations.syrups.reduce((total, syrup) => total + (syrup.pumps * 0.10), 0);

  // Function to render allergen tags with the same styling as product cards
  const renderAllergenTags = () => {
    const originalAllergens = coffee.allergens || [];
    
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
              alt={coffee.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">{coffee.name}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{coffee.description}</p>
            </div>

            {/* Allergen Information - same style as product cards */}
            {(coffee.allergens.length > 0 || relevantDetectedAllergens.length > 0) && (
              <div className="pt-3">
                {renderAllergenTags()}
              </div>
            )}
          </div>
        </div>

        {/* Customization & Order */}
        <div className="space-y-6">
          {/* Direct customization without extra card wrapper */}
          <CoffeeCustomizationComponent
            customization={customizations}
            onChange={setCustomizations}
          />

          {/* Price & Add to Cart */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg">Total Price:</span>
                  <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
                
                {customizations.syrups.length > 0 && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Base price:</span>
                      <span>${coffee.price.toFixed(2)}</span>
                    </div>
                    {customizations.syrups.map((syrup, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{syrup.pumps} pump{syrup.pumps !== 1 ? 's' : ''} {syrup.flavor}:</span>
                        <span>+${(syrup.pumps * 0.10).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

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
                <span className="font-medium">{coffee.name}</span>
                <span>${coffee.price.toFixed(2)}</span>
              </div>
              
              {customizations.milk !== 'Whole Milk' && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>• {customizations.milk}</span>
                  <span>Included</span>
                </div>
              )}
              
              {customizations.syrups.map((syrup, index) => (
                <div key={index} className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>• {syrup.pumps} pump{syrup.pumps !== 1 ? 's' : ''} {syrup.flavor}</span>
                  <span>+${(syrup.pumps * 0.10).toFixed(2)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};