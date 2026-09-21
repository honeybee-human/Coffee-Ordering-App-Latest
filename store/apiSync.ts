import { saveAllergens, saveFavorites, saveGroups, saveOrders } from '@/lib/api';
import { useAllergensStore } from '@/store/useAllergensStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useOrdersStore } from '@/store/useOrdersStore';

let syncing = false;
let groupsTimer: ReturnType<typeof setTimeout> | undefined;
let favoritesTimer: ReturnType<typeof setTimeout> | undefined;
let ordersTimer: ReturnType<typeof setTimeout> | undefined;
let allergensTimer: ReturnType<typeof setTimeout> | undefined;
const unsubscribers: Array<() => void> = [];

function debounce(timer: ReturnType<typeof setTimeout> | undefined, fn: () => void, delay = 400) {
  if (timer) clearTimeout(timer);
  return setTimeout(fn, delay);
}

export function setApiSyncing(value: boolean) {
  syncing = value;
}

export function startApiSync() {
  stopApiSync();

  unsubscribers.push(
    useGroupsStore.subscribe((state) => {
      if (syncing) return;
      groupsTimer = debounce(groupsTimer, () => {
        saveGroups({
          groups: state.groups,
          activeGroupId: state.activeGroupId,
          allMembers: state.allMembers
        }).catch((error) => console.warn('Failed to persist groups', error));
      });
    })
  );

  unsubscribers.push(
    useFavoritesStore.subscribe((state) => {
      if (syncing) return;
      favoritesTimer = debounce(favoritesTimer, () => {
        saveFavorites({
          favorites: state.favorites,
          cartSetFavorites: state.cartSetFavorites
        }).catch((error) => console.warn('Failed to persist favorites', error));
      });
    })
  );

  unsubscribers.push(
    useOrdersStore.subscribe((state) => {
      if (syncing) return;
      ordersTimer = debounce(ordersTimer, () => {
        saveOrders({ orders: state.orders }).catch((error) =>
          console.warn('Failed to persist orders', error)
        );
      });
    })
  );

  unsubscribers.push(
    useAllergensStore.subscribe((state) => {
      if (syncing) return;
      allergensTimer = debounce(allergensTimer, () => {
        saveAllergens({
          excludedAllergens: state.excludedAllergens,
          autoFilterEnabled: state.autoFilterEnabled
        }).catch((error) => console.warn('Failed to persist allergen settings', error));
      });
    })
  );
}

export function stopApiSync() {
  unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
  [groupsTimer, favoritesTimer, ordersTimer, allergensTimer].forEach((timer) => {
    if (timer) clearTimeout(timer);
  });
}
