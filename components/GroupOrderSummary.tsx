import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CartItem, GroupMember } from '../types';
import { GroupOrderContent } from './GroupOrderContent';

interface GroupOrderSummaryProps {
  cartItems: CartItem[];
  groupMembers: GroupMember[];
  getAllAllergens: (item: CartItem) => string[];
}

export const GroupOrderSummary: React.FC<GroupOrderSummaryProps> = ({
  cartItems,
  groupMembers,
  getAllAllergens
}) => {
  if (cartItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Group Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <GroupOrderContent 
          cartItems={cartItems}
          groupMembers={groupMembers}
          getAllAllergens={getAllAllergens}
        />
      </CardContent>
    </Card>
  );
};