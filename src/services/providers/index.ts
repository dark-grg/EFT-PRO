import { PlayerCard } from '../../types/playerCard';
import { PlayerCardDataProvider } from './PlayerCardDataProvider';
import { EFHubProvider } from './EFHubProvider';

export * from './PlayerCardDataProvider';
export * from './EFHubProvider';

/**
 * eFHUB Sole Player Card Data Provider
 * Source: https://efhub.com/tr
 */
export class AggregatedPlayerCardProvider implements PlayerCardDataProvider {
  readonly sourceName = 'eFHUB' as const;
  readonly sourceBaseUrl = 'https://efhub.com/tr';

  private efhubProvider = new EFHubProvider();

  async searchPlayers(query: string): Promise<PlayerCard[]> {
    return this.efhubProvider.searchPlayers(query);
  }

  async getPlayerCards(playerId: string): Promise<PlayerCard[]> {
    return this.efhubProvider.getPlayerCards(playerId);
  }

  async getCard(cardId: string): Promise<PlayerCard | null> {
    return this.efhubProvider.getCard(cardId);
  }

  async syncCards(): Promise<{ added: number; updated: number; cards: PlayerCard[] }> {
    return this.efhubProvider.syncCards();
  }
}

export const defaultPlayerCardProvider = new AggregatedPlayerCardProvider();
