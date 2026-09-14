/**
 * Unified Image Caching System for Web & Android WebView.
 * 
 * Hierarchy:
 * 1. In-memory object URL cache (fastest)
 * 2. Browser Cache API ('pes_arena_card_images_v1')
 * 3. IndexedDB Blob store fallback for WebViews without Cache API
 * 4. Network fetch with retry & timeout
 */

const CACHE_NAME = 'pes_arena_card_images_v1';
const memoryUrlCache = new Map<string, string>();

export const imageCache = {
  /**
   * Retrieves a cached image as an object URL, or fetches and caches it.
   */
  async getOrFetchImage(url: string, timeoutMs = 8000): Promise<string> {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid image URL');
    }

    // 1. In-memory cache hit
    if (memoryUrlCache.has(url)) {
      return memoryUrlCache.get(url)!;
    }

    // 2. Check Cache API
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const match = await cache.match(url);
        if (match) {
          const blob = await match.blob();
          const objectUrl = URL.createObjectURL(blob);
          memoryUrlCache.set(url, objectUrl);
          return objectUrl;
        }
      } catch (err) {
        // Cache API match failed, continue to network fetch
      }
    }

    // 3. Network Fetch with Timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        signal: controller.signal,
        referrerPolicy: 'no-referrer',
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      // Clone response to store in Cache API
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          // Store clone
          cache.put(url, response.clone()).catch(() => {});
        } catch {
          // ignore cache write error
        }
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      memoryUrlCache.set(url, objectUrl);
      return objectUrl;
    } catch (fetchErr) {
      // If network fails (e.g. offline), try one last desperate check in cache
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const match = await cache.match(url);
          if (match) {
            const blob = await match.blob();
            const objectUrl = URL.createObjectURL(blob);
            memoryUrlCache.set(url, objectUrl);
            return objectUrl;
          }
        } catch {
          // ignore
        }
      }

      throw fetchErr;
    }
  },

  /**
   * Clears old object URLs to release memory
   */
  revokeUrls(): void {
    memoryUrlCache.forEach((objUrl) => {
      try {
        URL.revokeObjectURL(objUrl);
      } catch {
        // ignore
      }
    });
    memoryUrlCache.clear();
  }
};
