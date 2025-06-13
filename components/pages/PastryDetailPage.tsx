import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Star, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';

import { CartItem, GroupMember, PastryCustomization as PastryCustomizationType, Pastry } from '@/types';
import { getComprehensiveAllergens } from '@/utils/allergens';

import { Group } from '@/types';
import { pastryMenu } from '@/data/menu';
import { GroupMemberAssignment } from '@/components/features/GroupMemberAssignment';
import { PastryCustomizationComponent } from '@/components/features/PastryCustomization';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { AllergenTag } from '@/components/shared/AllergenTag';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useModalsStore } from '@/store/useModalsStore';
import { useGroupMemberAssignmentStore } from '@/store/useGroupMemberAssignmentStore';

// Constants
const DEFAULT_CUSTOMIZATIONS: PastryCustomizationType = {
  removedIngredients: []
};

interface PastryDetailPageProps {
  pastryId: string;
  onBack: () => void;
}

// Custom hooks for better separation of concerns
const useSelectedGroup = () => {
  return useGroupsStore(state => {
    const activeGroupId = state.activeGroupId;
    return activeGroupId ? state.groups.find(g => g.id === activeGroupId) || null : null;
  });
};

const useGroupAllergens = (groupMembers: GroupMember[]) => {
  return useMemo(() => {
    const allergenSet = new Set<string>();
    groupMembers.forEach(member => {
      member.allergens?.forEach(allergen => allergenSet.add(allergen));
    });
    return Array.from(allergenSet);
  }, [groupMembers]);
};

// Component for pastry not found state
const PastryNotFound: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="space-y-6">
    <Button onClick={onBack} variant="outline">
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Menu
    </Button>
    <div className="text-center text-muted-foreground">
      Pastry not found
    </div>
  </div>
);

// Component for removable ingredients display
const RemovableIngredients: React.FC<{
  ingredients: string[];
  pastry: Pastry;
  groupAllergens: string[];
  relevantDetectedAllergens: string[];
}> = ({ ingredients, pastry, groupAllergens, relevantDetectedAllergens }) => (
  <div>
    <h2 className="text-lg font-semibold mb-3">Ingredients</h2>
    <p className="text-muted-foreground mb-3">
      The following ingredients can be removed from your pastry:
    </p>
    <div className="flex flex-wrap gap-2 mb-3">
      {ingredients.map((ingredient: string) => (
        <Badge 
          key={ingredient} 
          variant="outline" 
          className="text-xs"
        >
          {ingredient}
        </Badge>
      ))}
    </div>
    
    {/* Allergen Information */}
    {(pastry.allergens.length > 0 || relevantDetectedAllergens.length > 0) && (
      <div className="pt-3">
        <AllergenTag item={pastry} groupAllergens={groupAllergens} />
      </div>
    )}
  </div>
);

// Component for order summary
const OrderSummary: React.FC<{
  pastry: Pastry;
  customizations: PastryCustomizationType;
  selectedPerson?: string;
}> = ({ pastry, customizations, selectedPerson }) => (
  <div>
    <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
    
    <div className="flex justify-between items-center mb-3">
      <p>{pastry.name}</p>
      <p>${pastry.price.toFixed(2)}</p>
    </div>
    
    {customizations.removedIngredients.length > 0 && (
      <div className="pt-2 border-t border-border">
        <p className="text-sm font-medium text-muted-foreground mb-2">Removed ingredients:</p>
        <div className="space-y-1">
          {customizations.removedIngredients.map((ingredient, index) => (
            <div key={`removed-${ingredient}-${index}`} className="text-sm text-muted-foreground">
              • No {ingredient}
            </div>
          ))}
        </div>
      </div>
    )}

    {selectedPerson && selectedPerson !== "unassigned" && (
      <div className="pt-2 border-t border-border">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>• Assigned to:</span>
          <span>{selectedPerson}</span>
        </div>
      </div>
    )}
  </div>
);

