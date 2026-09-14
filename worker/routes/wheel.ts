import { Env } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';
import { getWheelRecord, executeSpin } from '../services/wheelService';

export function handleGetTime(request: Request): Response {
  return jsonResponse({
    serverTime: Date.now(),
    iso: new Date().toISOString()
  }, 200, request);
}

export async function handleGetWheelStatus(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const deviceId = url.searchParams.get('deviceId')?.trim();
  const now = Date.now();

  if (!deviceId) {
    return jsonResponse({
      canSpin: true,
      lastSpinAt: null,
      nextSpinAt: null,
      serverTime: now,
      remainingMs: 0
    }, 200, request);
  }

  const userRecord = await getWheelRecord(env, deviceId);

  if (!userRecord || !userRecord.nextSpinAt) {
    return jsonResponse({
      canSpin: true,
      lastSpinAt: null,
      nextSpinAt: null,
      serverTime: now,
      remainingMs: 0
    }, 200, request);
  }

  const remainingMs = Math.max(0, userRecord.nextSpinAt - now);
  const canSpin = remainingMs <= 0;

  return jsonResponse({
    canSpin,
    lastSpinAt: userRecord.lastSpinAt,
    nextSpinAt: userRecord.nextSpinAt,
    serverTime: now,
    remainingMs
  }, 200, request);
}

export async function handlePostWheelSpin(request: Request, env: Env): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON payload', 400, request);
  }

  const deviceId = body?.deviceId;
  if (!deviceId || typeof deviceId !== 'string') {
    return errorResponse('Missing deviceId parameter', 400, request);
  }

  try {
    const result = await executeSpin(env, deviceId.trim());
    return jsonResponse(result, 200, request);
  } catch (err: any) {
    const status = err?.status || 500;
    return errorResponse(err?.message || 'Failed to execute spin', status, request, {
      remainingMs: err?.remainingMs
    });
  }
}
