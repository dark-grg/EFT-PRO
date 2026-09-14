import { apiClient } from './client';
import { idbStorage } from '../storage/indexedDb';
import { PlayerCard } from '../types/playerCard';

const CACHE_KEY = 'pes_arena_cards_dataset_v1';

export const playerApi = {
  async getCards(): Promise<PlayerCard[]> {
    // 1. Try server endpoint
    try {
      const res = await apiClient.get<{ success: boolean; cards: PlayerCard[] }>('/api/players/cards', 5000);
      if (res?.success && Array.isArray(res.cards) && res.cards.length > 0) {
        // Save to IndexedDB for offline access
        idbStorage.set(CACHE_KEY, res.cards).catch(() => {});
        return res.cards;
      }
    } catch {
      // Ignore network error and fall back to local store
    }

    // 2. Check IndexedDB
    const cached = await idbStorage.get<PlayerCard[]>(CACHE_KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    // 3. Fallback to bundled dataset
    try {
      const bundled = await import('../data/efhubCards.json');
      const cards = (bundled.default || bundled) as unknown as PlayerCard[];
      if (Array.isArray(cards) && cards.length > 0) {
        idbStorage.set(CACHE_KEY, cards).catch(() => {});
        return cards;
      }
    } catch {
      // Bundled cards unavailable
    }

    return [];
  },

  async syncPlayers(): Promise<{ success: boolean; cardsCount: number; message: string }> {
    const res = await apiClient.post<{ success: boolean; cardsCount: number; message: string; cards?: PlayerCard[] }>(
      '/api/admin/resync-players',
      {},
      30000
    );

    if (res.cards && Array.isArray(res.cards)) {
      await idbStorage.set(CACHE_KEY, res.cards);
    }

    return {
      success: res.success,
      cardsCount: res.cardsCount || (res.cards?.length || 0),
      message: res.message || 'تم تحديث بيانات اللاعبين بنجاح'
    };
  }
};
