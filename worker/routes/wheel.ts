import { Env } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';
import { getWheelStatus, executeSpin } from '../services/wheelService';
import { DEFAULT_PRIZES } from '../durable-objects/WheelDurableObject';

export function handleGetTime(request: Request): Response {
  const now = Date.now();
  return jsonResponse({
    ok: true,
    serverTime: now,
    iso: new Date(now).toISOString()
  }, 200, request);
}

export function handleGetWheelPrizes(request: Request): Response {
  return jsonResponse({
    ok: true,
    prizes: DEFAULT_PRIZES
  }, 200, request);
}

export async function handleGetWheelStatus(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const deviceId = url.searchParams.get('deviceId')?.trim() || '';

  const status = await getWheelStatus(env, deviceId);

  return jsonResponse(status, 200, request);
}

export async function handlePostWheelSpin(request: Request, env: Env): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON payload', 400, request);
  }

  const deviceId = body?.deviceId;
  if (!deviceId || typeof deviceId !== 'string' || !deviceId.trim()) {
    return errorResponse('Missing or invalid deviceId parameter', 400, request);
  }

  const idempotencyKey = 
    request.headers.get('Idempotency-Key') || 
    body?.idempotencyKey || 
    null;

  try {
    const result = await executeSpin(env, deviceId.trim(), {
      idempotencyKey,
      originRequest: request
    });
    return jsonResponse(result, 200, request);
  } catch (err: any) {
    const status = err?.status || 500;
    
    if (status === 429) {
      const nextSpinTimestamp = typeof err?.nextSpinAt === 'number' 
        ? err.nextSpinAt 
        : (err?.nextSpinAtTimestamp || (err?.nextSpinAt ? new Date(err.nextSpinAt).getTime() : Date.now() + (err?.remainingMs || 86400000)));

      return jsonResponse({
        ok: false,
        success: false,
        code: 'COOLDOWN',
        error: err?.message || 'مسموح بلفة واحدة كل 24 ساعة فقط.',
        message: err?.message || 'مسموح بلفة واحدة كل 24 ساعة فقط.',
        remainingMs: err?.remainingMs ?? Math.max(0, nextSpinTimestamp - Date.now()),
        nextSpinAt: nextSpinTimestamp,
        nextSpinAtTimestamp: nextSpinTimestamp,
        nextSpinAtIso: err?.nextSpinAtIso || new Date(nextSpinTimestamp).toISOString(),
        serverTime: err?.serverTime || Date.now()
      }, 429, request);
    }

    if (err?.code === 'CONFIGURATION_REJECTED') {
      return jsonResponse({
        ok: false,
        success: false,
        code: 'CONFIGURATION_REJECTED',
        error: err?.message || 'Configuration rejected'
      }, 400, request);
    }

    return errorResponse(err?.message || 'Failed to execute spin', status, request, {
      remainingMs: err?.remainingMs
    });
  }
}
