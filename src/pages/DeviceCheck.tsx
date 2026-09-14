import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Cpu, 
  HardDrive, 
  Battery, 
  BatteryCharging, 
  Wifi, 
  WifiOff, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Gauge, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Clock, 
  Fingerprint, 
  Eye, 
  Gamepad2, 
  Radio, 
  Check, 
  Copy,
  Info,
  Lock
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import {
  FullDeviceAuditResult,
  SpeedTestResult,
  runFullDeviceAudit,
  loadAuditFromStorage,
  runRealSpeedTest,
  runPerformanceBenchmark
} from '../services/deviceAuditService';

export const DeviceCheck: React.FC = () => {
  const navigate = useNavigate();

  // Audit state
  const [auditResult, setAuditResult] = useState<FullDeviceAuditResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Speed test state (Optional real test)
  const [isSpeedTesting, setIsSpeedTesting] = useState(false);
  const [speedResult, setSpeedResult] = useState<SpeedTestResult | null>(null);

  // Active filter tab
  type FilterTab = 'all' | 'device' | 'network' | 'battery' | 'gpu' | 'benchmark' | 'compatibility';
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const scanSteps = [
    'فحص معلومات الجهاز ونظام التشغيل',
    'فحص أبعاد ودقة الشاشة والعرض',
    'فحص حالة الشبكة ونوع الاتصال',
    'فحص مساحة التخزين ومحيط الذاكرة',
    'فحص مستشعر وحالة شحن البطارية',
    'فحص معالج الرسوميات WebGL والـ GPU',
    'فحص توافق واجهات برمجة المتصفح (Web APIs)',
    'تشغيل اختبار أداء محرك JavaScript المحلي'
  ];

  // Perform full device audit
  const executeAudit = useCallback(async () => {
    setIsScanning(true);
    setCompletedSteps([]);
    setCurrentStepIndex(0);
    setCurrentStepText(scanSteps[0]);

    try {
      const result = await runFullDeviceAudit((stepIdx, stepName) => {
        setCurrentStepIndex(stepIdx);
        setCurrentStepText(stepName);
        setCompletedSteps(prev => [...prev, scanSteps[stepIdx]]);
      });

      setAuditResult(result);
      toast.success('تم اكتمال الفحص الفعلي للجهاز بنجاح!');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء إجراء الفحص');
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Initial load: check storage or run once
  useEffect(() => {
    const cached = loadAuditFromStorage();
    if (cached) {
      setAuditResult(cached);
    } else {
      executeAudit();
    }
  }, [executeAudit]);

  // Optional real speed test
  const handleRunSpeedTest = async () => {
    setIsSpeedTesting(true);
    toast('جاري قياس Ping وسرعة التنزيل من السيرفر...');
    try {
      const res = await runRealSpeedTest();
      setSpeedResult(res);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`اكتمل الاختبار: Ping ${res.pingMs}ms`);
      }
    } catch {
      toast.error('تعذر إجراء فحص السرعة');
    } finally {
      setIsSpeedTesting(false);
    }
  };

  // Re-run single benchmark
  const handleReRunBenchmark = () => {
    if (!auditResult) return;
    const newBenchmark = runPerformanceBenchmark();
    setAuditResult({
      ...auditResult,
      benchmark: newBenchmark
    });
    toast.success(`تم تحديث اختبار الأداء: ${newBenchmark.executionTimeMs} ms (${newBenchmark.rating})`);
  };

  // Copy summary to clipboard
  const handleCopySummary = () => {
    if (!auditResult) return;
    const summary = [
      '📊 تقرير فحص الجهاز الفعلي - eFootball Hub:',
      `• نوع الجهاز: ${auditResult.basicInfo.deviceType} (${auditResult.basicInfo.os})`,
      `• المتصفح: ${auditResult.basicInfo.browser} ${auditResult.basicInfo.browserVersion}`,
      `• الأنوية المنطقية: ${auditResult.basicInfo.logicalCores}`,
      `• الذاكرة التقريبية: ${auditResult.basicInfo.deviceMemory}`,
      `• الشاشة: ${auditResult.screenInfo.resolution} (DPR: ${auditResult.screenInfo.pixelRatio})`,
      `• الشبكة: ${auditResult.networkInfo.statusText} (${auditResult.networkInfo.effectiveType})`,
      `• البطارية: ${auditResult.batteryInfo.isSupported ? `${auditResult.batteryInfo.level}%` : 'غير متاحة من المتصفح'}`,
      `• معالج الرسوميات: ${auditResult.webglInfo.renderer}`,
      `• تقييم أداء المتصفح: ${auditResult.benchmark.rating} (${auditResult.benchmark.executionTimeMs} ms)`,
      'ملاحظة: البيانات حقيقية ومستخرجة مباشرة عبر Web APIs الرسمية.'
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      toast.success('تم نسخ ملخص فحص الجهاز!');
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Mobile':
        return <Smartphone size={22} className="text-cyan-400" />;
      case 'Tablet':
        return <Tablet size={22} className="text-purple-400" />;
      default:
        return <Laptop size={22} className="text-amber-400" />;
    }
  };

  const getBenchmarkBadgeClass = (rating: string) => {
    switch (rating) {
      case 'ممتاز':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'جيد':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'متوسط':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-500 pb-24 text-right select-none">
      
      {/* 1. Header with back button & re-scan */}
      <div className="w-full flex items-center justify-between py-2 border-b border-white/5">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 rounded-xl bg-[#0e1628] border border-white/10 text-white hover:bg-white/10 transition-colors"
          title="رجوع"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-md">
            <Gauge size={22} />
          </div>
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-white">فحص الجهاز الحقيقي</h1>
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30 font-mono">
                Web APIs
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              قراءة مباشرة لإمكانيات المتصفح والعتاد بدون بيانات وهمية
            </span>
          </div>
        </div>

        <button 
          onClick={executeAudit}
          disabled={isScanning}
          className="p-2.5 rounded-xl bg-[#0e1628] border border-white/10 text-white hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-50"
          title="إعادة فحص الجهاز"
        >
          <RefreshCw size={18} className={isScanning ? 'animate-spin text-cyan-400' : 'text-gray-300'} />
        </button>
      </div>

      {/* 2. Privacy & Accuracy Guarantee Banner */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B1221] border border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-black text-white text-[11px]">فحص آمن ومحلي 100% داخل جهازك</span>
            <span className="text-[10px] text-gray-400">
              لا يتم جمع بيانات خاصة أو طلب صلاحيات الكاميرا والموقع. القيم غير المتاحة من المتصفح تظهر بوضوح.
            </span>
          </div>
        </div>
        <Lock size={14} className="text-gray-500 shrink-0 hidden sm:block" />
      </div>

      {/* 3. Real Progress Scanning Modal / Box (Shown while actively scanning) */}
      {isScanning && (
        <Card className="p-5 bg-gradient-to-br from-[#0e172a] to-[#070c17] border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw size={18} className="text-cyan-400 animate-spin" />
              <span className="text-sm font-black text-white">جاري فحص عتاد الجهاز الفعلي...</span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {Math.round(((currentStepIndex + 1) / scanSteps.length) * 100)}%
            </span>
          </div>

          {/* Real progress track */}
          <div className="w-full bg-[#050811] h-2 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.round(((currentStepIndex + 1) / scanSteps.length) * 100)}%` }}
            />
          </div>

          {/* Live Step Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {scanSteps.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div 
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded-xl text-[11px] font-bold border transition-colors ${
                    isDone 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : isCurrent 
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 animate-pulse'
                        : 'bg-[#060a14] border-white/5 text-gray-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-white/10 shrink-0" />
                  )}
                  <span className="truncate">{step}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 4. Results Dashboard */}
      {auditResult && !isScanning && (
        <>
          {/* Main Hero Summary Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#101b33] via-[#0b1324] to-[#070b16] border-2 border-cyan-500/30 flex flex-col gap-3 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2.5">
                {getDeviceIcon(auditResult.basicInfo.deviceType)}
                <div className="flex flex-col text-right">
                  <span className="text-xs font-black text-white">
                    {auditResult.basicInfo.deviceType === 'Mobile' ? 'هاتف ذكي (Mobile)' : 
                     auditResult.basicInfo.deviceType === 'Tablet' ? 'جهاز لوحي (Tablet)' : 'كمبيوتر مكتبي (Desktop)'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {auditResult.basicInfo.os} • {auditResult.basicInfo.browser} {auditResult.basicInfo.browserVersion}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-gray-300 flex items-center gap-1 transition-colors"
                  title="نسخ التقرير"
                >
                  <Copy size={12} />
                  <span>نسخ الملخص</span>
                </button>
                <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                  آخر فحص: {auditResult.timestamp}
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* CPU */}
              <div className="p-2.5 rounded-2xl bg-[#060b17] border border-white/5 flex flex-col gap-1 text-right">
                <div className="flex items-center justify-between text-gray-400 text-[10px]">
                  <span className="flex items-center gap-1 font-bold">
                    <Cpu size={13} className="text-cyan-400" />
                    المعالج المنطقي
                  </span>
                </div>
                <span className="text-xs font-black text-white font-mono">
                  {auditResult.basicInfo.logicalCores}
                </span>
              </div>

              {/* RAM */}
              <div className="p-2.5 rounded-2xl bg-[#060b17] border border-white/5 flex flex-col gap-1 text-right">
                <div className="flex items-center justify-between text-gray-400 text-[10px]">
                  <span className="flex items-center gap-1 font-bold">
                    <Activity size={13} className="text-purple-400" />
                    الذاكرة (RAM)
                  </span>
                </div>
                <span className="text-xs font-black text-white font-mono truncate" title={auditResult.basicInfo.deviceMemory}>
                  {auditResult.basicInfo.deviceMemory.split('(')[0]}
                </span>
              </div>

              {/* Network */}
              <div className="p-2.5 rounded-2xl bg-[#060b17] border border-white/5 flex flex-col gap-1 text-right">
                <div className="flex items-center justify-between text-gray-400 text-[10px]">
                  <span className="flex items-center gap-1 font-bold">
                    {auditResult.networkInfo.isOnline ? <Wifi size={13} className="text-emerald-400" /> : <WifiOff size={13} className="text-red-400" />}
                    حالة الشبكة
                  </span>
                </div>
                <span className={`text-xs font-black font-mono ${auditResult.networkInfo.isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                  {auditResult.networkInfo.isOnline ? auditResult.networkInfo.effectiveType : 'غير متصل'}
                </span>
              </div>

              {/* Battery */}
              <div className="p-2.5 rounded-2xl bg-[#060b17] border border-white/5 flex flex-col gap-1 text-right">
                <div className="flex items-center justify-between text-gray-400 text-[10px]">
                  <span className="flex items-center gap-1 font-bold">
                    {auditResult.batteryInfo.charging ? <BatteryCharging size={13} className="text-yellow-400" /> : <Battery size={13} className="text-emerald-400" />}
                    البطارية
                  </span>
                </div>
                <span className="text-xs font-black text-white font-mono">
                  {auditResult.batteryInfo.isSupported && auditResult.batteryInfo.level !== null 
                    ? `${auditResult.batteryInfo.level}% ${auditResult.batteryInfo.charging ? '(شحن)' : ''}`
                    : 'غير متاح'}
                </span>
              </div>
            </div>

            {/* Performance Mini Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#060b17] border border-white/5 mt-0.5">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                <span className="text-[11px] font-bold text-gray-300">أداء JavaScript في المتصفح:</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getBenchmarkBadgeClass(auditResult.benchmark.rating)}`}>
                  {auditResult.benchmark.rating} ({auditResult.benchmark.executionTimeMs} ms)
                </span>
              </div>
              <button 
                onClick={handleReRunBenchmark}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                <RefreshCw size={11} />
                إعادة قياس الأداء
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'device', label: 'الجهاز والعتاد' },
              { id: 'network', label: 'الشبكة والسرعة' },
              { id: 'battery', label: 'البطارية والتخزين' },
              { id: 'gpu', label: 'معالج الرسوميات (GPU)' },
              { id: 'benchmark', label: 'اختبار الأداء' },
              { id: 'compatibility', label: 'توافق المتصفح' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-sm'
                    : 'bg-[#0B1221] text-gray-400 border-white/5 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ================= 1. Device & OS Section ================= */}
          {(activeTab === 'all' || activeTab === 'device') && (
            <Card className="p-4 bg-[#0B1221] border border-white/10 rounded-3xl flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <Smartphone size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">معلومات الجهاز الأساسية</span>
                    <span className="text-[10px] text-gray-400">مستخرجة من Client Hints و Web APIs</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                  {auditResult.basicInfo.deviceType}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">نظام التشغيل (OS):</span>
                  <span className="font-black text-white font-mono">{auditResult.basicInfo.os}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">المتصفح:</span>
                  <span className="font-black text-white font-mono">
                    {auditResult.basicInfo.browser} ({auditResult.basicInfo.browserVersion})
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">أنوية المعالج المنطقية:</span>
                  <span className="font-black text-cyan-300 font-mono">{auditResult.basicInfo.logicalCores}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">الذاكرة التقريبية:</span>
                  <span className="font-black text-purple-300 font-mono">{auditResult.basicInfo.deviceMemory}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">لغة الجهاز:</span>
                  <span className="font-black text-white font-mono">{auditResult.basicInfo.language}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">المنطقة الزمنية:</span>
                  <span className="font-black text-white font-mono">{auditResult.basicInfo.timezone}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between sm:col-span-2">
                  <span className="text-gray-400">دعم الشاشة اللمسية:</span>
                  <span className="font-black text-emerald-400 font-mono">{auditResult.basicInfo.touchSupport}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 text-[10px] text-gray-400 flex items-start gap-1.5">
                <Info size={14} className="text-gray-500 shrink-0 mt-0.5" />
                <span>
                  ملاحظة فنية: تقرير عدد الأنوية والذاكرة يتم بقيم رسمية معيارية من المتصفح لمنع التتبع الرقمي (Fingerprinting)، ولا يتم تخمين موديل المعالج الحقيقي لعدم وجود Web API تعطي هذا الإذن.
                </span>
              </div>
            </Card>
          )}

          {/* ================= 2. Screen & Display ================= */}
          {(activeTab === 'all' || activeTab === 'device') && (
            <Card className="p-4 bg-[#0B1221] border border-white/10 rounded-3xl flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Monitor size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">الشاشة والعرض (Display)</span>
                    <span className="text-[10px] text-gray-400">أبعاد البكسلات ونسبة التناسب</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                  {auditResult.screenInfo.orientation}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">دقة الشاشة الأصلية:</span>
                  <span className="font-black text-white font-mono">{auditResult.screenInfo.resolution}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">أبعاد نافذة العرض (Viewport):</span>
                  <span className="font-black text-white font-mono">{auditResult.screenInfo.viewport}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">كثافة البكسل (Device Pixel Ratio):</span>
                  <span className="font-black text-cyan-300 font-mono">{auditResult.screenInfo.pixelRatio}x</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">عمق الألوان (Color Depth):</span>
                  <span className="font-black text-white font-mono">{auditResult.screenInfo.colorDepth}</span>
                </div>
              </div>
            </Card>
          )}

          {/* ================= 3. Network & Speed Test ================= */}
          {(activeTab === 'all' || activeTab === 'network') && (
            <Card className="p-4 bg-[#0B1221] border border-white/10 rounded-3xl flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Wifi size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">الشبكة والاتصال (Network Information)</span>
                    <span className="text-[10px] text-gray-400">حالة الإنترنت ونوع الخط والسرعة التقديرية</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  auditResult.networkInfo.isOnline ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {auditResult.networkInfo.statusText}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">نوع الاتصال الفعلي:</span>
                  <span className="font-black text-white font-mono">{auditResult.networkInfo.effectiveType}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">السرعة المقدرة (Downlink):</span>
                  <span className="font-black text-cyan-300 font-mono">{auditResult.networkInfo.downlink}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">زمن الاستجابة التقديري (RTT):</span>
                  <span className="font-black text-amber-300 font-mono">{auditResult.networkInfo.rtt}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">وضع توفير البيانات (Save Data):</span>
                  <span className="font-black text-white">{auditResult.networkInfo.saveData}</span>
                </div>
              </div>

              {/* Real Speed Test Box (Optional so no data wasted) */}
              <div className="p-3 rounded-2xl bg-[#070d1a] border border-cyan-500/20 flex flex-col gap-2.5 mt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Activity size={15} className="text-cyan-400" />
                    <span className="text-xs font-black text-white">اختبار سرعة وتأخير حقيقي (اختياري)</span>
                  </div>
                  <Button
                    onClick={handleRunSpeedTest}
                    disabled={isSpeedTesting}
                    className="py-1 px-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[11px] rounded-lg transition-all shadow"
                  >
                    <RefreshCw size={12} className={isSpeedTesting ? 'animate-spin' : ''} />
                    <span>{isSpeedTesting ? 'جاري الفحص...' : 'بدء فحص حقيقي'}</span>
                  </Button>
                </div>
                <span className="text-[10px] text-gray-400">
                  يقوم بحساب زمن الوصول (Ping) وسرعة التنزيل الفعلية عبر إرسال حزمة صغيرة وموثوقة للسيرفر بدون توليد أرقام عشوائية.
                </span>

                {speedResult && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                    <div className="p-2 rounded-xl bg-[#040813] border border-white/5 flex flex-col text-right">
                      <span className="text-[10px] text-gray-400">زمن الاستجابة الفعلي (Ping):</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {speedResult.pingMs} ms
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-[#040813] border border-white/5 flex flex-col text-right">
                      <span className="text-[10px] text-gray-400">سرعة التنزيل اللحظية:</span>
                      <span className="text-sm font-black text-cyan-400 font-mono">
                        {speedResult.downloadMbps !== null ? `${speedResult.downloadMbps} Mbps` : 'غير متاح'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ================= 4. Battery & Storage ================= */}
          {(activeTab === 'all' || activeTab === 'battery') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Battery Card */}
              <Card className="p-4 bg-[#0B1221] border border-white/10 rounded-3xl flex flex-col gap-3 shadow-md">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/20">
                      {auditResult.batteryInfo.charging ? <BatteryCharging size={16} /> : <Battery size={16} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white">فحص البطارية (Battery API)</span>
                      <span className="text-[10px] text-gray-400">مستوى الشحن وحالة التوصيل</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    auditResult.batteryInfo.isSupported 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}>
                    {auditResult.batteryInfo.isSupported ? 'مدعوم بالمتصفح' : 'غير مدعوم'}
                  </span>
                </div>

                {auditResult.batteryInfo.isSupported && auditResult.batteryInfo.level !== null ? (
                  <div className="flex flex-col gap-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">نسبة شحن البطارية:</span>
                      <span className="text-lg font-black text-white font-mono">
                        {auditResult.batteryInfo.level}%
                      </span>
                    </div>

                    <div className="w-full bg-[#060b17] h-2.5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          auditResult.batteryInfo.level > 50 ? 'bg-emerald-500' :
                          auditResult.batteryInfo.level > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${auditResult.batteryInfo.level}%` }}
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                      <span className="text-gray-400">حالة الشاحن:</span>
                      <span className={`font-black ${auditResult.batteryInfo.charging ? 'text-yellow-400' : 'text-gray-300'}`}>
                        {auditResult.batteryInfo.charging ? 'متصل بالشاحن (جاري الشحن)' : 'غير متصل (يعمل على البطارية)'}
                      </span>
                    </div>

                    {auditResult.batteryInfo.chargingTime !== 'غير متاح من المتصفح' && (
                      <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                        <span className="text-gray-400">الوقت المتبقي لاكتمال الشحن:</span>
                        <span className="font-black text-white font-mono">{auditResult.batteryInfo.chargingTime}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#060b17] border border-white/5 flex items-start gap-2 text-xs">
                    <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-black text-white text-[11px]">معلومات البطارية غير متاحة على هذا المتصفح</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        متصفحات مثل Safari و Firefox وبعض نسخ Chrome تُعطل Battery Status API لحماية خصوصية المستخدم ومنع التتبع.
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Storage Card */}
              <Card className="p-4 bg-[#0B1221] border border-white/10 rounded-3xl flex flex-col gap-3 shadow-md">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                      <HardDrive size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white">التخزين (StorageManager API)</span>
                      <span className="text-[10px] text-gray-400">المساحة المخصصة والمستهلكة</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    auditResult.storageInfo.isSupported 
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}>
                    {auditResult.storageInfo.isSupported ? 'مدعوم' : 'غير مدعوم'}
                  </span>
                </div>

                {auditResult.storageInfo.isSupported && auditResult.storageInfo.percentageUsed !== null ? (
                  <div className="flex flex-col gap-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">المساحة المستخدمة:</span>
                      <span className="text-sm font-black text-white font-mono">
                        {auditResult.storageInfo.usageFormatted} / {auditResult.storageInfo.quotaFormatted}
                      </span>
                    </div>

                    <div className="w-full bg-[#060b17] h-2.5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full rounded-full bg-purple-500 transition-all"
                        style={{ width: `${Math.min(100, Math.max(2, auditResult.storageInfo.percentageUsed))}%` }}
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                      <span className="text-gray-400">نسبة الاستهلاك من الحصة:</span>
                      <span className="font-black text-purple-300 font-mono">
                        {auditResult.storageInfo.percentageUsed}% مستخدم
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#060b17] border border-white/5 text-xs text-gray-400">
                    Storage Estimate API غير مدعومة أو مقيدة في هذا المتصفح.
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ================= 5. WebGL & GPU Section ================= */}
          {(activeTab === 'all' || activeTab === 'gpu') && (
            <Card className="p-4 bg-[#0B1221] border border-white/10 rounded-3xl flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
                    <Gamepad2 size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">معالج الرسوميات (GPU & WebGL)</span>
                    <span className="text-[10px] text-gray-400">قدرات الرندرة ثلاثية الأبعاد وعجلة الحظ</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  auditResult.webglInfo.isSupported 
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' 
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {auditResult.webglInfo.isSupported ? 'WebGL متاح' : 'غير مدعوم'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex flex-col gap-1 sm:col-span-2">
                  <span className="text-gray-400">معالج الرسوميات المكتشف (GPU Renderer):</span>
                  <span className="font-black text-pink-300 font-mono text-[11px] break-all">
                    {auditResult.webglInfo.renderer}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">المصنّع (Vendor):</span>
                  <span className="font-black text-white font-mono truncate" title={auditResult.webglInfo.vendor}>
                    {auditResult.webglInfo.vendor}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">أقصى حجم تكسشر (Max Texture):</span>
                  <span className="font-black text-cyan-300 font-mono">{auditResult.webglInfo.maxTextureSize}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060b17] border border-white/5 flex items-center justify-between sm:col-span-2">
                  <span className="text-gray-400">إصدار WebGL / لغة التظليل:</span>
                  <span className="font-black text-gray-300 font-mono text-[11px]">
                    {auditResult.webglInfo.webglVersion}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* ================= 6. JavaScript Performance Benchmark ================= */}
          {(activeTab === 'all' || activeTab === 'benchmark') && (
            <Card className="p-4 bg-[#0B1221] border border-white/10 rounded-3xl flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Zap size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">اختبار أداء محرك JavaScript المحلي</span>
                    <span className="text-[10px] text-gray-400">قياس فعلي لسرعة المعالجة الحسابية (Benchmark)</span>
                  </div>
                </div>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${getBenchmarkBadgeClass(auditResult.benchmark.rating)}`}>
                  {auditResult.benchmark.rating}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#070d1a] border border-amber-500/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400">الزمن المقاس لإنجاز 40,000 عملية حسابية:</span>
                    <span className="text-2xl font-black text-white font-mono tracking-tight mt-0.5">
                      {auditResult.benchmark.executionTimeMs} <span className="text-xs text-amber-400">ms (مللي ثانية)</span>
                    </span>
                  </div>

                  <Button
                    onClick={handleReRunBenchmark}
                    className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow"
                  >
                    <RefreshCw size={13} />
                    <span>إعادة القياس</span>
                  </Button>
                </div>

                <div className="p-2.5 rounded-xl bg-[#040813] border border-white/5 text-[11px] text-gray-300 leading-relaxed">
                  {auditResult.benchmark.notes}
                </div>
              </div>
            </Card>
          )}

          {/* ================= 7. Browser Compatibility Matrix ================= */}
          {(activeTab === 'all' || activeTab === 'compatibility') && (
            <Card className="p-4 bg-[#0B1221] border border-white/10 rounded-3xl flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                    <Layers size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">فحص توافق واجهات المتصفح (Web APIs)</span>
                    <span className="text-[10px] text-gray-400">الميزات المدعومة المطلوبة لتجربة eFootball متكاملة</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 font-bold">
                  {auditResult.compatibility.filter(c => c.supported).length} / {auditResult.compatibility.length} مدعوم
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {auditResult.compatibility.map(item => (
                  <div 
                    key={item.id}
                    className="p-2.5 rounded-2xl bg-[#060b17] border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {item.supported ? (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-gray-500 shrink-0" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">{item.name}</span>
                        <span className="text-[9px] text-gray-400 truncate">{item.description}</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 border ${
                      item.supported 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {item.supported ? '✓ مدعوم' : '✕ غير مدعوم'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={executeAudit}
              disabled={isScanning}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw size={15} />
              <span>إعادة فحص الجهاز بالكامل</span>
            </Button>

            <button
              onClick={handleCopySummary}
              className="px-4 py-3 bg-[#0e1628] hover:bg-[#16223d] border border-white/10 rounded-2xl text-xs font-black text-white flex items-center gap-1.5 transition-colors"
            >
              <Copy size={15} />
              <span>نسخ التقرير</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
export default DeviceCheck;
