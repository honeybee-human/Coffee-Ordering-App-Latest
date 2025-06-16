// AddToCartModal.tsx - Refactored to use stores directly
import React from 'react';
import { CheckCircle, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { useModalsStore } from '@/store/useModalsStore';
import { useNavigationStore } from '@/store/useNavigationStore';

export const AddToCartModal: React.FC = () => {
  const { 
    modals: { addToCart }, 
    closeAddToCartModal 
  } = useModalsStore();
  
  const { navigateToCart } = useNavigationStore();

  const handleViewCart = () => {
    navigateToCart();
    closeAddToCartModal();
  };

  const handleContinueShopping = () => {
    closeAddToCartModal();
  };

  return (
    <Dialog open={addToCart.isOpen} onOpenChange={closeAddToCartModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Added to Cart!
          </DialogTitle>
          <DialogDescription>
            {addToCart.itemName && typeof addToCart.itemName === 'string' && addToCart.itemName.length > 0 
              ? addToCart.itemName[0].toUpperCase() + addToCart.itemName.substring(1) 
              : 'Item'} has been successfully added to your cart.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleContinueShopping}
              className="flex-1"
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={handleViewCart}
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};