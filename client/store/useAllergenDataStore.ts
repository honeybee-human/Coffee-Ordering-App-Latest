import { create } from 'zustand';
import type { AllergenGroup } from '@/types';
import { getApiBase, logAPI, logOptimistic } from '@/utils/devLogger';

interface AllergenDataState {
  groups: AllergenGroup[];
  individualAllergens: string[];
  loading: boolean;
  error?: string;
  fetchAllergenData: () => Promise<void>;
}

export const useAllergenDataStore = create<AllergenDataState>((set) => ({
  groups: [],
  individualAllergens: [],
  loading: false,
  error: undefined,
  fetchAllergenData: async () => {
    set({ loading: true, error: undefined });
    const base = getApiBase();
    logAPI('/allergen-groups', 'start');
    try {
      const res = await fetch(`${base}/allergen-groups`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      set({
        groups: Array.isArray(data.groups) ? data.groups : [],
        individualAllergens: Array.isArray(data.individualAllergens) ? data.individualAllergens : [],
        loading: false,
      });
      logAPI('/allergen-groups', 'success', { groups: Array.isArray(data.groups) ? data.groups.length : 0, individuals: Array.isArray(data.individualAllergens) ? data.individualAllergens.length : 0 });
      logOptimistic('fetchAllergenData', 'stored', { store: 'useAllergenDataStore' });
    } catch (e) {
      logAPI('/allergen-groups', 'fallback', { error: String(e) });
      const { allergenGroups, individualAllergens } = await import('@/localDataArchive/allergenGroups');
      set({ groups: allergenGroups, individualAllergens, loading: false, error: String(e) });
    }
  },
}));