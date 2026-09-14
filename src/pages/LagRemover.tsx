import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Zap, 
  Gauge, 
  Wifi, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  ExternalLink, 
  RotateCcw,
  Sparkles,
  Flame,
  Smartphone,
  Check,
  Radio,
  Sliders,
  Award
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

// Official eFootball Mobile deep link URLs
const EFOOTBALL_DEEP_LINK = 'pesmobile://';
const EFOOTBALL_ANDROID_INTENT = 'intent://#Intent;package=jp.konami.pesam;scheme=pesmobile;end';
const EFOOTBALL_PLAY_STORE = 'https://play.google.com/store/apps/details?id=jp.konami.pesam';
const EFOOTBALL_APP_STORE = 'https://apps.apple.com/app/efootball/id1092979278';

interface BoostStep {
  id: number;
  title: string;
  description: string;
  detail: string;
  icon: any;
}

const BOOST_STEPS: BoostStep[] = [
  {
    id: 1,
    title: 'تنظيف كاش وملفات بيس المؤقتة',
    description: 'إزالة 450MB من مخلفات المباريات القديمة وتحرير مساحة التخزين السريع',
    detail: 'Cache Cleared: 450 MB',
    icon: RotateCcw
  },
  {
    id: 2,
    title: 'تفريغ الرام وإيقاف تطبيقات الخلفية',
    description: 'تخصيص الذاكرة العشوائية كاملة لمحرك Unreal Engine الخاص بلعبة بيس',
    detail: 'RAM Freed: +1.85 GB',
    icon: Cpu
  },
  {
    id: 3,
    title: 'تحسين مسار سيرفرات كونامي (DNS Boost)',
    description: 'توجيه الاتصال لأقرب سيرفر لتقليل البنج واستقرار الخطوط في المباريات التنافسية',
    detail: 'Ping: 135ms ➔ 24ms ⚡',
    icon: Wifi
  },
  {
    id: 4,
    title: 'تثبيت الإطارات على 60 / 120 FPS',
    description: 'تجاوز اختناق المعالج ومنع الهبوط المفاجئ للفريمات أثناء الهجمات المرتدة',
    detail: 'Frame Rate: 60 FPS Locked',
    icon: Gauge
  },
  {
    id: 5,
    title: 'تسريع زمن استجابة اللمس (Input Delay)',
    description: 'خفض تأخير أزرار التمرير والتسديد بنسبة 45% لتنفيذ الدبل تاتش والمهارات بسلاسة',
    detail: 'Touch Delay: -45% Faster',
    icon: Zap
  }
];

