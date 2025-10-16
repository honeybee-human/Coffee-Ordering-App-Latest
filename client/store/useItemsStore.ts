import { useMenuQuery } from '@/queries/menu';
import type { Coffee, Pastry } from '@/types';

interface ItemsStoreShape {
  coffees: Coffee[];
  pastries: Pastry[];
  loading: boolean;
  error?: string;
  fetchMenu: () => Promise<void>;
}

// Zustand-free replacement: expose the same shape via TanStack Query
export function useItemsStore(): ItemsStoreShape {
  const { data, isLoading, refetch } = useMenuQuery();
  const coffees = data?.coffees ?? [];
  const pastries = data?.pastries ?? [];
  const error = data?.error;

  return {
    coffees,
    pastries,
    loading: isLoading,
    error,
    fetchMenu: async () => {
      await refetch();
    },
  };
}