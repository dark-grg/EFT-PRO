import React from 'react';
import { X, History, Trash2, ArrowUpRight, Shield, Swords } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SavedAnalysisRecord } from '../../models/FormationAnalysis';
import { getScoreLevel } from './ScoreCard';

interface FormationHistoryModalProps {
  records: SavedAnalysisRecord[];
  onSelectRecord: (record: SavedAnalysisRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const FormationHistoryModal: React.FC<FormationHistoryModalProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-[#0B1221] border-2 border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-right max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2 text-cyan-400">
            <History size={20} />
            <h3 className="text-sm font-black text-white">سجل فحوصات التشكيلات المحفوظة ({records.length})</h3>
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
          {records.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2 text-gray-400">
              <History size={32} className="opacity-30" />
              <span className="text-xs">لا توجد تشكيلات محفوظة في السجل حتى الآن.</span>
            </div>
          ) : (
            records.map((r) => {
              const level = getScoreLevel(r.overallScore);
              return (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-cyan-500/40 transition-all flex items-center justify-between text-right"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteRecord(r.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="حذف من السجل"
                    >
                      <Trash2 size={15} />
                    </button>

                    <Button
                      size="sm"
                      onClick={() => onSelectRecord(r)}
                      className="text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25"
                    >
                      <span>عرض</span>
                      <ArrowUpRight size={13} />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col text-right">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white font-mono">خطة {r.formation}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${level.bg} ${level.color} ${level.border}`}>
                          {r.overallScore}/100
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5">{r.date}</span>
                    </div>

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black border text-sm ${level.bg} ${level.color} ${level.border}`}>
                      {r.overallScore}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {records.length > 0 && (
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-[11px] text-red-400 hover:text-red-300 font-bold"
            >
              مسح السجل بالكامل
            </button>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-xs text-gray-400">
              إغلاق
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
