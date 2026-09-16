import { PlayerCard } from '../../types/playerCard';
import { PlayerCardDataProvider } from './PlayerCardDataProvider';

/**
 * eFootBase Player Card Data Provider
 * Source: https://efootbase.com/ar
 */
export class EFootBaseProvider implements PlayerCardDataProvider {
  readonly sourceName = 'eFootBase' as const;
  readonly sourceBaseUrl = 'https://efootbase.com/ar';

  private static verifiedCards: PlayerCard[] = [];

  async searchPlayers(query: string): Promise<PlayerCard[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [...EFootBaseProvider.verifiedCards];
    return EFootBaseProvider.verifiedCards.filter(c =>
      c.playerName.toLowerCase().includes(q) ||
      (c.arabicName && c.arabicName.toLowerCase().includes(q)) ||
      c.team.toLowerCase().includes(q) ||
      c.position.toLowerCase().includes(q) ||
      c.cardType.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.sourceCardId.includes(q)
    );
  }

  async getPlayerCards(playerId: string): Promise<PlayerCard[]> {
    const pid = playerId.toLowerCase().trim();
    return EFootBaseProvider.verifiedCards.filter(c => c.playerId.toLowerCase() === pid);
  }

  async getCard(cardId: string): Promise<PlayerCard | null> {
    const found = EFootBaseProvider.verifiedCards.find(c => c.id === cardId || c.sourceCardId === cardId);
    return found ? { ...found } : null;
  }

  async syncCards(): Promise<{ added: number; updated: number; cards: PlayerCard[] }> {
    // TODO: Implement actual fetching logic from efootbase.com
    return {
      added: 0,
      updated: 0,
      cards: [...EFootBaseProvider.verifiedCards]
    };
  }
}
