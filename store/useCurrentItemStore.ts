import { create } from 'zustand';
import { Coffee, Pastry } from '@/types';

type CurrentItem = {
  type: 'coffee' | 'pastry' | null;
  item: Coffee | Pastry | null;
};

interface CurrentItemStore {
  // State
  currentItem: CurrentItem;
  
  // Actions
  setCurrentItem: (type: 'coffee' | 'pastry', item: Coffee | Pastry) => void;
  clearCurrentItem: () => void;
}

export const useCurrentItemStore = create<CurrentItemStore>((set) => ({
  // Initial state
  currentItem: {
    type: null,
    item: null
  },
  
  // Actions
  setCurrentItem: (type, item) => set({ 
    currentItem: { type, item } 
  }),
  
  clearCurrentItem: () => set({ 
    currentItem: { type: null, item: null } 
  })
}));

// Selector hooks
export const useCurrentItem = () => useCurrentItemStore(state => state.currentItem);