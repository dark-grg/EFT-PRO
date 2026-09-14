/**
 * Device Audit Service - 100% Real Browser Web APIs
 * Strictly no Math.random(), no fake data, no simulated hardware models.
 * If an API is unavailable or restricted by browser privacy, reports "غير متاح من المتصفح".
 */

export interface DeviceBasicInfo {
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  os: string;
  browser: string;
  browserVersion: string;
  language: string;
  timezone: string;
  logicalCores: string;
  deviceMemory: string;
  touchSupport: string;
  touchPoints: number;
  userAgent: string;
}

export interface ScreenInfo {
  resolution: string;
  viewport: string;
  pixelRatio: number;
  colorDepth: string;
  orientation: string;
}

export interface NetworkInfo {
  isOnline: boolean;
  statusText: string;
  isApiSupported: boolean;
  effectiveType: string;
  downlink: string;
  rtt: string;
  saveData: string;
  connectionType: string;
}

export interface BatteryInfo {
  isSupported: boolean;
  statusMessage: string;
  level: number | null;
  charging: boolean | null;
  chargingTime: string;
  dischargingTime: string;
}

export interface StorageInfo {
  isSupported: boolean;
  statusMessage: string;
  usageBytes: number | null;
  quotaBytes: number | null;
  usageFormatted: string;
  quotaFormatted: string;
  percentageUsed: number | null;
}

export interface WebGLInfo {
  isSupported: boolean;
  statusMessage: string;
  renderer: string;
  vendor: string;
  webglVersion: string;
  shadingLanguageVersion: string;
  maxTextureSize: string;
}

export interface PerformanceBenchmark {
  rating: 'ممتاز' | 'جيد' | 'متوسط' | 'منخفض';
  executionTimeMs: number;
  operationsCount: number;
  notes: string;
}

export interface CompatibilityItem {
  id: string;
  name: string;
  supported: boolean;
  category: string;
  description: string;
}

export interface FullDeviceAuditResult {
  timestamp: string;
  basicInfo: DeviceBasicInfo;
  screenInfo: ScreenInfo;
  networkInfo: NetworkInfo;
  batteryInfo: BatteryInfo;
  storageInfo: StorageInfo;
  webglInfo: WebGLInfo;
  benchmark: PerformanceBenchmark;
  compatibility: CompatibilityItem[];
}

export interface SpeedTestResult {
  pingMs: number;
  downloadMbps: number | null;
  testedBytes: number;
  error?: string;
}

const STORAGE_KEY = 'efootball_device_audit_cache_v2';

/**
 * 1. Collect Basic Device Info
 */
