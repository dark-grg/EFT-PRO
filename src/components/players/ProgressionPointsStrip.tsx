import React, { useState } from 'react';
import { ProgressionAllocation } from '../../types/playerCard';

export interface ProgressionPointsStripProps {
  allocation: ProgressionAllocation;
  position?: string;
  variant?: 'pill' | 'compact' | 'expanded';
  className?: string;
  showOnlyAllocated?: boolean;
  onCopy?: () => void;
}

/* --- Exact Pixel-Perfect eFootball Vector Icons matching IMG_1840.jpeg --- */

// 1. Target with crosshair (Shooting)
const ShootingIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="7.5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <line x1="12" y1="1.5" x2="12" y2="4.5" />
    <line x1="12" y1="19.5" x2="12" y2="22.5" />
    <line x1="1.5" y1="12" x2="4.5" y2="12" />
    <line x1="19.5" y1="12" x2="22.5" y2="12" />
  </svg>
);

// 2. 5-spoke Steering Wheel (Passing)
const PassingWheelIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.5" />
    <line x1="12" y1="9.5" x2="12" y2="3" />
    <line x1="14.38" y1="11.23" x2="20.56" y2="9.22" />
    <line x1="13.47" y1="14.02" x2="17.29" y2="19.28" />
    <line x1="10.53" y1="14.02" x2="6.71" y2="19.28" />
    <line x1="9.62" y1="11.23" x2="3.44" y2="9.22" />
  </svg>
);

// 3. Training Cone with base & middle stripe (Dribbling)
const DribblingConeIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" y1="20" x2="20" y2="20" strokeWidth="2.6" />
    <path d="M7 20L10.5 4.5h3L17 20" />
    <line x1="8.6" y1="13" x2="15.4" y2="13" />
  </svg>
);

// 4. Stepped Zigzag Agility Arrow (Dexterity)
const DexterityArrowIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3.5 16.5h5.5l5.5-9h6" />
    <polyline points="16.5 4 20.5 7.5 16.5 11" />
  </svg>
);

// 5. Cleated Football Boot with Studs (Lower Body Strength)
const CleatShoeIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Shoe upper & sole */}
    <path d="M7 7.5c0 0 1.2 2 1.8 3.5l3.2 1c2 .6 4.5.2 6 1.4l2 1.6c.8.7.8 1.8 0 2.2l-14.5.3c-.9 0-1.5-.7-1.5-1.8V9.5c0-1.2.6-2 2-2z" />
    {/* Studs/Cleats */}
    <line x1="6.5" y1="18" x2="6.5" y2="20.5" strokeWidth="2.4" />
    <line x1="10" y1="18" x2="10" y2="20.5" strokeWidth="2.4" />
    <line x1="13.5" y1="18" x2="13.5" y2="20.5" strokeWidth="2.4" />
    <line x1="16.5" y1="18" x2="16.5" y2="20.5" strokeWidth="2.4" />
  </svg>
);

// Aerial / Jumping
const AerialIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="7 12 12 7 17 12" />
    <polyline points="7 17 12 12 17 17" />
  </svg>
);

// Defending (Shield)
const DefendingIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// GK 1 (Reaching Hand/Glove)
const GK1Icon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" />
    <path d="M14 9V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7" />
    <path d="M10 10V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M6 13V8a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8c0 4.4 3.6 8 8 8h1a8 8 0 0 0 8-8v-3" />
  </svg>
);

// GK 2 (Parrying / Shield)
const GK2Icon = DefendingIcon;

// GK 3 (Reflex / Activity)
const GK3Icon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

