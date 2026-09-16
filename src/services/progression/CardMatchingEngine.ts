import { PlayerCard } from '../../types/playerCard';
import { ProgressionRecord } from './types';

export type MatchConfidence = 'EXACT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNMATCHED';

export interface MatchResult {
  confidence: MatchConfidence;
  matchedCardId: string | null;
  reasons: string[];
}

export class CardMatchingEngine {
  /**
   * Evaluates how closely a source progression record matches a local player card.
   */
  static evaluateMatch(localCard: PlayerCard, sourceRecord: Partial<ProgressionRecord>): MatchResult {
    const reasons: string[] = [];
    let score = 0;
    const maxScore = 100;

    // 1. Exact ID Match (Primary Identifier)
    if (sourceRecord.cardId && sourceRecord.cardId === localCard.cardId) {
      score += 60;
      reasons.push('Exact Card ID match');
    } else if (sourceRecord.sourceCardId && sourceRecord.sourceCardId === localCard.cardId) {
      score += 60;
      reasons.push('Exact Source Card ID match');
    }

    // 2. Name Match
    const localName = (localCard.playerName || '').toLowerCase().trim();
    const sourceName = (sourceRecord.playerName || '').toLowerCase().trim();
    if (localName === sourceName) {
      score += 20;
      reasons.push('Exact Name match');
    } else if (localName && sourceName && (localName.includes(sourceName) || sourceName.includes(localName))) {
      score += 10;
      reasons.push('Partial Name match');
    }

    // 3. Position Match
    if (localCard.position === sourceRecord.position) {
      score += 10;
      reasons.push('Exact Position match');
    }

    // 4. Card Type Match
    if (localCard.cardType === sourceRecord.cardType) {
      score += 10;
      reasons.push('Exact Card Type match');
    }

    // Determine Confidence
    let confidence: MatchConfidence = 'UNMATCHED';
    if (score >= 90) confidence = 'EXACT';
    else if (score >= 70) confidence = 'HIGH';
    else if (score >= 40) confidence = 'MEDIUM';
    else if (score >= 20) confidence = 'LOW';

    return {
      confidence,
      matchedCardId: confidence !== 'UNMATCHED' ? localCard.cardId : null,
      reasons
    };
  }
}
