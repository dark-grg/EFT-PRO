import { Capacitor } from '@capacitor/core';

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

/**
 * Detects whether the app is executing inside a Capacitor native app wrapper (Android / iOS).
 * On Android Capacitor, the WebView scheme is https://localhost (with no port) or capacitor://.
 */
export const isNativeApp = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    if (Capacitor.isNativePlatform()) {
      return true;
    }
  } catch {}

  const origin = window.location.origin || '';
  const hostname = window.location.hostname || '';
  const protocol = window.location.protocol || '';

  // Android Capacitor uses https://localhost (no port), iOS uses capacitor://localhost
  if (
    protocol === 'capacitor:' ||
    protocol === 'file:' ||
    origin.startsWith('capacitor://') ||
    origin.startsWith('file://') ||
    (hostname === 'localhost' && !window.location.port) ||
    origin === 'https://localhost' ||
    origin === 'http://localhost'
  ) {
    return true;
  }

  return false;
};

const getFullUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // 1. In native Android/iOS APK, ALWAYS route API requests to the production Cloudflare worker
  if (isNativeApp()) {
    return `${PRODUCTION_WORKER_URL}${cleanEndpoint}`;
  }

  // 2. If explicitly configured in env, use it
  const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  if (envBaseUrl) {
    return `${envBaseUrl}${cleanEndpoint}`;
  }

  // 3. In web preview (e.g. dev server / Cloud Run container), use relative endpoint (handled by Express server.ts)
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
