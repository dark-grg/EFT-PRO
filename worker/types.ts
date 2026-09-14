/**
 * Cloudflare Worker Environment Bindings and Types
 */

export interface Env {
  // Cloudflare Worker Secret for Gemini API
  GEMINI_API_KEY?: string;

  // Optional Cloudflare KV Namespace for Wheel and Player Storage
  WHEEL_STORE?: KVNamespace;
  PLAYERS_STORE?: KVNamespace;

  // Environment mode
  ENVIRONMENT?: string;
}

export interface WheelRecord {
  lastSpinAt: number;
  nextSpinAt: number;
}

export interface PlayerCard {
  id: string;
  cardId: string;
  playerId: string;
  playerName: string;
  cardName: string;
  clubName: string;
  team: string;
  position: string;
  overall: number;
  maxOverall: number;
  cardType: string;
  cardVersion?: string;
  version?: string;
  cardImageUrl: string;
  efhubUrl?: string;
  sourceUrl?: string;
  sourceCardId?: string;
  sourceVersion?: string;
  source?: string;
  nationality?: string;
  playingStyle?: string;
  level?: number;
  maxLevel?: number;
  baseStats?: Record<string, number>;
  skills?: string[];
  lastSyncedAt?: string;
  lastUpdated?: string;
  createdAt?: string;
}
