import { Env, WheelState } from '../types';
import { jsonResponse } from '../utils/response';

export interface PrizeOption {
  id: string;
  weight: number;
  index: number;
  name: string;
  subtitle: string;
  type: string;
  iconColor: string;
  isSpecial?: boolean;
}

export const DEFAULT_PRIZES: PrizeOption[] = [
  { 
    id: 'suarez', 
    weight: 1, 
    index: 0,
    name: 'لاعب مميز: لويس سواريز',
    subtitle: 'طاقات 100 OVR - إبيك بوستر',
    type: 'special_player',
    iconColor: '#EAB308',
    isSpecial: true
  },
  { 
    id: 'coins_150', 
    weight: 1, 
    index: 1,
    name: '150 كوينز',
    subtitle: 'شحن كوينز مجاني للحساب',
    type: 'coins',
    iconColor: '#F59E0B'
  },
  { 
    id: 'ipad_prize', 
    weight: 0, 
    index: 2,
    name: 'جهاز iPad Pro للألعاب',
    subtitle: 'شاشة 120Hz فائقة السرعة',
    type: 'ipad',
    iconColor: '#06B6D4'
  },
  { 
    id: 'casillas', 
    weight: 1, 
    index: 3,
    name: 'إيكر كاسياس 103',
    subtitle: 'حارس أسطوري - إبيك بوستر ريال مدريد',
    type: 'special_player',
    iconColor: '#38BDF8'
  },
  { 
    id: 'better_luck', 
    weight: 97, 
    index: 4,
    name: 'حظ أوفر',
    subtitle: 'حاول مجدداً في السحب القادم',
    type: 'better_luck',
    iconColor: '#94A3B8'
  }
];

export const COOLDOWN_24H_MS = 24 * 60 * 60 * 1000;

/**
 * Mathematically sound weighted random selection
 */
export function selectWeightedPrize(
  prizes: PrizeOption[],
  randomValue: number = Math.random()
): PrizeOption {
  if (!Array.isArray(prizes) || prizes.length === 0) {
    throw new Error('CONFIGURATION_REJECTED: Prize list cannot be empty');
  }

  const sanitized = prizes.map(p => ({
    ...p,
    weight: typeof p.weight === 'number' && !isNaN(p.weight) ? Math.max(0, p.weight) : 0
  }));

  const totalWeight = sanitized.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight <= 0) {
    throw new Error('CONFIGURATION_REJECTED: total weight must be greater than 0');
  }

  // Clamped random value in [0, 1)
  const safeRand = Math.max(0, Math.min(0.999999999999, randomValue));
  const target = safeRand * totalWeight;

  let accumulated = 0;
  for (const prize of sanitized) {
    if (prize.weight <= 0) continue;
    accumulated += prize.weight;
    if (target < accumulated) {
      return prize;
    }
  }

  // Fallback to the last item with weight > 0
  for (let i = sanitized.length - 1; i >= 0; i--) {
    if (sanitized[i].weight > 0) return sanitized[i];
  }

  return sanitized[0];
}

/**
 * Durable Object for Atomic, Concurrent-Safe Wheel Spin Coordination per Device ID
 */
