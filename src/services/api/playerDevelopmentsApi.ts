export interface PlayerDevelopmentRecord {
  id: string;
  playerName: string;
  cardType: string;
  cardVersion?: string;
  imageUrl?: string | null;
  imageKey?: string | null;
  shooting: number;
  passing: number;
  dribbling: number;
  dexterity: number;
  lowerBody: number;
  aerial: number;
  defending: number;
  gk1: number;
  gk2: number;
  gk3: number;
  createdAt?: number;
  updatedAt?: number;
  version?: number;
  status?: string;
}

const API_BASE = 'https://eft-pro.grg0.workers.dev';
const LOCAL_CACHE_KEY = 'eft_pro_player_developments_cache_v2';
const ADMIN_KEY_STORAGE = 'eft_pro_admin_secret';

export const PlayerDevelopmentsApi = {
  getAdminKey(): string {
    return localStorage.getItem(ADMIN_KEY_STORAGE) || 'eft-pro-owner-2026';
  },

  setAdminKey(key: string) {
    localStorage.setItem(ADMIN_KEY_STORAGE, key);
  },

  async getAll(): Promise<PlayerDevelopmentRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/api/player-developments`);
      if (!res.ok) throw new Error('Failed to fetch from server');
      const json = await res.json() as { success: boolean; data: PlayerDevelopmentRecord[] };
      if (json.success && Array.isArray(json.data)) {
        // Cache successfully fetched data
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({
          data: json.data,
          timestamp: Date.now()
        }));
        return json.data;
      }
    } catch (e) {
      console.warn('Network fetch failed, using local cache fallback:', e);
    }

    // Fallback to cache if offline or error
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.data)) {
          return parsed.data;
        }
      }
    } catch (e) {
      console.error('Failed to read cache:', e);
    }

    return [];
  },

  async uploadImage(file: File): Promise<{ imageUrl: string; imageKey: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/admin/player-developments/upload`, {
      method: 'POST',
      headers: {
        'X-Admin-Key': this.getAdminKey(),
        'Authorization': `Bearer ${this.getAdminKey()}`
      },
      body: formData
    });

    const json = await res.json() as any;
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to upload image');
    }
    return { imageUrl: json.imageUrl, imageKey: json.imageKey };
  },

  async create(record: Omit<PlayerDevelopmentRecord, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<PlayerDevelopmentRecord> {
    const res = await fetch(`${API_BASE}/api/admin/player-developments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': this.getAdminKey(),
        'Authorization': `Bearer ${this.getAdminKey()}`
      },
      body: JSON.stringify(record)
    });

    const json = await res.json() as any;
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create player development');
    }
    return json.data;
  },

  async update(id: string, record: Partial<PlayerDevelopmentRecord>): Promise<PlayerDevelopmentRecord> {
    const res = await fetch(`${API_BASE}/api/admin/player-developments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': this.getAdminKey(),
        'Authorization': `Bearer ${this.getAdminKey()}`
      },
      body: JSON.stringify(record)
    });

    const json = await res.json() as any;
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to update player development');
    }
    return json.data;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/admin/player-developments/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Admin-Key': this.getAdminKey(),
        'Authorization': `Bearer ${this.getAdminKey()}`
      }
    });

    const json = await res.json() as any;
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to delete player development');
    }
  },

  async bulkCreate(records: Array<Omit<PlayerDevelopmentRecord, 'id' | 'createdAt' | 'updatedAt' | 'version'>>): Promise<number> {
    let count = 0;
    for (const rec of records) {
      try {
        await this.create(rec);
        count++;
      } catch (e) {
        console.error('Bulk item create failed:', e);
      }
    }
    return count;
  }
};
