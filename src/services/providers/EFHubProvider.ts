import { PlayerCard } from '../../types/playerCard';
import { PlayerCardDataProvider } from './PlayerCardDataProvider';
import suarezCardImage from '../../assets/images/luis_suarez_player_1789165035516.jpg';
import casillasCardImage from '../../assets/images/iker_casillas_card_1789301168614.jpg';

/**
 * eFHUB Player Card Data Provider
 * Source: https://efhub.com/tr
 * 
 * Provides verified eFootball mobile cards with authentic public eFHUB card images
 * hosted on efimg.com CDN without any portrait or random fallbacks.
 */
export class EFHubProvider implements PlayerCardDataProvider {
  readonly sourceName = 'eFHUB' as const;
  readonly sourceBaseUrl = 'https://efhub.com/tr';

  private static verifiedCards: PlayerCard[] = [];

  async searchPlayers(query: string): Promise<PlayerCard[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [...EFHubProvider.verifiedCards];
    return EFHubProvider.verifiedCards.filter(c =>
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
    return EFHubProvider.verifiedCards.filter(c => c.playerId.toLowerCase() === pid);
  }

  async getCard(cardId: string): Promise<PlayerCard | null> {
    const found = EFHubProvider.verifiedCards.find(c => c.id === cardId || c.sourceCardId === cardId);
    return found ? { ...found } : null;
  }

  async syncCards(): Promise<{ added: number; updated: number; cards: PlayerCard[] }> {
    return {
      added: EFHubProvider.verifiedCards.length,
      updated: 0,
      cards: [...EFHubProvider.verifiedCards]
    };
  }

  /**
   * Helper to parse eFHUB player card URL or sourceCardId into a structured PlayerCard
   */
  static parseEFHubUrlOrId(input: string): { sourceCardId: string; cardImageUrl: string; sourceUrl: string } | null {
    const cleaned = input.trim();
    if (!cleaned) return null;

    // Direct ID e.g. "105873896755947"
    if (/^\d{5,20}$/.test(cleaned)) {
      return {
        sourceCardId: cleaned,
        cardImageUrl: `https://efimg.com/efootballhub22/images/player_cards/${cleaned}_l.png`,
        sourceUrl: `https://efhub.com/tr/players/${cleaned}`
      };
    }

    // Direct image URL e.g. "https://efimg.com/efootballhub22/images/player_cards/105873896755947_l.png"
    const imgMatch = cleaned.match(/player_cards\/(\d+)_l\.png/);
    if (imgMatch && imgMatch[1]) {
      return {
        sourceCardId: imgMatch[1],
        cardImageUrl: `https://efimg.com/efootballhub22/images/player_cards/${imgMatch[1]}_l.png`,
        sourceUrl: `https://efhub.com/tr/players/${imgMatch[1]}`
      };
    }

    // Player URL e.g. "https://efhub.com/tr/players/105873896755947" or "https://efhub.com/players/105873896755947"
    const pageMatch = cleaned.match(/players\/(\d+)/);
    if (pageMatch && pageMatch[1]) {
      return {
        sourceCardId: pageMatch[1],
        cardImageUrl: `https://efimg.com/efootballhub22/images/player_cards/${pageMatch[1]}_l.png`,
        sourceUrl: `https://efhub.com/tr/players/${pageMatch[1]}`
      };
    }

    return null;
  }
}
