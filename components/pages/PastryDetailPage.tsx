import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Star, AlertTriangle, Plus } from 'lucide-react';
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

interface PastryDetailPageProps {
  pastry: Pastry;
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
  onToggleFavorite: (type: 'pastry', item: Pastry, customizations?: PastryCustomizationType) => void;
  onAllergenConflict: (allergens: string[], affectedMembers: string[], itemName: string, addCallback: () => void) => void;
  selectedGroup: Group | null;
  groupMembers: GroupMember[];
  isFavorited: boolean;
}

export const PastryDetailPage: React.FC<PastryDetailPageProps> = ({
  pastry,
  onBack,
  onAddToCart,
  onToggleFavorite,
  onAllergenConflict,
  selectedGroup,
  groupMembers,
  isFavorited,
}) => {
  const [customizations, setCustomizations] = useState<PastryCustomizationType>({
    removedIngredients: []
  });
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [showNoGroupModal, setShowNoGroupModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string>('');

  

  useEffect(() => {
    // Reset customizations when pastry changes
    setCustomizations({
      removedIngredients: []
    });
  }, [pastry]);

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

  const pastryIndex = pastryMenu.findIndex(p => p.id === pastry.id);
  const imageUrl = pastry.image || '/coffee-icon.svg';
  
  const comprehensiveAllergens = getComprehensiveAllergens({
    ...pastry,
    allergens: pastry.allergens
  });

  const relevantDetectedAllergens = comprehensiveAllergens.filter(allergen => 
    !pastry.allergens.includes(allergen) && groupAllergens.includes(allergen)
  );
  const allItemAllergens = [...pastry.allergens, ...comprehensiveAllergens];

  const handleAddToCart = () => {
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
      assignedTo: selectedMember || undefined
    };
    
    // Check for allergen conflicts
    const itemAllergens = comprehensiveAllergens;
    const affectedMemberNames = groupMembers
      .filter(member => member.allergens.some(allergen => itemAllergens.includes(allergen)))
      .map(member => member.name);
    
    if (affectedMemberNames.length > 0) {
      // If there are allergen conflicts, show the warning
      onAllergenConflict(itemAllergens, affectedMemberNames, pastry.name, () => {
        // This callback will be executed if the user proceeds despite the warning
        onAddToCart(cartItem);
      });
    } else {
      // No conflicts, add to cart directly
      onAddToCart(cartItem);
    }
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
    <div className="mx-auto space-y-6">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
      {/* Header */}
      <div className="flex items-center justify-between">

        <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">{pastry.name}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{pastry.description}</p>
            </div>
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
              alt={pastry.name}
              className="w-full h-full object-cover"
            />
          </div>
          

 
        </div>

        {/* Customization & Order */}
        <div className="space-y-6">
        <GroupMemberAssignment
            groupMembers={groupMembers}
            selectedPerson={selectedPerson}
            onPersonChange={setSelectedPerson}
            itemAllergens={allItemAllergens}
          />

 {/* Ingredients */}
 {pastry.removableIngredients && pastry.removableIngredients.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Ingredients</h2>
                {pastry.removableIngredients && pastry.removableIngredients.length > 0 && (
                  <>
                    <span className="text-muted-foreground mb-3">
                      The following ingredients can be removed from your pastry:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-3">
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
                  </>
                )}
                 
                {/* Allergen Information - same style as product cards */}
                {(pastry.allergens.length > 0 || relevantDetectedAllergens.length > 0) && (
                  <div className="pt-3">
                    {renderAllergenTags()}
                  </div>
                )}
                <div className="mt-4 pt-4"></div>
              </div>
            )}
          {/* Direct customization without extra card wrapper - only show if there are removable ingredients */}
          {pastry.removableIngredients && pastry.removableIngredients.length > 0 && (
            <PastryCustomizationComponent
              pastry={pastry}
              customization={customizations}
              onChange={setCustomizations}
            />
          )}

          {/* Order Summary */}
          
          
        </div>
        <div className='flex-col space-y-4'>
          <div>
            <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
            
            <div className="flex justify-between items-center">
              <p className="">{pastry.name}</p>
              <p>${pastry.price.toFixed(2)}</p>
            </div>
            
            {customizations.removedIngredients.length > 0 && (
              <div className="pt-2 mt-3 border-border border-t">
                <p className="text-sm font-medium text-muted-foreground mb-1">Removed ingredients:</p>
                {customizations.removedIngredients.map((ingredient, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • No {ingredient}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4"></div>
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