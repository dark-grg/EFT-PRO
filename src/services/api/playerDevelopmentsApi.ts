export interface PlayerDevelopmentRecord {
  id: string;
  playerName: string;
  imageUrl: string;
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
  createdAt: string;
  updatedAt: string;
  version: number;
  status: string;
}

const WORKER_API_BASE = 'https://eft-pro.grg0.workers.dev/api';
const LOCAL_CACHE_KEY = 'EFT_PRO_PLAYER_DEVELOPMENTS_CACHE';

export const PlayerDevelopmentsApi = {
  async getAll(): Promise<PlayerDevelopmentRecord[]> {
    try {
      const res = await fetch(`${WORKER_API_BASE}/player-developments`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json() as any;
        if (data && data.success && Array.isArray(data.developments)) {
          // Cache locally
          try {
            localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({
              timestamp: Date.now(),
              developments: data.developments
            }));
          } catch {
            // ignore
          }
          return data.developments;
        }
      }
    } catch {
      // offline or network error -> use local cache
    }

    // Fallback to local cache
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.developments)) {
          return parsed.developments;
        }
      }
    } catch {
      // fallback
    }

    // Default mock data if empty
    return [
      {
        id: "dev-messi-epic-2024",
        playerName: "Lionel Messi",
        imageUrl: "https://efimg.com/efootballhub22/images/player_cards/88033407929826_l.png",
        shooting: 11,
        passing: 9,
        dribbling: 9,
        dexterity: 0,
        lowerBody: 0,
        aerial: 4,
        defending: 0,
        gk1: 0,
        gk2: 0,
        gk3: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        status: "VERIFIED"
      },
      {
        id: "dev-haaland-epic-2024",
        playerName: "Erling Haaland",
        imageUrl: "https://efimg.com/efootballhub22/images/player_cards/88033400000001_l.png",
        shooting: 12,
        passing: 2,
        dribbling: 6,
        dexterity: 10,
        lowerBody: 12,
        aerial: 10,
        defending: 0,
        gk1: 0,
        gk2: 0,
        gk3: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        status: "VERIFIED"
      }
    ];
  },

  async uploadImage(file: File | string, adminKey: string): Promise<string> {
    const headers: Record<string, string> = {
      'X-Admin-Key': adminKey || 'eft-pro-admin-key'
    };

    if (typeof file === 'string') {
      // Base64 string
      headers['Content-Type'] = 'application/json';
      const res = await fetch(`${WORKER_API_BASE}/admin/player-developments/upload`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ imageBase64: file })
      });
      const data = await res.json() as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }
      return data.imageUrl;
    } else {
      // File object
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${WORKER_API_BASE}/admin/player-developments/upload`, {
        method: 'POST',
        headers,
        body: formData
      });
      const data = await res.json() as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }
      return data.imageUrl;
    }
  },

  async create(recordData: Omit<PlayerDevelopmentRecord, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status'>, adminKey: string): Promise<PlayerDevelopmentRecord> {
    const res = await fetch(`${WORKER_API_BASE}/admin/player-developments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey || 'eft-pro-admin-key'
      },
      body: JSON.stringify(recordData)
    });
    const data = await res.json() as any;
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create player development');
    }
    return data.development;
  },

  async update(id: string, recordData: Partial<PlayerDevelopmentRecord>, adminKey: string): Promise<PlayerDevelopmentRecord> {
    const res = await fetch(`${WORKER_API_BASE}/admin/player-developments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey || 'eft-pro-admin-key'
      },
      body: JSON.stringify(recordData)
    });
    const data = await res.json() as any;
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update player development');
    }
    return data.development;
  },

  async delete(id: string, adminKey: string): Promise<void> {
    const res = await fetch(`${WORKER_API_BASE}/admin/player-developments/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Admin-Key': adminKey || 'eft-pro-admin-key'
      }
    });
    const data = await res.json() as any;
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete player development');
    }
  }
};
