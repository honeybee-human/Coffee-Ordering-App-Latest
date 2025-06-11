import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ModalState } from '../types';

interface AllergenWarningState {
  isOpen: boolean;
  allergens: string[];
  affectedMembers: string[];
  itemName: string;
  addCallback?: () => void;
}

interface ModalsContextType {
  modalState: ModalState;
  allergenWarning: AllergenWarningState;
  showAddToCartModal: (itemName: string) => void;
  closeAddToCartModal: () => void;
  showOrderCompleteModal: (orderNumber: string, estimatedTime: number) => void;
  closeOrderCompleteModal: () => void;
  showAllergenWarning: (allergens: string[], affectedMembers: string[], itemName: string, addCallback: () => void) => void;
  proceedWithAllergen: () => void;
  closeAllergenWarning: () => void;
}

const ModalsContext = createContext<ModalsContextType | undefined>(undefined);

export const ModalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    addToCart: { isOpen: false, itemName: '' },
    orderComplete: { isOpen: false, orderNumber: '', estimatedTime: 0 },
    allergenWarning: { isOpen: false, itemId: '', itemType: 'coffee', allergens: [] }
  });

  const [allergenWarning, setAllergenWarning] = useState<AllergenWarningState>({
    isOpen: false,
    allergens: [],
    affectedMembers: [],
    itemName: ''
  });

  // Modal handlers
  const showAddToCartModal = useCallback((itemName: string) => {
    setModalState(prev => ({
      ...prev,
      addToCart: {
        isOpen: true,
        itemName
      }
    }));
  }, []);

  const closeAddToCartModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addToCart: { isOpen: false, itemName: '' }
    }));
  }, []);

  const showOrderCompleteModal = useCallback((orderNumber: string, estimatedTime: number) => {
    setModalState(prev => ({
      ...prev,
      orderComplete: {
        isOpen: true,
        orderNumber,
        estimatedTime
      }
    }));
  }, []);

  const closeOrderCompleteModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      orderComplete: { isOpen: false, orderNumber: '', estimatedTime: 0 }
    }));
  }, []);

  const showAllergenWarning = useCallback((
    allergens: string[], 
    affectedMembers: string[], 
    itemName: string, 
    addCallback: () => void
  ) => {
    setAllergenWarning({
      isOpen: true,
      allergens,
      affectedMembers,
      itemName,
      addCallback
    });
  }, []);

  const proceedWithAllergen = useCallback(() => {
    if (allergenWarning.addCallback) {
      allergenWarning.addCallback();
    }
    setAllergenWarning(prev => ({
      ...prev,
      isOpen: false
    }));
  }, [allergenWarning.addCallback]);

  const closeAllergenWarning = useCallback(() => {
    setAllergenWarning({
      isOpen: false,
      allergens: [],
      affectedMembers: [],
      itemName: '',
      addCallback: undefined
    });
  }, []);

  return (
    <ModalsContext.Provider value={{
      modalState,
      allergenWarning,
      showAddToCartModal,
      closeAddToCartModal,
      showOrderCompleteModal,
      closeOrderCompleteModal,
      showAllergenWarning,
      proceedWithAllergen,
      closeAllergenWarning
    }}>
      {children}
    </ModalsContext.Provider>
  );
};

export const useModals = (): ModalsContextType => {
  const context = useContext(ModalsContext);
  if (context === undefined) {
    throw new Error('useModals must be used within a ModalsProvider');
  }
  return context;
};