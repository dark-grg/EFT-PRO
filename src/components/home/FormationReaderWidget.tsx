import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Scan, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ShieldAlert, 
  Upload, 
  Zap, 
  Sliders 
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const FormationReaderWidget: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-4 bg-gradient-to-b from-[#0B1221] via-[#08101E] to-[#040812] border-2 border-cyan-500/30 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.12)] flex flex-col gap-3.5 relative overflow-hidden text-right">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Scan size={18} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">قارئ التشكيلة التكتيكي الذكي</span>
              <span className="text-[9px] bg-cyan-500 text-black font-black px-1.5 py-0.2 rounded font-mono">
                جديد AI
              </span>
            </div>
            <span className="text-[10px] text-gray-400">قراءة وتفكيك الخطط وكشف الأخطاء والنصائح</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/formation-reader')}
          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
        >
          <span>فتح القارئ</span>
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Description */}
      <p className="text-[11px] text-gray-300 leading-relaxed z-10">
        ارفع لقطة شاشة لتشكيلتك في eFootball أو حدد خطتك، وسيقوم النظام بقراءة تمركز اللاعبين واكتشاف الثغرات الدفاعية وأخطاء الارتداد، مع تقديم حلول وتعليمات فردية فورية.
      </p>

      {/* Quick Visual Badges */}
      <div className="grid grid-cols-3 gap-2 z-10">
        <div className="p-2 rounded-xl bg-black/40 border border-red-500/20 flex flex-col items-center text-center gap-1">
          <ShieldAlert size={14} className="text-red-400" />
          <span className="text-[10px] font-black text-red-300">كشف الأخطاء</span>
          <span className="text-[8px] text-gray-400">ثغرات الأظهرة والارتداد</span>
        </div>

        <div className="p-2 rounded-xl bg-black/40 border border-cyan-500/20 flex flex-col items-center text-center gap-1">
          <Zap size={14} className="text-cyan-400" />
          <span className="text-[10px] font-black text-cyan-300">نصائح تكتيكية</span>
          <span className="text-[8px] text-gray-400">تعليمات فردية ذهبية</span>
        </div>

        <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/20 flex flex-col items-center text-center gap-1">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span className="text-[10px] font-black text-emerald-300">تقييم شامل</span>
          <span className="text-[8px] text-gray-400">معدل التوازن /100</span>
        </div>
      </div>

      {/* Action CTA Button */}
      <Button
        onClick={() => navigate('/formation-reader')}
        className="w-full py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 z-10 transition-all"
      >
        <Upload size={14} />
        <span>ارفع تشكيلتك وافحص الأخطاء والنصائح الآن</span>
      </Button>
    </Card>
  );
};