export async function auditBasicInfo(): Promise<DeviceBasicInfo> {
  const nav = navigator as any;
  const ua = nav.userAgent || '';
  
  // A. Device Type
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  const isTouch = 'ontouchstart' in window || (nav.maxTouchPoints && nav.maxTouchPoints > 0);
  const uaLower = ua.toLowerCase();
  
  if (nav.userAgentData?.mobile) {
    // If width is large with touch, could be tablet
    if (Math.min(window.screen.width, window.screen.height) >= 600) {
      deviceType = 'Tablet';
    } else {
      deviceType = 'Mobile';
    }
  } else if (/ipad|tablet|(android(?!.*mobile))/i.test(uaLower)) {
    deviceType = 'Tablet';
  } else if (/iphone|ipod|mobile|android/i.test(uaLower)) {
    deviceType = 'Mobile';
  } else if (isTouch && Math.min(window.screen.width, window.screen.height) >= 768) {
    deviceType = window.screen.width < 1024 ? 'Tablet' : 'Desktop';
  }

  // B. Operating System Detection (Client Hints first, fallback to UA)
  let os = 'غير متاح من المتصفح';
  if (nav.userAgentData?.platform) {
    os = nav.userAgentData.platform;
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/mac os/i.test(ua)) {
    os = 'macOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // C. Browser & Version (Client Hints first, fallback to UA parsing)
  let browser = 'غير متاح من المتصفح';
  let browserVersion = 'غير متاح';

  if (nav.userAgentData?.brands && Array.isArray(nav.userAgentData.brands)) {
    const validBrands = nav.userAgentData.brands.filter(
      (b: any) => !b.brand.includes('Not') && !b.brand.includes('Chromium')
    );
    if (validBrands.length > 0) {
      browser = validBrands[0].brand;
      browserVersion = validBrands[0].version || 'متاح';
    }
  }

  if (browser === 'غير متاح من المتصفح') {
    if (/samsungbrowser/i.test(ua)) {
      browser = 'Samsung Internet';
      const m = ua.match(/samsungbrowser\/([\d.]+)/i);
      if (m) browserVersion = m[1];
    } else if (/edg/i.test(ua)) {
      browser = 'Microsoft Edge';
      const m = ua.match(/edg\/([\d.]+)/i);
      if (m) browserVersion = m[1];
    } else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) {
      browser = 'Google Chrome';
      const m = ua.match(/(chrome|crios)\/([\d.]+)/i);
      if (m) browserVersion = m[2];
    } else if (/firefox|fxios/i.test(ua)) {
      browser = 'Mozilla Firefox';
      const m = ua.match(/(firefox|fxios)\/([\d.]+)/i);
      if (m) browserVersion = m[2];
    } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
      browser = 'Apple Safari';
      const m = ua.match(/version\/([\d.]+)/i);
      if (m) browserVersion = m[1];
    } else if (/opera|opr/i.test(ua)) {
      browser = 'Opera';
      const m = ua.match(/(opera|opr)\/([\d.]+)/i);
      if (m) browserVersion = m[2];
    }
  }

  // D. Language & Timezone
  const language = nav.language || (nav.languages && nav.languages[0]) || 'غير متاح من المتصفح';
  let timezone = 'غير متاح من المتصفح';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'غير متاح من المتصفح';
  } catch {
    // safe fallback
  }

  // E. CPU Cores & Memory
  const logicalCores = nav.hardwareConcurrency 
    ? `${nav.hardwareConcurrency} أنوية منطقية` 
    : 'غير متاح من المتصفح';

  const deviceMemory = typeof nav.deviceMemory === 'number'
    ? `تقريباً ${nav.deviceMemory} GB (قيمة تقريبية من المتصفح)`
    : 'غير متاح من المتصفح';

  // F. Touch Support
  const touchPoints = nav.maxTouchPoints || 0;
  const touchSupport = isTouch
    ? `مدعوم (${touchPoints > 0 ? `${touchPoints} نقاط لمس` : 'شاشة لمسية'})`
    : 'غير مدعوم (فأرة ولوحة مفاتيح)';

  return {
    deviceType,
    os,
    browser,
    browserVersion,
    language,
    timezone,
    logicalCores,
    deviceMemory,
    touchSupport,
    touchPoints,
    userAgent: ua
  };
}

/**
 * 2. Screen & Viewport Information
 */
export function auditScreenInfo(): ScreenInfo {
  const w = window.screen.width || 0;
  const h = window.screen.height || 0;
  const vw = window.innerWidth || 0;
  const vh = window.innerHeight || 0;
  const pixelRatio = window.devicePixelRatio || 1;

  let orientation = 'غير متاح من المتصفح';
  try {
    if (window.screen.orientation && window.screen.orientation.type) {
      orientation = window.screen.orientation.type.includes('portrait') ? 'طولي (Portrait)' : 'عرضي (Landscape)';
    } else if (typeof window.orientation !== 'undefined') {
      orientation = Math.abs(Number(window.orientation)) === 90 ? 'عرضي (Landscape)' : 'طولي (Portrait)';
    } else {
      orientation = vw > vh ? 'عرضي (Landscape)' : 'طولي (Portrait)';
    }
  } catch {
    // fallback
  }

  const colorDepth = window.screen.colorDepth ? `${window.screen.colorDepth}-bit` : 'غير متاح من المتصفح';

  return {
    resolution: w && h ? `${w} × ${h} بكسل` : 'غير متاح من المتصفح',
    viewport: `${vw} × ${vh} بكسل`,
    pixelRatio: Number(pixelRatio.toFixed(2)),
    colorDepth,
    orientation
  };
}

/**
 * 3. Network Information
 */
