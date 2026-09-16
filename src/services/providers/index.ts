import { PlayerCard } from '../../types/playerCard';
import { PlayerCardDataProvider } from './PlayerCardDataProvider';
import { EFHubProvider } from './EFHubProvider';
import { EFootBaseProvider } from './EFootBaseProvider';

export * from './PlayerCardDataProvider';
export * from './EFHubProvider';
export * from './EFootBaseProvider';

/**
 * eFHUB and eFootBase Player Card Data Provider
 */
export class AggregatedPlayerCardProvider implements PlayerCardDataProvider {
  readonly sourceName = 'Aggregated' as const;
  readonly sourceBaseUrl = 'https://efhub.com/tr';

  private efhubProvider = new EFHubProvider();
  private efootbaseProvider = new EFootBaseProvider();

  async searchPlayers(query: string): Promise<PlayerCard[]> {
    const efhubCards = await this.efhubProvider.searchPlayers(query);
    const efootbaseCards = await this.efootbaseProvider.searchPlayers(query);
    return [...efhubCards, ...efootbaseCards];
  }

  async getPlayerCards(playerId: string): Promise<PlayerCard[]> {
    const efhubCards = await this.efhubProvider.getPlayerCards(playerId);
    const efootbaseCards = await this.efootbaseProvider.getPlayerCards(playerId);
    return [...efhubCards, ...efootbaseCards];
  }

  async getCard(cardId: string): Promise<PlayerCard | null> {
    const efhubCard = await this.efhubProvider.getCard(cardId);
    if (efhubCard) return efhubCard;
    return await this.efootbaseProvider.getCard(cardId);
  }

  async syncCards(): Promise<{ added: number; updated: number; cards: PlayerCard[] }> {
    const efhubResult = await this.efhubProvider.syncCards();
    const efootbaseResult = await this.efootbaseProvider.syncCards();
    return {
      added: efhubResult.added + efootbaseResult.added,
      updated: efhubResult.updated + efootbaseResult.updated,
      cards: [...efhubResult.cards, ...efootbaseResult.cards]
    };
  }
}

export const defaultPlayerCardProvider = new AggregatedPlayerCardProvider();
