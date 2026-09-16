export type VerificationStatus = 
  | 'VERIFIED_CROSS_SOURCE' 
  | 'VERIFIED_SOURCE' 
  | 'SOURCE_ONLY' 
  | 'CONFLICT' 
  | 'UNAVAILABLE' 
  | 'VERSION_MISMATCH' 
  | 'INVALID';

export interface ProgressionBuild {
  distribution: Record<string, number>;
  pointsUsed: number;
  finalStats?: Record<string, number>;
  finalOVR?: number;
  source: string;
}

export interface ProgressionRecordV2 {
  cardId: string;
  gameVersion: string;
  playerName: string;
  position: string;
  cardType: string;
  availablePoints: number;
  
  progression?: Record<string, number>; 
  pointsUsed?: number;

  builds: ProgressionBuild[];
  sourceRecords: string[];
  
  progressionStatus: VerificationStatus;
  confidence: string;
  importedAt: string;
  rulesVersion: string;
  datasetVersion: string;
}
