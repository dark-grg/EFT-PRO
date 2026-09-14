import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, User, Info, Crosshair } from 'lucide-react';

export interface PitchPlayerItem {
  name: string;
  position: string;
  rating?: number | null;
  pitchX?: number;
  pitchY?: number;
  x?: number;
  y?: number;
}

interface TacticalPitchBoardProps {
  formationName?: string;
  playstyle?: string;
  coachName?: string;
  players?: PitchPlayerItem[];
  tacticalRating?: number;
}

// Position categorized colors
type RoleCategory = 'gk' | 'defense' | 'midfield' | 'attack';

function getRoleCategory(pos: string): RoleCategory {
  const p = (pos || '').toUpperCase().trim();
  if (['GK'].includes(p)) return 'gk';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p)) return 'defense';
  if (['DMF', 'CMF', 'AMF', 'LMF', 'RMF'].includes(p)) return 'midfield';
  return 'attack';
}

function getRoleColor(category: RoleCategory) {
  switch (category) {
    case 'gk':
      return {
        badgeBg: 'bg-emerald-500 text-black shadow-emerald-500/30 border-emerald-300',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]',
        label: 'حارس مرمى',
        dot: 'bg-emerald-400'
      };
    case 'defense':
      return {
        badgeBg: 'bg-blue-600 text-white shadow-blue-500/30 border-blue-300',
        glow: 'shadow-[0_0_12px_rgba(37,99,235,0.5)]',
        label: 'خط الدفاع',
        dot: 'bg-blue-400'
      };
    case 'midfield':
      return {
        badgeBg: 'bg-amber-500 text-black shadow-amber-500/30 border-amber-200',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
        label: 'خط الوسط',
        dot: 'bg-amber-400'
      };
    case 'attack':
      return {
        badgeBg: 'bg-rose-600 text-white shadow-rose-500/30 border-rose-300',
        glow: 'shadow-[0_0_12px_rgba(225,29,72,0.5)]',
        label: 'خط الهجوم',
        dot: 'bg-rose-400'
      };
  }
}

/**
 * Computes balanced fallback coordinates for standard football positions
 * to ensure the tactical board always renders with optical perfection.
 */
function getFallbackCoordinates(
  pos: string,
  posIndex: number,
  posCount: number
): { x: number; y: number } {
  const p = (pos || '').toUpperCase().trim();

  // Goalkeeper
  if (p === 'GK') return { x: 50, y: 90 };

  // Fullbacks / Wingbacks
  if (p === 'LB' || p === 'LWB') return { x: 15, y: 74 };
  if (p === 'RB' || p === 'RWB') return { x: 85, y: 74 };

  // Center Backs (CB)
  if (p === 'CB') {
    if (posCount === 1) return { x: 50, y: 78 };
    if (posCount === 2) {
      return posIndex === 0 ? { x: 37, y: 78 } : { x: 63, y: 78 };
    }
    if (posCount >= 3) {
      if (posIndex === 0) return { x: 30, y: 78 };
      if (posIndex === 1) return { x: 50, y: 78 };
      return { x: 70, y: 78 };
    }
  }

  // Defensive Midfielder (DMF)
  if (p === 'DMF') {
    if (posCount === 1) return { x: 50, y: 60 };
    return posIndex === 0 ? { x: 40, y: 60 } : { x: 60, y: 60 };
  }

  // Wide Midfielders (LMF, RMF)
  if (p === 'LMF') return { x: 16, y: 46 };
  if (p === 'RMF') return { x: 84, y: 46 };

  // Central Midfielder (CMF)
  if (p === 'CMF') {
    if (posCount === 1) return { x: 50, y: 48 };
    if (posCount === 2) {
      return posIndex === 0 ? { x: 34, y: 48 } : { x: 66, y: 48 };
    }
    if (posIndex === 0) return { x: 28, y: 48 };
    if (posIndex === 1) return { x: 50, y: 48 };
    return { x: 72, y: 48 };
  }

  // Attacking Midfielder (AMF)
  if (p === 'AMF') {
    if (posCount === 1) return { x: 50, y: 36 };
    return posIndex === 0 ? { x: 38, y: 36 } : { x: 62, y: 36 };
  }

  // Wingers (LWF, RWF)
  if (p === 'LWF') return { x: 16, y: 20 };
  if (p === 'RWF') return { x: 84, y: 20 };

  // Second Striker (SS)
  if (p === 'SS') {
    if (posCount === 1) return { x: 50, y: 25 };
    return posIndex === 0 ? { x: 38, y: 25 } : { x: 62, y: 25 };
  }

  // Center Forward (CF)
  if (p === 'CF') {
    if (posCount === 1) return { x: 50, y: 14 };
    if (posCount === 2) {
      return posIndex === 0 ? { x: 38, y: 14 } : { x: 62, y: 14 };
    }
    if (posIndex === 0) return { x: 30, y: 14 };
    if (posIndex === 1) return { x: 50, y: 14 };
    return { x: 70, y: 14 };
  }

  // Generic fallback based on position index
  return {
    x: 20 + ((posIndex * 25) % 65),
    y: 35 + ((posIndex * 15) % 45)
  };
}

