/**
 * Safe LocalStorage Utility with error handling, serialization, and quota management.
 */

export const safeLocalStorage = {
  getItem<T = string>(key: string, defaultValue: T | null = null): T | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return defaultValue;
      }
      const raw = window.localStorage.getItem(key);
      if (raw === null) return defaultValue;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch (err) {
      console.warn(`[Storage] Failed to read key "${key}":`, err);
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (err: any) {
      console.warn(`[Storage] Failed to set key "${key}":`, err);
      // Handle quota exceeded
      if (err?.name === 'QuotaExceededError' || err?.code === 22) {
        try {
          // Clear non-critical temporary keys
          for (let i = 0; i < window.localStorage.length; i++) {
            const k = window.localStorage.key(i);
            if (k && (k.startsWith('temp_') || k.startsWith('cache_'))) {
              window.localStorage.removeItem(k);
            }
          }
          const serialized = typeof value === 'string' ? value : JSON.stringify(value);
          window.localStorage.setItem(key, serialized);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn(`[Storage] Failed to remove key "${key}":`, err);
    }
  },

  getDeviceId(): string {
    const KEY = 'pes_arena_anonymous_device_id_v1';
    let id = safeLocalStorage.getItem<string>(KEY);
    if (!id || typeof id !== 'string' || id.length < 10) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      safeLocalStorage.setItem(KEY, id);
    }
    return id;
  }
};
