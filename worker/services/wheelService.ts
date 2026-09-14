import { Env, WheelRecord, WheelState } from '../types';
import { 
  DEFAULT_PRIZES, 
  PrizeOption, 
  selectWeightedPrize, 
  COOLDOWN_24H_MS 
} from '../durable-objects/WheelDurableObject';

// In-memory persistent state for fallback execution environments
const localDurableStore = new Map<string, WheelState>();
const localIdempStore = new Map<string, any>();
const localDeviceQueues = new Map<string, Promise<any>>();

export interface SpinResult {
  ok: boolean;
  success: boolean;
  prizeIndex: number;
  prizeId: string;
  nextSpinAt: number;
  nextSpinAtIso?: string;
  serverTime: number;
  idempotent?: boolean;
}

export interface WheelStatusResult {
  ok?: boolean;
  canSpin: boolean;
  lastSpinAt: number | null;
  nextSpinAt: number | null;
  nextSpinAtIso?: string | null;
  serverTime: number;
  remainingMs: number;
}

/**
 * Retrieves Wheel Status for a given deviceId via Durable Object
 */
export async function getWheelStatus(env: Env, deviceId: string): Promise<WheelStatusResult> {
  const now = Date.now();
  if (!deviceId) {
    return {
      canSpin: true,
      lastSpinAt: null,
      nextSpinAt: null,
      serverTime: now,
      remainingMs: 0
    };
  }

  // 1. Primary: Use Cloudflare Durable Object instance
  if (env.WHEEL_DO) {
    try {
      const doId = env.WHEEL_DO.idFromName(deviceId);
      const stub = env.WHEEL_DO.get(doId);
      const res = await stub.fetch('http://wheel-do/status');
      if (res.ok) {
        return (await res.json()) as WheelStatusResult;
      }
    } catch (err) {
      console.warn('Durable Object status fetch fallback:', err);
    }
  }

  // 2. Fallback using KV if available
  if (env.WHEEL_STORE) {
    try {
      const kvData = await env.WHEEL_STORE.get(`wheel_${deviceId}`, 'json') as WheelRecord | null;
      if (kvData && kvData.nextSpinAt) {
        const remainingMs = Math.max(0, kvData.nextSpinAt - now);
        return {
          canSpin: remainingMs <= 0,
          lastSpinAt: kvData.lastSpinAt,
          nextSpinAt: kvData.nextSpinAt,
          nextSpinAtIso: new Date(kvData.nextSpinAt).toISOString(),
          serverTime: now,
          remainingMs
        };
      }
    } catch {
      // ignore
    }
  }

  // 3. In-memory fallback
  const localState = localDurableStore.get(deviceId);
  if (!localState || !localState.nextSpinAt) {
    return {
      canSpin: true,
      lastSpinAt: null,
      nextSpinAt: null,
      serverTime: now,
      remainingMs: 0
    };
  }

  const remainingMs = Math.max(0, localState.nextSpinAt - now);
  return {
    canSpin: remainingMs <= 0,
    lastSpinAt: localState.lastSpinAt,
    nextSpinAt: localState.nextSpinAt,
    nextSpinAtIso: new Date(localState.nextSpinAt).toISOString(),
    serverTime: now,
    remainingMs
  };
}

/**
 * Atomically executes a Spin through the Device's Durable Object
 */
