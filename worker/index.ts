/**
 * EFT PRO — Cloudflare Workers Main Entry Point
 */

import { Env } from './types';
import { handleOptions } from './utils/cors';
import { jsonResponse, errorResponse } from './utils/response';
import { handleAnalyzeFormation } from './routes/formation';
import { handleGetTime, handleGetWheelStatus, handlePostWheelSpin, handleGetWheelPrizes } from './routes/wheel';
import { handleGetPlayerCards, handlePostEfhubParse, handlePostResyncPlayers } from './routes/players';

// Export Durable Object class for Cloudflare Worker runtime binding
export { WheelDurableObject } from './durable-objects/WheelDurableObject';

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    // 1. Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      // 2. Health check route
      if (pathname === '/api/health' || pathname === '/health') {
        return jsonResponse({
          ok: true,
          service: 'eft-pro-api',
          runtime: 'cloudflare-workers',
          durableObjects: !!env.WHEEL_DO,
          timestamp: new Date().toISOString()
        }, 200, request);
      }

      // 3. Server Time endpoint
      if (pathname === '/api/time') {
        if (request.method === 'GET') {
          return handleGetTime(request);
        }
        return errorResponse('Method Not Allowed', 405, request);
      }

      // 4. Lucky Wheel endpoints
      if (pathname === '/api/wheel/prizes') {
        if (request.method === 'GET') {
          return handleGetWheelPrizes(request);
        }
        return errorResponse('Method Not Allowed', 405, request);
      }

      if (pathname === '/api/wheel/status') {
        if (request.method === 'GET') {
          return await handleGetWheelStatus(request, env);
        }
        return errorResponse('Method Not Allowed', 405, request);
      }

      if (pathname === '/api/wheel/spin') {
        if (request.method === 'POST') {
          return await handlePostWheelSpin(request, env);
        }
        return errorResponse('Method Not Allowed', 405, request);
      }

      // 5. Formation AI endpoint
      if (pathname === '/api/analyze-formation') {
        if (request.method === 'POST') {
          return await handleAnalyzeFormation(request, env);
        }
        return errorResponse('Method Not Allowed', 405, request);
      }

      // 6. Player Cards endpoints
      if (pathname === '/api/players/cards') {
        if (request.method === 'GET') {
          return await handleGetPlayerCards(request, env);
        }
        return errorResponse('Method Not Allowed', 405, request);
      }

      if (pathname === '/api/efhub/parse') {
        if (request.method === 'POST') {
          return await handlePostEfhubParse(request);
        }
        return errorResponse('Method Not Allowed', 405, request);
      }

      if (pathname === '/api/admin/resync-players') {
        if (request.method === 'POST') {
          return await handlePostResyncPlayers(request, env);
        }
        return errorResponse('Method Not Allowed', 405, request);
      }

      // 7. Fallback for unhandled API routes
      if (pathname.startsWith('/api/')) {
        return errorResponse(`Endpoint ${pathname} not found`, 404, request);
      }

      // Default root health response
      return jsonResponse({
        ok: true,
        service: 'eft-pro-api',
        message: 'EFT PRO Cloudflare Worker API is active and ready.'
      }, 200, request);
    } catch (err: any) {
      console.error('Unhandled Worker Error:', err);
      return errorResponse(err?.message || 'Internal Server Error', 500, request);
    }
  }
};
