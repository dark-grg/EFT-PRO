import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Send, 
  Sparkles, 
  ExternalLink,
  BadgeCheck,
  ShieldCheck,
  CheckCircle2,
  Disc3,
  Flame,
  ArrowLeft,
  Video
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { openTelegramAndWheel } from '../lib/telegramRedirect';

export const AlRashdawiPortal: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-500 pb-20 text-right">
      {/* Header */}
      <div className="w-full flex items-center justify-between relative py-2 border-b border-white/5">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-xl bg-[#0e1628] border border-white/10 text-white hover:bg-white/10 transition-colors"
          title="رجوع"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <BadgeCheck className="text-amber-400" size={24} />
          <h2 className="text-lg font-black text-white tracking-wide">منفذ الرشداوي</h2>
        </div>
        <div className="w-9" /> {/* Spacer for optical balance */}
      </div>

      {/* Official Rashdawi Announcement Card */}
      <div className="w-full p-5 rounded-3xl bg-gradient-to-br from-[#121a30] via-[#0d1527] to-[#070b14] border-2 border-amber-400/40 flex flex-col gap-4 shadow-[0_0_35px_rgba(245,158,11,0.18)] relative overflow-hidden">
        {/* Glow ambient background element */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Announcement Badge */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <Sparkles className="text-amber-400" size={16} />
              إعلان هام ومباشر من الرشداوي
            </span>
          </div>
          <span className="text-[11px] bg-emerald-500/20 text-emerald-400 font-black px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck size={13} />
            أمان 100%
          </span>
        </div>

        {/* Text Message Content */}
        <div className="flex flex-col gap-2.5 py-1 text-right">
          <h3 className="text-base font-black text-white leading-relaxed">
            اهلا والله بالشباب التطبيق امن 100%
          </h3>
          <p className="text-xs font-bold text-amber-200/95 leading-relaxed bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
            كل ماعليك تشترك بلقناة حته تتمكن من دوران عجله الحض مبروك للفائزين بجوائز
          </p>
        </div>

        {/* Official Direct Links */}
        <div className="flex flex-col gap-2.5 pt-2">
          {/* Telegram Personal Account */}
          <a
            href="https://t.me/ARahdawe"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-500/10 hover:from-blue-600/30 hover:to-blue-500/20 border border-blue-500/40 transition-all group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Send size={18} />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white group-hover:text-blue-300 transition-colors">
                  حسابي التلي كرام
                </span>
                <span className="text-[11px] text-blue-400 font-mono font-bold" dir="ltr">
                  @ARahdawe
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-300 font-bold">
              <span>تواصل مباشر</span>
              <ExternalLink size={14} className="group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </a>

          {/* Telegram Channel Link */}
          <a
            href="https://t.me/P2_B3"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-cyan-600/20 to-teal-500/10 hover:from-cyan-600/30 hover:to-teal-500/20 border border-cyan-500/40 transition-all group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 text-black flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform font-black">
                <Flame size={20} />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors">
                  رابط القناة الرسمية
                </span>
                <span className="text-[11px] text-cyan-400 font-mono font-bold" dir="ltr">
                  @P2_B3
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-bold">
              <span>اشتراك الآن</span>
              <ExternalLink size={14} className="group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </a>

          {/* TikTok Account Link */}
          <a
            href="https://www.tiktok.com/@arhdw2?_r=1&_t=ZS-99ix0vijZqu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#010101]/80 via-pink-950/20 to-cyan-950/20 hover:from-pink-900/30 hover:to-cyan-900/30 border border-pink-500/40 transition-all group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-pink-500/50 text-pink-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform font-black">
                <Video size={18} className="text-cyan-400 group-hover:text-pink-400 transition-colors" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white group-hover:text-pink-300 transition-colors flex items-center gap-1.5">
                  حساب التيك توك الرسمي
                  <span className="text-[9px] bg-gradient-to-r from-pink-500/20 to-cyan-500/20 text-pink-300 px-1.5 py-0.5 rounded-full border border-pink-500/30 font-mono font-bold">
                    TikTok
                  </span>
                </span>
                <span className="text-[11px] text-pink-300 font-mono font-bold" dir="ltr">
                  @arhdw2
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-pink-300 font-bold">
              <span>متابعة الآن</span>
              <ExternalLink size={14} className="group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </a>

          {/* Facebook Link */}
          <a
            href="https://www.facebook.com/share/19myxoXjBb/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-blue-600/10 hover:from-indigo-600/30 hover:to-blue-600/20 border border-indigo-500/40 transition-all group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform font-black text-xl">
                f
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors">
                  رابط الفيسبوك
                </span>
                <span className="text-[11px] text-indigo-300 font-bold">
                  الصفحة الرسمية للرشداوي
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-bold">
              <span>زيارة الصفحة</span>
              <ExternalLink size={14} className="group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </a>
        </div>

        {/* Fast Action to Wheel of Fortune */}
        <div className="mt-2 pt-3 border-t border-white/10">
          <Button
            onClick={() => openTelegramAndWheel(navigate)}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
          >
            <Disc3 size={18} className="animate-spin text-black" />
            <span>انتقل الآن إلى عجلة الحظ</span>
            <ArrowLeft size={16} />
          </Button>
        </div>
      </div>

      {/* Safety & Guarantee Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-3.5 bg-[#0b1221] border border-white/10 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 size={18} />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-black text-white">ضمان وأمان كامل</span>
            <span className="text-[10px] text-gray-400">جميع القنوات والروابط معتمدة رسمياً</span>
          </div>
        </Card>

        <Card className="p-3.5 bg-[#0b1221] border border-white/10 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <BadgeCheck size={18} />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-black text-white">منفذ الرشداوي المعتمد</span>
            <span className="text-[10px] text-gray-400">تحديثات وجوائز مستمرة لجميع المشتركين</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
