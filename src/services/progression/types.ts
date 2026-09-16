import { ProgressionAllocation } from '../../types/playerCard';

export interface ProgressionCategories {
  [key: string]: number | undefined;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  dexterity?: number;
  lowerBody?: number;
  aerial?: number;
  defending?: number;
  gk1?: number;
  gk2?: number;
  gk3?: number;
}

export interface ProgressionRecord {
  cardId: string;
  playerName?: string;
  cardType?: string;
  position?: string;
  clubName?: string;
  progressionPoints: number;
  categories: ProgressionCategories;
  source: string;
  sourceUrl?: string;
  sourceVersion?: string;
  sourceCardId?: string;
  importedAt?: string;
  dataHash?: string;
}