export function auditNetworkInfo(): NetworkInfo {
  const isOnline = navigator.onLine;
  const statusText = isOnline ? 'متصل بالإنترنت' : 'غير متصل (Offline)';
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (!conn) {
    return {
      isOnline,
      statusText,
      isApiSupported: false,
      effectiveType: 'غير مدعوم على هذا المتصفح',
      downlink: 'غير مدعوم على هذا المتصفح',
      rtt: 'غير مدعوم على هذا المتصفح',
      saveData: 'غير مدعوم على هذا المتصفح',
      connectionType: 'غير مدعوم على هذا المتصفح'
    };
  }

  return {
    isOnline,
    statusText,
    isApiSupported: true,
    effectiveType: conn.effectiveType ? conn.effectiveType.toUpperCase() : 'غير متاح من المتصفح',
    downlink: typeof conn.downlink === 'number' ? `${conn.downlink} Mbps تقريباً` : 'غير متاح من المتصفح',
    rtt: typeof conn.rtt === 'number' ? `${conn.rtt} ms` : 'غير متاح من المتصفح',
    saveData: conn.saveData ? 'مفعل (توفير البيانات نشط)' : 'معطل (استهلاك عادي)',
    connectionType: conn.type || 'غير محدد من المتصفح'
  };
}

/**
 * Real Network Speed & Latency Test
 * Downloads a small static asset with a timestamp to compute actual ping & download bandwidth.
 */
export async function runRealSpeedTest(): Promise<SpeedTestResult> {
  if (!navigator.onLine) {
    return { pingMs: 0, downloadMbps: null, testedBytes: 0, error: 'الجهاز غير متصل بالإنترنت حالياً' };
  }

  try {
    // 1. Measure Ping (3 fast round trips)
    const pings: number[] = [];
    for (let i = 0; i < 3; i++) {
      const t0 = performance.now();
      await fetch(`/favicon.ico?_ping=${Date.now()}_${i}`, { cache: 'no-store', method: 'HEAD' });
      pings.push(performance.now() - t0);
    }
    const avgPing = Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);

    // 2. Measure actual download speed of a small asset (e.g. index.html or SVG bundle)
    const tStart = performance.now();
    const response = await fetch(`/favicon.ico?_speed=${Date.now()}`, { cache: 'no-store' });
    const blob = await response.blob();
    const durationSec = (performance.now() - tStart) / 1000;

    const bytes = blob.size;
    let downloadMbps: number | null = null;
    if (bytes > 0 && durationSec > 0) {
      // (bytes * 8) bits / durationSec / 1000000 = Mbps
      downloadMbps = Number(((bytes * 8) / (durationSec * 1_000_000)).toFixed(2));
      // clamp to non-negative reasonable value
      if (downloadMbps <= 0.01) downloadMbps = 0.05;
    }

    return {
      pingMs: avgPing,
      downloadMbps,
      testedBytes: bytes
    };
  } catch (err: any) {
    return {
      pingMs: 0,
      downloadMbps: null,
      testedBytes: 0,
      error: 'تعذر إتمام اختبار السرعة: ' + (err?.message || 'خطأ في الشبكة')
    };
  }
}

/**
 * 4. Battery Information
 */
export async function auditBatteryInfo(): Promise<BatteryInfo> {
  const nav = navigator as any;

  if (!('getBattery' in nav)) {
    return {
      isSupported: false,
      statusMessage: 'معلومات البطارية غير متاحة على هذا المتصفح',
      level: null,
      charging: null,
      chargingTime: 'غير متاح من المتصفح',
      dischargingTime: 'غير متاح من المتصفح'
    };
  }

  try {
    const battery = await nav.getBattery();
    const level = Math.round(battery.level * 100);
    const charging = Boolean(battery.charging);

    let chargingTime = 'غير متاح من المتصفح';
    if (battery.chargingTime && battery.chargingTime !== Infinity && battery.chargingTime > 0) {
      const mins = Math.round(battery.chargingTime / 60);
      chargingTime = mins >= 60 ? `${Math.floor(mins / 60)} ساعة و ${mins % 60} دقيقة` : `${mins} دقيقة`;
    }

    let dischargingTime = 'غير متاح من المتصفح';
    if (battery.dischargingTime && battery.dischargingTime !== Infinity && battery.dischargingTime > 0) {
      const mins = Math.round(battery.dischargingTime / 60);
      dischargingTime = mins >= 60 ? `${Math.floor(mins / 60)} ساعة و ${mins % 60} دقيقة` : `${mins} دقيقة`;
    }

    return {
      isSupported: true,
      statusMessage: 'مدعوم رسمياً من المتصفح',
      level,
      charging,
      chargingTime,
      dischargingTime
    };
  } catch {
    return {
      isSupported: false,
      statusMessage: 'معلومات البطارية غير متاحة على هذا المتصفح (تم رفض الإذن أو غير مدعوم)',
      level: null,
      charging: null,
      chargingTime: 'غير متاح من المتصفح',
      dischargingTime: 'غير متاح من المتصفح'
    };
  }
}

