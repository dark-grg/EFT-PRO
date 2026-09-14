import { PlayerCard } from '../types/playerCard';

export interface DetectedPlayerItem {
  name: string;
  position: string;
  rating?: number | null;
  isClear?: boolean;
  confidence?: number;
  pitchX?: number;
  pitchY?: number;
}

export type MatchStatus = 'matched' | 'uncertain' | 'unrecognized';

export interface MatchedPlayerResult {
  detectedName: string;
  detectedPosition: string;
  detectedOverall: number | null;
  matchStatus: MatchStatus;
  matchStatusText: string;
  matchNote?: string;
  matchedCard: PlayerCard | null;
}

/**
 * Normalizes text for reliable matching (removes accents, periods, extra spaces)
 */
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics / accents
    .replace(/[.\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts key search tokens (e.g. "C. Ronaldo" -> ["ronaldo"], "L. Messi" -> ["messi"])
 */
function getPlayerTokens(rawName: string): string[] {
  const normalized = normalizeText(rawName);
  const parts = normalized.split(' ').filter(p => p.length > 1);
  return parts;
}

/**
 * Matches an AI-detected player against the verified `playerCards` database
 */
export function matchDetectedPlayer(
  detected: DetectedPlayerItem,
  allCards: PlayerCard[]
): MatchedPlayerResult {
  const rawName = (detected.name || '').trim();
  const position = (detected.position || '').toUpperCase().trim();
  const overall = typeof detected.rating === 'number' && detected.rating > 50 ? detected.rating : null;

  // If player name is missing, unclear, or marked as 'unknown'
  if (!rawName || rawName.toLowerCase() === 'unknown' || rawName.length < 2 || detected.isClear === false) {
    return {
      detectedName: rawName || 'غير معروف',
      detectedPosition: position || 'N/A',
      detectedOverall: overall,
      matchStatus: 'unrecognized',
      matchStatusText: 'لم يتم التعرف عليه',
      matchNote: 'صورة اللاعب أو الاسم غير مقروءين بوضوح في لقطة الشاشة.',
      matchedCard: null
    };
  }

  const normalizedQuery = normalizeText(rawName);
  const queryTokens = getPlayerTokens(rawName);

  // 1. Filter candidates by name match (English and Arabic)
  const candidateCards = allCards.filter(card => {
    const cardEn = normalizeText(card.playerName || '');
    const cardAr = normalizeText(card.arabicName || '');
    const cardTitle = normalizeText(card.cardName || '');

    // Direct substring or exact match
    if (cardEn === normalizedQuery || cardAr === normalizedQuery) return true;
    if (cardEn.includes(normalizedQuery) || normalizedQuery.includes(cardEn)) return true;

    // Check if key tokens (like "ronaldo", "messi", "neymar", "haaland", "mbappe") match
    return queryTokens.some(token => {
      if (token.length < 3) return false;
      return cardEn.includes(token) || cardAr.includes(token) || cardTitle.includes(token);
    });
  });

  // 2. If no card found in database
  if (candidateCards.length === 0) {
    return {
      detectedName: rawName,
      detectedPosition: position,
      detectedOverall: overall,
      matchStatus: 'unrecognized',
      matchStatusText: 'لم يتم التعرف عليه',
      matchNote: 'اللاعب غير مسجل في قاعدة البطاقات الحالية.',
      matchedCard: null
    };
  }

  // 3. If exactly 1 card found for this player
  if (candidateCards.length === 1) {
    return {
      detectedName: candidateCards[0].playerName,
      detectedPosition: position || candidateCards[0].position,
      detectedOverall: overall || candidateCards[0].maxOverall || candidateCards[0].overall,
      matchStatus: 'matched',
      matchStatusText: 'تم التعرف عليه',
      matchedCard: candidateCards[0]
    };
  }

  // 4. Multiple cards found for this player: can we uniquely match position & overall?
  if (overall) {
    const exactMatches = candidateCards.filter(c => {
      const posMatch = !position || c.position === position;
      const ratingMatch = c.maxOverall === overall || c.overall === overall;
      return posMatch && ratingMatch;
    });

    if (exactMatches.length === 1) {
      return {
        detectedName: exactMatches[0].playerName,
        detectedPosition: position || exactMatches[0].position,
        detectedOverall: overall,
        matchStatus: 'matched',
        matchStatusText: 'تم التعرف عليه',
        matchedCard: exactMatches[0]
      };
    }
  }

  // 5. Multiple cards exist and cannot be uniquely determined from screenshot without guessing
  // As per strict rule: "إذا كان هناك أكثر من بطاقة لنفس اللاعب ولا يمكن تحديد البطاقة من الصورة: لا تخمن. اعرض: تم التعرف على اللاعب، لكن لم يتم تحديد البطاقة بدقة."
  // Pick the most relevant card for display (same position if available, or base) but flag as uncertain
  const samePosCard = position ? candidateCards.find(c => c.position === position) : undefined;
  const displayCard = samePosCard || candidateCards[0];

  return {
    detectedName: displayCard.playerName,
    detectedPosition: position || displayCard.position,
    detectedOverall: overall || displayCard.maxOverall || displayCard.overall,
    matchStatus: 'uncertain',
    matchStatusText: 'مطابقة غير مؤكدة',
    matchNote: 'تم التعرف على اللاعب، لكن لم يتم تحديد البطاقة بدقة.',
    matchedCard: displayCard
  };
}

/**
 * Processes all detected players and returns matched results
 */
export function matchAllDetectedPlayers(
  detectedPlayers: DetectedPlayerItem[],
  allCards: PlayerCard[]
): MatchedPlayerResult[] {
  return (detectedPlayers || []).map(p => matchDetectedPlayer(p, allCards));
}
