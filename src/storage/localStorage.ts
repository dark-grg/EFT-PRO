/**
 * Safe LocalStorage Utility with error handling, serialization, and quota management.
 */

let memoryDeviceIdCache: string | null = null;

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
    if (memoryDeviceIdCache && typeof memoryDeviceIdCache === 'string' && memoryDeviceIdCache.length >= 10) {
      return memoryDeviceIdCache;
    }

    const KEY = 'pes_arena_anonymous_device_id_v1';
    const KEY_V2 = 'eft_pro_persistent_device_id_v2';
    let id: string | null = null;

    // 1. Direct raw string check from localStorage (NO JSON.parse)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const rawV2 = window.localStorage.getItem(KEY_V2);
        if (rawV2 && typeof rawV2 === 'string' && rawV2.trim().length >= 10) {
          id = rawV2.trim();
        } else {
          const rawV1 = window.localStorage.getItem(KEY);
          if (rawV1 && typeof rawV1 === 'string' && rawV1.trim().length >= 10) {
            id = rawV1.trim();
          }
        }
      } catch {}
    }

    // 2. Direct raw check from sessionStorage
    if (!id && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const sessId = window.sessionStorage.getItem(KEY_V2) || window.sessionStorage.getItem(KEY);
        if (sessId && typeof sessId === 'string' && sessId.trim().length >= 10) {
          id = sessId.trim();
        }
      } catch {}
    }

    // 3. Fallback: Check document.cookie
    if (!id && typeof document !== 'undefined' && document.cookie) {
      try {
        const match = document.cookie.match(/(?:^|;\s*)(?:pes_arena_device_id|eft_pro_device_id)=([^;]+)/);
        if (match && match[1]) {
          const decoded = decodeURIComponent(match[1]).trim();
          if (decoded.length >= 10) {
            id = decoded;
          }
        }
      } catch {}
    }

    // 4. If still missing, generate once and persist to all stores
    if (!id || typeof id !== 'string' || id.trim().length < 10) {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        id = crypto.randomUUID();
      } else {
        id = `eft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }
    }

    id = id.trim();
    memoryDeviceIdCache = id;

    // Persist to all accessible storage mechanisms
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(KEY_V2, id);
        window.localStorage.setItem(KEY, id);
      }
    } catch {}

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(KEY_V2, id);
        window.sessionStorage.setItem(KEY, id);
      }
    } catch {}

    try {
      if (typeof document !== 'undefined') {
        document.cookie = `eft_pro_device_id=${encodeURIComponent(id)}; path=/; max-age=315360000; SameSite=Lax`;
        document.cookie = `pes_arena_device_id=${encodeURIComponent(id)}; path=/; max-age=315360000; SameSite=Lax`;
      }
    } catch {}

    return id;
  }
};