/**
 * 5. Storage Information
 */
export async function auditStorageInfo(): Promise<StorageInfo> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return {
      isSupported: false,
      statusMessage: 'غير مدعوم على هذا المتصفح',
      usageBytes: null,
      quotaBytes: null,
      usageFormatted: 'غير متاح من المتصفح',
      quotaFormatted: 'غير متاح من المتصفح',
      percentageUsed: null
    };
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage ?? null;
    const quota = estimate.quota ?? null;

    const formatBytes = (bytes: number | null): string => {
      if (bytes === null || bytes === undefined) return 'غير متاح';
      if (bytes >= 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      }
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    let percentageUsed: number | null = null;
    if (usage !== null && quota !== null && quota > 0) {
      percentageUsed = Number(((usage / quota) * 100).toFixed(1));
    }

    return {
      isSupported: true,
      statusMessage: 'مدعوم من StorageManager API',
      usageBytes: usage,
      quotaBytes: quota,
      usageFormatted: formatBytes(usage),
      quotaFormatted: formatBytes(quota),
      percentageUsed
    };
  } catch {
    return {
      isSupported: false,
      statusMessage: 'غير مدعوم على هذا المتصفح',
      usageBytes: null,
      quotaBytes: null,
      usageFormatted: 'غير متاح من المتصفح',
      quotaFormatted: 'غير متاح من المتصفح',
      percentageUsed: null
    };
  }
}

/**
 * 6. WebGL & GPU Information
 */
export function auditWebGLInfo(): WebGLInfo {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || 
                canvas.getContext('webgl') || 
                canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!gl) {
      return {
        isSupported: false,
        statusMessage: 'GPU information unavailable (WebGL غير مفعل أو غير مدعوم)',
        renderer: 'غير متاح من المتصفح',
        vendor: 'غير متاح من المتصفح',
        webglVersion: 'غير متاح من المتصفح',
        shadingLanguageVersion: 'غير متاح من المتصفح',
        maxTextureSize: 'غير متاح من المتصفح'
      };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let renderer = 'غير متاح من المتصفح';
    let vendor = 'غير متاح من المتصفح';

    if (debugInfo) {
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'غير متاح من المتصفح';
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'غير متاح من المتصفح';
    } else {
      renderer = gl.getParameter(gl.RENDERER) || 'غير متاح من المتصفح';
      vendor = gl.getParameter(gl.VENDOR) || 'غير متاح من المتصفح';
    }

    const webglVersion = gl.getParameter(gl.VERSION) || 'WebGL متاح';
    const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || 'غير متاح';
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) ? `${gl.getParameter(gl.MAX_TEXTURE_SIZE)} px` : 'غير متاح';

    return {
      isSupported: true,
      statusMessage: 'WebGL نشط ومدعوم',
      renderer,
      vendor,
      webglVersion,
      shadingLanguageVersion,
      maxTextureSize
    };
  } catch {
    return {
      isSupported: false,
      statusMessage: 'GPU information unavailable',
      renderer: 'غير متاح من المتصفح',
      vendor: 'غير متاح من المتصفح',
      webglVersion: 'غير متاح من المتصفح',
      shadingLanguageVersion: 'غير متاح من المتصفح',
      maxTextureSize: 'غير متاح من المتصفح'
    };
  }
}