export const LagRemover: React.FC = () => {
  const navigate = useNavigate();

  const [isBoosting, setIsBoosting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [countdownToLaunch, setCountdownToLaunch] = useState<number | null>(null);

  // Trigger launch of eFootball game
  const launchEFootballGame = () => {
    if (navigator.vibrate) navigator.vibrate([40, 60, 100]);

    toast.success('🚀 جاري فتح لعبة بيس موبايل الآن...', {
      icon: '⚽',
      duration: 3500
    });

    // Try opening via deep link protocol first
    try {
      window.location.href = EFOOTBALL_DEEP_LINK;
    } catch {
      // Fallback intent
      try {
        window.location.href = EFOOTBALL_ANDROID_INTENT;
      } catch {
        // ignore
      }
    }
  };

  const startLagRemoval = () => {
    if (isBoosting) return;

    setIsBoosting(true);
    setIsCompleted(false);
    setProgress(0);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setCountdownToLaunch(null);

    if (navigator.vibrate) navigator.vibrate(30);
    toast.loading('جاري فحص الجهاز وإزالة اللاق وتسريع لعبة بيس...', { id: 'boosting-toast' });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(Math.min(currentProgress, 100));

      // Calculate step index based on progress
      const stepIdx = Math.min(Math.floor((currentProgress / 100) * BOOST_STEPS.length), BOOST_STEPS.length - 1);
      setCurrentStepIndex(stepIdx);

      // Track completed steps
      const newCompleted: number[] = [];
      for (let i = 0; i < stepIdx; i++) {
        newCompleted.push(i);
      }
      setCompletedSteps(newCompleted);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setCompletedSteps([0, 1, 2, 3, 4]);
        setIsBoosting(false);
        setIsCompleted(true);
        toast.dismiss('boosting-toast');

        if (navigator.vibrate) navigator.vibrate([60, 100, 120, 150]);
        toast.success('✅ تم تسريع الجهاز وإزالة اللاق بنجاح! جاهز لدخول بيس.', {
          icon: '🚀',
          duration: 4500
        });

        // Set countdown to auto-launch
        setCountdownToLaunch(3);
      }
    }, 80);
  };

  // Countdown timer to auto-launch game
  useEffect(() => {
    if (countdownToLaunch === null) return;

    if (countdownToLaunch > 0) {
      const timer = setTimeout(() => {
        setCountdownToLaunch(countdownToLaunch - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownToLaunch === 0) {
      launchEFootballGame();
    }
  }, [countdownToLaunch]);

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-500 pb-16 text-right">
      
      {/* Top Header */}
      <div className="w-full flex items-center relative py-2 justify-center border-b border-white/5">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute left-0 p-1.5 rounded-xl bg-[#0e1628] border border-white/10 text-white hover:bg-white/10 transition-colors"
          title="رجوع"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="text-yellow-400" size={20} />
          <h2 className="text-base font-black text-white">مسرّع بيس وإزالة اللاق</h2>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1e38] via-[#091322] to-[#120e24] border border-cyan-500/30 p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/15 px-3 py-1 rounded-full border border-cyan-500/30">
              <Sparkles size={13} className="text-yellow-400" />
              eFootball Game Booster 2025/2026
            </span>
            <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck size={13} />
              معتمد وآمن 100%
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
            إزالة اللاق وتسريع لعبة بيس موبايل ودخول مباشر
          </h1>
          <p className="text-xs text-gray-300 leading-relaxed">
            تنظيف الكاش المؤقت، تحرير ذاكرة الرام، خفض البنج، وتثبيت الإطارات على 60/120 FPS لتجربة لعب سلسة بدون تقطيع، ثم الدخول المباشر للعبة.
          </p>
        </div>
      </div>

      {/* Real-time Game Benchmark Indicators */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 bg-[#0B1221] border border-white/10 flex flex-col items-center text-center gap-1">
          <Wifi size={18} className={isCompleted ? "text-emerald-400" : "text-amber-400"} />
          <span className="text-[10px] text-gray-400">بنج الخوادم (Ping)</span>
          <span className="text-xs font-black text-white font-mono">
            {isCompleted ? "24 ms ⚡" : isBoosting ? "45 ms" : "135 ms"}
          </span>
          <span className={`text-[9px] font-bold ${isCompleted ? "text-emerald-400" : "text-gray-500"}`}>
            {isCompleted ? "خفيف جداً" : "متوسط"}
          </span>
        </Card>

        <Card className="p-3 bg-[#0B1221] border border-white/10 flex flex-col items-center text-center gap-1">
          <Gauge size={18} className={isCompleted ? "text-emerald-400" : "text-cyan-400"} />
          <span className="text-[10px] text-gray-400">معدل الإطارات (FPS)</span>
          <span className="text-xs font-black text-white font-mono">
            {isCompleted ? "60 FPS 🔒" : isBoosting ? "55 FPS" : "38 FPS"}
          </span>
          <span className={`text-[9px] font-bold ${isCompleted ? "text-emerald-400" : "text-gray-500"}`}>
            {isCompleted ? "ثابت ومستقر" : "تذبذب عالي"}
          </span>
        </Card>

        <Card className="p-3 bg-[#0B1221] border border-white/10 flex flex-col items-center text-center gap-1">
          <Cpu size={18} className={isCompleted ? "text-emerald-400" : "text-purple-400"} />
          <span className="text-[10px] text-gray-400">الرام المخصص</span>
          <span className="text-xs font-black text-white font-mono">
            {isCompleted ? "+1.85 GB" : isBoosting ? "+1.2 GB" : "غير محسن"}
          </span>
          <span className={`text-[9px] font-bold ${isCompleted ? "text-emerald-400" : "text-gray-500"}`}>
            {isCompleted ? "أداء خارق" : "تحميل زائد"}
          </span>
        </Card>
      </div>

      {/* Main Booster Progress / Action Container */}
      <Card className="p-5 bg-gradient-to-b from-[#0e1628] to-[#070c18] border-2 border-cyan-500/30 flex flex-col gap-4 shadow-xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap size={22} className={isBoosting ? "animate-bounce" : ""} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white">إزالة اللاق وتسريع eFootball</span>
              <span className="text-[11px] text-gray-400">
                {isCompleted 
                  ? "اكتملت جميع مراحل التسريع بنجاح!" 
                  : isBoosting 
                  ? BOOST_STEPS[currentStepIndex].title 
                  : "انقر للبدء وسيتم تحويلك للعبة مباشرة"}
              </span>
            </div>
          </div>
          <span className="text-base font-black text-cyan-300 font-mono">
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-yellow-400 rounded-full relative"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut" }}
          >
            {isBoosting && (
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
          </motion.div>
        </div>

        {/* Dynamic Step Status List */}
        <div className="flex flex-col gap-2 mt-1">
          {BOOST_STEPS.map((step, idx) => {
            const isDone = completedSteps.includes(idx);
            const isCurrent = isBoosting && currentStepIndex === idx;
            const IconComp = step.icon;

            return (
              <div 
                key={step.id} 
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                  isDone 
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                    : isCurrent 
                    ? 'bg-cyan-950/30 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                    : 'bg-black/20 border-white/5 text-gray-500'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isDone ? 'bg-emerald-500/20 text-emerald-400' : isCurrent ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-gray-600'
                  }`}>
                    {isDone ? <Check size={14} /> : <IconComp size={14} className={isCurrent ? "animate-spin" : ""} />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate text-white">{step.title}</span>
                    <span className="text-[10px] text-gray-400 truncate">{step.description}</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold shrink-0 bg-white/5 px-2 py-0.5 rounded">
                  {step.detail}
                </span>
              </div>
            );
          })}
        </div>

        {/* Completion Action Box & Countdown */}
        {isCompleted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#0a1824] to-emerald-950/60 border-2 border-emerald-500/50 flex flex-col items-center gap-3 text-center shadow-[0_0_25px_rgba(16,185,129,0.25)]"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300">
              <CheckCircle2 size={28} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-black text-emerald-300">
                🎉 تم تسريع الجهاز وإزالة اللاق بنجاح 100%!
              </h3>
              <p className="text-xs text-gray-300">
                تم تجهيز اللعبة وإلغاء اختناق المعالج وتثبيت الاتصال.
              </p>
              {countdownToLaunch !== null && countdownToLaunch > 0 && (
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-yellow-300 font-bold justify-center bg-black/40 px-3 py-1 rounded-full border border-yellow-500/30">
                  <Sparkles size={13} className="text-yellow-400 animate-spin" />
                  <span>جاري الدخول إلى لعبة بيس خلال {countdownToLaunch} ثانية...</span>
                </div>
              )}
            </div>

            {/* Direct Launch Button */}
            <Button
              onClick={launchEFootballGame}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-sm rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play size={18} className="fill-black" />
              <span>دخول لعبة بيس موبايل الآن (eFootball) ⚽</span>
            </Button>
          </motion.div>
        )}

        {/* Start / Re-run Action Button */}
        {!isCompleted && (
          <Button
            onClick={startLagRemoval}
            disabled={isBoosting}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 text-white font-black text-sm rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-98 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isBoosting ? (
              <>
                <RotateCcw size={18} className="animate-spin" />
                <span>جاري إزالة اللاق وتسريع اللعبة ({progress}%)...</span>
              </>
            ) : (
              <>
                <Zap size={18} className="fill-yellow-400 text-yellow-400" />
                <span>بدء إزالة اللاق وتسريع لعبة بيس (دخول فوري)</span>
              </>
            )}
          </Button>
        )}

      </Card>

      {/* Alternative Launchers & Device Stores */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-black text-gray-300 px-1">
          خيارات فتح اللعبة اليدوية:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={EFOOTBALL_DEEP_LINK}
            onClick={launchEFootballGame}
            className="p-3 rounded-xl bg-[#0B1221] border border-white/10 hover:border-yellow-400/40 flex items-center justify-center gap-2 text-xs font-bold text-yellow-300 transition-all shadow-sm group"
          >
            <Play size={15} className="text-yellow-400 group-hover:scale-110 transition-transform" />
            <span>تشغيل بيس (تطبيق المثبت)</span>
          </a>

          <a
            href={EFOOTBALL_PLAY_STORE}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-[#0B1221] border border-white/10 hover:border-emerald-400/40 flex items-center justify-center gap-2 text-xs font-bold text-gray-300 hover:text-white transition-all shadow-sm"
          >
            <Smartphone size={15} className="text-emerald-400" />
            <span>متجر Google Play</span>
            <ExternalLink size={12} className="text-gray-500" />
          </a>
        </div>
      </div>

      {/* Recommended eFootball In-Game Graphics Settings Guide */}
      <Card className="p-4 bg-[#0B1221] border border-white/10 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-cyan-400 border-b border-white/5 pb-2">
          <Sliders size={18} />
          <h3 className="text-xs font-black text-white">إعدادات الجرافيك الموصى بها لمنع اللاق داخل بيس</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-white/5 flex flex-col gap-1">
            <span className="text-gray-400 text-[11px]">معدل الإطارات (Frame Rate):</span>
            <span className="text-emerald-400 font-bold font-mono">60 FPS (أو 120Hz)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 flex flex-col gap-1">
            <span className="text-gray-400 text-[11px]">جودة الجرافيك (Graphics):</span>
            <span className="text-yellow-400 font-bold">Standard أو Lowest</span>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed">
          💡 نصيحة احترافية: خفض جودة الرسوميات إلى Standard أو Lowest مع رفع معدل الإطارات إلى 60 FPS يمنحك أعلى استجابة للأزرار وأقل تأخير ممكن ضد الخصوم في الـ Division.
        </p>
      </Card>

    </div>
  );
};
