import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';
import { TacticalError } from '../../models/FormationAnalysis';
import { Card } from '../ui/Card';

interface WeaknessCardProps {
  errors: TacticalError[];
}

export const WeaknessCard: React.FC<WeaknessCardProps> = ({ errors }) => {
  if (errors.length === 0) {
    return (
      <Card className="p-4 bg-[#0B1221] border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-right">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
          <CheckCircle size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-white">لم يتم رصد ثغرات تكتيكية بارزة</span>
          <span className="text-[10px] text-gray-400">تمركز اللاعبين والخطوط متناسق بشكل ممتاز.</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-[#0B1221] border-2 border-red-500/30 rounded-3xl flex flex-col gap-3.5 text-right shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-red-400">
          <ShieldAlert size={18} />
          <span className="text-xs font-black">الأخطاء والثغرات التكتيكية المرصودة ({errors.length})</span>
        </div>
        <span className="text-[10px] text-red-300 font-mono bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold">
          مستخرجة من مراكز اللاعبين
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {errors.map((err, idx) => {
          const isHigh = err.severity === 'high';
          const isMed = err.severity === 'medium';

          return (
            <div 
              key={idx}
              className={`p-3.5 rounded-2xl flex flex-col gap-2 border text-right transition-all ${
                isHigh 
                  ? 'bg-red-950/20 border-red-500/30' 
                  : isMed
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-blue-950/20 border-blue-500/25'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle 
                    size={15} 
                    className={isHigh ? 'text-red-400 shrink-0' : isMed ? 'text-amber-400 shrink-0' : 'text-blue-400 shrink-0'} 
                  />
                  <span className="text-xs font-black text-white">{err.title}</span>
                </div>
                
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md font-mono ${
                  isHigh 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                    : isMed
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  {isHigh ? 'خطورة عالية' : isMed ? 'خطورة متوسطة' : 'ملاحظة'}
                </span>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed pr-5">
                {err.description}
              </p>

              <div className="mt-1 pt-2 border-t border-white/5 pr-5 flex items-start gap-1.5">
                <span className="text-[10px] font-black text-emerald-400 shrink-0">الحل التكتيكي:</span>
                <span className="text-[10px] text-emerald-300 font-medium leading-normal">{err.recommendation}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