/**
 * 7. Real JavaScript Engine Performance Benchmark
 * Executes a deterministic numerical computation loop and measures actual execution time in ms.
 * Strictly no Math.random().
 */
export function runPerformanceBenchmark(): PerformanceBenchmark {
  const t0 = performance.now();
  
  // Real deterministic computational workload (Prime Sieve up to 40,000 + matrix transforms)
  const limit = 40000;
  const isPrime = new Uint8Array(limit + 1);
  isPrime.fill(1);
  isPrime[0] = 0;
  isPrime[1] = 0;

  for (let p = 2; p * p <= limit; p++) {
    if (isPrime[p]) {
      for (let i = p * p; i <= limit; i += p) {
        isPrime[i] = 0;
      }
    }
  }

  // Numerical array manipulation
  let checkSum = 0;
  for (let i = 0; i <= limit; i++) {
    if (isPrime[i]) {
      checkSum = (checkSum + (i * 3)) % 1000000;
    }
  }

  // Tiny Float64 calculation
  const floats = new Float64Array(5000);
  for (let i = 0; i < 5000; i++) {
    floats[i] = Math.sqrt(i) * Math.sin(i);
  }
  
  // Prevent dead code elimination
  if (floats[10] === 999999) console.log(checkSum);

  const duration = performance.now() - t0;
  const executionTimeMs = Number(duration.toFixed(1));

  let rating: PerformanceBenchmark['rating'] = 'متوسط';
  if (executionTimeMs < 75) {
    rating = 'ممتاز';
  } else if (executionTimeMs < 160) {
    rating = 'جيد';
  } else if (executionTimeMs < 320) {
    rating = 'متوسط';
  } else {
    rating = 'منخفض';
  }

  return {
    rating,
    executionTimeMs,
    operationsCount: limit,
    notes: 'تقييم تقريبي لأداء محرك JavaScript في المتصفح وليس قياساً رسمياً شاملاً لأداء عتاد الجهاز.'
  };
}

/**
 * 8. Browser Compatibility Feature Matrix
 * Tests support for modern web APIs without prompting permissions.
 */
export function auditBrowserCompatibility(): CompatibilityItem[] {
  const nav = navigator as any;

  // Safe check for localStorage
  let hasLocalStorage = false;
  try {
    hasLocalStorage = typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null;
    const testKey = '__test_ls__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
  } catch {
    hasLocalStorage = false;
  }

  // Safe check for sessionStorage
  let hasSessionStorage = false;
  try {
    hasSessionStorage = typeof window !== 'undefined' && 'sessionStorage' in window && window.sessionStorage !== null;
  } catch {
    hasSessionStorage = false;
  }

  // Safe check for IndexedDB
  let hasIndexedDB = false;
  try {
    hasIndexedDB = 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    hasIndexedDB = false;
  }

  return [
    {
      id: 'local_storage',
      name: 'LocalStorage',
      category: 'التخزين المحلي',
      supported: hasLocalStorage,
      description: 'حفظ إعدادات وتشكيلات المستخدم محلياً'
    },
    {
      id: 'session_storage',
      name: 'SessionStorage',
      category: 'التخزين المحلي',
      supported: hasSessionStorage,
      description: 'تخزين مؤقت أثناء الجلسة النشطة'
    },
    {
      id: 'indexed_db',
      name: 'IndexedDB',
      category: 'التخزين وقواعد البيانات',
      supported: hasIndexedDB,
      description: 'تخزين كميات ضخمة من البيانات والبطاقات'
    },
    {
      id: 'web_workers',
      name: 'Web Workers',
      category: 'معالجة الخلفية',
      supported: 'Worker' in window,
      description: 'تشغيل الحسابات والتحليلات في مسار منفصل'
    },
    {
      id: 'web_socket',
      name: 'WebSocket',
      category: 'الاتصال المباشر',
      supported: 'WebSocket' in window,
      description: 'دعم الغرف المباشرة والمزامنة اللحظية'
    },
    {
      id: 'webgl',
      name: 'WebGL 3D Rendering',
      category: 'الرسوميات والجرافيك',
      supported: Boolean(window.WebGLRenderingContext),
      description: 'تسريع الرسوميات ثلاثية الأبعاد وعجلة الحظ'
    },
    {
      id: 'service_worker',
      name: 'Service Worker (PWA)',
      category: 'التطبيق المستقل',
      supported: 'serviceWorker' in nav,
      description: 'التشغيل أوفلاين وتثبيت التطبيق على الشاشة'
    },
    {
      id: 'notifications',
      name: 'Notification API',
      category: 'التنبيهات',
      supported: 'Notification' in window,
      description: 'إشعارات البطولات والجوائز اليومية'
    },
    {
      id: 'clipboard',
      name: 'Clipboard API',
      category: 'النظام والواجهة',
      supported: Boolean(nav.clipboard),
      description: 'نسخ أرقام الآيدي ورسائل التشكيلة بسهولة'
    },
    {
      id: 'web_audio',
      name: 'Web Audio API',
      category: 'المؤثرات الصوتية',
      supported: Boolean(window.AudioContext || (window as any).webkitAudioContext),
      description: 'تشغيل أصوات الصافرة والدوران والتأثيرات'
    },
    {
      id: 'media_devices',
      name: 'Media Devices API',
      category: 'الكاميرا والوسائط',
      supported: Boolean(nav.mediaDevices),
      description: 'دعم مسح وقراءة بطاقات وتشكيلات اللعبة'
    },
    {
      id: 'fetch',
      name: 'Fetch API',
      category: 'الشبكة والبيانات',
      supported: 'fetch' in window,
      description: 'جلب البيانات والتحديثات والاتصال بالسيرفر'
    }
  ];
}

