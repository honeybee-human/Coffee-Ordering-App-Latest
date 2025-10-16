import { PastryCustomization } from '@/types';
import { useAppContext } from '@/context/AppContext';

interface PastryCustomizationStore {
  customization: PastryCustomization;
  toggleIngredient: (ingredient: string) => void;
  resetCustomization: () => void;
}

export const usePastryCustomizationStore = (): PastryCustomizationStore => {
  const { pastryCustomization, togglePastryIngredient, resetPastryCustomization } = useAppContext();

  return {
    customization: pastryCustomization,
    toggleIngredient: (ingredient: string) => togglePastryIngredient(ingredient),
    resetCustomization: () => resetPastryCustomization(),
  };
};