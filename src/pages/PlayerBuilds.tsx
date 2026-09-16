import React, { useState, useMemo } from 'react';
import { EF_LABO_PROVIDER, EFLabCardRecord } from '../services/progression/EFLabProgressionProvider';
import { ExactCardImage } from '../components/ExactCardImage';
import { Search, X, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const STAT_LABELS = [
  'Shooting',
  'Passing',
  'Dribbling',
  'Dexterity',
  'Lower Body',
  'Aerial',
  'Defending',
  'GK1',
  'GK2',
  'GK3'
];

export const PlayerBuilds: React.FC = () => {
  const navigate = useNavigate();
  const [laboRecords] = useState<EFLabCardRecord[]>(() => EF_LABO_PROVIDER.getAllRecords());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<EFLabCardRecord | null>(null);

  // Filter records based on search query
  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return laboRecords;
    return laboRecords.filter(record => 
      record.playerName.toLowerCase().includes(q) ||
      (record.arabicName && record.arabicName.toLowerCase().includes(q)) ||
      record.cardType.toLowerCase().includes(q) ||
      record.position.toLowerCase().includes(q)
    );
  }, [laboRecords, searchQuery]);

  const getProgressionValues = (p: EFLabCardRecord['progression']) => {
    if (!p) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    return [
      p.shooting ?? 0,
      p.passing ?? 0,
      p.dribbling ?? 0,
      p.dexterity ?? 0,
      p.lowerBody ?? 0,
      p.aerial ?? 0,
      p.defending ?? 0,
      p.gk1 ?? 0,
      p.gk2 ?? 0,
      p.gk3 ?? 0,
    ];
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-white pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-[#0B1221] border-b border-blue-900/30 px-4 py-4 sticky top-0 z-30 shadow-lg backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-blue-950/40 text-blue-400 hover:bg-blue-900/40 transition border border-blue-500/20"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="text-lg font-black text-white">تطويرات اللاعبين</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="🔎 ابحث عن لاعب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B1221] border border-blue-900/40 rounded-2xl pr-12 pl-4 py-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 transition shadow-md"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Players Grid */}
        {filteredRecords.length === 0 ? (
          <div className="bg-[#0B1221] rounded-2xl p-12 text-center border border-blue-900/30 space-y-2">
            <p className="text-sm font-bold text-gray-300">غير متاح</p>
            <p className="text-xs text-gray-500">لا توجد نتائج مطابقة لبحثك أو أن البيانات غير متوفرة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredRecords.map((record) => {
              const values = getProgressionValues(record.progression);
              const hasProg = record.progression && Object.keys(record.progression).length > 0;
              const line1 = values.slice(0, 5).join(' / ');
              const line2 = values.slice(5, 10).join(' / ');

              return (
                <div
                  key={record.cardId}
                  onClick={() => setSelectedRecord(record)}
                  className="bg-[#0B1221] hover:bg-[#131E32] rounded-2xl p-3 border border-blue-900/30 hover:border-blue-500/50 transition cursor-pointer flex flex-col items-center text-center space-y-2.5 shadow-md"
                >
                  {/* Player / Card Image */}
                  <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-[#050B14] overflow-hidden flex items-center justify-center border border-white/5 relative">
                    {record.cardImageUrl ? (
                      <ExactCardImage
                        cardId={record.cardId}
                        cardImageUrl={record.cardImageUrl}
                        alt={record.playerName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-500 px-1 text-center">غير متاح</span>
                    )}
                  </div>

                  {/* Player Name */}
                  <div className="w-full truncate">
                    <h3 className="font-bold text-xs text-white truncate px-1">
                      {record.playerName}
                    </h3>
                  </div>

                  {/* Progression Only */}
                  <div className="w-full bg-[#050B14] rounded-xl p-2 border border-white/5 font-mono text-[11px] tracking-tight text-blue-400 space-y-0.5">
                    {hasProg ? (
                      <>
                        <div dir="ltr" className="truncate">{line1}</div>
                        <div dir="ltr" className="truncate">{line2}</div>
                      </>
                    ) : (
                      <span className="text-[10px] text-gray-500">غير متاح</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B1221] border border-blue-900/50 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedRecord(null)}
                className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Player Image */}
              <div className="flex justify-center pt-2">
                <div className="w-24 h-32 rounded-2xl bg-[#050B14] overflow-hidden flex items-center justify-center border border-white/10 shadow-lg">
                  {selectedRecord.cardImageUrl ? (
                    <ExactCardImage
                      cardId={selectedRecord.cardId}
                      cardImageUrl={selectedRecord.cardImageUrl}
                      alt={selectedRecord.playerName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-500 text-center px-2">غير متاح</span>
                  )}
                </div>
              </div>

              {/* Player Name */}
              <div className="text-center space-y-1">
                <h2 className="text-base font-black text-white">{selectedRecord.playerName}</h2>
                {selectedRecord.arabicName && (
                  <p className="text-xs text-gray-400">{selectedRecord.arabicName}</p>
                )}
              </div>

              {/* Progression Data */}
              <div className="bg-[#050B14] rounded-2xl p-4 border border-blue-900/40 space-y-3">
                <div className="text-xs font-bold text-gray-300">التطوير:</div>
                <div className="bg-[#0B1221] p-3 rounded-xl border border-white/5 font-mono text-xs text-blue-400 text-center tracking-wider" dir="ltr">
                  {getProgressionValues(selectedRecord.progression).join(' / ')}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                  {STAT_LABELS.map((label, idx) => {
                    const vals = getProgressionValues(selectedRecord.progression);
                    return (
                      <div key={label} className="flex items-center justify-between text-gray-400">
                        <span>{label}</span>
                        <strong className="font-mono text-white">{vals[idx]}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
