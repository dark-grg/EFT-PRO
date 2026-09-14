import { apiClient } from './client';
import { safeLocalStorage } from '../storage/localStorage';

export interface WheelStatusResponse {
  canSpin: boolean;
  lastSpinAt: number | null;
  nextSpinAt: number | null;
  serverTime: number;
  remainingMs: number;
}

export interface WheelSpinResponse {
  success: boolean;
  prizeIndex: number;
  prizeId: string;
  nextSpinAt: number;
  serverTime: number;
}

const LOCAL_LAST_SPIN_KEY = 'eft_wheel_last_spin_time_v2';
const LOCAL_NEXT_SPIN_KEY = 'eft_wheel_next_spin_time_v2';
const COOLDOWN_24H_MS = 24 * 60 * 60 * 1000;

export const wheelApi = {
  /**
   * Retrieves current wheel cooldown status from server (with local offline fallback)
   */
  async getStatus(): Promise<WheelStatusResponse> {
    const deviceId = safeLocalStorage.getDeviceId();
    try {
      const res = await apiClient.get<WheelStatusResponse>(`/api/wheel/status?deviceId=${encodeURIComponent(deviceId)}`, 4000);
      // Synchronize with local storage
      if (res.lastSpinAt) {
        safeLocalStorage.setItem(LOCAL_LAST_SPIN_KEY, res.lastSpinAt);
      }
      if (res.nextSpinAt) {
        safeLocalStorage.setItem(LOCAL_NEXT_SPIN_KEY, res.nextSpinAt);
      }
      return res;
    } catch {
      // Local fallback
      return this.getLocalFallbackStatus();
    }
  },

  /**
   * Triggers a wheel spin with server authoritative verification
   */
  async spin(): Promise<WheelSpinResponse> {
    const deviceId = safeLocalStorage.getDeviceId();
    try {
      const res = await apiClient.post<WheelSpinResponse>(
        '/api/wheel/spin',
        { deviceId },
        8000
      );
      if (res.nextSpinAt) {
        safeLocalStorage.setItem(LOCAL_NEXT_SPIN_KEY, res.nextSpinAt);
        safeLocalStorage.setItem(LOCAL_LAST_SPIN_KEY, res.serverTime || Date.now());
      }
      return res;
    } catch (err: any) {
      // If network fails, allow local fallback spin ONLY if local cooldown permits
      if (err?.status === 0 || err?.code === 'NETWORK_ERROR') {
        const localStatus = this.getLocalFallbackStatus();
        if (!localStatus.canSpin) {
          throw new Error(`مسموح بلفة واحدة كل 24 ساعة فقط. يرجى الانتظار حتى انتهاء الوقت.`);
        }
        return this.executeLocalFallbackSpin();
      }
      throw err;
    }
  },

  getLocalFallbackStatus(): WheelStatusResponse {
    const now = Date.now();
    const lastSpin = safeLocalStorage.getItem<number>(LOCAL_LAST_SPIN_KEY);
    const nextSpin = safeLocalStorage.getItem<number>(LOCAL_NEXT_SPIN_KEY);

    if (!lastSpin || !nextSpin) {
      return {
        canSpin: true,
        lastSpinAt: null,
        nextSpinAt: null,
        serverTime: now,
        remainingMs: 0
      };
    }

    // Anti-clock-tampering check: if user shifted device clock backwards
    if (now < lastSpin) {
      const remainingMs = Math.max(0, nextSpin - lastSpin);
      return {
        canSpin: false,
        lastSpinAt: lastSpin,
        nextSpinAt: nextSpin,
        serverTime: now,
        remainingMs
      };
    }

    const remainingMs = Math.max(0, nextSpin - now);
    const canSpin = remainingMs <= 0;

    return {
      canSpin,
      lastSpinAt: lastSpin,
      nextSpinAt: nextSpin,
      serverTime: now,
      remainingMs
    };
  },

  executeLocalFallbackSpin(): WheelSpinResponse {
    const now = Date.now();
    const nextSpinAt = now + COOLDOWN_24H_MS;

    safeLocalStorage.setItem(LOCAL_LAST_SPIN_KEY, now);
    safeLocalStorage.setItem(LOCAL_NEXT_SPIN_KEY, nextSpinAt);

    // Weighted random selection:
    // 0: سواريز (1%)
    // 1: 150 كوينز (1%)
    // 2: ايباد برو (0%)
    // 3: كاسياس (1%)
    // 4: حظ أوفر (97%)
    const rand = Math.random() * 100;
    let prizeIndex = 4;
    let prizeId = 'better_luck';

    if (rand < 1) {
      prizeIndex = 0;
      prizeId = 'suarez';
    } else if (rand < 2) {
      prizeIndex = 1;
      prizeId = 'coins_150';
    } else if (rand < 3) {
      prizeIndex = 3;
      prizeId = 'casillas';
    }

    return {
      success: true,
      prizeIndex,
      prizeId,
      nextSpinAt,
      serverTime: now
    };
  }
};
