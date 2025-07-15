import React, { useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Separator } from '@/ui/separator';
import { Badge } from '@/ui/badge';
import { Alert, AlertDescription } from '@/ui/alert';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { CheckoutForm } from '@/components/features/CheckoutForm';
import { CartItem, GroupMember, Order } from '@/types';
import { useCartSubtotal, useCartTax, useCartTotal, useActiveGroup } from '@/store/useGroupsStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useModalsStore } from '@/store/useModalsStore';
import { useOrdersStore } from '@/store/useOrdersStore';
import { calculateItemPrice } from '@/utils/cart-calculations';
import { v4 as uuidv4 } from 'uuid';
import { useAllergensStore } from '@/store/useAllergensStore';
import CustomizationsList from '../shared/ListCustoms';

interface CheckoutPageProps {
  cartItems: CartItem[];
  onBack: () => void;
  onOrderComplete: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems: propCartItems,
  onBack,
  onOrderComplete
}) => {
  const cartItems = propCartItems;
  // Use the checkout form hook to manage form state and validation
  const {
    paymentInfo,
    errors,
    isProcessing,
    setIsProcessing,
    validateForm,
    resetCheckout,
    setError
  } = useCheckoutStore();
  // Use the centralized cart calculations from the store
  const subtotal = useCartSubtotal();
  const tax = useCartTax();
  const finalTotal = useCartTotal();
  // Get the active group and its allergen counts
  const activeGroup = useActiveGroup();
  const allergenCounts = useAllergensStore();
  const groupMembers = activeGroup?.members || [];
  // Effect to check for allergen conflicts when component mounts
  useEffect(() => {
    if (activeGroup && cartItems.length > 0) {
      // This could be used to show warnings about allergen conflicts
      // before the user completes checkout
    }
  }, [activeGroup, cartItems]);

  const processPayment = async (): Promise<boolean> => {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        resolve(Math.random() > 0.1);
      }, 2000);
    });
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const paymentSuccess = await processPayment();
      
      if (!paymentSuccess) {
        // Properly set the payment error using the hook method
        setError('payment', 'Payment failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      const estimatedTime = Math.floor(Math.random() * 10) + 5; // 5-15 minutes
      const orderNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      const order: Order = {
        id: uuidv4(),
        items: cartItems,
        totalAmount: finalTotal,
        orderDate: new Date(),
        status: 'pending',
        groupMembers: groupMembers,
        estimatedTime: estimatedTime,
        orderNumber: orderNumber,
        groupId: activeGroup?.id || '', // Use the active group ID
        groupName: activeGroup?.name || '',
        paymentInfo: paymentInfo
      };
      // Add order to history
      useOrdersStore.getState().completeOrder(order);
      
      // Show payment complete modal
      useModalsStore.getState().showPaymentCompleteModal(orderNumber, estimatedTime);
      resetCheckout(); // Reset the form after successful order
      setIsProcessing(false);
    } catch (error) {
      // Properly set the payment error using the hook method
      setError('payment', 'An error occurred during payment processing.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CheckoutForm
          />
          

          {/* Display payment error if it exists */}
          {/* Display payment error if it exists */}
          {errors.payment && (
            <Alert variant="destructive">
              <AlertDescription>{errors.payment}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length > 0 ? cartItems.map((item, index) => (
                <div key={item.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 flex gap-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={item.item.image || '/coffee-icon.svg'}
                          alt={item.item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{item.item.name}</span>
                          {item.assignedTo && (
                            <Badge variant="outline" className="text-xs">
                              {item.assignedTo}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${calculateItemPrice(item).toFixed(2)} × {item.quantity}
                        </p>
                        <CustomizationsList item={item} />
                      </div>
                    </div>
                    <span>${(calculateItemPrice(item) * item.quantity).toFixed(2)}</span>
                  </div>
                  {index < cartItems.length - 1 && <Separator className="mt-4" />}
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-4">
                  No items in cart
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Estimated preparation time: 15-25 minutes
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSubmitOrder} 
                disabled={isProcessing || cartItems.length === 0}
                className="w-full" 
                size="lg"
              >
                {isProcessing ? (
                  <>Processing Payment...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 .totalw-4 mr-2" />
                    Place Order - ${finalTotal.toFixed(2)}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
