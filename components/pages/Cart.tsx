import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, AlertTriangle, User, Save } from 'lucide-react';
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
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

interface CartProps {
  onNavigateToCheckout?: () => void;
}

export const Cart: React.FC<CartProps> = ({ onNavigateToCheckout }) => {
  const activeGroup = useActiveGroup();
  const cartTotal = useCartTotal();
  const { updateCartQuantity, removeFromCart, clearCart } = useGroupsStore();
  const { navigateToCoffeeDetail, navigateToPastryDetail } = useNavigationStore();
  const { addCartSetToFavorites } = useFavoritesStore();
  const [saveSetDialogOpen, setSaveSetDialogOpen] = useState(false);
  const [cartSetName, setCartSetName] = useState('');

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

  const handleSaveCartSet = () => {
    if (!activeGroup || !cartSetName.trim() || cartItems.length === 0) return;
    
    addCartSetToFavorites(cartSetName.trim(), cartItems, activeGroup.id);
    setCartSetName('');
    setSaveSetDialogOpen(false);
    // Show success message
  };

  if (cartItems.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="space-y-6 container mx-auto px-4 py-8">Cart</h1>

                <p className="text-muted-foreground text-center">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="">Cart</h1>
        <div className="flex gap-2">
          {cartItems.length > 0 && (
            <Dialog open={saveSetDialogOpen} onOpenChange={setSaveSetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Save as Set</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Cart as Favorite Set</DialogTitle>
                  <DialogDescription>
                    Give your cart set a personalized name (e.g., "My Workday Latte Set")
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="set-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="set-name"
                      value={cartSetName}
                      onChange={(e) => setCartSetName(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., My Workday Latte Set"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleSaveCartSet}
                    disabled={!cartSetName.trim()}
                  >
                    Save Set
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" onClick={handleClearCart}>
            <Trash2 className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Clear Cart</span>
          </Button>
        </div>
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
className="cursor-pointer rounded-lg border border-r-2 border-b-2 hover:border-[#964B00] hover:shadow-[2px_2px_0_0_#964B00] transition-all duration-0.5 overflow-hidden group !bg-transparent"
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
                            variant="ghost"
                            size="icon"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-lg">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-5 w-5" />
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
