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

const LOCAL_LAST_SPIN_KEY = 'eft_wheel_last_spin_time_v2';
const LOCAL_NEXT_SPIN_KEY = 'eft_wheel_next_spin_time_v2';

export const wheelApi = {
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
        const nextAt = err?.response?.nextSpinAtTimestamp || (err?.response?.nextSpinAt ? new Date(err.response.nextSpinAt).getTime() : Date.now() + (err?.response?.remainingMs || 86400000));
        safeLocalStorage.setItem(LOCAL_NEXT_SPIN_KEY, nextAt);
        safeLocalStorage.setItem(LOCAL_LAST_SPIN_KEY, err?.response?.serverTime || Date.now());
        
        const error = new Error(err?.response?.message || err?.response?.error || 'مسموح بلفة واحدة كل 24 ساعة فقط.');
        (error as any).status = 429;
        (error as any).remainingMs = err?.response?.remainingMs;
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
    const lastSpin = safeLocalStorage.getItem<number>(LOCAL_LAST_SPIN_KEY);
    const nextSpin = safeLocalStorage.getItem<number>(LOCAL_NEXT_SPIN_KEY);

    if (!lastSpin || !nextSpin) {
      return {
        ok: true,
        canSpin: true,
        lastSpinAt: null,
        nextSpinAt: null,
        serverTime: now,
        remainingMs: 0
      };
    }

    const remainingMs = Math.max(0, nextSpin - now);
    const canSpin = remainingMs <= 0;

    return {
      ok: true,
      canSpin,
      lastSpinAt: lastSpin,
      nextSpinAt: nextSpin,
      serverTime: now,
      remainingMs
    };
  }
};
