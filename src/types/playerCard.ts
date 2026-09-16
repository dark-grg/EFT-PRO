export type CardRarityType = 
  | 'Epic Booster' 
  | 'Big Time' 
  | 'Show Time' 
  | 'Highlight' 
  | 'POTW' 
  | 'Standard'
  | 'Legend'
  | 'Featured';

export type PlayerPositionType = 
  | 'CF' | 'SS' | 'LWF' | 'RWF' 
  | 'AMF' | 'CMF' | 'DMF' | 'LMF' | 'RMF' 
  | 'CB' | 'LB' | 'RB' 
  | 'GK';

export interface PlayerBaseStats {
  offensiveAwareness: number;
  ballControl: number;
  dribbling?: number;
  tightPossession: number;
  lowPass: number;
  loftedPass: number;
  finishing: number;
  heading: number;
  placeKicking: number;
  curl: number;
  speed: number;
  acceleration: number;
  kickingPower: number;
  jump: number;
  physicalContact: number;
  balance: number;
  stamina: number;
  // Defensive
  defensiveAwareness?: number;
  tackling?: number;
  aggression?: number;
  defensiveEngagement?: number;
  // GK specific
  gkAwareness?: number;
  gkCatching?: number;
  gkParrying?: number;
  gkReflexes?: number;
  gkReach?: number;
  [key: string]: number | undefined;
}

export interface PlayerCardBooster {
  name: string;
  description: string;
  affectedStats: string[];
  value: number; // e.g. +2
}

/**
 * EXACT Player Card Model in Firestore `playerCards` Collection
 * Primary Key is `id` (cardId), NEVER playerName!
 */
export interface PlayerCard {
  id: string; // Unique cardId (e.g., "105873896755947")
  cardId: string; // Explicit primary key
  clubName?: string; // Exact club from eFHUB (e.g. "FC Barcelona", "Wolverhampton YB")
  cardVersion?: string; // e.g. "2025"
  efhubUrl?: string; // e.g. "https://efhub.com/tr/players/105873896755947"
  lastSyncedAt?: string; // ISO 8601 string
  version: string; // e.g. "2022", "2015", "2025"
  source: 'eFHUB' | 'eFootBase' | 'PES Master' | 'eFootballLAB' | 'Konami Official' | 'Manual Source Import';
  sourceUrl: string;
  sourceCardId: string; // ID from eFHUB
  sourceVersion: string; // e.g. "eFootball 2025 v4.2.0"
  
  playerId: string; // Player entity ID (e.g. "lionel-messi")
  playerName: string; // "Lionel Messi"
  arabicName?: string; // "ليونيل ميسي"
  cardName: string; // Exact card title
  
  cardType: CardRarityType;
  cardImageUrl: string; // Exact card image URL: https://efimg.com/...
  
  overall: number; // Base overall (e.g. 83 or 96)
  baseOverall?: number; // Base overall alias
  maxOverall: number; // Max potential overall rating (e.g. 100 or 105)
  position: PlayerPositionType;
  team: string; // Club or National Team (same as clubName)
  nationality: string;
  playingStyle: string; // "Creative Playmaker", "Goal Poacher", etc.
  
  level: number; // Default 1
  maxLevel: number; // Max training level (e.g. 28)
  height?: number; // Player height in cm
  weakFootAccuracy?: number; // 1 to 4
  progressionPoints?: ProgressionAllocation; // Authentic progression points from eFHUB
  
  baseStats: PlayerBaseStats;
  skills: string[];
  boosters?: PlayerCardBooster;
  
  lastUpdated: string; // ISO 8601 string
  createdAt: string; // ISO 8601 string
}

export interface ProgressionAllocation {
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
  [key: string]: number | undefined;
}

export interface StatDiffItem {
  key: string;
  name: string;
  arabicName: string;
  before: number;
  after: number;
  diff: number;
}

/**
 * EXACT Player Development Model in Firestore `playerDevelopments` Collection
 * Linked directly to `cardId` (exact card)
 */
export interface PlayerDevelopment {
  id: string; // Unique Development ID
  developmentId?: string; // Explicit alias for id
  cardId: string; // Foreign Key to PlayerCard.id
  playerId?: string; // Player entity id
  
  // Card Snapshot for fast offline rendering & safety
  cardSnapshot?: {
    playerName: string;
    arabicName?: string;
    cardName: string;
    cardImageUrl: string;
    cardType: CardRarityType;
    overall: number;
    position: PlayerPositionType;
    team: string;
    nationality: string;
    source: string;
    sourceUrl: string;
    sourceVersion: string;
    sourceCardId: string;
    lastUpdated: string;
  };
  
  title: string; // e.g. "🔥 تدمير الخصوم: ميسي مهاجم وهمي 105"
  description: string; // Tactical description and tips
  role: string; // e.g. "CF / False 9"
  position: PlayerPositionType;
  
  developmentPoints: ProgressionAllocation;
  usedPoints: number;
  availablePoints: number;
  
  finalOverall: number; // Calculated overall after build
  
  statsBefore: Record<string, number>;
  statsAfter: Record<string, number>;
  statChanges: Record<string, StatDiffItem>;
  
  published: boolean;
  featured: boolean;
  author: string;
  
  createdAt: string;
  updatedAt: string;
}
