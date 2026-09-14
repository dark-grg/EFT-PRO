/**
 * Unified API Client for EFT PRO
 * Handles request timeouts, JSON parsing, error normalization, and Android WebView connectivity.
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const PRODUCTION_WORKER_URL = 'https://eft-pro.grg0.workers.dev';

const getFullUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  
  // If explicitly configured in env, use it
  if (envBaseUrl) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${envBaseUrl}${cleanEndpoint}`;
  }

  // If in browser web mode on the same domain (e.g. dev proxy or deployed applet), use relative endpoint
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (origin.startsWith('http://localhost') || origin.startsWith('capacitor://') || origin.startsWith('file://')) {
      // In Capacitor native app, route directly to the Cloudflare production worker
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      return `${PRODUCTION_WORKER_URL}${cleanEndpoint}`;
    }
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return cleanEndpoint;
};

export const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}, timeoutMs = 25000): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const fullUrl = getFullUrl(endpoint);

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timer);

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data: any = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        let msg = data?.message || data?.error || `HTTP error ${response.status}`;
        if (response.status === 503) {
          msg = 'خوادم الخدمة تشهد ضغطاً مؤقتاً حالياً، يرجى المحاولة بعد لحظات.';
        } else if (response.status === 429) {
          msg = data?.message || data?.error || 'مسموح بلفة واحدة كل 24 ساعة فقط.';
        } else if (response.status === 404) {
          msg = 'المورد المطلوب غير متاح.';
        }
        throw new ApiError(msg, response.status, data?.code, data);
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new ApiError('انتهت مهلة الاتصال بالخادم، يرجى التحقق من الشبكة وإعادة المحاولة.', 408, 'TIMEOUT');
      }
      if (err instanceof ApiError) {
        throw err;
      }
      // Offline / Network error
      throw new ApiError(
        navigator.onLine ? 'تعذر الاتصال بالخادم، يرجى إعادة المحاولة.' : 'لا يوجد اتصال بالإنترنت حالياً.',
        0,
        'NETWORK_ERROR'
      );
    }
  },

  get<T>(endpoint: string, timeoutMs?: number, headers?: Record<string, string>): Promise<T> {
    return apiClient.request<T>(endpoint, { method: 'GET', headers }, timeoutMs);
  },

  post<T>(endpoint: string, body?: any, timeoutMs?: number, headers?: Record<string, string>): Promise<T> {
    return apiClient.request<T>(
      endpoint,
      {
        method: 'POST',
        headers,
        body: body ? JSON.stringify(body) : undefined
      },
      timeoutMs
    );
  }
};