interface StatCategoryConfig {
  key: keyof ProgressionAllocation;
  labelAr: string;
  labelEn: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const OUTFIELD_CATEGORIES: StatCategoryConfig[] = [
  { key: 'shooting', labelAr: 'تسديد', labelEn: 'Shooting', icon: ShootingIcon },
  { key: 'passing', labelAr: 'تمرير', labelEn: 'Passing', icon: PassingWheelIcon },
  { key: 'dribbling', labelAr: 'مراوغة', labelEn: 'Dribbling', icon: DribblingConeIcon },
  { key: 'dexterity', labelAr: 'رشاقة', labelEn: 'Dexterity', icon: DexterityArrowIcon },
  { key: 'lowerBody', labelAr: 'قوة الجزء السفلي', labelEn: 'Lower Body', icon: CleatShoeIcon },
  { key: 'aerial', labelAr: 'ارتقاء', labelEn: 'Aerial', icon: AerialIcon },
  { key: 'defending', labelAr: 'دفاع', labelEn: 'Defending', icon: DefendingIcon },
];

const GK_CATEGORIES: StatCategoryConfig[] = [
  { key: 'aerial', labelAr: 'ارتقاء', labelEn: 'Aerial', icon: AerialIcon },
  { key: 'gk1', labelAr: 'حراسة 1', labelEn: 'GK 1', icon: GK1Icon },
  { key: 'gk2', labelAr: 'حراسة 2', labelEn: 'GK 2', icon: GK2Icon },
  { key: 'gk3', labelAr: 'حراسة 3', labelEn: 'GK 3', icon: GK3Icon },
];

/**
 * ProgressionPointsStrip
 * Exact eFootball official progression points strip matching IMG_1840.jpeg
 */
export const ProgressionPointsStrip: React.FC<ProgressionPointsStripProps> = ({
  allocation,
  position = '',
  variant = 'pill',
  className = '',
  showOnlyAllocated = true,
  onCopy,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const isGK = position === 'GK';
  const categoryConfigs = isGK ? GK_CATEGORIES : OUTFIELD_CATEGORIES;

  const hasAnyPoints = categoryConfigs.some(cat => (allocation[cat.key] ?? 0) > 0);
  
  const displayItems = categoryConfigs.filter(cat => {
    const val = allocation[cat.key] ?? 0;
    if (showOnlyAllocated && hasAnyPoints) {
      return val > 0;
    }
    return true;
  });

  if (displayItems.length === 0) {
    return null;
  }

  const isCompact = variant === 'compact';
  const isExpanded = variant === 'expanded';

  const iconSize = isCompact ? 14 : isExpanded ? 22 : 19;
  const badgeSizeClass = isCompact 
    ? 'w-6 h-6 min-w-[24px] text-[11px] rounded-lg' 
    : isExpanded 
      ? 'w-11 h-11 min-w-[44px] text-lg rounded-[16px]' 
      : 'w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[40px] text-base sm:text-lg rounded-[13px]';

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      dir="ltr"
      onClick={onCopy}
      title={onCopy ? 'انقر لنسخ نقاط التطوير' : undefined}
    >
      {/* Outer Pill Container precisely matching IMG_1840.jpeg */}
      <div className={`
        inline-flex items-center justify-center
        bg-[#0a0f1d] border border-[#232f48]/70
        shadow-[0_8px_30px_rgba(0,0,0,0.7)]
        transition-all duration-200
        ${onCopy ? 'cursor-pointer hover:border-blue-500/50 hover:bg-[#0d1426] active:scale-[0.98]' : ''}
        ${isCompact 
          ? 'px-2.5 py-1.5 rounded-xl gap-2' 
          : 'px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-full gap-3 sm:gap-4 md:gap-5'
        }
      `}>
        {displayItems.map((cat) => {
          const val = allocation[cat.key] ?? 0;
          const Icon = cat.icon;
          const isHovered = activeTooltip === String(cat.key);

          return (
            <div
              key={cat.key}
              className="relative flex items-center gap-1.5 sm:gap-2.5 group/item"
              onMouseEnter={() => setActiveTooltip(String(cat.key))}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {/* Category Icon */}
              <div 
                className="text-white group-hover/item:text-blue-300 transition-colors flex items-center justify-center shrink-0"
                title={`${cat.labelAr} (${cat.labelEn}): ${val}`}
              >
                <Icon size={iconSize} className="text-white" />
              </div>

              {/* Rounded Dark Square Badge with Bold White Number */}
              <div className={`
                ${badgeSizeClass}
                bg-[#161f33] border border-[#293754]/60
                text-white font-black font-sans tracking-tight
                flex items-center justify-center
                shadow-inner group-hover/item:bg-[#1d2943]
                transition-colors shrink-0
              `}>
                {val}
              </div>

              {/* Floating Tooltip with Arabic Name on Hover */}
              {isHovered && !isCompact && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-slate-900/95 border border-white/20 text-[11px] text-white whitespace-nowrap shadow-xl z-20 pointer-events-none text-center">
                  <span className="font-bold text-amber-300">{cat.labelAr}</span>
                  <span className="text-gray-400 text-[10px] ml-1">({cat.labelEn})</span>
                  <span className="block font-sans text-blue-400 font-black">+{val}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
