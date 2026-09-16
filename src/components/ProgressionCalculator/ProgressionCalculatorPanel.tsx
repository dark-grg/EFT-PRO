import React, { useState, useEffect } from 'react';
import { PlayerCard, ProgressionAllocation } from '../../types/playerCard';
import { ProgressionCalculator } from '../../services/progression/ProgressionCalculator';
import { ProgressionEngine } from '../../services/progression/ProgressionEngine';
import { calculateCategoryCost } from '../../services/progression/ProgressionRules';
import { Plus, Minus, RotateCcw, Copy, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { STAT_DEFINITIONS } from '../../services/progressionEngine';

interface Props {
  card: PlayerCard;
}

const CATEGORY_LABELS: Record<string, string> = {
  shooting: 'تسديد (Shooting)',
  passing: 'تمرير (Passing)',
  dribbling: 'مراوغة (Dribbling)',
  dexterity: 'رشاقة (Dexterity)',
  lowerBody: 'قوة الجزء السفلي (Lower Body)',
  aerial: 'ارتقاء (Aerial)',
  defending: 'دفاع (Defending)',
  gk1: 'حراسة مرمى 1',
  gk2: 'حراسة مرمى 2',
  gk3: 'حراسة مرمى 3'
};

export const ProgressionCalculatorPanel: React.FC<Props> = ({ card }) => {
  const [allocation, setAllocation] = useState<ProgressionAllocation>({});
  const [isCopied, setIsCopied] = useState(false);

  const availablePoints = ProgressionCalculator.getAvailablePoints(card);
  const cost = ProgressionCalculator.calculateTotalCost(allocation);
  const remaining = availablePoints !== null ? availablePoints - cost : null;
  
  const finalStats = ProgressionCalculator.applyAllocationToStats(card, allocation);
  const finalOVR = ProgressionCalculator.calculateFinalOVR(card, finalStats);

  const categories = ProgressionEngine.getBaseCategories(card.position || '');

  useEffect(() => {
    // Check if canonical/source data exists, if so load it, otherwise start empty.
    if (card.progressionPoints) {
       setAllocation(card.progressionPoints);
    } else {
       setAllocation({});
    }
  }, [card]);

  const handleAdjust = (cat: string, delta: number) => {
    setAllocation(prev => {
      const current = prev[cat as keyof ProgressionAllocation] || 0;
      const next = current + delta;
      if (next < 0) return prev;
      if (next > 99) return prev; // max levels check? normally max is around 16 but theoretically...
      
      const testAlloc = { ...prev, [cat]: next };
      const newCost = ProgressionCalculator.calculateTotalCost(testAlloc);
      
      if (availablePoints !== null && newCost > availablePoints) {
        toast.error('نقاط التطوير المتبقية غير كافية');
        return prev;
      }
      
      return testAlloc;
    });
  };

  const handleReset = () => {
    setAllocation({});
    toast.success('تمت إعادة ضبط التوزيع');
  };

  const handlePreset = (preset: any) => {
    const alloc = ProgressionEngine.buildDeterministicPreset(card, preset);
    setAllocation(alloc);
    toast.success(`تم تطبيق توزيع: ${preset}`);
  };

  const copyToClipboard = () => {
    let text = `🎮 توزيع نقاط ${card.playerName}:\n`;
    for (const cat of categories) {
      const val = allocation[cat as keyof ProgressionAllocation] || 0;
      if (val > 0) {
        text += `• ${CATEGORY_LABELS[cat] || cat}: +${val}\n`;
      }
    }
    text += `\n OVR: ${finalOVR || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('تم النسخ');
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (availablePoints === null) {
    return (
      <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
        <p className="text-red-400 font-bold mb-2">بيانات البطاقة غير مكتملة</p>
        <p className="text-sm text-gray-400">عدد نقاط التطوير (Max Level) أو Base Stats غير متوفر لهذه البطاقة.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#080d19] p-4 rounded-xl border border-white/10">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs">النقاط المتاحة</span>
          <span className="text-2xl font-black text-white">{availablePoints}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs">المستخدمة</span>
          <span className="text-2xl font-black text-blue-400">{cost}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs">المتبقية</span>
          <span className={`text-2xl font-black ${remaining === 0 ? 'text-emerald-400' : 'text-orange-400'}`}>{remaining}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-xs">Final OVR</span>
          <span className="text-3xl font-black text-emerald-400">{finalOVR || 'N/A'}</span>
        </div>
      </div>

      {/* Auto Presets */}
      <div className="flex flex-wrap gap-2">
        {card.position === 'GK' ? (
          <button onClick={() => handlePreset('Goalkeeper')} className="px-3 py-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-lg border border-blue-500/30">Auto GK</button>
        ) : (
          <>
            <button onClick={() => handlePreset('Balanced')} className="px-3 py-1.5 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20">متوازن</button>
            <button onClick={() => handlePreset('Attacker')} className="px-3 py-1.5 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg">هجومي</button>
            <button onClick={() => handlePreset('Speed')} className="px-3 py-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-lg">سرعة</button>
            <button onClick={() => handlePreset('Dribbler')} className="px-3 py-1.5 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-lg">مراوغة</button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-300 mb-2 border-b border-white/10 pb-2">توزيع النقاط</h3>
          {categories.map(cat => {
            const val = allocation[cat as keyof ProgressionAllocation] || 0;
            // Next cost if we add 1
            let nextCost = 1;
            if (val >= 4 && val < 8) nextCost = 2;
            else if (val >= 8 && val < 12) nextCost = 3;
            else if (val >= 12) nextCost = 4;
            else if (val >= 16) nextCost = 5;

            return (
              <div key={cat} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-xs font-bold text-gray-200">{CATEGORY_LABELS[cat] || cat}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 w-12 text-right">Cost: {nextCost}</span>
                  <button onClick={() => handleAdjust(cat, -1)} disabled={val === 0} className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/15 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none">
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-bold text-white text-sm">{val}</span>
                  <button onClick={() => handleAdjust(cat, 1)} disabled={remaining !== null && remaining < nextCost} className="w-7 h-7 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          
          <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
            <button onClick={handleReset} className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
              <RotateCcw size={14} /> إعادة ضبط
            </button>
            <button onClick={copyToClipboard} className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
              {isCopied ? <Check size={14} /> : <Copy size={14} />} نسخ
            </button>
          </div>
        </div>

        {/* Final Stats Preview */}
        <div className="bg-black/20 p-4 rounded-xl border border-white/5 h-[400px] overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-300 mb-4 sticky top-0 bg-[#0d121f] py-2 border-b border-white/10 z-10">إحصائيات اللاعب النهائية</h3>
          {card.baseStats ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {Object.entries(finalStats).map(([key, val]) => {
                const base = card.baseStats![key] || 0;
                const diff = val - base;
                const def = STAT_DEFINITIONS[key];
                
                return (
                  <div key={key} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-gray-400 truncate pr-2">{def ? def.arabicName : key}</span>
                    <div className="flex items-center gap-2 font-mono">
                      {diff > 0 && <span className="text-[10px] text-emerald-400">+{diff}</span>}
                      <span className={`font-bold ${val >= 90 ? 'text-purple-400' : val >= 80 ? 'text-emerald-400' : val >= 70 ? 'text-blue-400' : 'text-white'}`}>{val}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
             <p className="text-xs text-gray-500 text-center py-10">Base Stats غير متوفرة لحساب الإحصائيات.</p>
          )}
        </div>
      </div>
    </div>
  );
};
