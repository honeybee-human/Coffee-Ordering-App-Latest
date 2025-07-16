import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Separator } from '@/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { GroupMember, CartItem } from '@/types';
import { combineIdenticalItems, getAllergenConflicts, groupAndCombineItems } from '@/utils/cart-helpers';
import { calculateItemPrice } from '@/utils/cart-calculations';
import { GroupOrderContent } from '@/components/features/GroupOrderContent';
import { useCartTotal, useActiveGroup } from '@/store/useGroupsStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { formatCustomizations } from '@/utils/formatting-utils';
import CustomizationsList from '../shared/ListCustoms';

interface CartProps {
  onNavigateToCheckout?: () => void;
}

export const Cart: React.FC<CartProps> = ({ onNavigateToCheckout }) => {
  const activeGroup = useActiveGroup();
  const groupMembers = activeGroup?.members || [];
  const cartItems = activeGroup?.cart || [];
  const cartTotal = useCartTotal();
  const { updateCartQuantity, removeFromCart, clearCart } = useGroupsStore();


  if (cartItems.length === 0) {
    return (
      <div className="space-y-6">
        <h2>Shopping Cart</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3>Your cart is empty</h3>
                <p className="text-muted-foreground">Add some delicious items to get started!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group items by person
  const groupedItems = groupAndCombineItems(cartItems, groupMembers);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</h2>
        <Button variant="outline" onClick={() => activeGroup && clearCart(activeGroup.id)} size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      {/* <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">All Items</TabsTrigger>
          <TabsTrigger value="by-person">By Person</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6"> */}
          {/* Display items organized by person */}
          {Object.entries(groupedItems).map(([personName, items]) => {
            if (items.length === 0) return null;
            
            return (
              <div key={personName} className="space-y-4">
                {/* Person header */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <h4 className="font-medium">{personName === 'unassigned' ? 'Unassigned Items' : personName}</h4>
                </div>
                
                {/* Person's items */}
                {items.map((item) => {
                  const { conflicts, affectedMembers } = getAllergenConflicts(item, groupMembers);
                  const hasAllergenConflict = conflicts.length > 0;
                  
                  return (
                    <div key={item.id} className="p-4">
                      <div className="flex flex-wrap justify-between gap-4">
                        <div className="space-y-2 ">
                          <div className="flex items-start gap-4">
                            <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={item.item.image || '/coffee-icon.svg'}
                                alt={item.item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="flex items-center justify-between gap-2">
                                {item.item.name}
                                {hasAllergenConflict && (
                                  <AlertTriangle className="h-4 w-4 text-destructive" />
                                )}
                              </h4>
                              


                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg">
                              ${(calculateItemPrice(item) * item.quantity).toFixed(2)}
                                </span>
                                {/* <span className="text-sm text-muted-foreground">each</span> */}
                              </div>
                              
                            </div>


                              {hasAllergenConflict && (
                                <p className="text-sm text-destructive mt-2">
                                  ⚠️ Contains {conflicts.join(', ')} - affects {affectedMembers.join(', ')}
                                </p>
                              )}
                              
                          </div>
                          
                        </div>

<CustomizationsList item={item} />

                        <div className="flex flex-col items-end gap-2">


                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => activeGroup && updateCartQuantity(activeGroup.id, item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-lg">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => activeGroup && updateCartQuantity(activeGroup.id, item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>

                                                      <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => activeGroup && removeFromCart(activeGroup.id, item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          </div>
                          
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  );
                })}
              </div>
            );
          })}
        {/* </TabsContent>

        <TabsContent value="by-person">
          <GroupOrderContent />
        </TabsContent>
      </Tabs> */}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3>Total:</h3>
              <h3>${cartTotal.toFixed(2)}</h3>
            </div>

            <Separator />
            <br/>
            <Button 
              onClick={onNavigateToCheckout} 
              className="w-full text-lg" 
              size="lg"
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </Button>
          </div>
    </div>
  );
};