import { PlayerBaseStats, ProgressionAllocation, StatDiffItem, PlayerCard } from '../types/playerCard';
import { computeOverallRating, applyProgression } from './efhubEngine';

export { computeOverallRating, computeOverallRatingDecimal, applyProgression } from './efhubEngine';

export const STAT_DEFINITIONS: Record<string, { name: string; arabicName: string; category: string }> = {
  offensiveAwareness: { name: 'Offensive Awareness', arabicName: 'الوعي الهجومي', category: 'Attacking' },
  ballControl: { name: 'Ball Control', arabicName: 'التحكم بالكرة', category: 'Dribbling' },
  dribbling: { name: 'Dribbling', arabicName: 'المراوغة', category: 'Dribbling' },
  tightPossession: { name: 'Tight Possession', arabicName: 'الاستحواذ في المساحات الضيقة', category: 'Dribbling' },
  lowPass: { name: 'Low Pass', arabicName: 'التمرير الأرضي', category: 'Passing' },
  loftedPass: { name: 'Lofted Pass', arabicName: 'التمرير العالي', category: 'Passing' },
  finishing: { name: 'Finishing', arabicName: 'إنهاء الهجمات', category: 'Attacking' },
  heading: { name: 'Heading', arabicName: 'الرأسيات', category: 'Physical' },
  placeKicking: { name: 'Place Kicking', arabicName: 'الكرات الثابتة', category: 'Passing' },
  curl: { name: 'Curl', arabicName: 'التقويس (الانحناء)', category: 'Passing' },
  speed: { name: 'Speed', arabicName: 'السرعة القصوى', category: 'Speed' },
  acceleration: { name: 'Acceleration', arabicName: 'التسارع والانطلاق', category: 'Speed' },
  kickingPower: { name: 'Kicking Power', arabicName: 'قوة التسديد', category: 'Physical' },
  jump: { name: 'Jump', arabicName: 'الارتقاء والقفز', category: 'Physical' },
  physicalContact: { name: 'Physical Contact', arabicName: 'الالتحام الجسدي', category: 'Physical' },
  balance: { name: 'Balance', arabicName: 'التوازن', category: 'Physical' },
  stamina: { name: 'Stamina', arabicName: 'قوة التحمل واللياقة', category: 'Physical' },
  defensiveAwareness: { name: 'Defensive Awareness', arabicName: 'الوعي الدفاعي', category: 'Defending' },
  tackling: { name: 'Tackling', arabicName: 'قطع الكرة', category: 'Defending' },
  aggression: { name: 'Aggression', arabicName: 'الشراسة والقتالية', category: 'Defending' },
  defensiveEngagement: { name: 'Defensive Engagement', arabicName: 'المشاركة الدفاعية', category: 'Defending' },
  gkAwareness: { name: 'GK Awareness', arabicName: 'وعي الحارس', category: 'Goalkeeping' },
  gkCatching: { name: 'GK Catching', arabicName: 'إمساك الكرة', category: 'Goalkeeping' },
  gkParrying: { name: 'GK Parrying', arabicName: 'صد الكرات', category: 'Goalkeeping' },
  gkReflexes: { name: 'GK Reflexes', arabicName: 'ردة فعل الحارس', category: 'Goalkeeping' },
  gkReach: { name: 'GK Reach', arabicName: 'مدى الوصول للكرة', category: 'Goalkeeping' }
};

/**
 * Maps which progression category affects which player stats in eFootball 2025/2026.
 * Each 1 point invested adds the defined delta to the associated stats.
 */
export const PROGRESSION_STAT_IMPACTS: Record<keyof ProgressionAllocation, Record<string, number>> = {
  shooting: {
    finishing: 1,
    placeKicking: 1,
    curl: 1
  },
  passing: {
    lowPass: 1,
    loftedPass: 1
  },
  dribbling: {
    ballControl: 1,
    dribbling: 1,
    tightPossession: 1
  },
  dexterity: {
    offensiveAwareness: 1,
    acceleration: 1,
    balance: 1
  },
  lowerBody: {
    speed: 1,
    kickingPower: 1,
    stamina: 1
  },
  aerial: {
    heading: 1,
    jump: 1,
    physicalContact: 1
  },
  defending: {
    defensiveAwareness: 1,
    tackling: 1,
    aggression: 1,
    defensiveEngagement: 1
  },
  gk1: {
    gkAwareness: 1,
    gkCatching: 1,
    jump: 1
  },
  gk2: {
    gkParrying: 1,
    gkReach: 1
  },
  gk3: {
    gkReflexes: 1,
    gkAwareness: 1
  }
};

