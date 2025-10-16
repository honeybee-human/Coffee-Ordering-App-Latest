import { create } from 'zustand';
import { GroupMember } from '@/types';

interface ModalsStore {
  // State
  modals: {
    addToCart: { isOpen: boolean; itemName: string };
    orderComplete: { isOpen: boolean; orderNumber: string; estimatedTime: number };
    paymentComplete: { isOpen: boolean; orderNumber: string; estimatedTime: number };
    allergenWarning: { 
      isOpen: boolean; 
      allergens: string[]; 
      affectedMembers: GroupMember[]; 
      itemName: string;
      onProceed?: () => void;
    };
  };
  
  // Actions
  showAddToCartModal: (itemName: string) => void;
  closeAddToCartModal: () => void;
  showOrderCompleteModal: (orderNumber: string, estimatedTime: number) => void;
  closeOrderCompleteModal: () => void;
  showPaymentCompleteModal: (orderNumber: string, estimatedTime: number) => void;
  closePaymentCompleteModal: () => void;
  showAllergenWarning: (allergens: string[], affectedMembers: GroupMember[], itemName: string, onProceed: () => void) => void;
  closeAllergenWarning: () => void;
  closeAllergenWarningModal: () => void; // Added alias for backward compatibility
  proceedWithAllergen: () => void;
}

export const useModalsStore = create<ModalsStore>((set, get) => ({
  // Initial state
  modals: {
    addToCart: { isOpen: false, itemName: '' },
    orderComplete: { isOpen: false, orderNumber: '', estimatedTime: 0 },
    paymentComplete: { isOpen: false, orderNumber: '', estimatedTime: 0 },
    allergenWarning: { 
      isOpen: false, 
      allergens: [], 
      affectedMembers: [], 
      itemName: '',
      onProceed: undefined
    }
  },
  
  // Actions
  showAddToCartModal: (itemName: string) => {
    set((state) => ({
      modals: {
        ...state.modals,
        addToCart: { isOpen: true, itemName }
      }
    }));
  },

  closeAddToCartModal: () => {
    set((state) => ({
      modals: {
        ...state.modals,
        addToCart: { isOpen: false, itemName: '' }
      }
    }));
  },

  showOrderCompleteModal: (orderNumber: string, estimatedTime: number) => {
    set((state) => ({
      modals: {
        ...state.modals,
        orderComplete: { isOpen: true, orderNumber, estimatedTime }
      }
    }));
  },

  closeOrderCompleteModal: () => {
    set((state) => ({
      modals: {
        ...state.modals,
        orderComplete: { isOpen: false, orderNumber: '', estimatedTime: 0 }
      }
    }));
  },

  showPaymentCompleteModal: (orderNumber: string, estimatedTime: number) => {
    set((state) => ({
      modals: {
        ...state.modals,
        paymentComplete: { isOpen: true, orderNumber, estimatedTime }
      }
    }));
  },

  closePaymentCompleteModal: () => {
    set((state) => ({
      modals: {
        ...state.modals,
        paymentComplete: { isOpen: false, orderNumber: '', estimatedTime: 0 }
      }
    }));
  },

  showAllergenWarning: (allergens: string[], affectedMembers: GroupMember[], itemName: string, onProceed: () => void) => {
    set((state) => ({
      modals: {
        ...state.modals,
        allergenWarning: {
          isOpen: true,
          allergens,
          affectedMembers,
          itemName,
          onProceed
        }
      }
    }));
  },

  closeAllergenWarning: () => {
    set((state) => ({
      modals: {
        ...state.modals,
        allergenWarning: {
          isOpen: false,
          allergens: [],
          affectedMembers: [],
          itemName: '',
          onProceed: undefined
        }
      }
    }));
  },

  // Added alias for backward compatibility
  closeAllergenWarningModal: function() {
    return this.closeAllergenWarning();
  },

  proceedWithAllergen: () => {
    const { modals } = get();
    if (modals.allergenWarning.onProceed) {
      modals.allergenWarning.onProceed();
    }
    get().closeAllergenWarning();
  }
}));
