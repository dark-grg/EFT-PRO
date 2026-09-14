import React, { useState } from 'react';
import { Lightbulb, Copy, Check, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import toast from 'react-hot-toast';

interface RecommendationCardProps {
  recommendations: string[];
  formation: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendations, formation }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `💡 نصائح وتوجيهات تكتيكية لخطة ${formation}:\n` + 
      recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('تم نسخ النصائح التكتيكية!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4 bg-[#0B1221] border-2 border-cyan-500/30 rounded-3xl flex flex-col gap-3 text-right shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400">
          <Lightbulb size={18} />
          <span className="text-xs font-black">النصائح والحلول التكتيكية الذكية</span>
        </div>

        <button
          onClick={handleCopy}
          className="text-[10px] text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1 font-mono transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? 'تم النسخ' : 'نسخ النصائح'}</span>
        </button>
      </div>

      <div className="flex flex-col gap-2.5 mt-1">
        {recommendations.map((rec, idx) => (
          <div 
            key={idx}
            className="p-3 rounded-2xl bg-[#081326] border border-cyan-500/20 flex items-start gap-2.5 text-right shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
              {idx + 1}
            </div>
            <p className="text-xs text-gray-200 leading-relaxed font-medium">
              {rec}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
