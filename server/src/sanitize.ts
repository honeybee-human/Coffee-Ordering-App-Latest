type PaymentInfo = {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  billingAddress?: Record<string, string>;
};

export function sanitizePaymentInfo(paymentInfo?: PaymentInfo | null) {
  if (!paymentInfo) return undefined;
  const digits = (paymentInfo.cardNumber || '').replace(/\s/g, '');
  const last4 = digits.slice(-4);
  return {
    cardNumber: last4 ? `************${last4}` : '',
    expiryDate: paymentInfo.expiryDate || '',
    cvv: '',
    cardholderName: paymentInfo.cardholderName || '',
    billingAddress: paymentInfo.billingAddress || {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  };
}

export function sanitizeOrder<T extends { paymentInfo?: PaymentInfo | null }>(order: T): T {
  return {
    ...order,
    paymentInfo: sanitizePaymentInfo(order.paymentInfo)
  };
}