export const TacticalPitchBoard: React.FC<TacticalPitchBoardProps> = ({
  formationName = '4-2-1-3',
  playstyle,
  coachName,
  players = [],
  tacticalRating = 85
}) => {
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);

  // Calculate coordinates for each player, prioritizing AI Vision detection, with fallback
  const positionedPlayers = useMemo(() => {
    // Count occurrences of each position to distribute multiple CBs, CMFs, CFs
    const positionCounts: Record<string, number> = {};
    const positionIndices: Record<string, number> = {};

    players.forEach((p) => {
      const pos = (p.position || 'CF').toUpperCase().trim();
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
    });

    return players.map((player, idx) => {
      const pos = (player.position || 'CF').toUpperCase().trim();
      const currentPosIdx = positionIndices[pos] || 0;
      positionIndices[pos] = currentPosIdx + 1;
      const countForPos = positionCounts[pos] || 1;

      const rawX = player.pitchX ?? player.x;
      const rawY = player.pitchY ?? player.y;

      const hasAiCoordinates =
        typeof rawX === 'number' &&
        typeof rawY === 'number' &&
        rawX > 0 &&
        rawY > 0 &&
        rawX <= 100 &&
        rawY <= 100;

      let x: number;
      let y: number;

      if (hasAiCoordinates) {
        // Clamp with safe margin from pitch borders
        x = Math.max(10, Math.min(90, rawX));
        y = Math.max(9, Math.min(91, rawY));
      } else {
        const fallback = getFallbackCoordinates(pos, currentPosIdx, countForPos);
        x = fallback.x;
        y = fallback.y;
      }

      const roleCategory = getRoleCategory(pos);
      const roleStyle = getRoleColor(roleCategory);

      return {
        ...player,
        pos,
        calculatedX: x,
        calculatedY: y,
        roleCategory,
        roleStyle,
        originalIndex: idx
      };
    });
  }, [players]);

  const selectedPlayer =
    selectedPlayerIndex !== null && positionedPlayers[selectedPlayerIndex]
      ? positionedPlayers[selectedPlayerIndex]
      : null;

  return (
    <div className="w-full flex flex-col gap-3 text-right select-none" dir="rtl">
      {/* Header bar above pitch */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Crosshair size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              رسم الخطة والتمركز على الملعب
            </h3>
            <p className="text-[10px] text-gray-400">
              توزيع اللاعبين والخطوط التكتيكية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-black text-xs">
            {formationName}
          </span>
          <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-mono text-[10px]">
            {positionedPlayers.length} لاعب
          </span>
        </div>
      </div>

      {/* The Football Pitch Graphic */}
      <div className="relative w-full h-[420px] rounded-3xl bg-gradient-to-b from-[#072c18] via-[#052112] to-[#03150b] border-2 border-emerald-500/30 overflow-hidden shadow-2xl shadow-emerald-950/30 flex items-center justify-center">
        {/* Stadium turf stripes (horizontal pitch grass cutting lines) */}
        <div className="absolute inset-0 flex flex-col pointer-events-none opacity-40">
          <div className="flex-1 bg-emerald-400/5" />
          <div className="flex-1 bg-transparent" />
          <div className="flex-1 bg-emerald-400/5" />
          <div className="flex-1 bg-transparent" />
          <div className="flex-1 bg-emerald-400/5" />
          <div className="flex-1 bg-transparent" />
          <div className="flex-1 bg-emerald-400/5" />
          <div className="flex-1 bg-transparent" />
        </div>

        {/* Fine grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

        {/* Pitch boundary line */}
        <div className="absolute inset-3 border-2 border-white/20 rounded-2xl pointer-events-none" />

        {/* Halfway line */}
        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-[2px] bg-white/20 pointer-events-none" />

        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/20 pointer-events-none" />
        {/* Center spot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full pointer-events-none" />

        {/* TOP PENALTY AREA (Opponent / Attacking End) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-44 h-16 border-b-2 border-x-2 border-white/20 rounded-b-xl pointer-events-none" />
        {/* Top 6-yard goal area */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 border-b-2 border-x-2 border-white/20 rounded-b-md pointer-events-none" />
        {/* Top Penalty Spot */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/30 rounded-full pointer-events-none" />

        {/* BOTTOM PENALTY AREA (Defending End / GK) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-44 h-16 border-t-2 border-x-2 border-white/20 rounded-t-xl pointer-events-none" />
        {/* Bottom 6-yard goal area */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-7 border-t-2 border-x-2 border-white/20 rounded-t-md pointer-events-none" />
        {/* Bottom Penalty Spot */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/30 rounded-full pointer-events-none" />

        {/* Corner Arcs */}
        <div className="absolute top-3 left-3 w-4 h-4 border-b-2 border-r-2 border-white/20 rounded-br-full pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-b-2 border-l-2 border-white/20 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-t-2 border-r-2 border-white/20 rounded-tr-full pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl-full pointer-events-none" />

        {/* Subtle Pitch Orientation watermark */}
        <div className="absolute top-5 right-5 text-[9px] font-mono text-emerald-400/40 uppercase tracking-widest pointer-events-none">
          ATTACK ▲
        </div>
        <div className="absolute bottom-5 right-5 text-[9px] font-mono text-emerald-400/40 uppercase tracking-widest pointer-events-none">
          DEFENSE ▼
        </div>

        {/* SVG Tactical Connections between players */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          {/* Faint formation structure connection lines */}
          {positionedPlayers.map((p1, i) =>
            positionedPlayers.slice(i + 1).map((p2, j) => {
              // Connect players within adjacent rows or same line
              const distY = Math.abs(p1.calculatedY - p2.calculatedY);
              const distX = Math.abs(p1.calculatedX - p2.calculatedX);
              const isCloseLine = distY < 18 && distX < 35;
              const isSameUnit = p1.roleCategory === p2.roleCategory && distY < 12;

              if (isCloseLine || isSameUnit) {
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={`${p1.calculatedX}%`}
                    y1={`${p1.calculatedY}%`}
                    x2={`${p2.calculatedX}%`}
                    y2={`${p2.calculatedY}%`}
                    stroke="url(#lineGrad)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                );
              }
              return null;
            })
          )}
        </svg>

        {/* RENDER PLAYERS ON PITCH */}
        {positionedPlayers.map((player, idx) => {
          const isSelected = selectedPlayerIndex === idx;

          return (
            <motion.button
              key={idx}
              onClick={() => setSelectedPlayerIndex(isSelected ? null : idx)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              style={{
                left: `${player.calculatedX}%`,
                top: `${player.calculatedY}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className={`absolute flex flex-col items-center justify-center cursor-pointer z-10 transition-transform ${
                isSelected ? 'z-30' : ''
              }`}
            >
              {/* Circular Badge with Position & Rating */}
              <div
                className={`relative px-2 py-0.5 rounded-full font-mono text-[10px] font-black border flex items-center gap-1 shadow-lg transition-all ${
                  player.roleStyle.badgeBg
                } ${player.roleStyle.glow} ${
                  isSelected
                    ? 'ring-2 ring-white scale-125 brightness-110 shadow-[0_0_18px_rgba(255,255,255,0.7)]'
                    : ''
                }`}
              >
                <span>{player.pos}</span>
                {player.rating ? (
                  <span className="bg-black/35 text-white px-1 py-0.2 rounded text-[8px] font-bold">
                    {player.rating}
                  </span>
                ) : null}
              </div>

              {/* Player Name Pill */}
              {player.name && player.name !== 'unknown' && (
                <div
                  className={`mt-0.5 px-1.5 py-0.2 rounded-md font-sans text-[9px] font-bold truncate max-w-[68px] shadow-sm transition-colors ${
                    isSelected
                      ? 'bg-white text-black font-black'
                      : 'bg-black/75 text-white/95 border border-white/10'
                  }`}
                >
                  {player.name}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Player Floating Details Card */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="p-3 rounded-2xl bg-[#12121b] border border-cyan-500/40 text-right flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs border shadow-md ${selectedPlayer.roleStyle.badgeBg}`}
              >
                {selectedPlayer.pos}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">
                    {selectedPlayer.name && selectedPlayer.name !== 'unknown'
                      ? selectedPlayer.name
                      : 'لاعب أساسي'}
                  </span>
                  {selectedPlayer.rating && (
                    <span className="px-1.5 py-0.2 rounded bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-mono font-black text-[10px]">
                      {selectedPlayer.rating}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400">
                  {selectedPlayer.roleStyle.label} • خطة {formationName}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlayerIndex(null)}
              className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded-lg bg-white/5"
            >
              إغلاق
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pitch Legend */}
      <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-[#0f0f16] border border-white/5 text-[10px] text-gray-300">
        <span className="text-gray-400 text-[9px]">دليل المراكز:</span>
        <div className="flex items-center gap-3 font-medium">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>حراسة</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>دفاع</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>وسط</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>هجوم</span>
          </div>
        </div>
      </div>
    </div>
  );
};
