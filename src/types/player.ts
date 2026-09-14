export type PlayerPosition = 'CF' | 'SS' | 'LWF' | 'RWF' | 'AMF' | 'CMF' | 'DMF' | 'LMF' | 'RMF' | 'LB' | 'RB' | 'CB' | 'GK';

export type PlayerCategory = 'FW' | 'MF' | 'DF' | 'GK';

export type CardRarity = 'Epic Booster' | 'Big Time' | 'Show Time' | 'Highlight' | 'POTW' | 'Iconic';

export interface ProgressionPoints {
  shooting?: number;
  passing?: number;
  dribbling?: number;
  dexterity?: number;
  lowerBody?: number;
  aerial?: number;
  defending?: number;
  // GK specific
  gk1?: number; // Rebounding & reflexes
  gk2?: number; // Catching & reach
  gk3?: number; // Clearing & parrying
}

export interface PlayerStatItem {
  name: string;
  arabicName: string;
  value: number;
}

export interface PlayerBuild {
  id: string;
  name: string;
  arabicName: string;
  position: PlayerPosition;
  category: PlayerCategory;
  cardType: CardRarity;
  club: string;
  nationality: string;
  baseRating: number;
  maxRating: number;
  playstyle: string;
  image: string;
  booster?: string;
  progression: ProgressionPoints;
  keyStats: PlayerStatItem[];
  skills: string[];
  tips?: string;
}
