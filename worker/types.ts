/**
 * Cloudflare Worker Environment Bindings and Types
 */

export interface Env {
  // Cloudflare Worker Secret for Gemini API
  GEMINI_API_KEY?: string;

  // Cloudflare KV Namespace for Wheel and Player Storage
  WHEEL_STORE?: KVNamespace;
  PLAYERS_STORE?: KVNamespace;
  PLAYER_DEVELOPMENTS_STORE?: KVNamespace;

  // Cloudflare Durable Objects binding for Atomic Concurrency & Cooldown
  WHEEL_DO?: DurableObjectNamespace;

  // Cloudflare D1 Database
  DB?: D1Database;

  // Cloudflare R2 Bucket for Images
  IMAGES_BUCKET?: R2Bucket;

  // Admin secret key
  ADMIN_SECRET?: string;

  // Environment mode
  ENVIRONMENT?: string;
}

export interface WheelState {
  deviceId: string;
  lastSpinAt: number;
  nextSpinAt: number;
  lastPrizeId?: string;
  lastPrizeIndex?: number;
  updatedAt?: number;
}

export interface WheelRecord {
  lastSpinAt: number;
  nextSpinAt: number;
  lastPrizeId?: string;
  lastPrizeIndex?: number;
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
