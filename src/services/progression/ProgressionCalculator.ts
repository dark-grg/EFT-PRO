import { PlayerCard, ProgressionAllocation } from '../../types/playerCard';
import { calculateCategoryCost, CATEGORY_MAPPINGS } from './ProgressionRules';
import { computeOverallRating } from '../efhubEngine';

export class ProgressionCalculator {
  static calculateTotalCost(allocation: ProgressionAllocation): number {
    return Object.values(allocation).reduce((total, levels) => {
      if (typeof levels === 'number' && levels > 0) {
        return total + calculateCategoryCost(levels);
      }
      return total;
    }, 0);
  }

  static getAvailablePoints(card: PlayerCard): number | null {
    if (typeof card.maxLevel !== 'number' || card.maxLevel < 1) return null;
    return Math.max(0, (card.maxLevel - 1) * 2);
  }

  static applyAllocationToStats(card: PlayerCard, allocation: ProgressionAllocation): Record<string, number> {
    const stats = { ...card.baseStats } as Record<string, number>;
    
    // Apply coach boost or basic +2 for 100 chemistry if we assume manager boost?
    // User didn't specify manager boost, let's just stick to base + progression points for stats.
    // Actually, eFootball generally adds manager boost (+1 or +2) to stats > 85.
    // Let's assume just base stats + allocated points.
    
    for (const [category, levels] of Object.entries(allocation)) {
      if (typeof levels !== 'number' || levels <= 0) continue;
      
      const statKeys = CATEGORY_MAPPINGS[category];
      if (statKeys) {
        for (const statKey of statKeys) {
          if (stats[statKey] !== undefined) {
            stats[statKey] += levels;
            if (stats[statKey] > 99) stats[statKey] = 99;
          }
        }
      }
    }
    
    return stats;
  }

  static calculateFinalOVR(card: PlayerCard, finalStats: Record<string, number>): number | null {
    if (!card.position || !card.baseStats) return null;
    
    try {
      const ovr = computeOverallRating({
        position: card.position,
        height: card.height || 175,
        weakFootAccuracy: card.weakFootAccuracy || 2,
        stats: finalStats
      });
      return ovr > 0 ? ovr : null;
    } catch (e) {
      return null;
    }
  }

  static validateAllocation(card: PlayerCard, allocation: ProgressionAllocation): { valid: boolean; cost: number; available: number | null; error?: string } {
    const available = this.getAvailablePoints(card);
    if (available === null) {
      return { valid: false, cost: 0, available: null, error: 'عدد نقاط التطوير غير متوفر' };
    }

    const cost = this.calculateTotalCost(allocation);
    if (cost > available) {
      return { valid: false, cost, available, error: 'نقاط التطوير المستخدمة تتجاوز المتاح' };
    }

    for (const levels of Object.values(allocation)) {
      if (typeof levels === 'number' && (levels < 0 || isNaN(levels) || !isFinite(levels))) {
        return { valid: false, cost, available, error: 'قيم التطوير غير صالحة' };
      }
    }

    return { valid: true, cost, available };
  }
}