/**
 * Computes available training points based on card max level in eFootball Mobile
 * Formula: (maxLevel - 1) * 2 points (standard eFootball progression rule)
 */
export function calculateAvailablePoints(card: PlayerCard): number {
  const levels = Math.max(1, (card.maxLevel || 28) - (card.level || 1));
  return levels * 2;
}

/**
 * Calculates used progression points
 */
export function calculateUsedPoints(points: ProgressionAllocation): number {
  return Object.values(points).reduce((acc: number, val) => acc + (val || 0), 0);
}

/**
 * Real Calculation Engine for Before/After Stats
 * Mathematically derived from the card's exact baseStats + points + booster!
 */
export function calculateProgressionStats(
  card: PlayerCard,
  points: ProgressionAllocation,
  applyBooster: boolean = true
): {
  statsBefore: Record<string, number>;
  statsAfter: Record<string, number>;
  statChanges: Record<string, StatDiffItem>;
  finalOverall: number;
} {
  const statsBefore: Record<string, number> = {};
  const statsAfter: Record<string, number> = {};
  const statChanges: Record<string, StatDiffItem> = {};

  // 1. Initialize statsBefore from card.baseStats
  Object.keys(STAT_DEFINITIONS).forEach((statKey) => {
    const rawVal = card.baseStats[statKey];
    if (typeof rawVal === 'number') {
      statsBefore[statKey] = rawVal;
      statsAfter[statKey] = rawVal;
    }
  });

  // 2. Apply Progression Points impacts
  (Object.keys(points) as (keyof ProgressionAllocation)[]).forEach((category) => {
    const allocated = points[category] || 0;
    if (allocated <= 0) return;

    const impacts = PROGRESSION_STAT_IMPACTS[category];
    if (impacts) {
      Object.entries(impacts).forEach(([statKey, multiplier]) => {
        if (statsAfter[statKey] !== undefined) {
          statsAfter[statKey] += Math.round(allocated * multiplier);
        }
      });
    }
  });

  // 3. Apply Booster if card has an active booster
  if (applyBooster && card.boosters && card.boosters.value > 0) {
    const boosterValue = card.boosters.value;
    card.boosters.affectedStats.forEach((statKey) => {
      if (statsAfter[statKey] !== undefined) {
        statsAfter[statKey] += boosterValue;
      }
    });
  }

  // 4. Cap stats at bounds (40 min, 120 max to allow booster overflow naturally)
  Object.keys(statsAfter).forEach((key) => {
    statsAfter[key] = Math.min(120, Math.max(statsBefore[key] || 40, statsAfter[key]));
  });

  // 5. Generate precise Before / After / Diff map
  Object.keys(statsBefore).forEach((statKey) => {
    const def = STAT_DEFINITIONS[statKey] || { name: statKey, arabicName: statKey, category: 'General' };
    const before = statsBefore[statKey];
    const after = statsAfter[statKey];
    statChanges[statKey] = {
      key: statKey,
      name: def.name,
      arabicName: def.arabicName,
      before,
      after,
      diff: after - before
    };
  });

  // 6. Calculate Final Overall Rating
  // If the card has authentic maxOverall from eFHUB, honor it precisely.
  // Otherwise, compute it using the authentic eFHUB mathematical rating algorithm.
  let calculatedOvr = card.maxOverall;
  if (!calculatedOvr || calculatedOvr <= 0) {
    calculatedOvr = computeOverallRating({
      position: card.position,
      height: card.height || 175,
      weakFootAccuracy: card.weakFootAccuracy || 2,
      stats: statsAfter
    });
  }

  return {
    statsBefore,
    statsAfter,
    statChanges,
    finalOverall: calculatedOvr
  };
}
