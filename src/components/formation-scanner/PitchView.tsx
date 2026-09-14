import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DetectedPlayer, TacticalCoverageMetrics } from '../../models/FormationAnalysis';

interface PitchViewProps {
  players: DetectedPlayer[];
  formation: string;
  metrics: TacticalCoverageMetrics;
}

export const PitchView: React.FC<PitchViewProps> = ({ players, formation, metrics }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<DetectedPlayer | null>(null);

  const getRoleCategory = (pos: string) => {
    if (['GK'].includes(pos)) return 'gk';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'defense';
    if (['DMF', 'CMF', 'AMF', 'LMF', 'RMF'].includes(pos)) return 'midfield';
    return 'attack';
  };

  return (
    <div className="flex flex-col gap-2 text-right">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-white">رسم تمركز اللاعبين على الملعب:</span>
        <span className="text-[10px] text-cyan-400 font-mono">
          عرض الملعب: {metrics.width}% • العمق: {metrics.depth}%
        </span>
      </div>

      <div className="relative w-full h-80 rounded-2xl bg-gradient-to-b from-[#06331e] via-[#042617] to-[#02150c] border-2 border-emerald-500/40 overflow-hidden shadow-inner select-none">
        {/* Pitch stripes */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Boundary */}
        <div className="absolute inset-2 border border-white/25 rounded-lg pointer-events-none" />

        {/* Halfway line */}
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[1px] bg-white/25 pointer-events-none" />

        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/25 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/40 rounded-full pointer-events-none" />

        {/* Penalty Box Top */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-36 h-14 border-b border-x border-white/25 rounded-b-md pointer-events-none" />
        {/* Penalty Box Bottom */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-14 border-t border-x border-white/25 rounded-t-md pointer-events-none" />

        {/* Render Players */}
        {players.map((player, idx) => {
          const category = getRoleCategory(player.position);
          const isSelected = selectedPlayer === player;

          let badgeColor = 'bg-red-600 text-white border-red-300';
          if (category === 'midfield') badgeColor = 'bg-amber-500 text-black border-yellow-200';
          if (category === 'defense') badgeColor = 'bg-blue-600 text-white border-blue-300';
          if (category === 'gk') badgeColor = 'bg-emerald-500 text-black border-emerald-200';

          return (
            <motion.button
              key={idx}
              onClick={() => setSelectedPlayer(player)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              style={{
                left: `${player.x}%`,
                top: `${player.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute flex flex-col items-center justify-center cursor-pointer z-10 transition-transform"
            >
              <div className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-black shadow-md border flex items-center gap-1 ${badgeColor} ${
                isSelected ? 'ring-2 ring-white scale-110' : ''
              }`}>
                <span>{player.position}</span>
                {player.rating && (
                  <span className="opacity-90 font-mono text-[8px] bg-black/30 px-1 rounded-sm">
                    {player.rating}
                  </span>
                )}
              </div>

              {player.name && player.name !== 'unknown' && (
                <span className="text-[8px] text-white/90 font-bold bg-black/60 px-1 py-0.2 rounded mt-0.5 max-w-[60px] truncate shadow">
                  {player.name}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Player Details Bar */}
      {selectedPlayer ? (
        <div className="p-2.5 rounded-xl bg-black/60 border border-cyan-400/40 text-right flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500 text-black font-mono font-black text-xs">
              {selectedPlayer.position}
            </span>
            <span className="text-xs font-bold text-white">
              {selectedPlayer.name || 'لاعب'}
            </span>
            {selectedPlayer.rating && (
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                تقييم: {selectedPlayer.rating}
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            دقة الرصد: {selectedPlayer.confidence}%
          </span>
        </div>
      ) : (
        <span className="text-[10px] text-gray-400 text-center">
          اضغط على أي لاعب في الملعب لعرض بياناته والتقييم المرصود
        </span>
      )}
    </div>
  );
};
