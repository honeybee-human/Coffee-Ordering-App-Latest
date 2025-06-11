import { create } from 'zustand';
import { ModalState } from '../types';

interface ModalsStore {
  // State
  modals: ModalState;
  
  // Actions
  showAddToCartModal: (itemId: string, itemType: 'coffee' | 'pastry', customizations?: any) => void;
  closeAddToCartModal: () => void;
  showOrderCompleteModal: (orderNumber: string, estimatedTime: number) => void;
  closeOrderCompleteModal: () => void;
  showAllergenWarningModal: (itemId: string, itemType: 'coffee' | 'pastry', allergens: string[]) => void;
  closeAllergenWarningModal: () => void;
}

// Define a complete modal state that includes allergenWarning
interface CompleteModalState extends ModalState {
  allergenWarning: {
    isOpen: boolean;
    itemId: string;
    itemType: 'coffee' | 'pastry';
    allergens: string[];
  };
}

const initialModalState: CompleteModalState = {
  addToCart: {
    isOpen: false,
    itemName: ''
  },
  orderComplete: {
    isOpen: false,
    orderNumber: '',
    estimatedTime: 0
  },
  allergenWarning: {
    isOpen: false,
    itemId: '',
    itemType: 'coffee',
    allergens: []
  }
};

export const useModalsStore = create<ModalsStore>((set) => ({
  // Initial state
  modals: initialModalState,
  
  // Actions
  showAddToCartModal: (itemId: string, itemType: 'coffee' | 'pastry', customizations?: any) => {
    set(state => ({
      modals: {
        ...state.modals,
        addToCart: {
          isOpen: true,
          itemName: itemId
        }
      }
    }));
  },
  
  closeAddToCartModal: () => {
    set(state => ({
      modals: {
        ...state.modals,
        addToCart: {
          ...state.modals.addToCart,
          isOpen: false
        }
      }
    }));
  },
  
  showOrderCompleteModal: (orderNumber: string, estimatedTime: number) => {
    set(state => ({
      modals: {
        ...state.modals,
        orderComplete: {
          isOpen: true,
          orderNumber,
          estimatedTime
        }
      }
    }));
  },
  
  closeOrderCompleteModal: () => {
    set(state => ({
      modals: {
        ...state.modals,
        orderComplete: {
          ...state.modals.orderComplete,
          isOpen: false
        }
      }
    }));
  },
  
  showAllergenWarningModal: (itemId: string, itemType: 'coffee' | 'pastry', allergens: string[]) => {
    set(state => ({
      modals: {
        ...state.modals,
        allergenWarning: {
          isOpen: true,
          itemId,
          itemType,
          allergens
        }
      }
    }));
  },
  
  closeAllergenWarningModal: () => {
    set(state => ({
      modals: {
        ...state.modals,
        allergenWarning: {
          ...state.modals.allergenWarning,
          isOpen: false,
          itemId: '',
          itemType: 'coffee',
          allergens: []
        }
      }
    }));
  }
}));