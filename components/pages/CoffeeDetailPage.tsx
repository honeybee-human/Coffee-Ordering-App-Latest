// CoffeeDetailPage.tsx - Updated with allergen warning for favorites
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Star, Plus } from 'lucide-react';
import { Button } from '@/ui/button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { CoffeeCustomizationComponent } from '@/components/features/CoffeeCustomization';
import { GroupMemberAssignment } from '@/components/features/GroupMemberAssignment';
import { AllergenTag } from '@/components/shared/AllergenTag';
import { coffeeMenu } from '@/data/menu';
import { CartItem, GroupMember, CoffeeCustomization as CoffeeCustomizationType } from '@/types';
import { getComprehensiveAllergens } from '@/utils/allergens';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useModalsStore } from '@/store/useModalsStore';
import { useGroupMemberAssignmentStore } from '@/store/useGroupMemberAssignmentStore';

export const CoffeeDetailPage: React.FC<{ 
  coffeeId: string; 
  onBack: () => void; 
  initialCustomizations?: CoffeeCustomizationType;
  onSave?: (customizations: CoffeeCustomizationType) => void;
}> = ({ coffeeId, onBack, initialCustomizations, onSave }) => {
  const coffee = coffeeMenu.find(c => c.id === coffeeId);
  const [customizations, setCustomizations] = useState<CoffeeCustomizationType>(
    initialCustomizations || {
      syrups: [],
      milk: 'Whole Milk'
    }
  );
  const { selectedPerson, resetForNewItem, setSelectedPerson } = useGroupMemberAssignmentStore();
  
  const groupMembers = useGroupsStore(state => {
    const activeGroupId = state.activeGroupId;
    return activeGroupId ? state.groups.find(g => g.id === activeGroupId)?.members || [] : [];
  });

  useEffect(() => {
    if (initialCustomizations) {
      setCustomizations(initialCustomizations);
      // Initialize assignment if it exists in customizations
      if ('assignedTo' in initialCustomizations) {
        setSelectedPerson(initialCustomizations.assignedTo || '');
      }
    } else {
      // Reset customizations when switching to a new coffee
      setCustomizations({
        syrups: [],
        milk: 'Whole Milk'
      });
    }
  }, [coffeeId, initialCustomizations, setSelectedPerson]);

  useEffect(() => {
    // Reset assignment when switching to a new coffee
    resetForNewItem(groupMembers);
  }, [coffeeId, resetForNewItem, groupMembers]);

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

  const { addToCart } = useGroupsStore();
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isItemFavorited = useFavoritesStore(state => state.isItemFavorited);
  const favorites = useFavoritesStore(state => state.favorites);
  const { showAddToCartModal, showAllergenWarning } = useModalsStore();
  
  const isFavorited = useMemo(() => {
    return activeGroup ? isItemFavorited('coffee', coffee.id, activeGroup.id, customizations, (selectedPerson && selectedPerson !== "unassigned") ? selectedPerson : undefined) : false;
  }, [activeGroup, isItemFavorited, coffee.id, customizations, selectedPerson, favorites]);

  // Helper function to execute the favorite toggle
  const executeFavoriteToggle = useCallback(() => {
    if (!coffee || !activeGroup) return;
    const assignedTo = (selectedPerson && selectedPerson !== "unassigned") ? selectedPerson : undefined;
    
    // Create coffee object with comprehensive allergens
    const coffeeWithComprehensiveAllergens = {
      ...coffee,
      allergens: allItemAllergens
    };
    
    toggleFavorite('coffee', coffeeWithComprehensiveAllergens, activeGroup.id, customizations, assignedTo);
  }, [coffee, activeGroup, customizations, selectedPerson, toggleFavorite, allItemAllergens]);

  const handleToggleFavorite = useCallback(() => {
    if (!coffee || !activeGroup) return;

    // Check for allergen conflicts
    const affectedMembers = groupMembers.filter(member => {
      if (!member.allergens) return false;
      return allItemAllergens.some(allergen => member.allergens.includes(allergen));
    });

    if (affectedMembers.length > 0) {
      showAllergenWarning(
        allItemAllergens,
        affectedMembers,
        coffee.name,
        executeFavoriteToggle
      );
    } else {
      executeFavoriteToggle();
    }
  }, [coffee, activeGroup, groupMembers, allItemAllergens, showAllergenWarning, executeFavoriteToggle]);

  const handleAddToCart = useCallback(() => {
    if (!coffee || !activeGroup) return;

    const cartItem: CartItem = {
      id: `coffee-${Date.now()}-${Math.random()}`,
      type: 'coffee',
      item: coffee,
      customizations,
      quantity: 1,
      assignedTo: (selectedPerson && selectedPerson !== "unassigned") ? selectedPerson : undefined
    };

    // Check for allergen conflicts
    const affectedMembers = groupMembers.filter(member => {
      if (!member.allergens) return false;
      return allItemAllergens.some(allergen => member.allergens.includes(allergen));
    });

    if (affectedMembers.length > 0) {
      showAllergenWarning(
        allItemAllergens,
        affectedMembers,
        coffee.name,
        () => {
          addToCart(activeGroup.id, cartItem);
          showAddToCartModal(coffee.name);
        }
      );
    } else {
      addToCart(activeGroup.id, cartItem);
      showAddToCartModal(coffee.name);
    }
  }, [coffee, activeGroup, customizations, selectedPerson, groupMembers, allItemAllergens, addToCart, showAddToCartModal, showAllergenWarning]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({
        ...customizations,
        assignedTo: (selectedPerson && selectedPerson !== "unassigned") ? selectedPerson : undefined
      });
      onBack();
    }
  }, [onSave, customizations, selectedPerson, onBack]);

  // Fixed syrup pricing to $0.10 per pump
  const totalPrice = coffee.price + customizations.syrups.reduce((total, syrup) => total + (syrup.pumps * 0.10), 0);

  return (
    <div className="mx-auto space-y-6">
      <Button onClick={onBack} variant="outline" className="flex items-center gap-2 hover:bg-primary hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Menu
      </Button>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">{coffee.name}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">{coffee.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {onSave && (
            <Button
              variant="default"
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              Save Changes
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleToggleFavorite}
            className="flex items-center gap-2"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
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
            itemAllergens={allItemAllergens}
          />

          {/* Direct customization without extra card wrapper */}
          <CoffeeCustomizationComponent
            customizations={customizations}
            setCustomizations={setCustomizations}
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