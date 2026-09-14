import React from 'react';
import { PlayerBuild } from '../../types/player';
import { Zap, Sparkles, Shield, Trophy } from 'lucide-react';
import suarezCardImage from '../../assets/images/luis_suarez_player_1789165035516.jpg';
import casillasCardImage from '../../assets/images/iker_casillas_card_1789301168614.jpg';

interface EFootballCardProps {
  player: PlayerBuild;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showBoosterBadge?: boolean;
}

export const EFootballCard: React.FC<EFootballCardProps> = ({
  player,
  size = 'md',
  onClick,
  showBoosterBadge = true
}) => {
  // Check if we have a direct asset card image
  const getDedicatedCardImage = () => {
    if (player.id.includes('suarez')) return suarezCardImage;
    if (player.id.includes('casillas')) return casillasCardImage;
    return player.image;
  };

  // Card Theme Configurations matching Konami eFootball Mobile
  const getThemeConfig = () => {
    switch (player.cardType) {
      case 'Big Time':
        return {
          frameBorder: 'border-[#a855f7]/60 shadow-[0_0_20px_rgba(168,85,247,0.35)]',
          frameBg: 'from-[#1a082e] via-[#0d0722] to-[#12051f]',
          accentGradient: 'from-fuchsia-500 via-purple-400 to-amber-300',
          badgeBg: 'bg-gradient-to-r from-purple-700 to-pink-600 text-white',
          rarityLabel: 'BIG TIME',
          rarityColor: 'text-fuchsia-300',
          shineEffect: 'from-purple-500/15 via-pink-400/20 to-transparent'
        };
      case 'Show Time':
        return {
          frameBorder: 'border-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.35)]',
          frameBg: 'from-[#031d2e] via-[#02101e] to-[#041628]',
          accentGradient: 'from-cyan-400 via-sky-300 to-blue-500',
          badgeBg: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white',
          rarityLabel: 'SHOW TIME',
          rarityColor: 'text-cyan-300',
          shineEffect: 'from-cyan-400/20 via-sky-300/20 to-transparent'
        };
      case 'Epic Booster':
      default:
        return {
          frameBorder: 'border-yellow-400/70 shadow-[0_0_22px_rgba(234,179,8,0.4)]',
          frameBg: 'from-[#241a05] via-[#120d03] to-[#1f1604]',
          accentGradient: 'from-yellow-300 via-amber-400 to-yellow-500',
          badgeBg: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black',
          rarityLabel: 'EPIC BOOSTER',
          rarityColor: 'text-yellow-300',
          shineEffect: 'from-yellow-400/25 via-amber-300/20 to-transparent'
        };
    }
  };

  // Position Badge colors matching eFootball mobile UI
  const getPositionBadgeClass = () => {
    switch (player.category) {
      case 'FW':
        return 'bg-gradient-to-b from-rose-500 to-red-700 text-white border-red-300/40';
      case 'MF':
        return 'bg-gradient-to-b from-emerald-500 to-green-700 text-white border-emerald-300/40';
      case 'DF':
        return 'bg-gradient-to-b from-blue-500 to-indigo-700 text-white border-blue-300/40';
      case 'GK':
        return 'bg-gradient-to-b from-amber-400 to-yellow-600 text-black border-yellow-200/40';
      default:
        return 'bg-gray-700 text-white border-gray-500';
    }
  };

  const theme = getThemeConfig();
  const cardImage = getDedicatedCardImage();

  // Size scalings
  const dimensions = {
    sm: 'w-32 h-[190px]',
    md: 'w-44 h-[260px]',
    lg: 'w-56 h-[330px]'
  }[size];

  return (
    <div 
      onClick={onClick}
      className={`relative ${dimensions} select-none cursor-pointer group transition-all duration-300 hover:scale-105 active:scale-95`}
    >
      {/* Outer Glow & Card Shell */}
      <div className={`w-full h-full rounded-2xl p-[2px] bg-gradient-to-b ${theme.accentGradient} shadow-xl relative overflow-hidden`}>
        
        {/* Card Inner Body */}
        <div className={`w-full h-full rounded-[14px] bg-gradient-to-b ${theme.frameBg} relative flex flex-col justify-between overflow-hidden border ${theme.frameBorder}`}>
          
          {/* Foil Shine Shimmer Line */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:translate-x-full duration-1000" />
          
          {/* Diagonal Card Pattern watermark */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

          {/* Top Section: Rating, Position, eFootball Crest */}
          <div className="relative z-10 p-2 flex items-start justify-between">
            {/* Left Box: Rating + Position */}
            <div className="flex flex-col items-center leading-none">
              <div className="flex items-center gap-0.5">
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {player.maxRating}
                </span>
                {player.maxRating >= 102 && (
                  <Sparkles size={11} className="text-yellow-300 animate-pulse" />
                )}
              </div>
              <span className={`mt-0.5 text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded shadow-md border ${getPositionBadgeClass()}`}>
                {player.position}
              </span>
            </div>

            {/* Right Box: Booster Icon & Konami Crest */}
            <div className="flex flex-col items-end gap-1">
              {showBoosterBadge && player.booster && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-[9px] shadow-[0_0_8px_rgba(234,179,8,0.6)] animate-pulse">
                  <Zap size={10} className="fill-black" />
                  <span>BOOST</span>
                </div>
              )}
              <span className="text-[8px] font-black text-white/50 tracking-widest uppercase font-mono">
                eFootball
              </span>
            </div>
          </div>

          {/* Center Player Cutout / Art */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <img 
              src={cardImage} 
              alt={player.name}
              className="w-full h-full object-cover object-center filter contrast-105 brightness-100 group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            {/* Vignette Shadow to make text pop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          </div>

          {/* Bottom Section: Name, Club, Playstyle & eFootball Category Banner */}
          <div className="relative z-10 p-2 flex flex-col items-center text-center gap-0.5">
            {/* Player Full Name */}
            <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-[95%] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-sans">
              {player.arabicName || player.name}
            </h4>

            {/* Club & Playstyle */}
            <div className="flex items-center gap-1 text-[9px] text-gray-300 truncate font-medium">
              <span>{player.club}</span>
              <span>•</span>
              <span className="text-yellow-300/90 truncate">{player.playstyle.split('(')[0]}</span>
            </div>

            {/* Bottom Card Category Plate */}
            <div className={`mt-1 w-full py-0.5 px-2 rounded font-black text-[9px] tracking-wider uppercase flex items-center justify-center gap-1 shadow-md border border-white/20 ${theme.badgeBg}`}>
              {player.cardType === 'Epic Booster' && <Zap size={10} className="fill-current" />}
              {player.cardType === 'Big Time' && <Trophy size={10} />}
              {player.cardType === 'Show Time' && <Sparkles size={10} />}
              <span>{theme.rarityLabel}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
