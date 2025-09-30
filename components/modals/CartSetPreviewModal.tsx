import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { ShoppingCart, Eye, X } from 'lucide-react';
import { CartSetFavorite, CartItem, CoffeeCustomization, PastryCustomization } from '@/types';
import { combineIdenticalItems } from '@/utils/cart-helpers';
import { calculateItemPrice } from '@/utils/cart-calculations';

interface CartSetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartSet: CartSetFavorite | null;
  onAddToCart: (cartSet: CartSetFavorite) => void;
}

const getCustomizationCount = (item: CartItem): number => {
  if (item.type === 'coffee') {
    const customizations = item.customizations as CoffeeCustomization;
    let count = 0;
    
    // Count milk customization (if not default)
    if (customizations.milk && customizations.milk !== 'Whole Milk') {
      count++;
    }
    
    // Count syrup customizations
    if (customizations.syrups && customizations.syrups.length > 0) {
      count += customizations.syrups.length;
    }
    
    return count;
  } else {
    const customizations = item.customizations as PastryCustomization;
    // Count removed ingredients
    return customizations.removedIngredients?.length || 0;
  }
};

const formatCustomizations = (item: CartItem): string => {
  if (item.type === 'coffee') {
    const customizations = item.customizations as CoffeeCustomization;
    const parts = [];
    
    if (customizations.milk && customizations.milk !== 'Whole Milk') {
      parts.push(customizations.milk);
    }
    
    if (customizations.syrups?.length > 0) {
      customizations.syrups.forEach((syrup) => {
        parts.push(`${syrup.pumps} pump${syrup.pumps !== 1 ? 's' : ''} ${syrup.flavor}`);
      });
    }
    
    return parts.join(', ');
  } else {
    const customizations = item.customizations as PastryCustomization;
    if (customizations.removedIngredients?.length > 0) {
      return `No ${customizations.removedIngredients.join(', ')}`;
    }
    return '';
  }
};

export const CartSetPreviewModal: React.FC<CartSetPreviewModalProps> = ({
  isOpen,
  onClose,
  cartSet,
  onAddToCart
}) => {
  if (!cartSet) return null;

  const combinedItems = combineIdenticalItems(cartSet.items);
  const totalItems = cartSet.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {cartSet.name}
          </DialogTitle>
          <DialogDescription>
            {totalItems} total items • ${cartSet.totalAmount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {combinedItems.map((item, index) => {
            const customizationCount = getCustomizationCount(item);
            const customizationText = formatCustomizations(item);
            const itemPrice = calculateItemPrice(item);
            
            return (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">
                          {item.quantity}x {item.item.name}
                        </h4>
                        {customizationCount > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-[1px]">
                            {customizationCount} customization{customizationCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      {customizationText && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {customizationText}
                        </p>
                      )}
                      
                      {item.assignedTo && (
                        <p className="text-sm text-muted-foreground">
                          Assigned to: {item.assignedTo}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">
                        ${(itemPrice * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${itemPrice.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <p className="text-lg font-semibold">
              Total: ${cartSet.totalAmount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {combinedItems.length} unique items, {totalItems} total items
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button onClick={() => {
              onAddToCart(cartSet);
              onClose();
            }}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};