export const PastryDetailPage: React.FC<PastryDetailPageProps> = ({ 
  pastryId, 
  onBack 
}) => {
  const pastry = useMemo(() => pastryMenu.find(p => p.id === pastryId), [pastryId]);
  
  const [customizations, setCustomizations] = useState<PastryCustomizationType>(DEFAULT_CUSTOMIZATIONS);
  const [showNoGroupModal, setShowNoGroupModal] = useState(false);
  
  // Store hooks
  const { selectedPerson, resetForNewItem } = useGroupMemberAssignmentStore();
  const selectedGroup = useSelectedGroup();
  const groupMembers = useMemo(() => selectedGroup?.members || [], [selectedGroup]);
  const groupAllergens = useGroupAllergens(groupMembers);
  
  const { addToCart } = useGroupsStore();
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isItemFavorited = useFavoritesStore(state => state.isItemFavorited);
  const { showAddToCartModal, showAllergenWarning } = useModalsStore();

  // Computed values
  const isFavorited = useMemo(() => 
    pastry && activeGroup ? isItemFavorited('pastry', pastry.id, activeGroup.id, customizations) : false,
    [isItemFavorited, pastry, activeGroup, customizations]
  );

  const comprehensiveAllergens = useMemo(() => 
    pastry ? getComprehensiveAllergens({ ...pastry, allergens: pastry.allergens }) : [],
    [pastry]
  );

  const relevantDetectedAllergens = useMemo(() => 
    pastry ? comprehensiveAllergens.filter(allergen => 
      !pastry.allergens.includes(allergen) && groupAllergens.includes(allergen)
    ) : [],
    [pastry, comprehensiveAllergens, groupAllergens]
  );

  const allItemAllergens = useMemo(() => 
    pastry ? [...pastry.allergens, ...comprehensiveAllergens] : [],
    [pastry, comprehensiveAllergens]
  );

  const hasRemovableIngredients = useMemo(() => 
    pastry?.removableIngredients && pastry.removableIngredients.length > 0,
    [pastry]
  );

  // Effects
  useEffect(() => {
    setCustomizations(DEFAULT_CUSTOMIZATIONS);
  }, [pastryId]);

  useEffect(() => {
    resetForNewItem(groupMembers);
  }, [pastryId, resetForNewItem, groupMembers]);

  // Event handlers
  const handleAddToCart = useCallback(() => {
    if (!pastry) return;

    if (!selectedGroup) {
      setShowNoGroupModal(true);
      return;
    }

    const cartItem: CartItem = {
      id: `pastry-${Date.now()}-${Math.random()}`,
      type: 'pastry',
      item: pastry,
      customizations,
      quantity: 1,
      assignedTo: (selectedPerson && selectedPerson !== "unassigned") ? selectedPerson : undefined
    };
    
    // Check for allergen conflicts
    const itemAllergens = getComprehensiveAllergens(pastry);
    const conflictingMembers: string[] = [];
    const conflictingAllergens: string[] = [];
    
    groupMembers.forEach(member => {
      if (member.allergens) {
        const memberConflicts = itemAllergens.filter(allergen => 
          member.allergens!.includes(allergen)
        );
        if (memberConflicts.length > 0) {
          conflictingMembers.push(member.name);
          conflictingAllergens.push(...memberConflicts);
        }
      }
    });
    
    if (conflictingAllergens.length > 0) {
      const uniqueAllergens = [...new Set(conflictingAllergens)];
      const affectedGroupMembers = groupMembers.filter(member => 
        conflictingMembers.includes(member.name)
      );
      
      showAllergenWarning(uniqueAllergens, affectedGroupMembers, pastry.name, () => {
        if (activeGroup) addToCart(activeGroup.id, cartItem);
        showAddToCartModal(pastry.name);
      });
    } else {
      if (activeGroup) addToCart(activeGroup.id, cartItem);
      showAddToCartModal(pastry.name);
    }
  }, [pastry, selectedGroup, customizations, selectedPerson, groupMembers, addToCart, showAddToCartModal, showAllergenWarning]);

  const handleToggleFavorite = useCallback(() => {
    if (!pastry || !activeGroup) return;
    toggleFavorite('pastry', pastry, activeGroup.id, customizations);
  }, [pastry, activeGroup, customizations, toggleFavorite]);

  // Early return for pastry not found
  if (!pastry) {
    return <PastryNotFound onBack={onBack} />;
  }

  const imageUrl = pastry.image || '/coffee-icon.svg';

  return (
    <div className="mx-auto space-y-6">
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Menu
      </Button>
      
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">{pastry.name}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">{pastry.description}</p>
        </div>
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
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Product Image & Basic Info */}
        <section className="space-y-6" aria-label="Product information">
          <div className="aspect-square rounded-2xl overflow-hidden max-w-xl mx-auto">
            <ImageWithFallback
              src={imageUrl}
              alt={pastry.name}
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Customization & Assignment */}
        <section className="space-y-6" aria-label="Customization options">
          <GroupMemberAssignment itemAllergens={allItemAllergens} />

          {/* Ingredients section */}
          {hasRemovableIngredients && (
            <RemovableIngredients
              ingredients={pastry.removableIngredients!}
              pastry={pastry}
              groupAllergens={groupAllergens}
              relevantDetectedAllergens={relevantDetectedAllergens}
            />
          )}

          {/* Customization component - only show if there are removable ingredients */}
          {hasRemovableIngredients && (
            <PastryCustomizationComponent
              pastry={pastry}
              customizations={customizations}
              setCustomizations={setCustomizations}
            />
          )}

          {/* Show allergen info separately if no removable ingredients */}
          {!hasRemovableIngredients && (pastry.allergens.length > 0 || relevantDetectedAllergens.length > 0) && (
            <div className="pt-3">
              <AllergenTag item={pastry} groupAllergens={groupAllergens} />
            </div>
          )}
        </section>

        {/* Order Summary & Add to Cart */}
        <section className="flex flex-col space-y-4" aria-label="Order summary">
          <OrderSummary
            pastry={pastry}
            customizations={customizations}
            selectedPerson={selectedPerson}
          />
          
          <Button 
            onClick={handleAddToCart}
            className="w-full"
            size="lg"
            aria-label={`Add ${pastry.name} to cart for $${pastry.price.toFixed(2)}`}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        </section>
      </div>
    </div>
  );
};