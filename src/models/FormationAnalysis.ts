export interface DetectedPlayer {
  name?: string;
  position: string; // e.g. 'GK' | 'CB' | 'LB' | 'RB' | 'DMF' | 'CMF' | 'AMF' | 'LMF' | 'RMF' | 'LWF' | 'RWF' | 'SS' | 'CF'
  rating?: number;
  confidence: number; // 0 to 100
  x: number; // 0 to 100 (percentage from left)
  y: number; // 0 to 100 (percentage from top)
}

export type ErrorSeverity = 'low' | 'medium' | 'high';

export interface TacticalError {
  severity: ErrorSeverity;
  title: string;
  description: string;
  recommendation: string;
  affectedZone?: 'defense' | 'midfield' | 'attack' | 'left_flank' | 'right_flank' | 'center';
}

export interface TacticalCoverageMetrics {
  defensiveBalance: number; // 0 - 100
  midfieldBalance: number;  // 0 - 100
  attackingBalance: number; // 0 - 100
  width: number;            // 0 - 100 (horizontal spread)
  depth: number;            // 0 - 100 (vertical spread)
  coverage: number;         // 0 - 100 (overall pitch occupation)
}

export interface RawVisionOutput {
  isFormationScreenshot: boolean;
  confidence: number;
  gameName?: string;
  formationName?: string;
  coachName?: string;
  playstyle?: string;
  playersCount?: number;
  detectedPlayers: {
    name?: string;
    position?: string;
    rating?: number;
    confidence?: number;
    x?: number;
    y?: number;
  }[];
  visibleTactics?: string[];
  imageClarityNote?: string;
}

export interface FormationAnalysis {
  id: string;
  timestamp: string;
  formation: string;
  confidence: number;
  players: DetectedPlayer[];
  strengths: string[];
  weaknesses: string[];
  warnings: string[];
  recommendations: string[];
  tacticalErrors: TacticalError[];
  attackScore: number;
  defenseScore: number;
  midfieldScore: number;
  balanceScore: number;
  overallScore: number;
  coverageMetrics: TacticalCoverageMetrics;
  gameName?: string;
  coach?: string;
  playstyle?: string;
  imageClarityNote?: string;
}

export interface SavedAnalysisRecord {
  id: string;
  date: string;
  formation: string;
  overallScore: number;
  attackScore: number;
  defenseScore: number;
  midfieldScore: number;
  balanceScore: number;
  weaknesses: string[];
  recommendations: string[];
  strengths: string[];
  playersCount: number;
  previewThumbnail?: string;
}

/**
 * Validates and normalizes raw vision data into a robust FormationAnalysis object.
 */
export function validateAndNormalizeVision(raw: RawVisionOutput): {
  isValid: boolean;
  errorMessage?: string;
  normalizedData?: Partial<FormationAnalysis>;
} {
  if (!raw.isFormationScreenshot) {
    return {
      isValid: false,
      errorMessage: 'لم نتمكن من اكتشاف تشكيلة واضحة في الصورة. يرجى التأكد من رفع لقطة شاشة لشاشة إدارة الفريق (Game Plan).'
    };
  }

  if (raw.confidence < 35 && (!raw.detectedPlayers || raw.detectedPlayers.length < 5)) {
    return {
      isValid: false,
      errorMessage: 'جودة الصورة غير كافية لقراءة اللاعبين والتشكيلة بوضوح. يرجى اختيار لقطة شاشة أكثر دقة.'
    };
  }

  const validPositions = new Set([
    'GK', 'CB', 'LB', 'RB', 'LWB', 'RWB',
    'DMF', 'CMF', 'AMF', 'LMF', 'RMF',
    'LWF', 'RWF', 'SS', 'CF'
  ]);

  const sanitizedPlayers: DetectedPlayer[] = (raw.detectedPlayers || []).map((p, idx) => {
    let pos = (p.position || '').toUpperCase().trim();
    if (!validPositions.has(pos)) {
      pos = 'unknown';
    }

    let x = typeof p.x === 'number' ? Math.max(5, Math.min(95, p.x)) : 50;
    let y = typeof p.y === 'number' ? Math.max(5, Math.min(95, p.y)) : 50;
    let rating = typeof p.rating === 'number' && p.rating >= 40 && p.rating <= 110 ? p.rating : undefined;

    return {
      name: p.name && p.name !== 'unknown' && p.name.trim().length > 1 ? p.name.trim() : `لاعب ${idx + 1}`,
      position: pos,
      rating,
      confidence: typeof p.confidence === 'number' ? Math.min(100, Math.max(10, p.confidence)) : 75,
      x,
      y
    };
  });

  return {
    isValid: true,
    normalizedData: {
      formation: raw.formationName && raw.formationName !== 'unknown' ? raw.formationName : inferFormationFromPlayers(sanitizedPlayers),
      confidence: Math.round(raw.confidence || 75),
      players: sanitizedPlayers,
      gameName: raw.gameName || 'eFootball',
      coach: raw.coachName && raw.coachName !== 'unknown' ? raw.coachName : undefined,
      playstyle: raw.playstyle && raw.playstyle !== 'unknown' ? raw.playstyle : undefined,
      imageClarityNote: raw.imageClarityNote
    }
  };
}

/**
 * Infer tactical structure (e.g. 4-2-1-3) based on defensive, midfield, and forward player count
 */
export function inferFormationFromPlayers(players: DetectedPlayer[]): string {
  if (!players || players.length === 0) return '4-2-1-3';

  let defenders = 0;
  let dmfs = 0;
  let cmfs = 0;
  let amfs = 0;
  let forwards = 0;

  players.forEach(p => {
    const pos = p.position;
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) defenders++;
    else if (pos === 'DMF') dmfs++;
    else if (['CMF', 'LMF', 'RMF'].includes(pos)) cmfs++;
    else if (pos === 'AMF') amfs++;
    else if (['CF', 'SS', 'LWF', 'RWF'].includes(pos)) forwards++;
    else {
      // Position unknown, deduce by vertical position y (0 = top/attack, 100 = bottom/defense)
      if (p.y >= 70) defenders++;
      else if (p.y >= 45) cmfs++;
      else forwards++;
    }
  });

  if (defenders === 0) defenders = 4;
  const mids = dmfs + cmfs + amfs;
  if (forwards === 0) forwards = 3;

  if (dmfs > 0 && amfs > 0) {
    return `${defenders}-${dmfs}-${amfs}-${forwards}`;
  }
  return `${defenders}-${mids || 3}-${forwards}`;
}
