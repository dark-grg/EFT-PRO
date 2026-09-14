import React from 'react';
import { motion } from 'motion/react';
import { Shield, Swords, Compass, Scale, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';

interface ScoreCardProps {
  overallScore: number;
  attackScore: number;
  defenseScore: number;
  midfieldScore: number;
  balanceScore: number;
  formationName: string;
}

export function getScoreLevel(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 90) {
    return {
      label: 'ممتازة',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/40'
    };
  } else if (score >= 80) {
    return {
      label: 'قوية',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/15',
      border: 'border-cyan-500/40'
    };
  } else if (score >= 70) {
    return {
      label: 'جيدة',
      color: 'text-amber-400',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/40'
    };
  } else if (score >= 60) {
    return {
      label: 'تحتاج بعض التحسين',
      color: 'text-orange-400',
      bg: 'bg-orange-500/15',
      border: 'border-orange-500/40'
    };
  } else {
    return {
      label: 'تحتاج إعادة بناء',
      color: 'text-red-400',
      bg: 'bg-red-500/15',
      border: 'border-red-500/40'
    };
  }
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  overallScore,
  attackScore,
  defenseScore,
  midfieldScore,
  balanceScore,
  formationName
}) => {
  const level = getScoreLevel(overallScore);

  return (
    <Card className="p-4 bg-[#0B1221] border-2 border-cyan-500/30 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col gap-4 text-right relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Main Score Ring */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-black border-2 shadow-lg ${level.bg} ${level.color} ${level.border}`}>
            <motion.span 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="text-2xl leading-none"
            >
              {overallScore}
            </motion.span>
            <span className="text-[9px] text-gray-400 mt-0.5">/100</span>
          </div>

          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">التقييم التكتيكي النهائي</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${level.bg} ${level.color} ${level.border}`}>
                {level.label}
              </span>
            </div>
            <span className="text-sm font-black text-cyan-300 font-mono mt-0.5">
              خطة {formationName}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Score Bars */}
      <div className="grid grid-cols-2 gap-2.5 z-10 pt-1 border-t border-white/5">
        {/* Attack */}
        <div className="p-2.5 rounded-2xl bg-black/40 border border-red-500/20 flex flex-col gap-1.5 text-right">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-red-400">
              <Swords size={13} />
              <span className="font-bold">الهجوم</span>
            </div>
            <span className="font-mono font-black text-red-300">{attackScore}/100</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${attackScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-red-600 to-rose-400"
            />
          </div>
        </div>

        {/* Defense */}
        <div className="p-2.5 rounded-2xl bg-black/40 border border-blue-500/20 flex flex-col gap-1.5 text-right">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-blue-400">
              <Shield size={13} />
              <span className="font-bold">الدفاع</span>
            </div>
            <span className="font-mono font-black text-blue-300">{defenseScore}/100</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${defenseScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
            />
          </div>
        </div>

        {/* Midfield */}
        <div className="p-2.5 rounded-2xl bg-black/40 border border-amber-500/20 flex flex-col gap-1.5 text-right">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-amber-400">
              <Compass size={13} />
              <span className="font-bold">الوسط</span>
            </div>
            <span className="font-mono font-black text-amber-300">{midfieldScore}/100</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${midfieldScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
            />
          </div>
        </div>

        {/* Balance */}
        <div className="p-2.5 rounded-2xl bg-black/40 border border-purple-500/20 flex flex-col gap-1.5 text-right">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-purple-400">
              <Scale size={13} />
              <span className="font-bold">التوازن</span>
            </div>
            <span className="font-mono font-black text-purple-300">{balanceScore}/100</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${balanceScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-400"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
