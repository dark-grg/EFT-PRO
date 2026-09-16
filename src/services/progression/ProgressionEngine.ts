import { PlayerCard, ProgressionAllocation } from '../../types/playerCard';
import { ProgressionCalculator } from './ProgressionCalculator';

export class ProgressionEngine {
  static getBaseCategories(position: string): string[] {
    if (position === 'GK') {
      return ['aerial', 'gk1', 'gk2', 'gk3'];
    }
    return ['shooting', 'passing', 'dribbling', 'dexterity', 'lowerBody', 'aerial', 'defending'];
  }

  static buildDeterministicPreset(card: PlayerCard, preset: 'Balanced' | 'Attacker' | 'Speed' | 'Finisher' | 'Dribbler' | 'Physical' | 'Defender' | 'Goalkeeper'): ProgressionAllocation {
    const available = ProgressionCalculator.getAvailablePoints(card) || 0;
    const allocation: ProgressionAllocation = {};
    const categories = this.getBaseCategories(card.position);
    
    // Default zero allocation
    categories.forEach(cat => allocation[cat as keyof ProgressionAllocation] = 0);

    if (available <= 0) return allocation;

    let remaining = available;
    
    // Deterministic priority based on preset
    let priorities: string[] = [];
    
    if (card.position === 'GK' || preset === 'Goalkeeper') {
      priorities = ['gk1', 'gk2', 'gk3', 'aerial'];
    } else {
      switch (preset) {
        case 'Attacker':
          priorities = ['shooting', 'dexterity', 'dribbling', 'lowerBody', 'passing'];
          break;
        case 'Finisher':
          priorities = ['shooting', 'dexterity', 'lowerBody', 'aerial'];
          break;
        case 'Speed':
          priorities = ['lowerBody', 'dexterity', 'dribbling'];
          break;
        case 'Dribbler':
          priorities = ['dribbling', 'dexterity', 'passing'];
          break;
        case 'Physical':
          priorities = ['aerial', 'lowerBody', 'defending'];
          break;
        case 'Defender':
          priorities = ['defending', 'aerial', 'lowerBody', 'passing'];
          break;
        case 'Balanced':
        default:
          priorities = ['dexterity', 'lowerBody', 'passing', 'dribbling', 'shooting', 'defending'];
          break;
      }
    }

    // A simple deterministic allocation algorithm
    // We try to allocate levels evenly across priorities until points are exhausted or cost per level gets too high (e.g. > 3).
    // Let's cap max level per category in auto-build at 8 (cost 2) initially.
    
    let currentLevelCap = 4;
    while (remaining > 0 && currentLevelCap <= 12) {
      let allocatedInThisPass = false;
      
      for (const cat of priorities) {
        const catKey = cat as keyof ProgressionAllocation;
        const currentLevel = (allocation[catKey] || 0) as number;
        
        if (currentLevel < currentLevelCap) {
          // Cost to next level
          let cost = 1;
          if (currentLevel >= 4 && currentLevel < 8) cost = 2;
          else if (currentLevel >= 8 && currentLevel < 12) cost = 3;
          else if (currentLevel >= 12) cost = 4;
          
          if (remaining >= cost) {
            allocation[catKey] = currentLevel + 1;
            remaining -= cost;
            allocatedInThisPass = true;
          }
        }
      }
      
      if (!allocatedInThisPass) {
        currentLevelCap += 4;
      }
    }

    return allocation;
  }
}
