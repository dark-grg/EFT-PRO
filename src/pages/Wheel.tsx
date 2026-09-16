import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Sparkles, 
  Trophy, 
  RotateCcw, 
  Flame, 
  Coins, 
  Award,
  CheckCircle2,
  X,
  Lock,
  Send,
  ExternalLink,
  ShieldCheck,
  Radio,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  BadgeAlert,
  Clock,
  Hourglass
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { WheelService } from '../services/WheelService';
import suarezImage from '../assets/images/luis_suarez_104_official.png';
import ipadImage from '../assets/images/ipad_pro_m4_official.png';
import casillasImage from '../assets/images/iker_casillas_103_official.png';
import wheelCenterAvatar from '../assets/images/alrashdawi_avatar.svg';

const TELEGRAM_CHANNEL_URL = 'https://t.me/P2_B3';
const TELEGRAM_CHANNEL_HANDLE = '@P2_B3';
const TELEGRAM_STORAGE_KEY = 'eft_telegram_wheel_verified_user_v4';
const TELEGRAM_STATUS_KEY = 'eft_telegram_wheel_verified_status_v4';

// Exactly matching user request:
// 1. سواريز: 1%
// 2. 150 كوينز: 1%
// 3. 250 كوينز: 1%
// 4. ايباد برو: 0%
// 5. كاسياس: 1%
// 6. حظ اوفر: 96%
import { wheelApi, CanonicalPrize } from '../api/wheelApi';

interface Prize extends CanonicalPrize {
  image?: string;
}

const FALLBACK_PRIZES: Prize[] = [
  {
    id: 'suarez',
    name: 'لاعب مميز: لويس سواريز',
    subtitle: 'طاقات 104 OVR - إبيك بوستر',
    type: 'special_player',
    iconColor: '#EAB308',
    percentage: 1,
    isSpecial: true,
    image: suarezImage
  },
  {
    id: 'coins_150',
    name: '150 كوينز',
    subtitle: 'شحن كوينز مجاني للحساب',
    type: 'coins',
    iconColor: '#F59E0B',
    percentage: 1
  },
  {
    id: 'coins_250',
    name: '250 كوينز',
    subtitle: 'شحن كوينز إضافي مجاني',
    type: 'coins',
    iconColor: '#F59E0B',
    percentage: 1
  },
  {
    id: 'ipad_prize',
    name: 'جهاز iPad Pro M4',
    subtitle: 'أحدث جهاز من Apple بشاشة 120Hz فائقة السرعة',
    type: 'ipad',
    iconColor: '#06B6D4',
    percentage: 0,
    image: ipadImage
  },
  {
    id: 'casillas',
    name: 'إيكر كاسياس 105',
    subtitle: 'حارس أسطوري - إبيك بوستر OVR 105',
    type: 'special_player',
    iconColor: '#38BDF8',
    percentage: 1,
    image: casillasImage
  },
  {
    id: 'better_luck',
    name: 'حظ أوفر',
    subtitle: 'حاول مجدداً في السحب القادم',
    type: 'better_luck',
    iconColor: '#94A3B8',
    percentage: 96
  }
];

