import { ProgressionRecord } from './types';

export function validateProgressionRecord(record: Partial<ProgressionRecord>): string | null {
  if (!record.cardId) return 'Missing cardId';
  if (!record.playerName) return 'Missing playerName';
  if (!record.source) return 'Missing source';
  
  if (typeof record.progressionPoints !== 'number' || record.progressionPoints < 0 || isNaN(record.progressionPoints)) {
    return 'Invalid progressionPoints';
  }

  if (!record.categories) return 'Missing categories';

  const cat = record.categories;
  const vals = Object.values(cat);
  for (const v of vals) {
    if (typeof v !== 'number' || isNaN(v) || !isFinite(v) || v < 0) {
      return 'Categories contain invalid, negative, or random values';
    }
  }

  return null;
}

import { PlayerCard, ProgressionAllocation } from '../../types/playerCard';
import { ProgressionCalculator } from './ProgressionCalculator';

export class ProgressionCalculatorValidator {
  static validate(card: PlayerCard, allocation: ProgressionAllocation): { isValid: boolean; messages: string[] } {
    const messages: string[] = [];
    
    if (!card || !card.cardId) {
      messages.push('invalid cardId');
      return { isValid: false, messages };
    }

    if (!card.baseStats) {
      messages.push('missing stats');
    }

    const available = ProgressionCalculator.getAvailablePoints(card);
    if (available === null) {
      messages.push('بيانات البطاقة غير مكتملة');
    }

    const cost = ProgressionCalculator.calculateTotalCost(allocation);
    if (available !== null && cost > available) {
      messages.push('points > available points');
    }

    for (const [key, val] of Object.entries(allocation)) {
      if (typeof val === 'number') {
        if (val < 0) {
          messages.push('negative points');
        }
        if (isNaN(val) || !isFinite(val)) {
          messages.push('NaN or Infinity');
        }
      }
    }

    return {
      isValid: messages.length === 0,
      messages
    };
  }
}