export async function executeSpin(
  env: Env, 
  deviceId: string, 
  options: { 
    idempotencyKey?: string | null; 
    prizes?: PrizeOption[];
    originRequest?: Request;
  } = {}
): Promise<SpinResult> {
  if (!deviceId || typeof deviceId !== 'string' || !deviceId.trim()) {
    const error: any = new Error('Missing or invalid deviceId parameter');
    error.status = 400;
    throw error;
  }

  const trimmedDeviceId = deviceId.trim();

  // 1. Primary: Delegate directly to Cloudflare Durable Object for this deviceId
  if (env.WHEEL_DO) {
    const doId = env.WHEEL_DO.idFromName(trimmedDeviceId);
    const stub = env.WHEEL_DO.get(doId);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const response = await stub.fetch('http://wheel-do/spin', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        deviceId: trimmedDeviceId,
        idempotencyKey: options.idempotencyKey,
        prizes: options.prizes
      })
    });

    const data: any = await response.json().catch(() => ({}));

    if (response.status === 429) {
      const error: any = new Error(data?.error || data?.message || 'مسموح بلفة واحدة كل 24 ساعة فقط.');
      error.status = 429;
      error.code = 'COOLDOWN';
      error.remainingMs = data?.remainingMs;
      error.nextSpinAt = data?.nextSpinAt;
      error.nextSpinAtTimestamp = data?.nextSpinAtTimestamp;
      error.serverTime = data?.serverTime || Date.now();
      throw error;
    }

    if (!response.ok) {
      const error: any = new Error(data?.error || 'Failed to execute spin');
      error.status = response.status;
      error.code = data?.code || 'SPIN_ERROR';
      throw error;
    }

    // Also mirror to KV for backup query speed if KV namespace is attached
    if (env.WHEEL_STORE && data?.nextSpinAt) {
      env.WHEEL_STORE.put(`wheel_${trimmedDeviceId}`, JSON.stringify({
        lastSpinAt: data.serverTime,
        nextSpinAt: data.nextSpinAt,
        lastPrizeId: data.prizeId,
        lastPrizeIndex: data.prizeIndex
      }), { expirationTtl: 2592000 }).catch(() => {});
    }

    return data as SpinResult;
  }

  // 2. Fallback Sequential Promise Queue per deviceId (replicates DO atomic serialization in test/dev)
  const currentQueue = localDeviceQueues.get(trimmedDeviceId) || Promise.resolve();
  
  const execution = currentQueue.then(async () => {
    const now = Date.now();

    // Idempotency check
    if (options.idempotencyKey) {
      const cached = localIdempStore.get(options.idempotencyKey);
      if (cached) {
        return {
          ...cached,
          idempotent: true,
          serverTime: now
        };
      }
    }

    const existing = localDurableStore.get(trimmedDeviceId);
    if (existing && existing.nextSpinAt && now < existing.nextSpinAt) {
      const remainingMs = existing.nextSpinAt - now;
      const nextSpinAtIso = new Date(existing.nextSpinAt).toISOString();
      const error: any = new Error('مسموح بلفة واحدة كل 24 ساعة فقط.');
      error.status = 429;
      error.code = 'COOLDOWN';
      error.remainingMs = remainingMs;
      error.nextSpinAt = nextSpinAtIso;
      error.nextSpinAtTimestamp = existing.nextSpinAt;
      error.serverTime = now;
      throw error;
    }

    // Weighted selection
    const selectedPrize = selectWeightedPrize(DEFAULT_PRIZES);
    const nextSpinAt = now + COOLDOWN_24H_MS;

    const newState: WheelState = {
      deviceId: trimmedDeviceId,
      lastSpinAt: now,
      nextSpinAt,
      lastPrizeId: selectedPrize.id,
      lastPrizeIndex: selectedPrize.index,
      updatedAt: now
    };

    localDurableStore.set(trimmedDeviceId, newState);

    const result: SpinResult = {
      ok: true,
      success: true,
      prizeIndex: selectedPrize.index,
      prizeId: selectedPrize.id,
      nextSpinAt,
      nextSpinAtIso: new Date(nextSpinAt).toISOString(),
      serverTime: now
    };

    if (options.idempotencyKey) {
      localIdempStore.set(options.idempotencyKey, result);
    }

    return result;
  });

  localDeviceQueues.set(trimmedDeviceId, execution.catch(() => {}));
  return await execution;
}

// Retain legacy method for backward compatibility
export async function getWheelRecord(env: Env, deviceId: string): Promise<WheelRecord | null> {
  const status = await getWheelStatus(env, deviceId);
  if (!status.lastSpinAt || !status.nextSpinAt) return null;
  return {
    lastSpinAt: status.lastSpinAt,
    nextSpinAt: status.nextSpinAt
  };
}
