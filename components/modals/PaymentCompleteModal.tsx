import React from 'react';
import { CheckCircle, Clock, Coffee, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { useModalsStore } from '@/store/useModalsStore';
import { useNavigationStore } from '@/store/useNavigationStore';

export const PaymentCompleteModal: React.FC = () => {
  const { 
    modals: { paymentComplete }, 
    closePaymentCompleteModal 
  } = useModalsStore();
  
  const { navigateToOrderHistory, navigateToMenu } = useNavigationStore();

  const handleGoToOrderHistory = () => {
    navigateToOrderHistory();
    closePaymentCompleteModal();
  };

  const handleBackToMenu = () => {
    navigateToMenu();
    closePaymentCompleteModal();
  };

  return (
    <Dialog open={paymentComplete.isOpen} onOpenChange={closePaymentCompleteModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Payment Completed!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your payment has been processed successfully. Your order is now being prepared.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <div className="space-y-1">
              <p>Order Number: <span className="text-primary">{paymentComplete.orderNumber}</span></p>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Estimated time: {paymentComplete.estimatedTime} minutes
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-[1px] p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coffee className="h-5 w-5 text-primary" />
              <span className="font-medium">Your order is being prepared</span>
            </div>
            <p className="text-sm text-muted-foreground">
              We'll notify you when it's ready for pickup
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleGoToOrderHistory} className="w-full">
              View Order History
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button onClick={handleBackToMenu} variant="outline" className="w-full">
              Back to Menu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};