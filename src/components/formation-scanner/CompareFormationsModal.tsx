import React, { useState } from 'react';
import { X, ArrowLeftRight, Trophy, Shield, Swords, Compass, Scale, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FormationAnalysis, SavedAnalysisRecord } from '../../models/FormationAnalysis';
import { FormationAnalysisService } from '../../services/FormationAnalysisService';

interface CompareFormationsModalProps {
  currentAnalysis?: FormationAnalysis | SavedAnalysisRecord;
  savedRecords: SavedAnalysisRecord[];
  onClose: () => void;
}

export const CompareFormationsModal: React.FC<CompareFormationsModalProps> = ({
  currentAnalysis,
  savedRecords,
  onClose
}) => {
  const service = new FormationAnalysisService();

  // Pick formation A and formation B
  const [selectedAId, setSelectedAId] = useState<string>(currentAnalysis?.id || savedRecords[0]?.id || '');
  const [selectedBId, setSelectedBId] = useState<string>(savedRecords[1]?.id || savedRecords[0]?.id || '');

  const getRecord = (id: string): FormationAnalysis | SavedAnalysisRecord | undefined => {
    if (currentAnalysis && currentAnalysis.id === id) return currentAnalysis;
    return savedRecords.find(r => r.id === id);
  };

  const itemA = getRecord(selectedAId);
  const itemB = getRecord(selectedBId);

  const comparison = itemA && itemB ? service.compareFormations(itemA, itemB) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-[#0B1221] border-2 border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-right max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2 text-cyan-400">
            <ArrowLeftRight size={20} />
            <h3 className="text-sm font-black text-white">مقارنة التشكيلات التكتيكية</h3>
          </div>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-3">
          {/* Formation A */}
          <div className="flex flex-col gap-1.5 text-right">
            <span className="text-[11px] font-bold text-cyan-300">التشكيلة (أ)</span>
            <select
              value={selectedAId}
              onChange={(e) => setSelectedAId(e.target.value)}
              className="bg-black/60 border border-cyan-500/30 text-white rounded-xl p-2 text-xs font-bold"
            >
              {currentAnalysis && (
                <option value={currentAnalysis.id}>التحليل الحالي ({currentAnalysis.formation})</option>
              )}
              {savedRecords.map(r => (
                <option key={`a-${r.id}`} value={r.id}>
                  خطة {r.formation} ({r.overallScore}/100) - {r.date}
                </option>
              ))}
            </select>
          </div>

          {/* Formation B */}
          <div className="flex flex-col gap-1.5 text-right">
            <span className="text-[11px] font-bold text-purple-300">التشكيلة (ب)</span>
            <select
              value={selectedBId}
              onChange={(e) => setSelectedBId(e.target.value)}
              className="bg-black/60 border border-purple-500/30 text-white rounded-xl p-2 text-xs font-bold"
            >
              {currentAnalysis && (
                <option value={currentAnalysis.id}>التحليل الحالي ({currentAnalysis.formation})</option>
              )}
              {savedRecords.map(r => (
                <option key={`b-${r.id}`} value={r.id}>
                  خطة {r.formation} ({r.overallScore}/100) - {r.date}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Dashboard */}
        {comparison && itemA && itemB ? (
          <div className="flex flex-col gap-3.5 pt-2">
            {/* Summary Banner */}
            <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center">
              <span className="text-xs font-bold text-cyan-200 leading-relaxed">
                {comparison.summary}
              </span>
            </div>

            {/* Overall Score Head-to-Head */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className={`p-3 rounded-2xl border ${comparison.betterOverall === 'A' ? 'bg-cyan-500/15 border-cyan-500' : 'bg-black/40 border-white/10'}`}>
                <span className="text-[10px] text-gray-400">التقييم الإجمالي (أ)</span>
                <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
                  {itemA.overallScore}
                </div>
                <span className="text-xs font-bold text-white mt-0.5 block font-mono">{itemA.formation}</span>
              </div>

              <div className={`p-3 rounded-2xl border ${comparison.betterOverall === 'B' ? 'bg-purple-500/15 border-purple-500' : 'bg-black/40 border-white/10'}`}>
                <span className="text-[10px] text-gray-400">التقييم الإجمالي (ب)</span>
                <div className="text-2xl font-black font-mono text-purple-400 mt-1">
                  {itemB.overallScore}
                </div>
                <span className="text-xs font-bold text-white mt-0.5 block font-mono">{itemB.formation}</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="flex flex-col gap-2 bg-black/40 p-3 rounded-2xl border border-white/5">
              {/* Attack */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span className="font-mono font-black text-cyan-400">{itemA.attackScore}</span>
                <div className="flex items-center gap-1 text-red-400">
                  <Swords size={13} />
                  <span className="font-bold">الهجوم</span>
                </div>
                <span className="font-mono font-black text-purple-400">{itemB.attackScore}</span>
              </div>

              {/* Defense */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span className="font-mono font-black text-cyan-400">{itemA.defenseScore}</span>
                <div className="flex items-center gap-1 text-blue-400">
                  <Shield size={13} />
                  <span className="font-bold">الدفاع</span>
                </div>
                <span className="font-mono font-black text-purple-400">{itemB.defenseScore}</span>
              </div>

              {/* Midfield */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span className="font-mono font-black text-cyan-400">{itemA.midfieldScore}</span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Compass size={13} />
                  <span className="font-bold">الوسط</span>
                </div>
                <span className="font-mono font-black text-purple-400">{itemB.midfieldScore}</span>
              </div>

              {/* Balance */}
              <div className="flex items-center justify-between text-xs py-1">
                <span className="font-mono font-black text-cyan-400">{itemA.balanceScore}</span>
                <div className="flex items-center gap-1 text-purple-400">
                  <Scale size={13} />
                  <span className="font-bold">التوازن</span>
                </div>
                <span className="font-mono font-black text-purple-400">{itemB.balanceScore}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            يرجى حفظ تشكيلتين على الأقل للمقارنة بينهما.
          </div>
        )}

        <Button onClick={onClose} variant="secondary" className="w-full mt-2 text-xs font-bold">
          إغلاق المقارنة
        </Button>
      </Card>
    </div>
  );
};
