// OrderCompleteModal.tsx - Refactored to use stores directly
import React from 'react';
import { CheckCircle, Clock, Coffee } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { useModalsStore } from '@/store/useModalsStore';
import { useNavigationStore } from '@/store/useNavigationStore';

export const OrderCompleteModal: React.FC = () => {
  const { 
    modals: { orderComplete }, 
    closeOrderCompleteModal 
  } = useModalsStore();
  
  const { navigateToOrderHistory } = useNavigationStore();

  const handleBackToMenu = () => {
    navigateToOrderHistory();
    closeOrderCompleteModal();
  };

  return (
    <Dialog open={orderComplete.isOpen} onOpenChange={closeOrderCompleteModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Order Confirmed!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your order has been placed successfully and is now being prepared. We'll notify you when it's ready for pickup.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <div className="space-y-1">
              <p>Order Number: <span className="text-primary">{orderComplete.orderNumber}</span></p>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Estimated time: {orderComplete.estimatedTime} minutes
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coffee className="h-5 w-5 text-primary" />
              <span>We'll notify you when your order is ready!</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Order Status: Preparing
            </Badge>
          </div>

          <Button onClick={handleBackToMenu} className="w-full">
            View Order History
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};