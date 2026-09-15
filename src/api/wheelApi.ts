import { apiClient } from './client';
import { safeLocalStorage } from '../storage/localStorage';

export interface WheelStatusResponse {
  ok?: boolean;
  canSpin: boolean;
  lastSpinAt: number | null;
  nextSpinAt: number | null;
  nextSpinAtIso?: string | null;
  serverTime: number;
  remainingMs: number;
}

export interface WheelSpinResponse {
  ok?: boolean;
  success: boolean;
  prizeIndex: number;
  prizeId: string;
  nextSpinAt: number;
  nextSpinAtIso?: string;
  serverTime: number;
  idempotent?: boolean;
}

export interface CanonicalPrize {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  iconColor: string;
  isSpecial?: boolean;
  percentage?: number;
}

const LOCAL_LAST_SPIN_KEY = 'eft_wheel_last_spin_time_v2';
const LOCAL_NEXT_SPIN_KEY = 'eft_wheel_next_spin_time_v2';

export const wheelApi = {
  /**
   * Retrieves the canonical list of prizes from the server
   */
  async getPrizes(): Promise<CanonicalPrize[]> {
    try {
      const res = await apiClient.get<{ ok: boolean; prizes: CanonicalPrize[] }>('/api/wheel/prizes', 5000);
      if (res.ok && Array.isArray(res.prizes)) {
        return res.prizes;
      }
      throw new Error("Invalid prizes response");
    } catch (err) {
      console.warn("Failed to fetch wheel prizes from server, fallback to local:", err);
      // Fallback empty array, the UI should handle this gracefully
      return [];
    }
  },

  /**
   * Retrieves current wheel cooldown status from authoritative server
   */
  async getStatus(): Promise<WheelStatusResponse> {
    const deviceId = safeLocalStorage.getDeviceId();
    try {
      const res = await apiClient.get<WheelStatusResponse>(
        `/api/wheel/status?deviceId=${encodeURIComponent(deviceId)}`, 
        5000
      );
      
      if (res.lastSpinAt) {
        safeLocalStorage.setItem(LOCAL_LAST_SPIN_KEY, res.lastSpinAt);
      }
      if (res.nextSpinAt) {
        safeLocalStorage.setItem(LOCAL_NEXT_SPIN_KEY, res.nextSpinAt);
      }
      return res;
    } catch {
      return this.getLocalFallbackStatus();
    }
  },

  /**
   * Triggers a wheel spin with server-authoritative execution and idempotency
   */
  async spin(): Promise<WheelSpinResponse> {
    const deviceId = safeLocalStorage.getDeviceId();
    const idempotencyKey = `spin_${deviceId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const res = await apiClient.post<WheelSpinResponse>(
        '/api/wheel/spin',
        { 
          deviceId,
          idempotencyKey
        },
        10000,
        {
          'Idempotency-Key': idempotencyKey,
          'X-Device-Id': deviceId
        }
      );

      if (res.nextSpinAt) {
        safeLocalStorage.setItem(LOCAL_NEXT_SPIN_KEY, res.nextSpinAt);
        safeLocalStorage.setItem(LOCAL_LAST_SPIN_KEY, res.serverTime || Date.now());
      }
      return res;
    } catch (err: any) {
      // If server returned 429 (Cooldown), update local cache immediately
      if (err?.status === 429 || err?.response?.code === 'COOLDOWN') {
        const rawNextAt = err?.response?.nextSpinAt;
        const nextAt = typeof rawNextAt === 'number'
          ? rawNextAt
          : (err?.response?.nextSpinAtTimestamp || (rawNextAt ? new Date(rawNextAt).getTime() : Date.now() + (err?.response?.remainingMs || 86400000)));
        safeLocalStorage.setItem(LOCAL_NEXT_SPIN_KEY, nextAt);
        safeLocalStorage.setItem(LOCAL_LAST_SPIN_KEY, err?.response?.serverTime || Date.now());
        
        const error = new Error(err?.response?.message || err?.response?.error || 'مسموح بلفة واحدة كل 24 ساعة فقط.');
        (error as any).status = 429;
        (error as any).remainingMs = err?.response?.remainingMs;
        (error as any).nextSpinAt = nextAt;
        throw error;
      }

      throw err;
    }
  },

  /**
   * Read-only UI cooldown calculation based on cached server timestamp
   */
  getLocalFallbackStatus(): WheelStatusResponse {
    const now = Date.now();
    const lastSpin = safeLocalStorage.getItem<number | string>(LOCAL_LAST_SPIN_KEY);
    const nextSpin = safeLocalStorage.getItem<number | string>(LOCAL_NEXT_SPIN_KEY);

    let nextSpinMs: number | null = null;
    if (typeof nextSpin === 'number') {
      nextSpinMs = nextSpin;
    } else if (typeof nextSpin === 'string' && nextSpin.trim()) {
      const parsed = Number(nextSpin);
      nextSpinMs = !Number.isNaN(parsed) && parsed > 0 ? parsed : new Date(nextSpin).getTime();
    }

    if (!nextSpinMs || Number.isNaN(nextSpinMs)) {
      return {
        ok: true,
        canSpin: true,
        lastSpinAt: null,
        nextSpinAt: null,
        serverTime: now,
        remainingMs: 0
      };
    }

    const remainingMs = Math.max(0, nextSpinMs - now);
    const canSpin = remainingMs <= 0;

    return {
      ok: true,
      canSpin,
      lastSpinAt: typeof lastSpin === 'number' ? lastSpin : null,
      nextSpinAt: nextSpinMs,
      serverTime: now,
      remainingMs
    };
  }
};
