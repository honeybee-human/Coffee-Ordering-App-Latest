import React from 'react';
import { User, Users, AlertTriangle } from 'lucide-react';
import { Badge } from '@/ui/badge';
import { Separator } from '@/ui/separator';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { CartItem, GroupMember } from '@/types';
import { groupAndCombineItems } from '@/utils/cart-helpers';

interface GroupOrderContentProps {
  cartItems: CartItem[];
  groupMembers: GroupMember[];
  getAllAllergens: (item: CartItem) => string[];
  groupName?: string;
}

export const GroupOrderContent: React.FC<GroupOrderContentProps> = ({
  cartItems,
  groupMembers,
  getAllAllergens,
  groupName = 'Group'
}) => {
  // Helper to get assigned person, defaulting to the only member if groupMembers.length === 1
  const getAssignedPerson = (item: CartItem): string | undefined => {
    if (item.assignedTo) return item.assignedTo;
    if (groupMembers.length === 1) return groupMembers[0].name;
    return undefined;
  };
  // Helper function to calculate item price including customizations
  const calculateItemPrice = (item: CartItem): number => {
    let itemPrice = item.item.price;
    
    if (item.type === 'coffee') {
      const customizations = item.customizations as any;
      if (customizations.syrups && customizations.syrups.length > 0) {
        const syrupCost = customizations.syrups.reduce((cost: number, syrup: any) => 
          cost + (syrup.pumps * 0.10), 0
        );
        itemPrice += syrupCost;
      }
    }
    
    return itemPrice;
  };

  // Group items by person and combine identical items
  const groupedItems = React.useMemo(() => {
    return groupAndCombineItems(cartItems, groupMembers);
  }, [cartItems, groupMembers]);

  // Calculate totals for each person
  const personTotals = React.useMemo(() => {
    const totals: { [key: string]: number } = {};
    
    Object.entries(groupedItems).forEach(([person, items]) => {
      totals[person] = items.reduce((total, item) => {
        const itemPrice = calculateItemPrice(item);
        return total + (itemPrice * item.quantity);
      }, 0);
    });
    
    return totals;
  }, [groupedItems]);

  // Helper function to check allergen conflicts for a person
  const getPersonAllergenConflicts = (items: CartItem[], person: string): string[] => {
    const member = groupMembers.find(m => m.name === person);
    if (!member) return [];
    
    const conflicts = new Set<string>();
    items.forEach(item => {
      const itemAllergens = getAllAllergens(item);
      itemAllergens.forEach(allergen => {
        if (member.allergens.includes(allergen)) {
          conflicts.add(allergen);
        }
      });
    });
    
    return Array.from(conflicts);
  };

  // Helper function to format customizations
  const formatCustomizations = (item: CartItem): string => {
    if (item.type === 'coffee') {
      const customizations = item.customizations as any;
      const parts = [];
      
      if (customizations.milk && customizations.milk !== 'Whole Milk') {
        parts.push(`${customizations.milk} milk`);
      }
      
      if (customizations.syrups && customizations.syrups.length > 0) {
        const syrupDescriptions = customizations.syrups.map((syrup: any) => 
          `${syrup.pumps} pump${syrup.pumps !== 1 ? 's' : ''} ${syrup.flavor}`
        );
        parts.push(...syrupDescriptions);
      }
      
      return parts.length > 0 ? parts.join(', ') : '';
    } else {
      const customizations = item.customizations as any;
      if (customizations.removedIngredients && customizations.removedIngredients.length > 0) {
        return `No ${customizations.removedIngredients.join(', ')}`;
      }
      return '';
    }
  };

  const totalOrder = Object.values(personTotals).reduce((sum, total) => sum + total, 0);

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
                <h2 className='mb-5'>{groupName} Order Summary</h2>
                <Separator/>
      {/* Group Members */}
      {groupMembers.map(member => {
        const memberItems = groupedItems[member.name] || [];
        const memberTotal = personTotals[member.name] || 0;
        const conflicts = getPersonAllergenConflicts(memberItems, member.name);
        // Use getAssignedPerson for assignment logic
        
        return (
          <div key={member.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{member.name}</span>
                {conflicts.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Allergen Warning
                  </Badge>
                )}
              </div>
              <span className="font-medium">${memberTotal.toFixed(2)}</span>
            </div>
            
            {memberItems.length > 0 ? (
              <div className="ml-6 space-y-2">
                {memberItems.map(item => {
                  const itemPrice = calculateItemPrice(item);
                  const customizations = formatCustomizations(item);
                  const assignedPerson = getAssignedPerson(item);
                  
                  return (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div className="flex-1 flex gap-2">
                        <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={item.item.image || '/coffee-icon.svg'}
                            alt={item.item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{item.quantity}x {item.item.name}</span>
                            {assignedPerson && (
                              <span className="ml-2 text-xs text-muted-foreground">For: {assignedPerson}</span>
                            )}
                          </div>
                          {customizations && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {customizations}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium ml-4">
                        ${(itemPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                
                {conflicts.length > 0 && (
                  <div className="text-xs text-destructive mt-2">
                    ⚠️ Allergen conflicts: {conflicts.join(', ')}
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-6 text-sm text-muted-foreground">
                No items ordered
              </div>
            )}
          </div>
        );
      })}

      {/* Unassigned Items */}
      {groupedItems.unassigned.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">Unassigned Items</span>
            </div>
            <span className="font-medium">${personTotals.unassigned.toFixed(2)}</span>
          </div>
          
          <div className="ml-6 space-y-2">
            {groupedItems.unassigned.map(item => {
              const itemPrice = calculateItemPrice(item);
              const customizations = formatCustomizations(item);
              
              return (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1 flex gap-2">
                    <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.item.image || '/coffee-icon.svg'}
                        alt={item.item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{item.quantity}x {item.item.name}</span>
                      </div>
                      {customizations && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {customizations}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium ml-4">
                    ${(itemPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};