export class WheelDurableObject {
  state: DurableObjectState;
  env: Env;
  private spinQueue: Promise<any> = Promise.resolve();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'GET' && (pathname === '/status' || pathname === '/')) {
      return this.handleStatus(request);
    }

    if (request.method === 'POST' && (pathname === '/spin' || pathname === '/')) {
      // Execute all spin operations sequentially through an atomic promise chain
      return new Promise<Response>((resolve) => {
        this.spinQueue = this.spinQueue
          .catch(() => {})
          .then(async () => {
            try {
              const res = await this.handleSpin(request);
              resolve(res);
            } catch (err: any) {
              resolve(jsonResponse({ 
                ok: false, 
                success: false, 
                error: err?.message || 'Spin execution failed' 
              }, 500, request));
            }
          });
      });
    }

    if (request.method === 'POST' && pathname === '/reset') {
      await this.state.storage.deleteAll();
      return jsonResponse({ ok: true, message: 'State reset successfully' }, 200, request);
    }

    return jsonResponse({ ok: false, error: 'Endpoint not found in Durable Object' }, 404, request);
  }

  private async handleStatus(request: Request): Promise<Response> {
    const state = await this.state.storage.get<WheelState>('spin_state');
    const now = Date.now();

    const lastSpinAt = state?.lastSpinAt ?? null;
    const nextSpinAt = state?.nextSpinAt ?? null;
    const remainingMs = nextSpinAt ? Math.max(0, nextSpinAt - now) : 0;
    const canSpin = remainingMs <= 0;

    return jsonResponse({
      ok: true,
      canSpin,
      lastSpinAt,
      nextSpinAt,
      nextSpinAtIso: nextSpinAt ? new Date(nextSpinAt).toISOString() : null,
      serverTime: now,
      remainingMs
    }, 200, request);
  }

  private async handleSpin(request: Request): Promise<Response> {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const idempotencyKey = 
      request.headers.get('Idempotency-Key') || 
      body?.idempotencyKey || 
      null;

    const now = Date.now();

    // 1. Check Idempotency Key cache
    if (idempotencyKey) {
      const cached = await this.state.storage.get<any>(`idemp_${idempotencyKey}`);
      if (cached) {
        return jsonResponse({
          ...cached,
          idempotent: true,
          serverTime: now
        }, 200, request);
      }
    }

    // 2. Read persistent state from Durable Object storage
    const state = await this.state.storage.get<WheelState>('spin_state');

    // 3. Strict 24h Cooldown enforcement from Server Time only
    if (state && state.nextSpinAt && now < state.nextSpinAt) {
      const remainingMs = state.nextSpinAt - now;
      const nextSpinAtIso = new Date(state.nextSpinAt).toISOString();
      return jsonResponse({
        ok: false,
        success: false,
        code: 'COOLDOWN',
        error: 'مسموح بلفة واحدة كل 24 ساعة فقط.',
        message: 'مسموح بلفة واحدة كل 24 ساعة فقط.',
        remainingMs,
        nextSpinAt: state.nextSpinAt,
        nextSpinAtTimestamp: state.nextSpinAt,
        nextSpinAtIso,
        serverTime: now
      }, 429, request);
    }

    // 4. Validate prize configuration & pick weighted random
    if (body?.prizes || body?.weights) {
      return jsonResponse({
        ok: false,
        success: false,
        code: 'CONFIGURATION_REJECTED',
        error: 'Clients are strictly forbidden from specifying prizes or weights. Server is the sole Source of Truth.'
      }, 400, request);
    }
    
    let selectedPrize: PrizeOption;
    try {
      selectedPrize = selectWeightedPrize(DEFAULT_PRIZES);
    } catch (err: any) {
      return jsonResponse({
        ok: false,
        success: false,
        code: 'CONFIGURATION_REJECTED',
        error: err?.message || 'Invalid prize configuration'
      }, 400, request);
    }

    // 5. Update atomic state in Durable Object storage
    const nextSpinAt = now + COOLDOWN_24H_MS;
    const newState: WheelState = {
      deviceId: body?.deviceId || 'unknown',
      lastSpinAt: now,
      nextSpinAt,
      lastPrizeId: selectedPrize.id,
      lastPrizeIndex: selectedPrize.index,
      updatedAt: now
    };

    await this.state.storage.put('spin_state', newState);

    const result = {
      ok: true,
      success: true,
      prizeIndex: selectedPrize.index,
      prizeId: selectedPrize.id,
      nextSpinAt,
      nextSpinAtIso: new Date(nextSpinAt).toISOString(),
      serverTime: now
    };

    // 6. Cache idempotency key if present
    if (idempotencyKey) {
      await this.state.storage.put(`idemp_${idempotencyKey}`, result);
    }

    return jsonResponse(result, 200, request);
  }
}
