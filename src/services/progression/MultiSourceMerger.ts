import { ProgressionRecord } from './types';
import { CardMatchingEngine, MatchConfidence } from './CardMatchingEngine';
import { PlayerCard } from '../../types/playerCard';

export type ProgressionStatus = 'VERIFIED' | 'SOURCE_ONLY' | 'CONFLICT' | 'UNAVAILABLE';

export interface CanonicalProgression extends ProgressionRecord {
  playerId: string;
  maxOverall: number;
  overall: number;
  sourcePrimary: string;
  sourceSecondary?: string;
  sourceUrls: string[];
  confidence: MatchConfidence;
  conflict: boolean;
  conflictDetails?: any[];
  progressionStatus: ProgressionStatus;
}

export class MultiSourceMerger {
  /**
   * Merges multiple sources for a specific card to resolve conflicts.
   */
  static mergeSources(localCard: PlayerCard, sources: Partial<ProgressionRecord>[]): CanonicalProgression {
    const validSources = sources.filter(s => CardMatchingEngine.evaluateMatch(localCard, s).confidence !== 'UNMATCHED');
    
    if (validSources.length === 0) {
      return this.createEmptyRecord(localCard);
    }

    // Sort by source priority (e.g., eFootball LABO, eFHUB)
    const primary = validSources[0]; // Assuming first is highest priority for now
    
    // Check for conflicts across sources if multiple exist
    let hasConflict = false;
    const conflictDetails: any[] = [];
    
    if (validSources.length > 1) {
      const pCats = primary.categories;
      for (let i = 1; i < validSources.length; i++) {
        const sCats = validSources[i].categories;
        if (!pCats || !sCats) continue;
        
        // Simple comparison of keys
        for (const k of Object.keys(pCats) as Array<keyof typeof pCats>) {
          if (pCats[k] !== sCats[k]) {
            hasConflict = true;
            conflictDetails.push({
              sourceA: primary.source,
              sourceB: validSources[i].source,
              category: k,
              valA: pCats[k],
              valB: sCats[k]
            });
          }
        }
      }
    }

    const { confidence } = CardMatchingEngine.evaluateMatch(localCard, primary);

    return {
      cardId: localCard.cardId,
      playerId: localCard.playerId || '',
      playerName: localCard.playerName,
      cardType: localCard.cardType || 'Standard',
      position: localCard.position || 'Unknown',
      clubName: localCard.clubName || 'Unknown',
      overall: localCard.overall || 0,
      maxOverall: localCard.maxOverall || 0,
      
      progressionPoints: primary.progressionPoints || 0,
      categories: primary.categories!,
      
      source: primary.source || 'Unknown',
      sourcePrimary: primary.source || 'Unknown',
      sourceSecondary: validSources.length > 1 ? validSources[1].source : undefined,
      sourceUrls: validSources.map(s => s.sourceUrl || '').filter(Boolean),
      
      confidence,
      conflict: hasConflict,
      conflictDetails: hasConflict ? conflictDetails : undefined,
      progressionStatus: hasConflict ? 'CONFLICT' : (validSources.length > 1 && confidence === 'EXACT' ? 'VERIFIED' : 'SOURCE_ONLY'),
      importedAt: new Date().toISOString(),
      sourceVersion: primary.sourceVersion,
      dataHash: `hash-${localCard.cardId}-${Date.now()}` // Mock hash
    };
  }

  static createEmptyRecord(localCard: PlayerCard): CanonicalProgression {
    return {
      cardId: localCard.cardId,
      playerId: localCard.playerId || '',
      playerName: localCard.playerName,
      cardType: localCard.cardType || 'Standard',
      position: localCard.position || 'Unknown',
      clubName: localCard.clubName || 'Unknown',
      overall: localCard.overall || 0,
      maxOverall: localCard.maxOverall || 0,
      
      progressionPoints: 0,
      categories: {
        shooting: 0, passing: 0, dribbling: 0, dexterity: 0,
        lowerBody: 0, aerial: 0, defending: 0,
        gk1: 0, gk2: 0, gk3: 0
      },
      
      source: 'None',
      sourcePrimary: 'None',
      sourceUrls: [],
      confidence: 'UNMATCHED',
      conflict: false,
      progressionStatus: 'UNAVAILABLE',
      importedAt: new Date().toISOString(),
    };
  }
}
