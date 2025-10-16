export type PersistOptions<T, Persisted = T> = {
  name: string;
  storage?: () => Storage;
  partialize?: (state: T) => Persisted;
  serialize?: (state: Persisted) => string;
  deserialize?: (str: string) => Persisted;
};

export function createJSONStorage(getStorage: () => Storage) {
  return getStorage;
}

export function persist<T, Persisted = T>(createFn: (set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void, get: () => T) => T, options: PersistOptions<T, Persisted>) {
  return (set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void, get: () => T): T => {
    const storage = options.storage ? options.storage() : typeof window !== 'undefined' ? window.localStorage : undefined;

    const wrappedSet = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
      set(partial);
      try {
        if (storage) {
          const current = get();
          const toSave = (options.partialize ? options.partialize(current) : (current as unknown as Persisted)) as Persisted;
          const serialized = options.serialize ? options.serialize(toSave) : JSON.stringify(toSave);
          storage.setItem(options.name, serialized);
        }
      } catch {}
    };

    let state = createFn(wrappedSet, get);

    try {
      const raw = storage?.getItem(options.name);
      if (raw) {
        const saved = options.deserialize ? options.deserialize(raw) : (JSON.parse(raw) as Persisted);
        state = { ...(state as any), ...(saved as any) } as T;
      }
    } catch {}

    return state;
  };
}