import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Bookmark, 
  BookmarkCheck, 
  ArrowLeftRight, 
  RotateCcw, 
  AlertTriangle,
  Layers,
  Gamepad2,
  UserCheck
} from 'lucide-react';
import { FormationAnalysis, SavedAnalysisRecord } from '../../models/FormationAnalysis';
import { ScoreCard } from './ScoreCard';
import { WeaknessCard } from './WeaknessCard';
import { RecommendationCard } from './RecommendationCard';
import { PitchView } from './PitchView';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FormationAnalysisService } from '../../services/FormationAnalysisService';
import toast from 'react-hot-toast';

interface AnalysisResultProps {
  analysis: FormationAnalysis;
  previewThumbnail?: string;
  onNewScan: () => void;
  onOpenCompare: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  analysis,
  previewThumbnail,
  onNewScan,
  onOpenCompare
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const analysisService = new FormationAnalysisService();

  const handleSave = () => {
    if (isSaved) return;
    analysisService.saveAnalysisToHistory(analysis, false, previewThumbnail);
    setIsSaved(true);
    toast.success('تم حفظ التقرير التكتيكي في السجل بنجاح!');
  };

  const isLowConfidence = analysis.confidence < 60;

  return (
    <div className="flex flex-col gap-5 text-right animate-in fade-in duration-300">
      {/* Top Banner: Formation, Game, Confidence */}
      <Card className="p-4 bg-gradient-to-r from-[#0B1221] to-[#121E38] border-2 border-cyan-500/40 rounded-3xl shadow-xl flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white">تقرير فحص التشكيلة الاحترافي</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
              مباشر
            </span>
          </div>

          <div className="flex items-center gap-1 bg-black/50 border border-white/10 px-2.5 py-1 rounded-xl">
            <span className="text-[10px] text-gray-400">دقة قراءة الصورة:</span>
            <span className={`text-xs font-mono font-black ${isLowConfidence ? 'text-amber-400' : 'text-emerald-400'}`}>
              {analysis.confidence}%
            </span>
          </div>
        </div>

        {/* Formation Meta Details */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-xl border border-white/5 text-xs text-white">
            <Layers size={14} className="text-cyan-400" />
            <span>الخطة: <strong className="font-mono text-cyan-300">{analysis.formation}</strong></span>
          </div>

          {analysis.gameName && (
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-xl border border-white/5 text-xs text-gray-300">
              <Gamepad2 size={14} className="text-blue-400" />
              <span>{analysis.gameName}</span>
            </div>
          )}

          {analysis.coach && (
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-xl border border-white/5 text-xs text-gray-300">
              <UserCheck size={14} className="text-purple-400" />
              <span>المدرب: <strong className="text-white">{analysis.coach}</strong></span>
            </div>
          )}

          {analysis.playstyle && (
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-xl border border-white/5 text-xs text-gray-300">
              <Sparkles size={14} className="text-yellow-400" />
              <span>الأسلوب: <strong className="text-yellow-300">{analysis.playstyle}</strong></span>
            </div>
          )}
        </div>

        {/* Low Confidence Warning Note if any */}
        {(isLowConfidence || analysis.imageClarityNote) && (
          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2 text-right mt-1">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-200">
                {isLowConfidence ? "بعض المعلومات غير واضحة" : "ملاحظة الفحص والتحليل"}
              </span>
              <span className="text-[11px] text-gray-300 mt-0.5">
                {analysis.imageClarityNote || 'قد تكون بعض أسماء اللاعبين أو تقييماتهم غير واضحة بسبب دقة السكرين شوت، تم اعتماد التمركز التكتيكي بدقة.'}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* 1. Score Card (0-100 deterministic scores: Attack, Defense, Midfield, Balance, Overall) */}
      <ScoreCard
        overallScore={analysis.overallScore}
        attackScore={analysis.attackScore}
        defenseScore={analysis.defenseScore}
        midfieldScore={analysis.midfieldScore}
        balanceScore={analysis.balanceScore}
        formationName={analysis.formation}
      />

      {/* 2. Interactive Pitch Representation */}
      <PitchView
        players={analysis.players}
        formation={analysis.formation}
        metrics={analysis.coverageMetrics}
      />

      {/* 3. Strengths Section */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <Card className="p-4 bg-[#0B1221] border border-emerald-500/30 rounded-3xl flex flex-col gap-3 text-right shadow-lg">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={18} />
            <span className="text-xs font-black">نقاط القوة والمزايا التكتيكية ({analysis.strengths.length})</span>
          </div>

          <div className="flex flex-col gap-2">
            {analysis.strengths.map((str, idx) => (
              <div 
                key={idx}
                className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-2 text-right text-xs text-emerald-200 font-medium"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{str}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 4. Tactical Errors & Weaknesses */}
      <WeaknessCard errors={analysis.tacticalErrors || []} />

      {/* 5. Tactical Recommendations & Instructions */}
      <RecommendationCard 
        recommendations={analysis.recommendations || []} 
        formation={analysis.formation} 
      />

      {/* Sticky Bottom Actions Bar */}
      <div className="p-3 bg-[#0B1221]/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl flex items-center justify-between gap-2 shadow-2xl sticky bottom-20 z-30">
        <Button
          onClick={handleSave}
          disabled={isSaved}
          variant={isSaved ? 'secondary' : 'primary'}
          className={`text-xs font-bold py-2.5 px-3 rounded-xl flex items-center gap-1.5 ${
            isSaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-cyan-500 text-black'
          }`}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          <span>{isSaved ? 'تم الحفظ' : 'حفظ التحليل'}</span>
        </Button>

        <Button
          onClick={onOpenCompare}
          variant="secondary"
          className="text-xs font-bold py-2.5 px-3 rounded-xl flex items-center gap-1.5 border border-purple-500/30 hover:border-purple-400"
        >
          <ArrowLeftRight size={16} className="text-purple-400" />
          <span>قارن تشكيلتين</span>
        </Button>

        <Button
          onClick={onNewScan}
          variant="ghost"
          className="text-xs font-bold py-2.5 px-3 rounded-xl text-gray-300 hover:text-white flex items-center gap-1.5"
        >
          <RotateCcw size={16} />
          <span>فحص لقطة أخرى</span>
        </Button>
      </div>
    </div>
  );
};
