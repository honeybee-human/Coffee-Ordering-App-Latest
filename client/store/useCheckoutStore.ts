import { create } from '@/lib/zustand';
import { PaymentInfo } from '@/types';

interface CheckoutStore {
  paymentInfo: PaymentInfo;
  errors: { [key: string]: string };
  isProcessing: boolean;
  updatePaymentInfo: (field: string, value: string) => void;
  setErrors: (errors: { [key: string]: string }) => void;
  setError: (field: string, message: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  validateForm: () => boolean;
  resetCheckout: () => void;
  formatCardNumber: (value: string) => string;
  formatExpiryDate: (value: string) => string;
}

const initialPaymentInfo: PaymentInfo = {
  cardholderName: '',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  billingAddress: {
    street: '',
    city: '',
    state: '',
    zipCode: ''
  }
};

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  paymentInfo: initialPaymentInfo,
  errors: {},
  isProcessing: false,

  formatCardNumber: (value: string) => {
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
  },

  formatExpiryDate: (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  },

  updatePaymentInfo: (field, value) => set((state) => {
    const { formatCardNumber, formatExpiryDate } = get();
    
    // Apply formatting
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      value = formatExpiryDate(value);
    } else if (field === 'cvv') {
      value = value.replace(/[^0-9]/g, '').substring(0, 3);
    }

    // Clear error when user starts typing
    const newErrors = { ...state.errors };
    if (newErrors[field]) {
      delete newErrors[field];
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'billingAddress') {
        return {
          paymentInfo: {
            ...state.paymentInfo,
            billingAddress: {
              ...state.paymentInfo.billingAddress,
              [child]: value
            }
          },
          errors: newErrors
        };
      }
    }
    return {
      paymentInfo: {
        ...state.paymentInfo,
        [field]: value
      },
      errors: newErrors
    };
  }),

  validateForm: () => {
    const { paymentInfo } = get();
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

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  setErrors: (errors) => set({ errors }),

  setError: (field: string, message: string) => set((state) => ({
    errors: { ...state.errors, [field]: message }
  })),

  setIsProcessing: (isProcessing) => set({ isProcessing }),

  resetCheckout: () => set({
    paymentInfo: initialPaymentInfo,
    errors: {},
    isProcessing: false
  })
}));