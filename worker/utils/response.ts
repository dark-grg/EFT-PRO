import { getCorsHeaders } from './cors';

export function jsonResponse(data: any, status = 200, request?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...getCorsHeaders(request)
    }
  });
}

export function errorResponse(message: string, status = 500, request?: Request, extra: Record<string, any> = {}): Response {
  return jsonResponse(
    {
      error: status === 400 ? 'Bad Request' : status === 404 ? 'Not Found' : status === 429 ? 'Rate Limited' : 'Server Error',
      message,
      status,
      ...extra
    },
    status,
    request
  );
}
