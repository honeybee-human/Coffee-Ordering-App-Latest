import { create } from 'zustand';
import type { Coffee, Pastry } from '@/types';
import { getApiBase, logAPI, logOptimistic } from '@/utils/devLogger';

interface ItemsStore {
  coffees: Coffee[];
  pastries: Pastry[];
  loading: boolean;
  error?: string;
  fetchMenu: () => Promise<void>;
}

export const useItemsStore = create<ItemsStore>((set) => ({
  coffees: [],
  pastries: [],
  loading: false,
  error: undefined,
  fetchMenu: async () => {
    set({ loading: true, error: undefined });
    const base = getApiBase();
    logAPI('/menu', 'start');
    try {
      const res = await fetch(`${base}/menu`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const mapCoffee = (i: any): Coffee => ({
        id: String(i._id || i.id || i.name?.toLowerCase().replace(/\s+/g, '-')),
        name: i.name,
        price: i.price,
        allergens: i.allergens || [],
        description: i.description,
        image: i.image,
        syrupOptions: i.syrupOptions || [],
      });
      const mapPastry = (i: any): Pastry => ({
        id: String(i._id || i.id || i.name?.toLowerCase().replace(/\s+/g, '-')),
        name: i.name,
        price: i.price,
        allergens: i.allergens || [],
        description: i.description,
        image: i.image,
        ingredients: i.ingredients || [],
        removableIngredients: i.removableIngredients || [],
      });
      const coffees: Coffee[] = Array.isArray(data.coffee) ? data.coffee.map(mapCoffee) : [];
      const pastries: Pastry[] = Array.isArray(data.pastry) ? data.pastry.map(mapPastry) : [];
      set({ coffees, pastries, loading: false });
      logAPI('/menu', 'success', { coffees: coffees.length, pastries: pastries.length });
      logOptimistic('fetchMenu', 'stored', { store: 'useItemsStore' });
    } catch (e) {
      logAPI('/menu', 'fallback', { error: String(e) });
      const { coffeeMenu, pastryMenu } = await import('@/localDataArchive/menu');
      set({ coffees: coffeeMenu, pastries: pastryMenu, loading: false, error: String(e) });
    }
  },
}));