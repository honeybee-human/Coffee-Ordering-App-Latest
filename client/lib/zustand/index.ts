import { useSyncExternalStore } from 'react';

export type StoreApi<T extends object> = {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;
  subscribe: (listener: () => void) => () => void;
  destroy: () => void;
};

export type StateCreator<T extends object> = (
  set: StoreApi<T>['setState'],
  get: StoreApi<T>['getState'],
  api: StoreApi<T>
) => T;

export type UseBoundStore<T extends object> = {
  <R = T>(selector?: (state: T) => R): R;
} & StoreApi<T>;

export function create<T extends object>(initializer: StateCreator<T>): UseBoundStore<T>;
export function create<T extends object>(): (initializer: StateCreator<T>) => UseBoundStore<T>;
export function create<T extends object>(initializer?: StateCreator<T>) {
  const internalCreate = (init: StateCreator<T>): UseBoundStore<T> => {
    let state: T;
    const listeners = new Set<() => void>();

    const api: StoreApi<T> = {
      getState: () => state,
      setState: (partial, replace = false) => {
        const nextPartial = typeof partial === 'function' ? (partial as any)(state) : partial;
        const nextState = replace ? (nextPartial as T) : { ...state, ...nextPartial };
        if (nextState !== state) {
          state = nextState;
          listeners.forEach((l) => l());
        }
      },
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      destroy: () => {
        listeners.clear();
      },
    };

    // initialize state
    state = init(api.setState, api.getState, api);

    const useBoundStore = (<R = T>(selector?: (s: T) => R): R => {
      const getSnapshot = () => (selector ? selector(state) : (state as any as R));
      return useSyncExternalStore(api.subscribe, getSnapshot, getSnapshot);
    }) as UseBoundStore<T>;

    // attach api methods
    useBoundStore.getState = api.getState;
    useBoundStore.setState = api.setState;
    useBoundStore.subscribe = api.subscribe;
    useBoundStore.destroy = api.destroy;

    return useBoundStore;
  };

  if (initializer) return internalCreate(initializer);
  return internalCreate;
}