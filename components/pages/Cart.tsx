import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Separator } from '@/ui/separator';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { GroupMember, CartItem, CoffeeCustomization, PastryCustomization } from '@/types';
import { combineIdenticalItems, getAllergenConflicts, groupAndCombineItems } from '@/utils/cart-helpers';
import { calculateItemPrice } from '@/utils/cart-calculations';
import CustomizationsList from '../shared/ListCustoms';
import { useCartTotal, useActiveGroup } from '@/store/useGroupsStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useNavigationStore } from '@/store/useNavigationStore';

interface CartProps {
  onNavigateToCheckout?: () => void;
}

export const Cart: React.FC<CartProps> = ({ onNavigateToCheckout }) => {
  const activeGroup = useActiveGroup();
  const cartTotal = useCartTotal();
  const { updateCartQuantity, removeFromCart, clearCart } = useGroupsStore();
  const { navigateToCoffeeDetail, navigateToPastryDetail } = useNavigationStore();

  const groupMembers = activeGroup?.members || [];
  const cartItems = activeGroup?.cart || [];

  const groupedItems = React.useMemo(() => {
    if (cartItems.length === 0) return {};
    return groupAndCombineItems(cartItems, groupMembers);
  }, [cartItems, groupMembers]);

  const handleQuantityUpdate = React.useCallback((itemId: string, newQuantity: number) => {
    if (!activeGroup) return;

    if (newQuantity <= 0) {
      removeFromCart(activeGroup.id, itemId);
    } else {
      updateCartQuantity(activeGroup.id, itemId, newQuantity);
    }
  }, [activeGroup, removeFromCart, updateCartQuantity]);

  const handleRemoveItem = React.useCallback((itemId: string) => {
    if (!activeGroup) return;
    removeFromCart(activeGroup.id, itemId);
  }, [activeGroup, removeFromCart]);

  const handleClearCart = React.useCallback(() => {
    if (!activeGroup) return;
    clearCart(activeGroup.id);
  }, [activeGroup, clearCart]);

  const handleEditCartItem = React.useCallback((item: CartItem) => {
    if (item.type === 'coffee' && 'syrups' in item.customizations) {
      navigateToCoffeeDetail(
        item.item.id,
        {
          ...item.customizations as CoffeeCustomization,
          assignedTo: item.assignedTo
        },
        (newCustomizations: CoffeeCustomization) => {
          if (!activeGroup) return;
          
          // Update the cart item with new customizations
          const updatedItem = {
            ...item,
            customizations: {
              syrups: newCustomizations.syrups,
              milk: newCustomizations.milk
            },
            assignedTo: newCustomizations.assignedTo
          };
          
          // Remove old item and add updated one
          removeFromCart(activeGroup.id, item.id);
          useGroupsStore.getState().addToCart(activeGroup.id, updatedItem);
        },
        'cart' // Return to cart after saving
      );
    } else if (item.type === 'pastry' && 'removedIngredients' in item.customizations) {
      navigateToPastryDetail(
        item.item.id,
        {
          ...item.customizations as PastryCustomization,
          assignedTo: item.assignedTo
        },
        (newCustomizations: PastryCustomization) => {
          if (!activeGroup) return;
          
          // Update the cart item with new customizations
          const updatedItem = {
            ...item,
            customizations: {
              removedIngredients: newCustomizations.removedIngredients
            },
            assignedTo: newCustomizations.assignedTo
          };
          
          // Remove old item and add updated one
          removeFromCart(activeGroup.id, item.id);
          useGroupsStore.getState().addToCart(activeGroup.id, updatedItem);
        },
        'cart' // Return to cart after saving
      );
    }
  }, [activeGroup, navigateToCoffeeDetail, navigateToPastryDetail, removeFromCart]);

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
        <Button variant="outline" onClick={handleClearCart} size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      {Object.entries(groupedItems).map(([personName, items]) => {
        if (items.length === 0) return null;

        return (
          <React.Fragment key={personName}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <h4 className="font-medium">{personName === 'unassigned' ? 'Unassigned Items' : personName}</h4>
              </div>

              {items.map((item) => {
                const { conflicts, affectedMembers } = getAllergenConflicts(item, groupMembers);
                const hasAllergenConflict = conflicts.length > 0;

                return (
                  <React.Fragment key={item.id}>
                    <div 
                      className="flex flex-wrap justify-between p-4 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors" 
                      onClick={() => handleEditCartItem(item)}
                    >
                      <div className="flex flex-wrap justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-4">
                            <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={item.item.image || '/coffee-icon.svg'}
                                alt={item.item.name}
                                className="w-full h-full object-cover" />
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
                              </div>
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

                      <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-lg">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </React.Fragment>
                );
              })}
            </div>
          </React.Fragment>
        );
      })}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3>Total:</h3>
          <h3>${cartTotal.toFixed(2)}</h3>
        </div>

        <Separator />
        
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
