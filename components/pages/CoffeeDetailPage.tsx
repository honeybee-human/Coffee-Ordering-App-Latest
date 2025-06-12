import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Star, Plus } from 'lucide-react';
import { Button } from '@/ui/button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { CoffeeCustomizationComponent } from '@/components/features/CoffeeCustomization';
import { GroupMemberAssignment } from '@/components/features/GroupMemberAssignment';
import { AllergenTag } from '@/components/shared/AllergenTag';
import { coffeeMenu } from '@/data/menu';
import { CartItem, GroupMember, CoffeeCustomization as CoffeeCustomizationType } from '@/types';
import { getComprehensiveAllergens } from '@/utils/allergens';

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
  const [selectedPerson, setSelectedPerson] = useState<string>('');

  useEffect(() => {
    if (initialCustomizations) {
      setCustomizations(initialCustomizations);
    }
  }, [initialCustomizations]);

  const groupAllergens = useMemo(() => {
    const allergenSet = new Set<string>();
    groupMembers.forEach(member => {
      if (member.allergens) {
        member.allergens.forEach(allergen => allergenSet.add(allergen));
      }
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

  const imageUrl = coffee.image || '/coffee-icon.svg';
  
  const comprehensiveAllergens = getComprehensiveAllergens({
    ...coffee,
    allergens: coffee.allergens
  });

  const relevantDetectedAllergens = comprehensiveAllergens.filter(allergen => 
    !coffee.allergens.includes(allergen) && groupAllergens.includes(allergen)
  );

  // Get all allergens for this coffee item (original + detected)
  const allItemAllergens = [...coffee.allergens, ...comprehensiveAllergens];

  const isFavorited = isItemFavorited('coffee', coffee.id, customizations);

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: `coffee-${Date.now()}-${Math.random()}`,
      type: 'coffee',
      item: coffee,
      customizations,
      quantity: 1,
      assignedTo: (selectedPerson && selectedPerson !== "unassigned") ? selectedPerson : undefined
    };
    onAddToCart(cartItem);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite('coffee', coffee, customizations);
  };

  // Fixed syrup pricing to $0.10 per pump
  const totalPrice = coffee.price + customizations.syrups.reduce((total, syrup) => total + (syrup.pumps * 0.10), 0);



  return (
    <div className="mx-auto space-y-6">
       <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
      {/* Header */}
      <div className="flex items-center justify-between">
 
              <div>
              <h1 className="text-3xl font-bold text-primary mb-2">{coffee.name}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{coffee.description}</p>
            </div>
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Product Image & Basic Info */}
        <div className="space-y-6">
          <div className="aspect-square rounded-2xl overflow-hidden max-w-xl mx-auto">
            <ImageWithFallback
              src={imageUrl}
              alt={coffee.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-4">
 

            {/* Allergen Information - same style as product cards */}
            {(coffee.allergens.length > 0 || relevantDetectedAllergens.length > 0) && (
              <div className="pt-3">
                <AllergenTag item={coffee} groupAllergens={groupAllergens} />
              </div>
            )}
          </div>
          
          
        </div>

        {/* Customization & Order */}
        <div className="space-y-6">
 

                          {/* Person Assignment using the new component */}
          <GroupMemberAssignment
            groupMembers={groupMembers}
            selectedPerson={selectedPerson}
            onPersonChange={setSelectedPerson}
            itemAllergens={allItemAllergens}
          />

          {/* Direct customization without extra card wrapper */}
          <CoffeeCustomizationComponent
            customization={customizations}
            onChange={setCustomizations}
          />



        </div>

        <div className='flex-col space-y-5'>
          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
            <div className="text-sm font-medium">
              Total: ${totalPrice.toFixed(2)}
            </div>
            <div className="text-sm flex justify-between items-center">
              <div>{coffee.name}</div>
              <div>${coffee.price.toFixed(2)}</div>
            </div>
              
              {customizations.milk !== 'Whole Milk' && (
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-2 border-t border-border">
                  <span>• {customizations.milk}</span>
                  <span>Included</span>
                </div>
              )}
              
              {customizations.syrups.map((syrup, index) => (
                <div key={index} className="flex justify-between items-center text-sm text-muted-foreground mt-2 border-t border-border">
                  <span>• {syrup.pumps} pump{syrup.pumps !== 1 ? 's' : ''} {syrup.flavor}</span>
                  <span>+${(syrup.pumps * 0.10).toFixed(2)}</span>
                </div>
              ))}

              {selectedPerson && selectedPerson !== "unassigned" && (
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>• Assigned to:</span>
                    <span>{selectedPerson}</span>
                  </div>
                </div>
              )}
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
      </div>
    </div>
  );
};