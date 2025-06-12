import React, { useState, useCallback } from 'react';
import { ModalState } from '@/types';

/**
 * Custom hook for managing modal states
 * Handles: add to cart modal, order complete modal, allergen warning modal
 */
export const useModals = () => {
    const [modalState, setModalState] = useState<ModalState>({
      addToCart: { isOpen: false, itemName: '' },
      orderComplete: { isOpen: false, orderNumber: '', estimatedTime: 0 },
      allergenWarning: { isOpen: false, itemId: '', itemType: 'coffee', allergens: [] },
      noMembersWarning: { isOpen: false },
    });

  const [allergenWarning, setAllergenWarning] = useState<{
    isOpen: boolean;
    allergens: string[];
    affectedMembers: string[];
    itemName: string;
    addCallback?: () => void;
  }>({
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
    setAllergenWarning(prev => ({ ...prev, isOpen: false }));
  }, [allergenWarning.addCallback]);

  const closeAllergenWarning = useCallback(() => {
    setAllergenWarning(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Assign Order Modal handlers
  const showAssignOrderModal = useCallback((itemId: string) => {
    setModalState(prev => ({
      ...prev,
      assignOrder: {
        isOpen: true,
        itemId
      }
    }));
  }, []);

  const closeAssignOrderModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      assignOrder: { isOpen: false, itemId: '' }
    }));
  }, []);

  return {
    modalState,
    allergenWarning,
    showAddToCartModal,
    closeAddToCartModal,
    showOrderCompleteModal,
    closeOrderCompleteModal,
    showAllergenWarning,
    proceedWithAllergen,
    closeAllergenWarning,
    showAssignOrderModal,
    closeAssignOrderModal
  };
};