import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Separator } from '@/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { CartItem, GroupMember } from '@/types';
import { combineIdenticalItems } from '@/utils/cart-helpers';
import { GroupOrderContent } from '../features/GroupOrderContent';
interface CartProps {
  cartItems: CartItem[];
  groupMembers: GroupMember[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  getAllAllergens: (item: CartItem) => string[];
  groupName?: string;
}

export const Cart: React.FC<CartProps> = ({
  cartItems,
  groupMembers,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  getAllAllergens,
  groupName = 'Group'
}) => {
  // Helper function to check allergen conflicts for a cart item
  const getAllergenConflicts = (item: CartItem): { conflicts: string[]; affectedMembers: string[] } => {
    const itemAllergens = getAllAllergens(item);
    const affectedMembers: string[] = [];
    const conflicts: string[] = [];
    
    // Check each group member for allergen conflicts
    groupMembers.forEach(member => {
      const memberConflicts = itemAllergens.filter(allergen => 
        member.allergens.includes(allergen)
      );
      
      if (memberConflicts.length > 0) {
        affectedMembers.push(member.name);
        memberConflicts.forEach(conflict => {
          if (!conflicts.includes(conflict)) {
            conflicts.push(conflict);
          }
        });
      }
    });
    
    // If the item is assigned to a specific person, also check their conflicts
    if (item.assignedTo) {
      const person = groupMembers.find(member => member.name === item.assignedTo);
      if (person) {
        const personalConflicts = itemAllergens.filter(allergen => 
          person.allergens.includes(allergen)
        );
        personalConflicts.forEach(conflict => {
          if (!conflicts.includes(conflict)) {
            conflicts.push(conflict);
          }
        });
      }
    }
    
    return { conflicts, affectedMembers };
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      let itemPrice = item.item.price;
      
      // Add syrup costs for coffee items
      if (item.type === 'coffee') {
        const customizations = item.customizations as any;
        if (customizations.syrups && customizations.syrups.length > 0) {
          const syrupCost = customizations.syrups.reduce((cost: number, syrup: any) => 
            cost + (syrup.pumps * 0.10), 0
          );
          itemPrice += syrupCost;
        }
      }
      
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const formatCustomizations = (item: CartItem) => {
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
      
      return parts.length > 0 ? parts.join(', ') : 'No customizations';
    } else {
      const customizations = item.customizations as any;
      if (customizations.removedIngredients && customizations.removedIngredients.length > 0) {
        return `No ${customizations.removedIngredients.join(', ')}`;
      }
      return 'No customizations';
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</h2>
        <Button variant="outline" onClick={onClearCart} size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">All Items</TabsTrigger>
          <TabsTrigger value="by-person">By Person</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          {/* Combine identical items with the same customizations */}
          {combineIdenticalItems(cartItems).map((item) => {
            const { conflicts, affectedMembers } = getAllergenConflicts(item);
            const hasAllergenConflict = conflicts.length > 0;
            
            return (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <h4 className="flex items-center gap-2">
                            {item.item.name}
                            {hasAllergenConflict && (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCustomizations(item)}
                          </p>
                        </div>
                      </div>

                      {item.assignedTo && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          For: {item.assignedTo}
                        </div>
                      )}

                      {hasAllergenConflict && (
                        <p className="text-sm text-destructive">
                          ⚠️ Contains {conflicts.join(', ')} - affects {affectedMembers.join(', ')}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          ${(() => {
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
                            return itemPrice.toFixed(2);
                          })()}
                        </span>
                        <span className="text-sm text-muted-foreground">each</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <span>
                          ${(() => {
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
                            return (itemPrice * item.quantity).toFixed(2);
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="by-person">

          <GroupOrderContent
            cartItems={cartItems}
            groupMembers={groupMembers}
            getAllAllergens={getAllAllergens}
            groupName={groupName}
          />
        </TabsContent>
      </Tabs>

          <div className="space-y-4">
            <Separator />
            <div className="flex items-center justify-between text-lg">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <Button onClick={onCheckout} className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </div>
    </div>
  );
};