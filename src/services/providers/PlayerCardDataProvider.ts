import { PlayerCard } from '../../types/playerCard';

export interface PlayerCardDataProvider {
  /**
   * Name of the data provider source (e.g., 'eFootBase', 'eFHUB', 'PES Master', 'eFootballLAB')
   */
  readonly sourceName: 'eFootBase' | 'eFHUB' | 'PES Master' | 'eFootballLAB' | 'Konami Official' | 'Manual Source Import' | 'Aggregated';

  /**
   * Base website URL of the provider
   */
  readonly sourceBaseUrl: string;

  /**
   * Searches for cards by query string (searches player name, team, position, card type, overall)
   */
  searchPlayers(query: string): Promise<PlayerCard[]>;

  /**
   * Gets all distinct cards belonging to a specific player entity
   * e.g. "lionel-messi" returns all 6+ distinct Messi cards (World Cup 105, Epic 104, Miami 100, etc.)
   */
  getPlayerCards(playerId: string): Promise<PlayerCard[]>;

  /**
   * Fetches an exact card by its unique cardId
   */
  getCard(cardId: string): Promise<PlayerCard | null>;

  /**
   * Synchronizes and yields latest verified cards from the source
   */
  syncCards(): Promise<{ added: number; updated: number; cards: PlayerCard[] }>;
}
