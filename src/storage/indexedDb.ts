/**
 * IndexedDB storage helper for larger datasets (e.g. Player Cards, cache).
 * Features automatic fallback to localStorage if IndexedDB is unavailable in restrictive WebViews.
 */

import { safeLocalStorage } from './localStorage';

const DB_NAME = 'pes_arena_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'key_value_store';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

export const idbStorage = {
  async get<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result !== undefined ? request.result : defaultValue);
        };
        request.onerror = () => {
          resolve(safeLocalStorage.getItem<T>(key, defaultValue));
        };
      });
    } catch {
      return safeLocalStorage.getItem<T>(key, defaultValue);
    }
  },

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);

        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          resolve(safeLocalStorage.setItem(key, value));
        };
      });
    } catch {
      return safeLocalStorage.setItem(key, value);
    }
  },

  async delete(key: string): Promise<void> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    } catch {
      safeLocalStorage.removeItem(key);
    }
  }
};
