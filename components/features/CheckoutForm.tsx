import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Separator } from '@/ui/separator';
import { Alert, AlertDescription } from '@/ui/alert';
import { useCheckoutStore } from '@/store/useCheckoutStore';

export const CheckoutForm: React.FC = () => {
  const { paymentInfo, errors, isProcessing, updatePaymentInfo } = useCheckoutStore();

  const handleChange = (field: string, value: string) => {
    updatePaymentInfo(field, value);
  };

  return (
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
              onChange={(e) => handleChange('cardholderName', e.target.value)}
              placeholder="John Doe"
              className={errors.cardholderName ? 'border-destructive' : ''}
              disabled={isProcessing}
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
              onChange={(e) => handleChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={errors.cardNumber ? 'border-destructive' : ''}
              disabled={isProcessing}
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
                onChange={(e) => handleChange('expiryDate', e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                className={errors.expiryDate ? 'border-destructive' : ''}
                disabled={isProcessing}
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
                onChange={(e) => handleChange('cvv', e.target.value)}
                placeholder="123"
                maxLength={3}
                className={errors.cvv ? 'border-destructive' : ''}
                disabled={isProcessing}
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
              onChange={(e) => handleChange('billingAddress.street', e.target.value)}
              placeholder="123 Main St"
              className={errors.street ? 'border-destructive' : ''}
              disabled={isProcessing}
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
                onChange={(e) => handleChange('billingAddress.city', e.target.value)}
                placeholder="New York"
                className={errors.city ? 'border-destructive' : ''}
                disabled={isProcessing}
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
                onChange={(e) => handleChange('billingAddress.state', e.target.value)}
                placeholder="NY"
                className={errors.state ? 'border-destructive' : ''}
                disabled={isProcessing}
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
              onChange={(e) => handleChange('billingAddress.zipCode', e.target.value)}
              placeholder="10001"
              className={errors.zipCode ? 'border-destructive' : ''}
              disabled={isProcessing}
            />
            {errors.zipCode && (
              <p className="text-sm text-destructive mt-1">{errors.zipCode}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};