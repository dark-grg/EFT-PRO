# EFT PRO

منصة eFootball احترافية متكاملة للبطولات، التشكيلات، تحليل التشكيلة بالذكاء الاصطناعي، تطويرات وبطاقات اللاعبين، وعجلة الحظ التفاعلية مع دعم كامل للويب ونظام أندرويد (Capacitor / Android WebView) و Cloudflare Workers Backend.

---

## 🌟 المميزات الرئيسية (Features)

- **🃏 بطاقات وتطويرات اللاعبين (Player Cards):** قاعدة بيانات متكاملة تحتوي على أكثر من 475 بطاقة رسمية مع إحصائيات التطوير وروابط الصور الكاملة ونظام تخزين مؤقت محلي (Offline Image Cache).
- **🤖 تحليل التشكيلة بالذكاء الاصطناعي (Formation AI):** فحص لقطات شاشة التشكيلة بالرؤية الحاسوبية (Gemini Vision Server-Side) واستخراج الخطة، أسماء ومراكز اللاعبين، التقييمات، ونقاط القوة والضعف والتوصيات التكتيكية بدقة.
- **🎡 عجلة الحظ (Lucky Wheel):** نظام جوائز باحتمالات رياضية مرجحة (Weighted Random)، مدعوم بمؤقت 24 ساعة حقيقي مرتبط بوقت الخادم (Server Time) مع عزل للأجهزة وحماية من الدوران المتكرر.
- **📋 التشكيلات والتكتيكات (Formations & Tactics):** استعراض أفضل الخطط التكتيكية، أساليب اللعب، وخصائص المدربين.
- **📱 فحص الجهاز وتحسين الأداء (Device Diagnostic):** أدوات لقياس معدل الإطارات والذاكرة وتقليل الـ Lag.
- **📴 العمل دون اتصال (Offline Mode):** تصفح المحتوى والبطاقات والصور المحفوظة دون الحاجة للاتصال بالإنترنت.
- **🛡️ أمان كامل (Zero Secret Exposure):** مفتاح الذكاء الاصطناعي محمي بالكامل في بيئة الخادم ولا يتم تضمينه في حزمة العميل أو تطبيق الأندرويد.
- **☁️ Cloudflare Workers Backend:** معمارية خادم سحابي فائقة السرعة ومنخفضة التكلفة تدعم جميع نقاط الـ API مع حماية CORS و Secrets.

---

## 🛠️ متطلبات التشغيل والتطوير (Development)

### 1. تثبيت الاعتماديات
```bash
npm install
```

### 2. إعداد المتغيرات البيئية
انسخ ملف `.env.example` إلى `.env` وضع مفتاح الخادم:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. تشغيل الخادم المحلي (Web + Express Dev Server)
```bash
npm run dev
```

---

## ☁️ نشر وإدارة Backend عبر Cloudflare Workers

### 1. توليد أنواع العامل (Worker Types)
```bash
npm run worker:types
```

### 2. تجربة البناء الجاف (Dry Run)
```bash
npm run worker:dry-run
```

### 3. تسجيل الدخول ونشر الـ Worker إلى Cloudflare
```bash
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npm run worker:deploy
```

---

## 📦 البناء للإنتاج (Production Web Build)

### فحص الأنواع وبناء الويب
```bash
npm run typecheck
npm run build
```

---

## 📱 مزامنة وبناء تطبيق أندرويد (Android with Capacitor)

### مزامنة أصول الويب مع مشروع أندرويد:
```bash
npm run build
npx cap sync android
```

### بناء حزمة Debug APK محلياً (باستخدام Gradle):
```bash
cd android
./gradlew assembleDebug
```
سيتوفر ملف الـ APK في:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🚀 البناء التلقائي عبر GitHub Actions

المشروع مزود بـ Workflows جاهزة للبناء التلقائي عند كل `push` أو تشغيل يدوي (`workflow_dispatch`):

1. **Android Build (`.github/workflows/android-build.yml`):**
   - يقوم بتثبيت الاعتماديات وفحص الأنواع.
   - يبني تطبيق الويب ويزامنه مع Capacitor.
   - يقوم بتشغيل Gradle وبناء `app-debug.apk`.
   - يرفع الـ APK تلقائياً كـ **GitHub Actions Artifact** باسم `PES-ARENA-APK`.

2. **Web Build (`.github/workflows/web-build.yml`):**
   - يفحص سلامة كود TypeScript والـ Build الإنتاجي.

---

## 🔒 ملاحظات الأمان

- لا يتم تضمين `GEMINI_API_KEY` إطلاقاً داخل تطبيق أندرويد أو حزم الـ JavaScript في الـ Frontend.
- يُحفظ المفتاح داخل Cloudflare Worker Secret عبر `npx wrangler secret put GEMINI_API_KEY`.
- يتصل تطبيق أندرويد بنقاط النهاية عبر HTTPS فقط.
