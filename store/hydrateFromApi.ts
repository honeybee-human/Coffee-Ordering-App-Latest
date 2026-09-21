import type { BootstrapPayload } from '@/lib/api';
import { useAllergensStore } from '@/store/useAllergensStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useMenuStore } from '@/store/useMenuStore';
import { useOrdersStore } from '@/store/useOrdersStore';
import type { CartSetFavorite, FavoriteItem, Group, GroupMember, Order } from '@/types';

const DATE_KEYS = new Set(['dateCreated', 'dateAdded', 'orderDate']);

function reviveDates<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => reviveDates(item)) as T;
  }
  if (value && typeof value === 'object') {
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (DATE_KEYS.has(key) && typeof nested === 'string') {
        next[key] = new Date(nested);
      } else {
        next[key] = reviveDates(nested);
      }
    }
    return next as T;
  }
  return value;
}

export function hydrateFromApi(payload: BootstrapPayload) {
  useMenuStore.getState().hydrate({
    coffee: payload.menu.coffee as never,
    pastry: payload.menu.pastry as never
  });
  useGroupsStore.getState().hydrate({
    groups: reviveDates(payload.groups) as Group[],
    activeGroupId: payload.activeGroupId,
    allMembers: (payload.allMembers || []) as GroupMember[]
  });
  useFavoritesStore.getState().hydrate({
    favorites: reviveDates(payload.favorites) as FavoriteItem[],
    cartSetFavorites: reviveDates(payload.cartSetFavorites) as CartSetFavorite[]
  });
  useOrdersStore.getState().hydrate({
    orders: reviveDates(payload.orders) as Order[]
  });
  useAllergensStore.getState().hydrate(payload.allergenSettings);

  if (useGroupsStore.getState().groups.length === 0) {
    useGroupsStore.getState().initialize();
  }
}
