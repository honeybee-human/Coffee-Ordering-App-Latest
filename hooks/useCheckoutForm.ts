import { useState } from 'react';
import { PaymentInfo } from '@/types';

interface CheckoutFormErrors {
  [key: string]: string;
}

interface UseCheckoutFormReturn {
  paymentInfo: PaymentInfo;
  errors: CheckoutFormErrors;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  handlePaymentInfoChange: (field: string, value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
}

export const useCheckoutForm = (): UseCheckoutFormReturn => {
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
  const [errors, setErrors] = useState<CheckoutFormErrors>({});

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

  const validateForm = (): boolean => {
    const newErrors: CheckoutFormErrors = {};

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

  const resetForm = () => {
    setPaymentInfo({
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
    setErrors({});
    setIsProcessing(false);
  };

  return {
    paymentInfo,
    errors,
    isProcessing,
    setIsProcessing,
    handlePaymentInfoChange,
    validateForm,
    resetForm
  };
};