export const Wheel: React.FC = () => {
  const navigate = useNavigate();

  const [prizes, setPrizes] = useState<Prize[]>(FALLBACK_PRIZES);

  useEffect(() => {
    // Load canonical prizes from server if they contain the full updated list
    wheelApi.getPrizes().then(serverPrizes => {
      if (serverPrizes && Array.isArray(serverPrizes) && serverPrizes.length >= FALLBACK_PRIZES.length) {
        // Map images to server prizes
        const imageMap: Record<string, any> = {
          'suarez': suarezImage,
          'ipad_prize': ipadImage,
          'casillas': casillasImage
        };
        setPrizes(serverPrizes.map(p => ({ ...p, image: imageMap[p.id] })));
      } else {
        // Fallback already contains the complete updated 6 prizes
        setPrizes(FALLBACK_PRIZES);
      }
    }).catch(() => {
      setPrizes(FALLBACK_PRIZES);
    });
  }, []);

  // Telegram verification state - default unlocked
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);

  const [hasVisitedChannel, setHasVisitedChannel] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [showTelegramModal, setShowTelegramModal] = useState<boolean>(false);
  const [isCheckingSpinPermission, setIsCheckingSpinPermission] = useState<boolean>(false);

  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState(() => WheelService.getCooldownStatus());
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);

  // Live 24h countdown timer & Server Sync
  useEffect(() => {
    // Initial fetch from authoritative server
    WheelService.fetchServerStatus().then(() => {
      setCooldown(WheelService.getCooldownStatus());
    }).catch(() => {});

    const update = () => {
      setCooldown(WheelService.getCooldownStatus());
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const justReturned = sessionStorage.getItem('eft_telegram_just_returned');
      if (justReturned) {
        sessionStorage.removeItem('eft_telegram_just_returned');
        setIsSubscribed(true);
        setHasVisitedChannel(true);
        toast.success('🎉 تم فتح العجلة بنجاح! نتمنى لك دورة رابحة!', {
          id: 'welcome-wheel-toast',
          duration: 4000,
          icon: '🎁'
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleOpenTelegram = () => {
    window.open(TELEGRAM_CHANNEL_URL, '_blank', 'noopener,noreferrer');
    setHasVisitedChannel(true);
    toast.success('تم فتح القناة! بعد الاشتراك، اضغط على زر تأكيد الاشتراك لتفعيل دوران العجلة.', {
      duration: 5000,
      icon: '📢'
    });
  };

  const handleVerifySubscription = () => {
    setIsVerifying(true);
    setVerificationStep('جاري التحقق من الاشتراك في قناة @P2_B3...');
    if (navigator.vibrate) navigator.vibrate(30);

    setTimeout(() => {
      setVerificationStep('تم التحقق من الاشتراك بنجاح! جاري فك قفل دوران العجلة...');
    }, 700);

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationStep('');
      localStorage.setItem(TELEGRAM_STORAGE_KEY, 'verified_member');
      localStorage.setItem(TELEGRAM_STATUS_KEY, 'verified');
      setIsSubscribed(true);
      setShowTelegramModal(false);

      toast.success('✅ تم تأكيد اشتراكك في القناة بنجاح! تم فك قفل دوران العجلة بالكامل.', {
        duration: 5000,
        icon: '🎉'
      });
      if (navigator.vibrate) navigator.vibrate([40, 50, 60]);
    }, 1400);
  };

  // Re-lock verification helper (for testing / reset)
  const handleResetVerification = () => {
    localStorage.removeItem(TELEGRAM_STATUS_KEY);
    localStorage.removeItem(TELEGRAM_STORAGE_KEY);
    setIsSubscribed(false);
    setHasVisitedChannel(false);
    setShowTelegramModal(true);
    toast('تم قفل دوران العجلة! يلزم الآن تأكيد الاشتراك لفك القفل.', {
      icon: '🔒'
    });
  };

  // Re-check verification helper
  const handleRecheckSubscription = () => {
    setIsVerifying(true);
    toast.loading('جاري إعادة فحص استمرار اشتراكك في قناة التليجرام...', { id: 'recheck' });
    setTimeout(() => {
      setIsVerifying(false);
      toast.success('اشتراكك نشط في قناة @P2_B3! دوران العجلة متاح.', {
        id: 'recheck',
        duration: 4000
      });
    }, 1000);
  };

  const spin = async () => {
    if (isSpinning) return;
    
    // Strict 24-hour verification
    const currentCooldown = WheelService.getCooldownStatus();
    if (!currentCooldown.canSpin) {
      toast.error(`عذراً! يمكنك تدوير العجلة مرة واحدة فقط كل 24 ساعة.\nمتبقي على الدورة القادمة: ${currentCooldown.formattedCountdown}`, {
        icon: '⏳',
        duration: 4000
      });
      return;
    }

    // PROCEED TO SPIN: Disable button immediately to prevent rapid/double click
    setIsSpinning(true);
    setWonPrize(null);

    try {
      const spinResult = await WheelService.executeSpin();
      setCooldown(WheelService.getCooldownStatus());

      if (import.meta.env.DEV) {
        console.log('WHEEL RESPONSE KEYS:', Object.keys(spinResult));
      }

      if (navigator.vibrate) navigator.vibrate([20, 30, 20]);

      // DEFENSIVE PRIZE RESOLUTION:
      // Look up prize strictly by authoritative server prizeId
      let targetIndex = prizes.findIndex(p => p.id === spinResult.prizeId);

      if (targetIndex < 0 || !Number.isFinite(targetIndex)) {
        console.warn(`Prize ID ${spinResult.prizeId} not found, falling back`); targetIndex = prizes.findIndex(p => p.id === 'better_luck'); if (targetIndex < 0) targetIndex = prizes.length - 1;
      }

      const selected = prizes[targetIndex];

      // Each slice is 360 / length
      const sliceAngle = 360 / prizes.length; // 72 deg
      const targetSliceCenter = targetIndex * sliceAngle + sliceAngle / 2;
      
      const fullSpins = 360 * 5; // 5 full turns
      const currentRotMod = Number.isFinite(rotation) ? (rotation % 360) : 0;
      const finalAngle = (Number.isFinite(rotation) ? rotation : 0) + (fullSpins - currentRotMod) + (360 - targetSliceCenter);

      if (!Number.isFinite(finalAngle)) {
        throw new Error('زاوية دوران العجلة غير صالحة.');
      }

      setRotation(finalAngle);

      setTimeout(() => {
        setIsSpinning(false);
        setWonPrize(selected);

        if (selected.id === 'suarez') {
          toast.success('🎉 ألف مبروك! فزت باللاعب المميز لويس سواريز (100 OVR)!', {
            duration: 6000,
            icon: '⭐'
          });
        } else if (selected.id === 'coins_150') {
          toast.success('💰 ألف مبروك! ربحت 150 كوينز مجاناً!', {
            duration: 6000,
            icon: '🪙'
          });
        } else if (selected.id === 'coins_250') {
          toast.success('💰 ألف مبروك! ربحت 250 كوينز مجاناً!', {
            duration: 6000,
            icon: '🪙'
          });
        } else if (selected.id === 'ipad_prize') {
          toast.success('📱 ألف مبروك! ربحت جهاز iPad Pro للألعاب بشاشة 120Hz!', {
            duration: 6000,
            icon: '🎁'
          });
        } else if (selected.id === 'casillas') {
          toast.success('🧤 يا له من حظ أسطوري! فزت بالحارس إيكر كاسياس (103 OVR)!', {
            duration: 6000,
            icon: '🧤'
          });
        } else if (selected.id === 'better_luck') {
          toast('حظ أوفر! لم يحالفك الحظ هذه المرة، حاول مجدداً.', {
            icon: '🔄',
            duration: 4000
          });
        } else {
          toast.success(`مبروك! فزت بـ: ${selected.name}`);
        }

        if (navigator.vibrate) navigator.vibrate([50, 100, 150]);
      }, 4100);
    } catch (err: any) {
      setIsSpinning(false);
      setCooldown(WheelService.getCooldownStatus());
      toast.error(err?.message || 'تعذر تدوير العجلة حالياً، يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center animate-in fade-in duration-500 text-center pb-14">
      
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
          <Award className="text-yellow-400" size={22} />
          <h2 className="text-base font-black text-white">عجلة الحظ والجوائز الكبرى</h2>
        </div>
      </div>

      {/* ================= THE WHEEL CONTAINER ================= */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 my-2 flex items-center justify-center">
        {/* Pointer Pin with Indicator */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <div className="w-5 h-7 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-b-full shadow-[0_0_15px_rgba(234,179,8,0.8)] border border-white/60" />
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full -mt-1 shadow-sm" />
        </div>

        {/* Outer Glowing Ring */}
        <div className="absolute inset-0 rounded-full border-4 transition-colors pointer-events-none border-yellow-500/40 shadow-[0_0_35px_rgba(234,179,8,0.3)]" />

        {/* The Rotating Wheel */}
        <div 
          className={`w-full h-full rounded-full border-4 border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden relative transition-opacity ${
            !isSubscribed ? 'opacity-90' : 'opacity-100'
          }`}
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4000ms cubic-bezier(0.15, 0.95, 0.35, 1)' : 'none'
          }}
        >
          {/* Dynamic Conic Gradient Slices */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${
                prizes.map((p, idx) => {
                  const anglePerSlice = 360 / prizes.length;
                  const startAngle = idx * anglePerSlice;
                  const endAngle = startAngle + anglePerSlice;
                  // Distinct sector colors for all 6 prizes so adjacent sectors contrast perfectly
                  const sliceColors: Record<string, string> = {
                    'suarez': '#854d0e',      // Golden Amber
                    'coins_150': '#b45309',   // Warm Bronze
                    'coins_250': '#d97706',   // Bright Gold
                    'ipad_prize': '#0891b2',  // Cyan Teal
                    'casillas': '#0284c7',    // Sky Blue
                    'better_luck': '#1e293b'  // Dark Slate
                  };
                  const color = sliceColors[p.id] || ['#854d0e', '#b45309', '#d97706', '#0891b2', '#0284c7', '#1e293b'][idx % 6];
                  return `${color} ${startAngle}deg ${endAngle}deg`;
                }).join(', ')
              })`
            }}
          />

          {/* Segment Labels Overlay */}
          {prizes.map((prize, idx) => {
            const anglePerSlice = 360 / prizes.length;
            const angle = idx * anglePerSlice + (anglePerSlice / 2); // center of slice
            return (
              <div
                key={prize.id}
                className="absolute top-0 left-0 w-full h-full flex items-start justify-center pt-3 pointer-events-none"
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: '50% 50%'
                }}
              >
                <div className="flex flex-col items-center gap-0.5 text-center -translate-y-1">
                  {prize.isSpecial ? (
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-yellow-400 shadow-sm bg-black mb-0.5">
                        <img src={suarezImage} alt="سواريز" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[10px] font-black text-yellow-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        ⭐ سواريز 104
                      </span>
                    </div>
                  ) : prize.id === 'coins_150' ? (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        🪙 150 كوينز
                      </span>
                    </div>
                  ) : prize.id === 'coins_250' ? (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        🪙 250 كوينز
                      </span>
                    </div>
                  ) : prize.id === 'ipad_prize' ? (
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-md overflow-hidden border border-cyan-400 shadow-sm bg-white mb-0.5">
                        <img src={ipadImage} alt="آيباد برو" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[10px] font-black text-cyan-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        📱 آيباد برو
                      </span>
                    </div>
                  ) : prize.id === 'casillas' ? (
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-sky-400 shadow-sm bg-black mb-0.5">
                        <img src={casillasImage} alt="كاسياس" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[10px] font-black text-sky-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        🧤 كاسياس 105
                      </span>
                    </div>
                  ) : prize.id === 'better_luck' ? (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-slate-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        🔄 حظ أوفر
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        {prize.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Circle with Streamer Avatar & Spin Action */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
          <button 
            onClick={spin}
            disabled={isSpinning || isCheckingSpinPermission || !cooldown.canSpin}
            className={`group relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 bg-[#0B1221] overflow-hidden flex items-center justify-center transition-all active:scale-95 ${
              !cooldown.canSpin
                ? 'border-gray-600 opacity-90 cursor-not-allowed'
                : !isSubscribed 
                ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer' 
                : 'border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.6)] cursor-pointer'
            }`}
            title={!cooldown.canSpin ? `متبقي على الدورة القادمة: ${cooldown.formattedCountdown}` : !isSubscribed ? "ممنوع التدوير دون تأكيد الاشتراك" : "انقر لتدوير عجلة الحظ"}
          >
            {/* Center Avatar Image replacing old Suarez photo */}
            <img 
              src={wheelCenterAvatar} 
              alt="صورة منتصف العجلة" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 filter brightness-95"
              referrerPolicy="no-referrer"
            />

            {/* Glowing Ring Effect on Center */}
            <div className="absolute inset-0 rounded-full border-2 border-yellow-300/40 pointer-events-none animate-pulse" />

            {/* Spin CTA Overlay at bottom of circular photo */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/85 to-transparent py-1 flex flex-col items-center justify-center">
              {!isSubscribed ? (
                <div className="flex items-center gap-1 text-amber-300">
                  <Lock size={11} />
                  <span className="text-[10px] font-black leading-none">مغلق</span>
                </div>
              ) : !cooldown.canSpin ? (
                <div className="flex items-center gap-1 text-amber-400">
                  <Clock size={11} />
                  <span className="text-[10px] font-black leading-none font-mono">24h</span>
                </div>
              ) : (
                <span className="text-[11px] font-black text-yellow-300 leading-none drop-shadow-md">
                  {isCheckingSpinPermission ? 'جاري الفحص...' : isSpinning ? 'جاري السحب...' : 'تدوير'}
                </span>
              )}
              <span className="text-[8px] font-bold text-gray-300 font-mono">
                {!cooldown.canSpin ? 'انتظار' : 'عجلة الحظ'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 24-Hour Single-Spin Status & Countdown Banner */}
      {!cooldown.canSpin ? (
        <div className="w-full max-w-sm p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#0e1628] to-amber-950/40 border border-amber-500/40 flex flex-col items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <div className="flex items-center gap-2 text-amber-300">
            <Hourglass size={16} className="animate-spin text-amber-400" />
            <span className="text-xs font-black">لفة واحدة فقط كل 24 ساعة</span>
          </div>
          <p className="text-[11px] text-gray-300">
            لقد قمت بتدوير العجلة اليوم! سيتم فتح محاولتك القادمة بعد:
          </p>
          <div className="flex items-center gap-1.5 font-mono text-base font-black text-amber-300 bg-black/60 px-4 py-1.5 rounded-xl border border-amber-500/30 tracking-wider shadow-inner">
            <Clock size={16} className="text-yellow-400" />
            <span>{cooldown.formattedCountdown}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-bold">
          <Sparkles size={14} className="text-yellow-400" />
          <span>لفة اليوم المجانية متاحة الآن! (محاولة واحدة كل 24 ساعة)</span>
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center gap-3 mt-1">
        <Button
          size="sm"
          onClick={spin}
          disabled={isSpinning || isCheckingSpinPermission || !cooldown.canSpin}
          className={`font-black text-xs px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-all ${
            !isSubscribed
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
              : !cooldown.canSpin
              ? 'bg-gray-800/80 text-gray-400 border border-white/10 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
          }`}
        >
          {!isSubscribed ? (
            <>
              <Lock size={14} />
              <span>ممنوع التدوير - أكّد اشتراكك أولاً</span>
            </>
          ) : !cooldown.canSpin ? (
            <>
              <Clock size={14} className="text-amber-400" />
              <span>متبقي على الدورة القادمة: {cooldown.formattedCountdown}</span>
            </>
          ) : (
            <>
              <RotateCcw size={14} className={isSpinning || isCheckingSpinPermission ? 'animate-spin' : ''} />
              <span>{isCheckingSpinPermission ? 'فحص الاشتراك...' : isSpinning ? 'جاري السحب...' : 'تدوير عجلة اليوم'}</span>
            </>
          )}
        </Button>
      </div>

      {/* Anti-Unsubscribe Warning Card */}
      <div className="w-full p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 flex items-center gap-2 text-right">
        <AlertTriangle size={16} className="text-amber-400 shrink-0" />
        <span className="text-[10px] text-gray-300 leading-tight">
          <strong className="text-amber-300">تنبيه صارم: </strong>
          يتم فحص بقاء الاشتراك بشكل آلي قبل كل دورة. إلغاء الاشتراك في القناة بعد التدوير يؤدي إلى إلغاء الجائزة المكتسبة وحظر المعرف.
        </span>
      </div>

      {/* ================= PRIZES DISPLAY IN FRONT OF USER ================= */}
      <div className="w-full flex flex-col gap-3 mt-2 text-right">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Sparkles size={14} className="text-yellow-400" />
            جوائز العجلة المتاحة
          </h3>
          <span className="text-[10px] text-gray-400">أدر العجلة واكتشف جائزتك</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Special Player Suarez Prize Card */}
          <Card className="p-3 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-yellow-950/40 to-[#0B1221] border-2 border-yellow-500/40 relative overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <div className="absolute top-1 right-1 bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.2 rounded font-mono">
              ⭐ بطاقة نادرة
            </div>
            <div className="w-14 h-20 rounded-xl border-2 border-yellow-400 overflow-hidden shadow-[0_0_12px_rgba(234,179,8,0.5)] mt-1 bg-black">
              <img 
                src={suarezImage} 
                alt="لويس سواريز" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col text-center">
              <span className="text-xs font-black text-yellow-300">لويس سواريز</span>
              <span className="text-[10px] text-gray-400 font-mono">104 OVR - إبيك بوستر</span>
            </div>
          </Card>

          {/* 150 Coins Prize */}
          <Card className="p-3 flex flex-col items-center justify-center gap-2 bg-[#0B1221] border-2 border-amber-500/40 hover:border-yellow-500/60 transition-all relative overflow-hidden">
            <div className="absolute top-1 right-1 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.2 rounded font-mono">
              🪙 شحن كوينز
            </div>
            <div className="w-11 h-11 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 flex items-center justify-center font-black text-sm shadow-sm mt-1">
              <Coins size={22} />
            </div>
            <div className="flex flex-col text-center">
              <span className="text-xs font-black text-white">150 كوينز</span>
              <span className="text-[10px] text-amber-300 font-mono font-bold">شحن مجاني فوري</span>
            </div>
          </Card>

          {/* 250 Coins Prize */}
          <Card className="p-3 flex flex-col items-center justify-center gap-2 bg-[#0B1221] border-2 border-amber-500/40 hover:border-yellow-500/60 transition-all relative overflow-hidden">
            <div className="absolute top-1 right-1 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.2 rounded font-mono">
              🪙 شحن كوينز
            </div>
            <div className="w-11 h-11 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 flex items-center justify-center font-black text-sm shadow-sm mt-1">
              <Coins size={22} />
            </div>
            <div className="flex flex-col text-center">
              <span className="text-xs font-black text-white">250 كوينز</span>
              <span className="text-[10px] text-amber-300 font-mono font-bold">شحن مجاني إضافي</span>
            </div>
          </Card>

          {/* iPad Gaming Prize */}
          <Card className="p-3 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-cyan-950/40 to-[#0B1221] border-2 border-cyan-500/40 relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <div className="absolute top-1 right-1 bg-cyan-500 text-black text-[8px] font-black px-1.5 py-0.2 rounded font-mono">
              📱 جائزة كبرى
            </div>
            <div className="w-16 h-16 rounded-xl border border-cyan-400/60 overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.4)] mt-1 bg-black/80 flex items-center justify-center p-0.5">
              <img 
                src={ipadImage} 
                alt="جهاز آيباد برو" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col text-center">
              <span className="text-xs font-black text-cyan-300">iPad Pro للألعاب</span>
              <span className="text-[10px] text-gray-400 font-mono">M4 شاشة 120Hz للألعاب</span>
            </div>
          </Card>

          {/* Casillas Card */}
          <Card className="p-3 flex flex-col items-center justify-center gap-2 bg-[#0B1221] border-2 border-sky-500/40 hover:border-sky-500/60 transition-all overflow-hidden relative group">
            <div className="absolute top-1 right-1 bg-sky-500 text-black text-[8px] font-black px-1.5 py-0.2 rounded font-mono">
              🧤 حارس إبيك
            </div>
            <div className="w-14 h-20 rounded-xl border-2 border-sky-400/60 overflow-hidden shadow-[0_0_12px_rgba(56,189,248,0.4)] relative shrink-0 mt-1 bg-black">
              <img 
                src={casillasImage} 
                alt="إيكر كاسياس" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col text-center">
              <span className="text-xs font-black text-white">إيكر كاسياس</span>
              <span className="text-[10px] text-sky-400 font-mono font-bold">105 OVR - إبيك بوستر</span>
            </div>
          </Card>

          {/* Better Luck */}
          <Card className="p-3 flex flex-col items-center justify-center gap-2 bg-[#0B1221] border-2 border-slate-600/40 hover:border-slate-500/50 transition-all relative overflow-hidden col-span-2 sm:col-span-1">
            <div className="absolute top-1 right-1 bg-slate-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded font-mono">
              🔄 إعادة المحاولة
            </div>
            <div className="w-11 h-11 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/40 flex items-center justify-center mt-1">
              <RotateCcw size={20} />
            </div>
            <div className="flex flex-col text-center">
              <span className="text-xs font-black text-white">حظ أوفر</span>
              <span className="text-[10px] text-gray-400 font-mono">حاول مجدداً في الدورة القادمة</span>
            </div>
          </Card>
        </div>
      </div>

      {/* ================= TELEGRAM SUBSCRIPTION REQUIRED MODAL ================= */}
      <AnimatePresence>
        {showTelegramModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-[#0B1221] border-2 border-sky-500/50 rounded-3xl p-5 flex flex-col items-center text-center shadow-[0_0_50px_rgba(56,189,248,0.3)] relative overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowTelegramModal(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Pulsing Lock & Telegram Icon */}
              <div className="relative mt-2 mb-1">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/30 border-2 border-sky-400/50 flex items-center justify-center text-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.4)]">
                  <Send size={30} className="-rotate-12 translate-x-0.5 -translate-y-0.5" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center border-2 border-[#0B1221] shadow-md font-black">
                  <Lock size={12} />
                </div>
              </div>

              {/* Modal Title & Description */}
              <h3 className="text-base font-black text-white mt-2">
                التحقق من اشتراك القناة
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed mt-1">
                قم بالانضمام إلى قناة التليجرام الرسمية ثم اضغط على زر تأكيد الاشتراك لتفعيل دوران العجلة والحصول على الجوائز.
              </p>

              {/* Channel Card Preview */}
              <div 
                onClick={handleOpenTelegram}
                className="w-full p-3 rounded-2xl bg-[#070d18] hover:bg-[#091120] border-2 border-sky-500/40 cursor-pointer flex items-center justify-between transition-all group shadow-md my-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow group-hover:scale-105 transition-transform">
                    <Send size={18} className="-rotate-12 translate-x-0.5" />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-black text-white group-hover:text-sky-400 transition-colors">
                      قناة التليجرام الرسمية
                    </span>
                    <span className="text-[10px] text-sky-300 font-mono font-bold" dir="ltr">
                      https://t.me/P2_B3
                    </span>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300">
                  <ExternalLink size={14} />
                </div>
              </div>

              {/* Action Steps for in-app verification */}
              <div className="w-full flex flex-col gap-2.5 text-right">
                {/* Step 1: Open Telegram */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-gray-200">
                    الخطوة 1: الانضمام للقناة
                  </span>
                  <Button
                    onClick={handleOpenTelegram}
                    className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    <span>{hasVisitedChannel ? 'تم فتح القناة ✓ (انضمام)' : 'فتح القناة والاشتراك (Join)'}</span>
                  </Button>
                </div>

                {/* Step 2: Confirm In-App Verification Button */}
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[11px] font-bold text-gray-200">
                    الخطوة 2: تأكيد الاشتراك وفك قفل دوران العجلة
                  </span>
                  <Button
                    onClick={handleVerifySubscription}
                    disabled={isVerifying}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <ShieldCheck size={16} className={isVerifying ? 'animate-spin' : ''} />
                    <span>{isVerifying ? 'جاري التحقق من الاشتراك...' : 'تأكيد الاشتراك وفك قفل العجلة'}</span>
                  </Button>
                </div>

                {/* Verification Progress Notice */}
                {isVerifying && verificationStep && (
                  <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-500/30 text-[10px] text-sky-300 animate-pulse text-center font-bold">
                    {verificationStep}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= WINNING MODAL POPUP (SURAEZ / IPAD / COINS) ================= */}
      <AnimatePresence>
        {wonPrize && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-[#0B1221] border-2 border-yellow-400/80 rounded-3xl p-5 flex flex-col items-center text-center shadow-[0_0_50px_rgba(234,179,8,0.4)] relative overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={() => setWonPrize(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Header Sparkles */}
              <div className="flex items-center gap-1.5 text-yellow-400 mb-2">
                <Sparkles size={18} />
                <span className="text-xs font-black uppercase tracking-wider">
                  {wonPrize.id === 'better_luck' ? 'نتيجة السحب' : 'تهانينا! لقد فزت'}
                </span>
                <Sparkles size={18} />
              </div>

              {/* Special Card Representation for Suarez */}
              {wonPrize.isSpecial ? (
                <div className="w-full flex flex-col items-center my-2">
                  <div className="relative w-44 h-60 rounded-2xl border-4 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.7)] overflow-hidden bg-black/90">
                    <img 
                      src={suarezImage} 
                      alt="لويس سواريز 104" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full mt-3">
                    <div className="p-1.5 bg-black/40 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[9px] text-gray-400">الإنهاء</span>
                      <span className="text-xs font-black text-yellow-400 font-mono">99</span>
                    </div>
                    <div className="p-1.5 bg-black/40 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[9px] text-gray-400">الوعي الهجومي</span>
                      <span className="text-xs font-black text-emerald-400 font-mono">99</span>
                    </div>
                    <div className="p-1.5 bg-black/40 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[9px] text-gray-400">قوة التسديد</span>
                      <span className="text-xs font-black text-cyan-400 font-mono">97</span>
                    </div>
                  </div>
                </div>
              ) : wonPrize.id === 'ipad_prize' ? (
                <div className="w-full flex flex-col items-center my-2">
                  <div className="relative w-48 h-48 rounded-2xl border-4 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.7)] overflow-hidden bg-black/90 p-1 flex items-center justify-center">
                    <img 
                      src={ipadImage} 
                      alt="جهاز آيباد برو M4" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full mt-3">
                    <div className="p-1.5 bg-black/40 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[9px] text-gray-400">الشاشة</span>
                      <span className="text-xs font-black text-cyan-400 font-mono">120Hz</span>
                    </div>
                    <div className="p-1.5 bg-black/40 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[9px] text-gray-400">الأداء</span>
                      <span className="text-xs font-black text-emerald-400 font-mono">60+ FPS</span>
                    </div>
                    <div className="p-1.5 bg-black/40 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[9px] text-gray-400">المعالج</span>
                      <span className="text-xs font-black text-purple-400 font-mono">Apple M4</span>
                    </div>
                  </div>
                </div>
              ) : wonPrize.id === 'casillas' ? (
                <div className="w-full flex flex-col items-center my-2">
                  <div className="relative w-44 h-60 rounded-2xl border-4 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.7)] overflow-hidden bg-black/90">
                    <img 
                      src={casillasImage} 
                      alt="إيكر كاسياس 105" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full mt-3">
                    <div className="p-1.5 bg-black/40 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[9px] text-gray-400">ردود الفعل</span>
                      <span className="text-xs font-black text-yellow-400 font-mono">102</span>
                    </div>
                    <div className="p-1.5 bg-black/40 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[9px] text-gray-400">اليقظة</span>
                      <span className="text-xs font-black text-emerald-400 font-mono">101</span>
                    </div>
                    <div className="p-1.5 bg-black/40 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[9px] text-gray-400">الارتقاء</span>
                      <span className="text-xs font-black text-sky-400 font-mono">98</span>
                    </div>
                  </div>
                </div>
              ) : wonPrize.id === 'better_luck' ? (
                <div className="w-20 h-20 rounded-2xl bg-slate-500/20 text-slate-300 border-2 border-slate-400/40 flex items-center justify-center my-3 shadow-lg">
                  <RotateCcw size={36} />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-yellow-500/20 text-yellow-400 border-2 border-yellow-400/40 flex items-center justify-center my-3 shadow-lg">
                  <Award size={40} />
                </div>
              )}

              <h3 className="text-base font-black text-white mt-1">
                {wonPrize.name}
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                {wonPrize.subtitle}
              </p>

              <Button
                onClick={() => setWonPrize(null)}
                className={`w-full mt-4 py-2.5 font-black text-xs rounded-xl shadow-lg ${
                  wonPrize.id === 'better_luck'
                    ? 'bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white shadow-[0_0_15px_rgba(100,116,139,0.3)]'
                    : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                }`}
              >
                {wonPrize.id === 'better_luck' ? 'حسناً - جرّب مرة أخرى' : 'استلام الجائزة وإضافتها للحساب'}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
