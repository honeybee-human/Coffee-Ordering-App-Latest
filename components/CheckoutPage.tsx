import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CartItem, GroupMember, PaymentInfo, Order } from '../types';
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
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const total = cartItems.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
  const tax = total * 0.08; // 8% tax
  const finalTotal = total + tax;

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!paymentInfo.cardholderName) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!paymentInfo.cardNumber || paymentInfo.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!paymentInfo.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
      newErrors.expiryDate = 'Please enter expiry date in MM/YY format';
    }

    if (!paymentInfo.cvv || paymentInfo.cvv.length !== 3) {
      newErrors.cvv = 'Please enter a valid 3-digit CVV';
    }

    if (!paymentInfo.billingAddress.street) {
      newErrors.street = 'Street address is required';
    }

    if (!paymentInfo.billingAddress.city) {
      newErrors.city = 'City is required';
    }

    if (!paymentInfo.billingAddress.state) {
      newErrors.state = 'State is required';
    }

    if (!paymentInfo.billingAddress.zipCode) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handlePaymentInfoChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      value = formatExpiryDate(value);
    } else if (field === 'cvv') {
      value = value.replace(/[^0-9]/g, '').substring(0, 3);
    }

    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1];
      setPaymentInfo(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value
        }
      }));
    } else {
      setPaymentInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

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
        setErrors({ payment: 'Payment failed. Please try again.' });
        setIsProcessing(false);
        return;
      }

      const order: Order = {
        id: uuidv4(),
        items: cartItems,
        totalAmount: finalTotal,
        orderDate: new Date(),
        status: 'pending',
        groupMembers: groupMembers,
        estimatedTime: Math.floor(Math.random() * 10) + 5, // 5-15 minutes
        orderNumber: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        groupId: '', // This will be set by the business logic
        paymentInfo: paymentInfo
      };

      onOrderComplete(order);
    } catch (error) {
      setErrors({ payment: 'An error occurred during payment processing.' });
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.payment && (
                <Alert className="border-destructive">
                  <AlertDescription>{errors.payment}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={paymentInfo.cardholderName}
                    onChange={(e) => handlePaymentInfoChange('cardholderName', e.target.value)}
                    placeholder="John Doe"
                    className={errors.cardholderName ? 'border-destructive' : ''}
                  />
                  {errors.cardholderName && (
                    <p className="text-sm text-destructive mt-1">{errors.cardholderName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => handlePaymentInfoChange('cardNumber', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={errors.cardNumber ? 'border-destructive' : ''}
                  />
                  {errors.cardNumber && (
                    <p className="text-sm text-destructive mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => handlePaymentInfoChange('expiryDate', e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={errors.expiryDate ? 'border-destructive' : ''}
                    />
                    {errors.expiryDate && (
                      <p className="text-sm text-destructive mt-1">{errors.expiryDate}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={paymentInfo.cvv}
                      onChange={(e) => handlePaymentInfoChange('cvv', e.target.value)}
                      placeholder="123"
                      maxLength={3}
                      className={errors.cvv ? 'border-destructive' : ''}
                    />
                    {errors.cvv && (
                      <p className="text-sm text-destructive mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4>Billing Address</h4>
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={paymentInfo.billingAddress.street}
                    onChange={(e) => handlePaymentInfoChange('billingAddress.street', e.target.value)}
                    placeholder="123 Main St"
                    className={errors.street ? 'border-destructive' : ''}
                  />
                  {errors.street && (
                    <p className="text-sm text-destructive mt-1">{errors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={paymentInfo.billingAddress.city}
                      onChange={(e) => handlePaymentInfoChange('billingAddress.city', e.target.value)}
                      placeholder="New York"
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={paymentInfo.billingAddress.state}
                      onChange={(e) => handlePaymentInfoChange('billingAddress.state', e.target.value)}
                      placeholder="NY"
                      className={errors.state ? 'border-destructive' : ''}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={paymentInfo.billingAddress.zipCode}
                    onChange={(e) => handlePaymentInfoChange('billingAddress.zipCode', e.target.value)}
                    placeholder="10001"
                    className={errors.zipCode ? 'border-destructive' : ''}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-destructive mt-1">{errors.zipCode}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{item.item.name}</span>
                        {item.assignedTo && (
                          <Badge variant="outline" className="text-xs">
                            {item.assignedTo}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${item.item.price.toFixed(2)} × {item.quantity}
                      </p>
                      {formatCustomizations(item) && (
                        <p className="text-sm text-muted-foreground">
                          {formatCustomizations(item)}
                        </p>
                      )}
                    </div>
                    <span>${(item.item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {index < cartItems.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
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
                disabled={isProcessing}
                className="w-full" 
                size="lg"
              >
                {isProcessing ? (
                  <>Processing Payment...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
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