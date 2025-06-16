import React from 'react';
import { CartItem } from '@/types';
import { Badge } from '@/ui/badge';
import { Separator } from '@/ui/separator';
import { AlertTriangle, User } from 'lucide-react';
import { calculateItemPrice } from '@/utils/cart-calculations';
import { 
  groupAndCombineItems, 
  getAssignedPerson, 
  getPersonAllergenConflicts, 
  calculatePersonTotals 
} from '@/utils/cart-helpers';
import { formatCustomizations } from '@/utils/formatting-utils';
import { useGroupsStore } from '@/store/useGroupsStore';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export const GroupOrderContent: React.FC = () => {
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const cartItems = activeGroup?.cart || [];

  if (!activeGroup) return null;

  const { groupMembers, groupName } = {
    groupMembers: activeGroup.members,
    groupName: activeGroup.name
  };

  // Group items by person and combine identical items
  const groupedItems = React.useMemo(() => {
    return groupAndCombineItems(cartItems, groupMembers);
  }, [cartItems, groupMembers]);

  // Calculate totals for each person
  const personTotals = React.useMemo(() => {
    return calculatePersonTotals(groupedItems);
  }, [groupedItems]);

  // Filter members who have assigned items
  const membersWithItems = React.useMemo(() => {
    return groupMembers.filter(member => {
      const memberItems = groupedItems[member.name] || [];
      return memberItems.length > 0;
    });
  }, [groupMembers, groupedItems]);

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-large">
      <h2 className='mb-5'>{groupName} Order Summary</h2>
      <Separator/>
      {/* Group Members - Only show members with assigned items */}
      {membersWithItems.map(member => {
        const memberItems = groupedItems[member.name] || [];
        const memberTotal = personTotals[member.name] || 0;
        const conflicts = getPersonAllergenConflicts(memberItems, member.name, groupMembers);
        
        return (
          <div key={member.name} className="space-y-3">
            <div className="flex-between">
              <div className="flex-center-gap">
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
            
            <div className="ml-6 space-y-small">
              {memberItems.map(item => {
                const itemPrice = calculateItemPrice(item);
                const customizations = formatCustomizations(item);
                const assignedPerson = getAssignedPerson(item, groupMembers);
                
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
                        <div className="flex-center-gap">
                          <span>{item.quantity}x {item.item.name}</span>
                          {assignedPerson && (
                            <span className="ml-2 text-xs text-muted-foreground">For: {assignedPerson}</span>
                          )}
                        </div>
                        {customizations && (
                          <div className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
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
          </div>
        );
      })}

      {/* Unassigned Items */}
      {groupedItems.unassigned.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <div className="flex-between">
            <div className="flex-center-gap">
              <span className="font-medium text-muted-foreground">Unassigned Items</span>
            </div>
            <span className="font-medium">${personTotals.unassigned.toFixed(2)}</span>
          </div>
          
          <div className="ml-6 space-y-small">
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
                      <div className="flex-center-gap">
                        <span>{item.quantity}x {item.item.name}</span>
                      </div>
                      {customizations && (
                        <div className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
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