import { create } from 'zustand';
import { PastryCustomization } from '@/types';

interface PastryCustomizationStore {
  customization: PastryCustomization;
  toggleIngredient: (ingredient: string) => void;
  resetCustomization: () => void;
}

export const usePastryCustomizationStore = create<PastryCustomizationStore>((set) => ({
  customization: {
    removedIngredients: []
  },

  toggleIngredient: (ingredient) => set((state) => {
    const isRemoved = state.customization.removedIngredients.includes(ingredient);
    if (isRemoved) {
      return {
        customization: {
          ...state.customization,
          removedIngredients: state.customization.removedIngredients.filter(i => i !== ingredient)
        }
      };
    }
    return {
      customization: {
        ...state.customization,
        removedIngredients: [...state.customization.removedIngredients, ingredient]
      }
    };
  }),

  resetCustomization: () => set({
    customization: {
      removedIngredients: []
    }
  })
})); 