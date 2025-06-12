import { useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Separator } from '@/ui/separator';
import { Badge } from '@/ui/badge';
import { Alert, AlertDescription } from '@/ui/alert';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { CheckoutForm } from '@/components/features/CheckoutForm';
import { CartItem, GroupMember, Order } from '@/types';
import { useCartSubtotal, useCartTax, useCartTotal, useActiveGroup } from '@/store/useAppStore';
import { useActiveGroupAllergenCount } from '@/store/useGroupAllergensStore';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import { calculateItemPrice } from '@/utils/cart-calculations';
import { v4 as uuidv4 } from 'uuid';

interface CheckoutPageProps {
  cartItems: CartItem[];
  groupMembers: GroupMember[];
  onBack: () => void;
  onOrderComplete: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems,
  groupMembers,
  onBack,
  onOrderComplete
}) => {
  // Use the checkout form hook to manage form state and validation
  const {
    paymentInfo,
    errors,
    isProcessing,
    setIsProcessing,
    handlePaymentInfoChange,
    validateForm,
    resetForm
  } = useCheckoutForm();

  // Use the centralized cart calculations from the store
  const subtotal = useCartSubtotal();
  const tax = useCartTax();
  const finalTotal = useCartTotal();

  // Get the active group and its allergen counts
  const activeGroup = useActiveGroup();
  const allergenCounts = useActiveGroupAllergenCount();
  
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
        // Use the errors object from the hook
        const newErrors = { ...errors, payment: 'Payment failed. Please try again.' };
        // We need to manually set this error since it's not a field error
        setIsProcessing(false);
        return;
      }

      const order: Order = {
        id: uuidv4(),
        items: cartItems,
        totalAmount: finalTotal.total,
        orderDate: new Date(),
        status: 'pending',
        groupMembers: groupMembers,
        estimatedTime: Math.floor(Math.random() * 10) + 5, // 5-15 minutes
        orderNumber: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        groupId: activeGroup?.id || '', // Use the active group ID
        paymentInfo: paymentInfo
      };

      onOrderComplete(order);
      resetForm(); // Reset the form after successful order
    } catch (error) {
      // Use the errors object from the hook
      const newErrors = { ...errors, payment: 'An error occurred during payment processing.' };
      // We need to manually set this error since it's not a field error
      setIsProcessing(false);
    }
  };

  const formatCustomizations = (item: CartItem): string => {
    if (item.type === 'coffee') {
      const custom = item.customizations as any;
      const parts: string[] = [];
      
      if (custom.milk !== 'Whole Milk') {
        parts.push(`${custom.milk}`);
      }
      
      if (custom.syrups.length > 0) {
        const syrupText = custom.syrups
          .map((s: any) => `${s.pumps} pump${s.pumps !== 1 ? 's' : ''} ${s.flavor}`)
          .join(', ');
        parts.push(syrupText);
      }
      
      return parts.join(', ');
    } else {
      const custom = item.customizations as any;
      if (custom.removedIngredients.length > 0) {
        return `No ${custom.removedIngredients.join(', ')}`;
      }
      return '';
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
            paymentInfo={paymentInfo}
            errors={errors}
            isProcessing={isProcessing}
            onPaymentInfoChange={handlePaymentInfoChange}
          />
          
          {/* Display allergen information if available */}
          {activeGroup && Object.keys(allergenCounts).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Group Allergen Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">Allergens in this group:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(allergenCounts).map(([allergen, count]) => (
                      <Badge key={allergen} variant="outline" className="text-xs">
                        {allergen} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item, index) => (
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
                        {formatCustomizations(item) && (
                          <p className="text-sm text-muted-foreground">
                            {formatCustomizations(item)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span>${(calculateItemPrice(item) * item.quantity).toFixed(2)}</span>
                  </div>
                  {index < cartItems.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}

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
                  <span>${finalTotal.total.toFixed(2)}</span>
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
                disabled={isProcessing}
                className="w-full" 
                size="lg"
              >
                {isProcessing ? (
                  <>Processing Payment...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Place Order - ${finalTotal.total.toFixed(2)}
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