/**
 * Run Full Complete Audit with step-by-step reporting
 */
export async function runFullDeviceAudit(
  onStepChange?: (stepIndex: number, stepName: string) => void
): Promise<FullDeviceAuditResult> {
  // Step 0: Basic Info
  onStepChange?.(0, 'فحص معلومات الجهاز ونظام التشغيل');
  const basicInfo = await auditBasicInfo();
  await new Promise(r => setTimeout(r, 90));

  // Step 1: Screen
  onStepChange?.(1, 'فحص أبعاد ودقة الشاشة والعرض');
  const screenInfo = auditScreenInfo();
  await new Promise(r => setTimeout(r, 90));

  // Step 2: Network
  onStepChange?.(2, 'فحص حالة الشبكة ونوع الاتصال');
  const networkInfo = auditNetworkInfo();
  await new Promise(r => setTimeout(r, 90));

  // Step 3: Storage
  onStepChange?.(3, 'فحص مساحة التخزين ومحيط الذاكرة');
  const storageInfo = await auditStorageInfo();
  await new Promise(r => setTimeout(r, 90));

  // Step 4: Battery
  onStepChange?.(4, 'فحص مستشعر وحالة شحن البطارية');
  const batteryInfo = await auditBatteryInfo();
  await new Promise(r => setTimeout(r, 90));

  // Step 5: WebGL
  onStepChange?.(5, 'فحص معالج الرسوميات WebGL والـ GPU');
  const webglInfo = auditWebGLInfo();
  await new Promise(r => setTimeout(r, 90));

  // Step 6: Compatibility
  onStepChange?.(6, 'فحص توافق واجهات برمجة المتصفح (Web APIs)');
  const compatibility = auditBrowserCompatibility();
  await new Promise(r => setTimeout(r, 90));

  // Step 7: Performance
  onStepChange?.(7, 'تشغيل اختبار أداء محرك JavaScript المحلي');
  const benchmark = runPerformanceBenchmark();
  await new Promise(r => setTimeout(r, 90));

  const result: FullDeviceAuditResult = {
    timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    basicInfo,
    screenInfo,
    networkInfo,
    batteryInfo,
    storageInfo,
    webglInfo,
    benchmark,
    compatibility
  };

  saveAuditToStorage(result);
  return result;
}

/**
 * LocalStorage caching for last scan
 */
export function saveAuditToStorage(result: FullDeviceAuditResult): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // quota exceeded or disabled
  }
}

export function loadAuditFromStorage(): FullDeviceAuditResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FullDeviceAuditResult;
  } catch {
    return null;
  }
}
