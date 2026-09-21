import { coffeeMenu, pastryMenu } from '@/data/menu';
import { create } from 'zustand';
import type { Coffee, Pastry } from '@/types';

interface MenuStore {
  coffee: Coffee[];
  pastry: Pastry[];
  hydrate: (menu: { coffee?: Coffee[]; pastry?: Pastry[] }) => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
  coffee: coffeeMenu,
  pastry: pastryMenu,
  hydrate: (menu) => {
    set({
      coffee: menu.coffee?.length ? menu.coffee : coffeeMenu,
      pastry: menu.pastry?.length ? menu.pastry : pastryMenu
    });
  }
}));
