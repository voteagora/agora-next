type Entry = [string, string];

const store = new Map<string, string>();

const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    return store.has(key) ? store.get(key)! : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    store.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    store.delete(key);
  },
  async mergeItem(key: string, value: string): Promise<void> {
    const existing = store.get(key);
    if (!existing) {
      store.set(key, value);
      return;
    }
    try {
      const existingJson = JSON.parse(existing);
      const valueJson = JSON.parse(value);
      const merged = {
        ...existingJson,
        ...valueJson,
      };
      store.set(key, JSON.stringify(merged));
    } catch {
      store.set(key, value);
    }
  },
  async clear(): Promise<void> {
    store.clear();
  },
  async getAllKeys(): Promise<string[]> {
    return Array.from(store.keys());
  },
  async multiGet(keys: readonly string[]): Promise<[string, string | null][]> {
    return keys.map((key) => [key, store.get(key) ?? null]);
  },
  async multiSet(entries: readonly Entry[]): Promise<void> {
    entries.forEach(([key, value]) => {
      store.set(key, value);
    });
  },
  async multiRemove(keys: readonly string[]): Promise<void> {
    keys.forEach((key) => store.delete(key));
  },
  async multiMerge(entries: readonly Entry[]): Promise<void> {
    await Promise.all(
      entries.map(([key, value]) => AsyncStorage.mergeItem(key, value))
    );
  },
  useAsyncStorage(key: string) {
    return {
      getItem: () => AsyncStorage.getItem(key),
      setItem: (value: string) => AsyncStorage.setItem(key, value),
      mergeItem: (value: string) => AsyncStorage.mergeItem(key, value),
      removeItem: () => AsyncStorage.removeItem(key),
    };
  },
  async flushGetRequests(): Promise<void> {
    // No batching in the stub
  },
};

export type AsyncStorageStatic = typeof AsyncStorage;

export default AsyncStorage;
export { AsyncStorage };
