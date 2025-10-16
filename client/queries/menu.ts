import { useQuery } from '@tanstack/react-query';
import type { Coffee, Pastry } from '@/types';
import { getApiBase, logAPI, logOptimistic } from '@/utils/devLogger';

type MenuResponse = { coffee: any[]; pastry: any[] };

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

export function useMenuQuery() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: async (): Promise<{ coffees: Coffee[]; pastries: Pastry[]; error?: string }> => {
      const base = getApiBase();
      logAPI('/menu', 'start');
      try {
        const res = await fetch(`${base}/menu`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MenuResponse = await res.json();
        const coffees: Coffee[] = Array.isArray(data.coffee) ? data.coffee.map(mapCoffee) : [];
        const pastries: Pastry[] = Array.isArray(data.pastry) ? data.pastry.map(mapPastry) : [];
        logAPI('/menu', 'success', { coffees: coffees.length, pastries: pastries.length });
        logOptimistic('fetchMenu', 'stored', { store: 'useItemsStore' });
        return { coffees, pastries };
      } catch (e) {
        logAPI('/menu', 'fallback', { error: String(e) });
        const { coffeeMenu, pastryMenu } = await import('@/localDataArchive/menu');
        return { coffees: coffeeMenu, pastries: pastryMenu, error: String(e) };
      }
    },
  });
}