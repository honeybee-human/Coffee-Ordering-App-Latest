import { create } from 'zustand';
import { CoffeeCustomization } from '@/types';

interface CoffeeCustomizationStore {
  customization: CoffeeCustomization;
  setMilk: (milk: string) => void;
  addSyrup: (flavor: string) => void;
  updateSyrupPumps: (flavor: string, pumps: number) => void;
  removeSyrup: (flavor: string) => void;
  resetCustomization: () => void;
}

export const useCoffeeCustomizationStore = create<CoffeeCustomizationStore>((set) => ({
  customization: {
    milk: 'No Milk',
    syrups: []
  },

  setMilk: (milk) => set((state) => ({
    customization: {
      ...state.customization,
      milk
    }
  })),

  addSyrup: (flavor) => set((state) => {
    const existingSyrup = state.customization.syrups.find(s => s.flavor === flavor);
    if (existingSyrup) {
      return {
        customization: {
          ...state.customization,
          syrups: state.customization.syrups.map(s =>
            s.flavor === flavor ? { ...s, pumps: s.pumps + 1 } : s
          )
        }
      };
    }
    return {
      customization: {
        ...state.customization,
        syrups: [...state.customization.syrups, { flavor, pumps: 1 }]
      }
    };
  }),

  updateSyrupPumps: (flavor, pumps) => set((state) => {
    if (pumps <= 0) {
      return {
        customization: {
          ...state.customization,
          syrups: state.customization.syrups.filter(s => s.flavor !== flavor)
        }
      };
    }
    return {
      customization: {
        ...state.customization,
        syrups: state.customization.syrups.map(s =>
          s.flavor === flavor ? { ...s, pumps } : s
        )
      }
    };
  }),

  removeSyrup: (flavor) => set((state) => ({
    customization: {
      ...state.customization,
      syrups: state.customization.syrups.filter(s => s.flavor !== flavor)
    }
  })),

  resetCustomization: () => set({
    customization: {
      milk: 'No Milk',
      syrups: []
    }
  })
}));