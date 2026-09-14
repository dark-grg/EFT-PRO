import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Flame, 
  Gift, 
  Sparkles,
  Scan,
  BadgeCheck,
  Gauge,
  Users,
  Zap,
  Play
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormationReaderWidget } from '../components/home/FormationReaderWidget';
import { openTelegramAndWheel } from '../lib/telegramRedirect';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-500 pb-12">
      {/* 1. قارئ التشكيلة التكتيكي الذكي */}
      <FormationReaderWidget />

      {/* 2. زر إزالة اللاق وتسريع لعبة بيس والدخول المباشر */}
      <motion.div whileTap={{ scale: 0.99 }}>
        <Card 
          id="home-card-lag-remover"
          onClick={() => navigate('/lag-remover')}
          className="p-4 bg-gradient-to-r from-[#0c223a] via-[#091526] to-[#160e28] border-2 border-cyan-500/40 hover:border-cyan-400 cursor-pointer flex flex-col gap-3 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] group relative overflow-hidden"
        >
          {/* Background subtle glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-black flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-105 transition-transform">
                <Zap size={22} className="fill-black" />
              </div>
              <div className="flex flex-col text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                    إزالة اللاق وتسريع لعبة بيس
                  </span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                    دخول فوري
                  </span>
                </div>
                <span className="text-[11px] text-gray-300">
                  تنظيف الكاش، تفريغ الرام، وتحسين أداء اللعبة
                </span>
              </div>
            </div>
            <div className="shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-500 group-hover:text-black transition-all">
              <Play size={14} className="fill-current" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-gray-400">
            <span className="flex items-center gap-1 font-mono text-cyan-300 font-bold">
              ⚡ مسرّع الأداء
            </span>
            <span className="flex items-center gap-1 font-mono text-emerald-300 font-bold">
              🔒 تنظيف تلقائي
            </span>
            <span className="text-yellow-400 font-bold flex items-center gap-1">
              بدء الدخول ➔
            </span>
          </div>
        </Card>
      </motion.div>

      {/* 3. Main Platform Services Grid (أقسام المنصة) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400" />
            أقسام المنصة
          </h3>
          <span className="text-[11px] text-gray-400">خدمات اللاعبين</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Player Builds */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card 
              id="home-card-builds"
              onClick={() => navigate('/player-builds')}
              className="p-3.5 bg-[#0B1221]/90 border border-yellow-500/20 hover:border-yellow-500/50 cursor-pointer flex flex-col gap-2.5 transition-all shadow-md group"
            >
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/20 group-hover:bg-yellow-500/20 transition-colors">
                <Flame size={22} />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white group-hover:text-yellow-400 transition-colors">تطويرات اللاعبين</span>
                <span className="text-[10px] text-gray-400 mt-0.5">+100 لاعب بنقاط دقيقة</span>
              </div>
            </Card>
          </motion.div>

          {/* Analyze Your Formation (حلل تشكيلتك) */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card 
              id="home-card-analyze-formation"
              onClick={() => navigate('/formation-reader')}
              className="p-3.5 bg-[#0B1221]/90 border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer flex flex-col gap-2.5 transition-all shadow-md group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:bg-cyan-500/25 transition-colors">
                  <Scan size={22} />
                </div>
                <span className="text-[9px] bg-cyan-500 text-black font-black px-1.5 py-0.2 rounded font-mono">
                  فحص AI
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">حلل تشكيلتك</span>
                <span className="text-[10px] text-gray-400 mt-0.5">ارفع صورة لكشف الأخطاء والنصائح</span>
              </div>
            </Card>
          </motion.div>

          {/* eFootball Managers Guide (50 مدرب) */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card 
              id="home-card-managers"
              onClick={() => navigate('/managers')}
              className="p-3.5 bg-[#0B1221]/90 border border-purple-500/20 hover:border-purple-500/50 cursor-pointer flex flex-col gap-2.5 transition-all shadow-md group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                  <Users size={22} />
                </div>
                <span className="text-[9px] bg-purple-500 text-white font-black px-1.5 py-0.2 rounded font-mono">
                  50 مدرب
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white group-hover:text-purple-400 transition-colors">المدربين</span>
                <span className="text-[10px] text-gray-400 mt-0.5">التشكيلة وأسلوب اللعب والبوستر</span>
              </div>
            </Card>
          </motion.div>

          {/* AlRashdawi Portal */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card 
              id="home-card-rashdawi"
              onClick={() => navigate('/alrashdawi')}
              className="p-3.5 bg-gradient-to-br from-[#12110a] to-[#0B1221] border border-amber-500/30 hover:border-amber-400/70 cursor-pointer flex flex-col gap-2.5 transition-all shadow-md group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-500/30 transition-colors">
                  <BadgeCheck size={22} />
                </div>
                <span className="text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.2 rounded font-mono">
                  معتمد
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">منفذ الرشداوي</span>
                <span className="text-[10px] text-gray-400 mt-0.5">القناة الرسمية والروابط المعتمدة</span>
              </div>
            </Card>
          </motion.div>

          {/* Lucky Wheel (عجلة الحظ) */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card 
              id="home-card-wheel"
              onClick={() => openTelegramAndWheel(navigate)}
              className="p-3.5 bg-[#0B1221]/90 border border-pink-500/20 hover:border-pink-500/50 cursor-pointer flex flex-col gap-2.5 transition-all shadow-md group"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20 group-hover:bg-pink-500/20 transition-colors">
                <Gift size={22} />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white group-hover:text-pink-400 transition-colors">عجلة الحظ</span>
                <span className="text-[10px] text-gray-400 mt-0.5">جوائز وسحب اللاعبين</span>
              </div>
            </Card>
          </motion.div>

          {/* Device Check (فحص الجهاز) */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card 
              id="home-card-device-check"
              onClick={() => navigate('/device-check')}
              className="p-3.5 bg-[#0B1221]/90 border border-cyan-500/20 hover:border-cyan-500/50 cursor-pointer flex flex-col gap-2.5 transition-all shadow-md group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                <Gauge size={22} />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">فحص الجهاز</span>
                <span className="text-[10px] text-gray-400 mt-0.5">فحص حقيقي للعتاد والشبكة والبطارية</span>
              </div>
            </Card>
          </motion.div>

          {/* Quick Lag Remover Card in Grid */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card 
              id="home-card-grid-lag-remover"
              onClick={() => navigate('/lag-remover')}
              className="p-3.5 bg-gradient-to-br from-[#0B1221] to-[#0c1f36] border border-cyan-500/30 hover:border-cyan-400 cursor-pointer flex flex-col gap-2.5 transition-all shadow-md group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:bg-cyan-500/25 transition-colors">
                  <Zap size={22} className="text-yellow-400" />
                </div>
                <span className="text-[9px] bg-yellow-500 text-black font-black px-1.5 py-0.2 rounded font-mono">
                  تسريع
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">إزالة اللاق</span>
                <span className="text-[10px] text-gray-400 mt-0.5">تسريع اللعبة ودخول مباشر لبيس</span>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
