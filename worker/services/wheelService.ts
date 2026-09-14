import { Env, WheelRecord } from '../types';

// In-memory fallback for local dev or when KV is not configured
const inMemoryWheelStore = new Map<string, WheelRecord>();
const activeSpinLocks = new Set<string>();

export async function getWheelRecord(env: Env, deviceId: string): Promise<WheelRecord | null> {
  if (!deviceId) return null;

  if (env.WHEEL_STORE) {
    try {
      const data = await env.WHEEL_STORE.get(`wheel_${deviceId}`, 'json');
      if (data) return data as WheelRecord;
    } catch {
      // fallback
    }
  }

  return inMemoryWheelStore.get(deviceId) || null;
}

export async function saveWheelRecord(env: Env, deviceId: string, record: WheelRecord): Promise<void> {
  if (!deviceId) return;

  if (env.WHEEL_STORE) {
    try {
      // Store with 30 days TTL (2592000 seconds)
      await env.WHEEL_STORE.put(`wheel_${deviceId}`, JSON.stringify(record), {
        expirationTtl: 2592000
      });
    } catch {
      // fallback
    }
  }

  inMemoryWheelStore.set(deviceId, record);
}

export interface SpinResult {
  success: boolean;
  prizeIndex: number;
  prizeId: string;
  nextSpinAt: number;
  serverTime: number;
}

export async function executeSpin(env: Env, deviceId: string): Promise<SpinResult> {
  if (!deviceId) {
    throw new Error('Missing deviceId parameter');
  }

  if (activeSpinLocks.has(deviceId)) {
    const error: any = new Error('Spin already in progress. Please wait.');
    error.status = 429;
    throw error;
  }

  activeSpinLocks.add(deviceId);
  try {
    const now = Date.now();
    const existing = await getWheelRecord(env, deviceId);

    if (existing && existing.nextSpinAt && now < existing.nextSpinAt) {
      const remainingMs = existing.nextSpinAt - now;
      const error: any = new Error('مسموح بلفة واحدة كل 24 ساعة فقط.');
      error.status = 429;
      error.remainingMs = remainingMs;
      throw error;
    }

    // Weighted Random Configuration
    // 0: suarez (1%)
    // 1: coins_150 (1%)
    // 2: ipad_prize (0%)
    // 3: casillas (1%)
    // 4: better_luck (97%)
    const prizes = [
      { id: 'suarez', weight: 1, index: 0 },
      { id: 'coins_150', weight: 1, index: 1 },
      { id: 'ipad_prize', weight: 0, index: 2 },
      { id: 'casillas', weight: 1, index: 3 },
      { id: 'better_luck', weight: 97, index: 4 }
    ];

    const totalWeight = prizes.reduce((acc, p) => acc + p.weight, 0);
    if (totalWeight <= 0) {
      throw new Error('Wheel configuration invalid: total weight must be > 0');
    }

    const rand = Math.random() * totalWeight;
    let accumulated = 0;
    let selectedPrize = prizes[prizes.length - 1];

    for (const p of prizes) {
      accumulated += p.weight;
      if (rand < accumulated) {
        selectedPrize = p;
        break;
      }
    }

    const COOLDOWN_24H_MS = 24 * 60 * 60 * 1000;
    const nextSpinAt = now + COOLDOWN_24H_MS;

    const record: WheelRecord = {
      lastSpinAt: now,
      nextSpinAt
    };

    await saveWheelRecord(env, deviceId, record);

    return {
      success: true,
      prizeIndex: selectedPrize.index,
      prizeId: selectedPrize.id,
      nextSpinAt,
      serverTime: now
    };
  } finally {
    activeSpinLocks.delete(deviceId);
  }
}
