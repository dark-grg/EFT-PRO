import { PlayerCard } from '../types/playerCard';
import { EfootbaseCardRecord, CanonicalProgressionDatabase } from './progression/CanonicalDatabase';
import { playerCardDb } from './playerCardDatabase';
import { apiClient } from '../api/client';

export interface EfootbaseUrlParseResult {
  cardId: string;
  playerId: string;
  progression: {
    shooting: number;
    passing: number;
    dribbling: number;
    dexterity: number;
    lowerBodyStrength: number;
    aerialStrength: number;
    defending: number;
    gk1: number;
    gk2: number;
    gk3: number;
  };
}

/**
 * Parses query parameters from an eFootBase URL
 * e.g., https://efootbase.com/ar/players/134626/88033407929826?sho=10&dri=4&dex=12&lbs=8&aer=4
 */
export function parseEfootbaseProgressionUrl(urlStr: string): EfootbaseUrlParseResult | null {
  try {
    const trimmed = urlStr.trim();
    const url = new URL(trimmed);
    const params = url.searchParams;

    const sho = parseInt(params.get('sho') || '0', 10);
    const pas = parseInt(params.get('pas') || '0', 10);
    const dri = parseInt(params.get('dri') || '0', 10);
    const dex = parseInt(params.get('dex') || '0', 10);
    const lbs = parseInt(params.get('lbs') || '0', 10);
    const aer = parseInt(params.get('aer') || '0', 10);
    const def = parseInt(params.get('def') || '0', 10);
    const gk1 = parseInt(params.get('gk1') || '0', 10);
    const gk2 = parseInt(params.get('gk2') || '0', 10);
    const gk3 = parseInt(params.get('gk3') || '0', 10);

    const pathMatch = url.pathname.match(/players\/(\d+)\/(\d+)/) || url.pathname.match(/players\/(\d+)/);
    if (!pathMatch) return null;

    const playerId = pathMatch[1];
    const cardId = pathMatch[2] || pathMatch[1];

    return {
      cardId,
      playerId,
      progression: {
        shooting: sho,
        passing: pas,
        dribbling: dri,
        dexterity: dex,
        lowerBodyStrength: lbs,
        aerialStrength: aer,
        defending: def,
        gk1,
        gk2,
        gk3
      }
    };
  } catch {
    return null;
  }
}

export interface ImportEfootbaseResponse {
  success: boolean;
  count: number;
  cards: PlayerCard[];
  records: EfootbaseCardRecord[];
  errors?: string[];
}

export async function importEfootbaseUrls(urls: string[]): Promise<ImportEfootbaseResponse> {
  const cleanUrls = urls.map(u => u.trim()).filter(u => u.length > 0);
  if (cleanUrls.length === 0) {
    throw new Error('يرجى إدخال رابط eFootBase صالح واحد على الأقل.');
  }

  // Call the server import API
  const response = await apiClient.post<ImportEfootbaseResponse>('/api/efootbase/import', { urls: cleanUrls }, 45000);

  if (!response.success) {
    throw new Error('فشل استيراد البيانات من eFootBase.');
  }

  // Save each imported card to client-side database
  for (const card of response.cards) {
    await playerCardDb.saveCard(card);
  }

  // Save each progression record to CanonicalProgressionDatabase
  if (Array.isArray(response.records) && response.records.length > 0) {
    CanonicalProgressionDatabase.addRecords(response.records);
  }

  return response;
}
