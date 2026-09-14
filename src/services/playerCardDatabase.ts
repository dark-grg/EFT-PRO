import { PlayerCard, PlayerDevelopment, ProgressionAllocation } from '../types/playerCard';
import { apiClient } from '../api/client';
import { defaultPlayerCardProvider } from './providers';
import { calculateProgressionStats, calculateAvailablePoints, calculateUsedPoints } from './progressionEngine';
import initialCardsData from '../data/efhubCards.json';

const CARDS_STORAGE_KEY = 'pes_arena_playerCards_v5';
const DEVELOPMENTS_STORAGE_KEY = 'pes_arena_playerDevelopments_v5';

// BroadcastChannel for instant cross-tab real-time reactivity
const syncChannel = typeof BroadcastChannel !== 'undefined' 
  ? new BroadcastChannel('pes_arena_realtime_sync') 
  : null;

export class PlayerCardDatabaseService {
  private cardsCache: PlayerCard[] = [];
  private developmentsCache: PlayerDevelopment[] = [];
  private cardListeners: Set<(cards: PlayerCard[]) => void> = new Set();
  private devListeners: Set<(developments: PlayerDevelopment[]) => void> = new Set();
  private initialized = false;

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === CARDS_STORAGE_KEY) {
          this.loadCardsFromStorage();
          this.notifyCardsListeners();
        } else if (e.key === DEVELOPMENTS_STORAGE_KEY) {
          this.loadDevelopmentsFromStorage();
          this.notifyDevListeners();
        }
      });
    }

    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        if (event.data?.type === 'CARDS_UPDATED') {
          this.loadCardsFromStorage();
          this.notifyCardsListeners();
        } else if (event.data?.type === 'DEVELOPMENTS_UPDATED') {
          this.loadDevelopmentsFromStorage();
          this.notifyDevListeners();
        }
      };
    }
  }

  private async init() {
    if (this.initialized) return;

    // Clean legacy storage versions to prevent corrupted/mismatched player names from persisting
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('pes_arena_playerCards_v4');
        localStorage.removeItem('pes_arena_playerDevelopments_v4');
        localStorage.removeItem('pes_arena_playerCards_v3');
        localStorage.removeItem('pes_arena_playerCards');
      } catch {
        // ignore
      }
    }

    this.loadCardsFromStorage();
    this.loadDevelopmentsFromStorage();

    // If cards database is empty or was purged, immediately populate from verified efhubCardsData
    if (this.cardsCache.length === 0) {
      if (Array.isArray(initialCardsData) && initialCardsData.length > 0) {
        this.cardsCache = initialCardsData as unknown as PlayerCard[];
        this.saveCardsToStorage();
        this.notifyCardsListeners();
      }
    }

    // Attempt to sync newest updates from backend API if available
    try {
      const json = await apiClient.get<{ success: boolean; cards: PlayerCard[] }>('/api/players/cards', 4000);
      if (Array.isArray(json?.cards) && json.cards.length > 0) {
        this.cardsCache = json.cards;
        this.saveCardsToStorage();
        this.notifyCardsListeners();
      }
    } catch {
      // fallback to current cache
    }

    if (this.cardsCache.length === 0) {
      await this.syncCardsDatabase();
    }

    // If developments are empty, seed with initial featured builds
    if (this.developmentsCache.length === 0) {
      await this.seedInitialDevelopments();
    }

    this.initialized = true;
  }

  private loadCardsFromStorage() {
    try {
      const data = localStorage.getItem(CARDS_STORAGE_KEY);
      let list = data ? JSON.parse(data) : [];
      if (Array.isArray(list)) {
        // Enforce removal of legacy, mock, or non-eFHUB cards, and cards with mismatched Messi images
        const isInvalid = (c: any) => {
          if (!c || c.source !== 'eFHUB') return true;
          if (typeof c.id === 'string' && (c.id.includes('pesmaster') || c.id.includes('eflab'))) return true;
          if (!c.cardImageUrl?.startsWith('https://efimg.com/')) return true;
          // Purge cards where non-Messi player has Messi card ID or Messi card image
          if (c.playerName !== 'Lionel Messi' && (
            c.id?.includes('88032602496343') || 
            c.cardImageUrl?.includes('88032602496343') ||
            c.id?.includes('88030186577239') ||
            c.cardImageUrl?.includes('88030186577239') ||
            c.id?.includes('88037971205463') ||
            c.cardImageUrl?.includes('88037971205463') ||
            c.id?.includes('89129698205015') ||
            c.cardImageUrl?.includes('89129698205015') ||
            c.id?.includes('105774575525207') ||
            c.cardImageUrl?.includes('105774575525207') ||
            c.id?.includes('89062052470103') ||
            c.cardImageUrl?.includes('89062052470103')
          )) {
            return true;
          }
          return false;
        };

        const hasInvalid = list.some(isInvalid);
        if (hasInvalid) {
          list = list.filter((c: any) => !isInvalid(c));
        }
      }
      this.cardsCache = list;
    } catch (err) {
      console.error('Failed to load playerCards from storage:', err);
      this.cardsCache = [];
    }
  }

  private saveCardsToStorage() {
    try {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(this.cardsCache));
      if (syncChannel) {
        syncChannel.postMessage({ type: 'CARDS_UPDATED' });
      }
    } catch (err) {
      console.error('Failed to save playerCards to storage:', err);
    }
  }

  private loadDevelopmentsFromStorage() {
    try {
      const data = localStorage.getItem(DEVELOPMENTS_STORAGE_KEY);
      this.developmentsCache = data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to load playerDevelopments from storage:', err);
      this.developmentsCache = [];
    }
  }

  private saveDevelopmentsToStorage() {
    try {
      localStorage.setItem(DEVELOPMENTS_STORAGE_KEY, JSON.stringify(this.developmentsCache));
      if (syncChannel) {
        syncChannel.postMessage({ type: 'DEVELOPMENTS_UPDATED' });
      }
    } catch (err) {
      console.error('Failed to save playerDevelopments to storage:', err);
    }
  }

  private notifyCardsListeners() {
    this.cardListeners.forEach(listener => listener([...this.cardsCache]));
  }

  private notifyDevListeners() {
    this.devListeners.forEach(listener => listener([...this.developmentsCache]));
  }

  // =========================================================================
  // REAL-TIME ON SNAPSHOT (FIRESTORE COMPLIANT)
  // =========================================================================

  /**
   * Real-Time listener for `playerCards` collection
   */
  onCardsSnapshot(callback: (cards: PlayerCard[]) => void): () => void {
    this.cardListeners.add(callback);
    // Instant initial delivery
    callback([...this.cardsCache]);
    return () => {
      this.cardListeners.delete(callback);
    };
  }

  /**
   * Real-Time listener for `playerDevelopments` collection
   * Updates instantly across Owner Dashboard and User App without refresh
   */
  onDevelopmentsSnapshot(callback: (developments: PlayerDevelopment[]) => void): () => void {
    this.devListeners.add(callback);
    // Instant initial delivery
    callback([...this.developmentsCache]);
    return () => {
      this.devListeners.delete(callback);
    };
  }

  // =========================================================================
  // CARD MANAGEMENT & DE-DUPLICATION (Sections 12 & 13)
  // =========================================================================

  /**
   * Synchronizes with provider.
   * Compares cards: adds new cards, updates modified cards, preserves cardId, prevents duplicates.
   */
  async syncCardsDatabase(): Promise<{ added: number; updated: number; total: number }> {
    const providerResult = await defaultPlayerCardProvider.syncCards();
    let addedCount = 0;
    let updatedCount = 0;

    const existingMap = new Map<string, number>();
    this.cardsCache.forEach((c, idx) => {
      // Keyed by unique source + sourceCardId + sourceVersion to prevent duplication
      const dedupKey = `${c.source}_${c.sourceCardId}_${c.sourceVersion}`.toLowerCase();
      existingMap.set(dedupKey, idx);
      existingMap.set(c.id, idx);
    });

    for (const card of providerResult.cards) {
      const dedupKey = `${card.source}_${card.sourceCardId}_${card.sourceVersion}`.toLowerCase();
      
      if (existingMap.has(dedupKey)) {
        // Update existing card data while preserving cardId
        const existingIdx = existingMap.get(dedupKey)!;
        this.cardsCache[existingIdx] = {
          ...card,
          id: this.cardsCache[existingIdx].id, // strictly preserve cardId
          lastUpdated: new Date().toISOString()
        };
        updatedCount++;
      } else if (existingMap.has(card.id)) {
        const existingIdx = existingMap.get(card.id)!;
        this.cardsCache[existingIdx] = {
          ...card,
          lastUpdated: new Date().toISOString()
        };
        updatedCount++;
      } else {
        // Add new card
        this.cardsCache.push({
          ...card,
          createdAt: card.createdAt || new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        existingMap.set(dedupKey, this.cardsCache.length - 1);
        existingMap.set(card.id, this.cardsCache.length - 1);
        addedCount++;
      }
    }

    this.saveCardsToStorage();
    this.notifyCardsListeners();

    return {
      added: addedCount,
      updated: updatedCount,
      total: this.cardsCache.length
    };
  }

  /**
   * Full Re-Sync System from eFHUB (PREPARE -> IMPORT -> VALIDATE -> REPLACE)
   * 1. Safe replacement: If sync fails, current database remains intact.
   * 2. Purges all legacy/mock players and cards.
   * 3. Preserves all other non-player collections (Users, Tournaments, Formations, etc.).
   */
  async fullReSync(): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    playersCount?: number;
    cardsCount?: number;
    invalidCount?: number;
    duplicatesCount?: number;
    cards?: PlayerCard[];
  }> {
    try {
      const data = await apiClient.post<{
        success: boolean;
        cards?: PlayerCard[];
        error?: string;
        message?: string;
        playersCount?: number;
        cardsCount?: number;
        invalidCount?: number;
        duplicatesCount?: number;
      }>('/api/admin/resync-players', {}, 30000);

      if (!data.success || !Array.isArray(data.cards) || data.cards.length === 0) {
        throw new Error(data.error || 'فشل تحديث اللاعبين، تم الاحتفاظ بالبيانات الحالية.');
      }

      // Safe atomic replacement: Delete old cards and replace with verified eFHUB cards
      this.cardsCache = data.cards;
      this.saveCardsToStorage();
      this.notifyCardsListeners();

      // Ensure developments are aligned
      if (this.developmentsCache.length === 0) {
        await this.seedInitialDevelopments();
      }

      return {
        success: true,
        message: data.message || 'تمت إعادة الاستيراد بنجاح',
        playersCount: data.playersCount || new Set(data.cards.map((c: PlayerCard) => c.playerId)).size,
        cardsCount: data.cardsCount || data.cards.length,
        invalidCount: data.invalidCount || 0,
        duplicatesCount: data.duplicatesCount || 0,
        cards: data.cards
      };
    } catch (err: any) {
      console.error('Full Re-Sync failed:', err);
      return {
        success: false,
        error: err?.message || 'فشل تحديث اللاعبين، تم الاحتفاظ بالبيانات الحالية.'
      };
    }
  }

  /**
   * Saves or imports a card manually (Section 18 - Manual Import Fallback)
   * Enforces de-duplication before saving.
   */
  async saveCard(cardData: Omit<PlayerCard, 'id' | 'createdAt' | 'lastUpdated'> & { id?: string; cardId?: string }): Promise<PlayerCard> {
    const targetId = cardData.cardId || cardData.id;
    const dedupKey = `${cardData.source}_${cardData.sourceCardId}_${cardData.sourceVersion}`.toLowerCase();
    
    // Check if card exists
    const existingIndex = this.cardsCache.findIndex(c => 
      (targetId && (c.id === targetId || c.cardId === targetId)) ||
      (`${c.source}_${c.sourceCardId}_${c.sourceVersion}`.toLowerCase() === dedupKey)
    );

    const now = new Date().toISOString();

    if (existingIndex !== -1) {
      // Update existing - strictly preserve existing cardId
      const existing = this.cardsCache[existingIndex];
      const preservedId = existing.id || existing.cardId || targetId;
      const updatedCard: PlayerCard = {
        ...existing,
        ...cardData,
        id: preservedId,
        cardId: preservedId,
        version: cardData.version || existing.version || '2025',
        lastUpdated: now
      };
      this.cardsCache[existingIndex] = updatedCard;

      // Also update snapshots in developmentsCache linked to this cardId
      let devUpdated = false;
      this.developmentsCache.forEach((dev) => {
        if (dev.cardId === preservedId) {
          dev.cardSnapshot = {
            playerName: updatedCard.playerName,
            arabicName: updatedCard.arabicName,
            cardName: updatedCard.cardName,
            cardImageUrl: updatedCard.cardImageUrl,
            cardType: updatedCard.cardType,
            overall: updatedCard.overall,
            position: updatedCard.position,
            team: updatedCard.team,
            nationality: updatedCard.nationality,
            source: updatedCard.source,
            sourceUrl: updatedCard.sourceUrl,
            sourceVersion: updatedCard.sourceVersion,
            sourceCardId: updatedCard.sourceCardId,
            lastUpdated: updatedCard.lastUpdated
          };
          devUpdated = true;
        }
      });
      if (devUpdated) {
        this.saveDevelopmentsToStorage();
        this.notifyDevListeners();
      }

      this.saveCardsToStorage();
      this.notifyCardsListeners();
      return updatedCard;
    } else {
      // Create new card
      const newCardId = targetId || `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newCard: PlayerCard = {
        ...cardData,
        id: newCardId,
        cardId: newCardId,
        version: cardData.version || '2025',
        createdAt: now,
        lastUpdated: now
      };
      this.cardsCache.push(newCard);
      this.saveCardsToStorage();
      this.notifyCardsListeners();
      return newCard;
    }
  }

  /**
   * Delete card by cardId
   */
  async deleteCard(cardId: string): Promise<void> {
    this.cardsCache = this.cardsCache.filter(c => c.id !== cardId && c.cardId !== cardId);
    this.saveCardsToStorage();
    this.notifyCardsListeners();
  }

  /**
   * Get card by unique cardId
   */
  async getCard(cardId: string): Promise<PlayerCard | null> {
    await this.init();
    return this.cardsCache.find(c => c.id === cardId) || null;
  }

  /**
   * Get all cached player cards
   */
  getCards(): PlayerCard[] {
    if (this.cardsCache.length === 0) {
      this.loadCardsFromStorage();
    }
    return [...this.cardsCache];
  }

  /**
   * Search cards by query (Player Name, Club, Position, Card Type, Overall)
   */
  async searchCards(query: string): Promise<PlayerCard[]> {
    await this.init();
    const q = query.toLowerCase().trim();
    if (!q) return [...this.cardsCache];
    
    return this.cardsCache.filter(card => 
      card.playerName.toLowerCase().includes(q) ||
      (card.arabicName && card.arabicName.toLowerCase().includes(q)) ||
      card.cardName.toLowerCase().includes(q) ||
      card.team.toLowerCase().includes(q) ||
      card.position.toLowerCase().includes(q) ||
      card.cardType.toLowerCase().includes(q) ||
      card.nationality.toLowerCase().includes(q) ||
      card.overall.toString().includes(q) ||
      card.maxOverall.toString().includes(q)
    );
  }

  /**
   * Get all cards for a specific player entity
   */
  async getCardsForPlayer(playerId: string): Promise<PlayerCard[]> {
    await this.init();
    return this.cardsCache.filter(c => c.playerId.toLowerCase() === playerId.toLowerCase());
  }

  // =========================================================================
  // PLAYER DEVELOPMENTS MANAGEMENT (Sections 6, 7, 9, 14, 15)
  // =========================================================================

  /**
   * Creates or updates a Player Development
   * Calculates real Before / After stats from exact baseStats!
   */
  async saveDevelopment(devData: {
    id?: string;
    cardId: string;
    title: string;
    description: string;
    role: string;
    position: any;
    developmentPoints: ProgressionAllocation;
    published?: boolean;
    featured?: boolean;
    author?: string;
  }): Promise<PlayerDevelopment> {
    await this.init();
    const card = await this.getCard(devData.cardId);
    if (!card) {
      throw new Error(`Cannot create development: Exact Card with id "${devData.cardId}" not found.`);
    }

    const availablePoints = calculateAvailablePoints(card);
    const usedPoints = calculateUsedPoints(devData.developmentPoints);

    // Calculate real mathematical stats before/after
    const statsCalc = calculateProgressionStats(card, devData.developmentPoints, true);

    const now = new Date().toISOString();
    const devId = devData.id || `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const development: PlayerDevelopment = {
      id: devId,
      cardId: card.id,
      cardSnapshot: {
        playerName: card.playerName,
        arabicName: card.arabicName,
        cardName: card.cardName,
        cardImageUrl: card.cardImageUrl,
        cardType: card.cardType,
        overall: card.overall,
        position: card.position,
        team: card.team,
        nationality: card.nationality,
        source: card.source,
        sourceUrl: card.sourceUrl,
        sourceVersion: card.sourceVersion,
        sourceCardId: card.sourceCardId,
        lastUpdated: card.lastUpdated
      },
      title: devData.title,
      description: devData.description,
      role: devData.role,
      position: devData.position,
      developmentPoints: devData.developmentPoints,
      usedPoints,
      availablePoints,
      finalOverall: statsCalc.finalOverall,
      statsBefore: statsCalc.statsBefore,
      statsAfter: statsCalc.statsAfter,
      statChanges: statsCalc.statChanges,
      published: devData.published ?? true,
      featured: devData.featured ?? false,
      author: devData.author || 'PES ARENA Official',
      createdAt: now,
      updatedAt: now
    };

    const existingIndex = this.developmentsCache.findIndex(d => d.id === devId);
    if (existingIndex !== -1) {
      this.developmentsCache[existingIndex] = {
        ...this.developmentsCache[existingIndex],
        ...development,
        createdAt: this.developmentsCache[existingIndex].createdAt,
        updatedAt: now
      };
    } else {
      this.developmentsCache.unshift(development);
    }

    this.saveDevelopmentsToStorage();
    this.notifyDevListeners();

    return development;
  }

  async deleteDevelopment(devId: string): Promise<void> {
    this.developmentsCache = this.developmentsCache.filter(d => d.id !== devId);
    this.saveDevelopmentsToStorage();
    this.notifyDevListeners();
  }

  async getAllDevelopments(): Promise<PlayerDevelopment[]> {
    await this.init();
    return [...this.developmentsCache];
  }

  // =========================================================================
  // SEED INITIAL DEVELOPMENTS
  // =========================================================================
  private async seedInitialDevelopments() {
    const findCard = (idCandidates: string[], fallbackFn?: (c: PlayerCard) => boolean): PlayerCard | undefined => {
      for (const id of idCandidates) {
        const found = this.cardsCache.find(c => c.id === id || c.sourceCardId === id);
        if (found) return found;
      }
      if (fallbackFn) {
        return this.cardsCache.find(fallbackFn);
      }
      return undefined;
    };

    // 1. Lionel Messi (eFHUB cards)
    const cardMessiWC = findCard(['efhub-messi-105-bigtime-2022', '105899666447703'], c => c.playerName === 'Lionel Messi' && c.maxOverall >= 104);
    const cardMessiBarca = findCard(['efhub-messi-106-epicbooster-2015', '89133456301399'], c => c.playerName === 'Lionel Messi' && c.maxOverall >= 105);
    const cardMessiMiami = findCard(['efhub-messi-100-highlight-2024', '105584254786903'], c => c.playerName === 'Lionel Messi');

    // 2. Matheus Cunha (eFHUB cards)
    const cardCunhaPOTW = findCard(['efhub-cunha-97-potw-2024', '105873896755947'], c => c.playerName === 'Matheus Cunha');
    const cardCunhaHL = findCard(['efhub-cunha-96-highlight-2024', '52899233256171'], c => c.playerName === 'Matheus Cunha');

    // 3. Antoine Semenyo (eFHUB cards)
    const cardSemenyoPOTW = findCard(['efhub-semenyo-95-potw-2024', '105873896760682'], c => c.playerName === 'Antoine Semenyo');
    const cardSemenyoHL = findCard(['efhub-semenyo-94-highlight-2024', '105799540139370'], c => c.playerName === 'Antoine Semenyo');

    // 4. Dominik Szoboszlai (eFHUB cards)
    const cardSzoboszlaiST = findCard(['efhub-szoboszlai-99-showtime-2024', '105873896766735'], c => c.playerName === 'Dominik Szoboszlai');
    const cardSzoboszlaiHL = findCard(['efhub-szoboszlai-98-highlight-2024', '105795245178127'], c => c.playerName === 'Dominik Szoboszlai');

    // 5. Cole Palmer (eFHUB cards)
    const cardPalmerST = findCard(['efhub-palmer-102-showtime-2024', '105873896774572'], c => c.playerName === 'Cole Palmer');
    const cardPalmerPOTW = findCard(['efhub-palmer-100-potw-2024', '105830678666156'], c => c.playerName === 'Cole Palmer');
    
    // 6. Cristiano Ronaldo (verified eFHUB cards)
    const cardRonaldoManUtd = findCard(['efhub-ronaldo-104-epicbooster', '89138556572074'], c => c.playerName === 'Cristiano Ronaldo' && c.overall >= 87);
    const cardRonaldoAlNassr = findCard(['efhub-ronaldo-100-showtime', '106734785925546'], c => c.playerName === 'Cristiano Ronaldo' && ((c.clubName && c.clubName.includes('Nassr')) || (c.team && c.team.includes('Nassr'))));
    const cardRonaldoRealMadrid = findCard(['efhub-ronaldo-102-epicbooster', '89135066911146'], c => c.playerName === 'Cristiano Ronaldo');

    // 7. Neymar Jr (verified eFHUB cards)
    const cardNeymarSantos = findCard(['efhub-neymar-104-epicbooster', '88044145253792'], c => c.playerName === 'Neymar Jr' && c.maxOverall >= 103);
    const cardNeymarAlHilal = findCard(['efhub-neymar-104-bigtime', '88039044980128'], c => c.playerName === 'Neymar Jr');
    const cardNeymarBarca = findCard(['efhub-neymar-100-highlight', '89133993205152'], c => c.playerName === 'Neymar Jr');

    // 8. Kylian Mbappé (verified eFHUB cards)
    const cardMbappeRM = findCard(['efhub-mbappe-103-showtime', '89138556678270'], c => (c.playerName === 'Kylian Mbappé' || c.playerName === 'Kylian Mbappe') && ((c.clubName && c.clubName.includes('Madrid')) || (c.team && c.team.includes('Madrid'))));
    const cardMbappeFrance = findCard(['efhub-mbappe-104-bigtime', '106777987362942'], c => (c.playerName === 'Kylian Mbappé' || c.playerName === 'Kylian Mbappe'));

    // 9. Erling Haaland (verified eFHUB cards)
    const cardHaalandST = findCard(['efhub-haaland-103-showtime', '106778255821223'], c => c.playerName === 'Erling Haaland' && c.maxOverall >= 102);
    const cardHaalandHL = findCard(['efhub-haaland-101-highlight', '89138556701095'], c => c.playerName === 'Erling Haaland');

    // 10. Lautaro, Havertz, Isak, Fermin, Legends
    const cardMartinez = findCard(['efhub-martinez-96-potw-2024', '105873896740698'], c => c.playerName === 'Lautaro Martinez');
    const cardHavertz = findCard(['efhub-havertz-95-potw-2024', '105873896739665'], c => c.playerName === 'Kai Havertz');
    const cardIsak = findCard(['efhub-isak-95-potw-2024', '105873896738968'], c => c.playerName === 'Alexander Isak');
    const cardFermin = findCard(['efhub-lopez-95-potw-2024', '105873896749964'], c => c.playerName === 'Fermin Lopez');
    const cardSuarez = findCard(['efhub-suarez-103-epicbooster', '123236838841410'], c => c.playerName.includes('Suarez') || c.playerName === 'Robert Lewandowski');
    const cardCasillas = findCard(['efhub-casillas-102-epicbooster'], c => c.playerName.includes('Casillas') || c.playerName === 'Thibaut Courtois');
    const cardMaldini = findCard(['pesmaster_maldini_milan_eb_104'], c => c.position === 'CB');
    const cardVieira = findCard(['pesmaster_vieira_arsenal_eb_103'], c => c.position === 'DMF');

    const seedConfigs = [
      // 1. MESSI - CARD A (105 OVR, SS)
      {
        card: cardMessiWC,
        title: '🔥 ميسي بطل كأس العالم 2022 - مهاجم وهمي فتاك (105 OVR)',
        description: 'أفضل توزيع نقاط لمركز SS أو CF مهاجم وهمي من بطاقة eFHUB بيج تايم الأصلية، تحركات سحرية وإنهاء متقن بالقدم اليسرى مع كيرل 99.',
        role: 'مهاجم متأخر (SS / False 9)',
        position: 'SS' as const,
        points: { shooting: 8, passing: 4, dribbling: 8, dexterity: 8, lowerBody: 7, aerial: 0, defending: 0 },
        featured: true
      },
      // 1. MESSI - CARD B (106 OVR, RWF)
      {
        card: cardMessiBarca,
        title: '⚡ ميسي برشلونة 2015 الثلاثية - جناح متوغل خارق (106 OVR)',
        description: 'تطويرة الجناح الأيمن RWF الخارق من بطاقة eFHUB إيبك بوستر: سرعة 95، تسارع 99، ومراوغة 99.',
        role: 'جناح أيمن متوغل (RWF)',
        position: 'RWF' as const,
        points: { shooting: 7, passing: 4, dribbling: 9, dexterity: 9, lowerBody: 8, aerial: 0, defending: 0 },
        featured: true
      },
      // 1. MESSI - CARD C (100 OVR, SS)
      {
        card: cardMessiMiami,
        title: '🪄 ميسي إنتر ميامي 2024 - مايسترو خط الهجوم وضربات حرة (100 OVR)',
        description: 'توزيع مخصص لصانع الألعاب والمهاجم المتأخر: تمريرات بينية حاسمة وركلات حرة دقيقة.',
        role: 'مهاجم متأخر (SS)',
        position: 'SS' as const,
        points: { shooting: 5, passing: 8, dribbling: 8, dexterity: 7, lowerBody: 6, aerial: 0, defending: 0 },
        featured: false
      },

      // 2. MATHEUS CUNHA (POTW & HIGHLIGHT)
      {
        card: cardCunhaPOTW,
        title: '🐺 ماتيوس كونها - مهاجم قناص ولاعب الفراغات POTW (97 OVR)',
        description: 'بطاقة كونها الرسمية من eFHUB بنسخة نجوم الأسبوع POTW: ارتقاء عالي، سرعة وقوة تسديد مع خاصية Hole Player.',
        role: 'مهاجم صريح (CF)',
        position: 'CF' as const,
        points: { shooting: 8, passing: 2, dribbling: 7, dexterity: 8, lowerBody: 7, aerial: 4, defending: 0 },
        featured: true
      },
      {
        card: cardCunhaHL,
        title: '🎯 ماتيوس كونها - مهاجم ثانٍ ذكي هايلايت (96 OVR)',
        description: 'بطاقة كونها هايلايت ولفرهامبتون من eFHUB: تحكم بالكرة ولمسات ساحرة وسرعة اختراق في عمق دفاع الخصم.',
        role: 'مهاجم متأخر (SS)',
        position: 'SS' as const,
        points: { shooting: 7, passing: 4, dribbling: 8, dexterity: 8, lowerBody: 7, aerial: 2, defending: 0 },
        featured: false
      },

      // 3. ANTOINE SEMENYO (POTW & HIGHLIGHT)
      {
        card: cardSemenyoPOTW,
        title: '⚡ أنطوان سيمينيو - جناح صاروخي هداف POTW (95 OVR)',
        description: 'بطاقة سيمينيو الرسمية من eFHUB نجوم الأسبوع: سرعة انفجارية 96، قوة تسديد هائلة واختراق دفاعي من الطرف.',
        role: 'جناح أيمن (RWF)',
        position: 'RWF' as const,
        points: { shooting: 8, passing: 1, dribbling: 7, dexterity: 8, lowerBody: 8, aerial: 3, defending: 0 },
        featured: true
      },
      {
        card: cardSemenyoHL,
        title: '🍒 أنطوان سيمينيو - مهاجم بورنموث القوي هايلايت (94 OVR)',
        description: 'بطاقة سيمينيو هايلايت من eFHUB: التحام بدني 90 وسرعة عالية في خط الهجوم للمرتدات السريعة.',
        role: 'مهاجم صريح (CF)',
        position: 'CF' as const,
        points: { shooting: 8, passing: 0, dribbling: 6, dexterity: 8, lowerBody: 7, aerial: 4, defending: 0 },
        featured: false
      },

      // 4. DOMINIK SZOBOSZLAI (SHOW TIME & HIGHLIGHT)
      {
        card: cardSzoboszlaiST,
        title: '🚀 دومينيك سوبوسلاي - قذائف آنفيلد شو تايم (99 OVR)',
        description: 'بطاقة سوبوسلاي شو تايم من eFHUB: قوة تسديد 99 لا تُصد وركلات حرة وكرات عرضية مليمترية في كل أرجاء الملعب.',
        role: 'صانع ألعاب متقدم (AMF)',
        position: 'AMF' as const,
        points: { shooting: 8, passing: 8, dribbling: 7, dexterity: 7, lowerBody: 7, aerial: 2, defending: 2 },
        featured: true
      },
      {
        card: cardSzoboszlaiHL,
        title: '🎼 دومينيك سوبوسلاي - ضابط إيقاع الوسط هايلايت (98 OVR)',
        description: 'بطاقة سوبوسلاي هايلايت ليفربول من eFHUB بأسلوب أوركسترا: رؤية خارقة وتمريرات بينية متقنة واسترداد كرات.',
        role: 'لاعب وسط متكامل (CMF)',
        position: 'CMF' as const,
        points: { shooting: 5, passing: 9, dribbling: 7, dexterity: 6, lowerBody: 7, aerial: 2, defending: 4 },
        featured: false
      },

      // 5. COLE PALMER (SHOW TIME & POTW)
      {
        card: cardPalmerST,
        title: '🥶 كول بالمر - كولد بالمر شو تايم تشيلسي (102 OVR)',
        description: 'بطاقة كول بالمر شو تايم الحصرية من eFHUB: وعي هجومي 95، إنهاء 96، تمرير حاسم وتحكم استثنائي بالكرة.',
        role: 'صانع ألعاب هداف (AMF)',
        position: 'AMF' as const,
        points: { shooting: 8, passing: 7, dribbling: 8, dexterity: 8, lowerBody: 7, aerial: 0, defending: 0 },
        featured: true
      },
      {
        card: cardPalmerPOTW,
        title: '🪄 كول بالمر - رجل المباريات الكبرى POTW (100 OVR)',
        description: 'بطاقة بالمر نجوم الأسبوع من eFHUB لمركز الجناح الأيمن RWF: كيرل عالي ومراوغات سلسة وإنهاء متقن.',
        role: 'جناح أيمن متوغل (RWF)',
        position: 'RWF' as const,
        points: { shooting: 8, passing: 6, dribbling: 8, dexterity: 8, lowerBody: 7, aerial: 0, defending: 0 },
        featured: false
      },

      // 6. CRISTIANO RONALDO - CARDS
      {
        card: cardRonaldoManUtd,
        title: '🚀 كريستيانو رونالدو 2008 صاروخ ماديرا - جناح هداف (104 OVR)',
        description: 'بطاقة رونالدو مانشستر يونايتد 2008 من eFHUB: تسديد من مسافات بعيدة، سرعة جبارة، ارتقاء خيالي 98 للرأسيات، وقوة تسديد 99.',
        role: 'جناح أيسر هداف (LWF)',
        position: 'LWF' as const,
        points: { shooting: 8, passing: 1, dribbling: 7, dexterity: 8, lowerBody: 8, aerial: 4, defending: 0 },
        featured: true
      },
      {
        card: cardRonaldoAlNassr,
        title: '🎯 كريستيانو رونالدو النصر 2024 - هداف الدوري السفاح (100 OVR)',
        description: 'بطاقة رونالدو النصر من eFHUB: تركيز كامل على إنهاء الفرص ورأسيات لا ترد من داخل منطقة الجزاء.',
        role: 'مهاجم صريح (CF)',
        position: 'CF' as const,
        points: { shooting: 9, passing: 0, dribbling: 4, dexterity: 8, lowerBody: 6, aerial: 6, defending: 0 },
        featured: false
      },
      {
        card: cardRonaldoRealMadrid,
        title: '👑 كريستيانو رونالدو ريال مدريد 2017 كارديف - البيج تايم الأعظم (105 OVR)',
        description: 'النسخة الأسطورية لكريستيانو نهائي كارديف 2017 من eFHUB: وعي هجومي 99، إنهاء 99، وقوة تسديد 99.',
        role: 'مهاجم صندوق مدمر (CF)',
        position: 'CF' as const,
        points: { shooting: 8, passing: 0, dribbling: 6, dexterity: 8, lowerBody: 8, aerial: 5, defending: 0 },
        featured: true
      },

      // 7. NEYMAR JR - CARDS
      {
        card: cardNeymarSantos,
        title: '🕺 نيمار جونيور سانتوس 2011 بيج تايم - ساحر المراوغات (104 OVR)',
        description: 'بطاقة نيمار سانتوس من eFHUB: مراوغة 99 وتوازن 99 ورشاقة تفكك أعتى خطوط الدفاع مع تسديدات مقوسة كيرل 97.',
        role: 'جناح أيسر مهاري (LWF)',
        position: 'LWF' as const,
        points: { shooting: 7, passing: 3, dribbling: 10, dexterity: 9, lowerBody: 8, aerial: 0, defending: 0 },
        featured: true
      },
      {
        card: cardNeymarAlHilal,
        title: '🇸🇦 نيمار جونيور الهلال 2024 هايلايت - مهندس الفرص (99 OVR)',
        description: 'بطاقة نيمار الهلال من eFHUB: صناعة ألعاب وتمريرات قاتلة وسيطرة مطلقة على الكرة.',
        role: 'صانع ألعاب حر (AMF)',
        position: 'AMF' as const,
        points: { shooting: 6, passing: 7, dribbling: 8, dexterity: 7, lowerBody: 6, aerial: 0, defending: 0 },
        featured: false
      },
      {
        card: cardNeymarBarca,
        title: '🔥 نيمار جونيور برشلونة 2015 إيبك بوستر - ثلاثية الـ MSN التاريخية (105 OVR)',
        description: 'نسخة البوستر الخارقة من eFHUB: سرعة 96، إنهاء 95، مراوغة 99، وتوافق خيالي مع هجوم برشلونة.',
        role: 'جناح متوغل قاتل (LWF)',
        position: 'LWF' as const,
        points: { shooting: 8, passing: 3, dribbling: 9, dexterity: 8, lowerBody: 8, aerial: 0, defending: 0 },
        featured: true
      },

      // 8. KYLIAN MBAPPE
      {
        card: cardMbappeRM,
        title: '⚡ كيليان مبابي ريال مدريد 2024 شو تايم - الصاروخ الملكي (103 OVR)',
        description: 'بطاقة مبابي الملكي من eFHUB: سرعة 99 وتسارع 99 مع خاصية فينامينال فينيشينج.',
        role: 'مهاجم صريح (CF)',
        position: 'CF' as const,
        points: { shooting: 8, passing: 0, dribbling: 7, dexterity: 8, lowerBody: 7, aerial: 1, defending: 0 },
        featured: true
      },
      {
        card: cardMbappeFrance,
        title: '🏆 كيليان مبابي فرنسا نهائي 2022 بيج تايم - هاتريك التاريخ (104 OVR)',
        description: 'بطاقة نهائي لوسيل من eFHUB: تسديدات هوائية مدمرة، سرعة خاطفة تكسر مصيدة التسلل، وإنهاء 98.',
        role: 'جناح أيسر خارق (LWF)',
        position: 'LWF' as const,
        points: { shooting: 8, passing: 1, dribbling: 8, dexterity: 8, lowerBody: 8, aerial: 1, defending: 0 },
        featured: true
      },

      // 9. ERLING HAALAND
      {
        card: cardHaalandST,
        title: '🤖 إيرلينغ هالاند مانشستر سيتي 2024 شو تايم - الفايكنج المدمر (103 OVR)',
        description: 'بطاقة هالاند شو تايم من eFHUB: إنهاء 99 والتحام جسدي 99 وقوة تسديد 99.',
        role: 'مهاجم صندوق مدمر (CF)',
        position: 'CF' as const,
        points: { shooting: 9, passing: 0, dribbling: 4, dexterity: 8, lowerBody: 6, aerial: 5, defending: 0 },
        featured: true
      },
      {
        card: cardHaalandHL,
        title: '⚽ إيرلينغ هالاند مانشستر سيتي 2023 هايلايت - قناص الثلاثية (100 OVR)',
        description: 'بطاقة هالاند هايلايت من eFHUB: سرعة وتمركز هجومي ذكي واستغلال الفرص.',
        role: 'صياد أهداف (CF)',
        position: 'CF' as const,
        points: { shooting: 8, passing: 0, dribbling: 4, dexterity: 8, lowerBody: 6, aerial: 4, defending: 0 },
        featured: false
      },

      // 10. LAUTARO, HAVERTZ, ISAK, FERMIN
      {
        card: cardMartinez,
        title: '🐂 لاوتارو مارتينيز - كابتن الإنتر المقاتل POTW (96 OVR)',
        description: 'بطاقة لاوتارو مارتينيز نجوم الأسبوع من eFHUB: إنهاء حاسم وقوة بدنية وروح قتالية.',
        role: 'مهاجم صريح (CF)',
        position: 'CF' as const,
        points: { shooting: 8, passing: 1, dribbling: 6, dexterity: 8, lowerBody: 6, aerial: 4, defending: 0 },
        featured: false
      },
      {
        card: cardHavertz,
        title: '🎯 كاي هافيرتز - قناص الجانرز المتأخر POTW (95 OVR)',
        description: 'بطاقة هافيرتز أرسنال نجوم الأسبوع من eFHUB بأسلوب Deep-Lying Forward: ربط هجومي وتمريرات دقيقة.',
        role: 'مهاجم وهمي (CF)',
        position: 'CF' as const,
        points: { shooting: 7, passing: 5, dribbling: 7, dexterity: 8, lowerBody: 6, aerial: 4, defending: 0 },
        featured: false
      },
      {
        card: cardIsak,
        title: '⚡ ألكسندر إيزاك - غزال نيوكاسل السريع POTW (95 OVR)',
        description: 'بطاقة إيزاك نجوم الأسبوع من eFHUB: سرعة 95 ومراوغة وإنهاء بالقدمين في انفرادات المرمى.',
        role: 'مهاجم صريح (CF)',
        position: 'CF' as const,
        points: { shooting: 8, passing: 0, dribbling: 7, dexterity: 8, lowerBody: 7, aerial: 3, defending: 0 },
        featured: false
      },
      {
        card: cardFermin,
        title: '💎 فيرمين لوبيز - جوهرة لاماسيا الهدافة POTW (95 OVR)',
        description: 'بطاقة فيرمين لوبيز برشلونة نجوم الأسبوع من eFHUB بأسلوب Hole Player: تسديدات بعيدة المدى واختراقات غير متوقعة.',
        role: 'صانع ألعاب متقدم (AMF)',
        position: 'AMF' as const,
        points: { shooting: 8, passing: 6, dribbling: 7, dexterity: 8, lowerBody: 7, aerial: 1, defending: 0 },
        featured: false
      },

      // LEGENDS
      {
        card: cardSuarez,
        title: '🎯 لويس سواريز البيستوليرو - ثعلب الصندوق القاتل (103 OVR)',
        description: 'بطاقة سواريز برشلونة إيبك بوستر الأصلية: إنهاء 99، والتحام جسدي 93، وقوة تسديد خارقة.',
        role: 'مهاجم صريح (CF)',
        position: 'CF' as const,
        points: { shooting: 9, passing: 0, dribbling: 6, dexterity: 9, lowerBody: 7, aerial: 3, defending: 0 },
        featured: true
      },
      {
        card: cardCasillas,
        title: '🧤 إيكر كاسياس القديس - ردات فعل حارقة (102 OVR)',
        description: 'بطاقة إيكر كاسياس إيبك بوستر الأصلية: ردة فعل 99، وعي حارس 99، وارتقاء 96.',
        role: 'حارس مرمى هجومي (GK)',
        position: 'GK' as const,
        points: { shooting: 0, passing: 0, dribbling: 0, dexterity: 0, lowerBody: 0, aerial: 5, defending: 0, gk1: 9, gk2: 9, gk3: 9 },
        featured: true
      },
      {
        card: cardMaldini,
        title: '🛡️ باولو مالديني - الجدار الحديدي لقلب الدفاع (104 OVR)',
        description: 'وعي دفاعي 99، قطع كرات 99، ارتقاء 97، وسرعة 88. قلب الدفاع الأفضل في بيس موبايل بلا منازع.',
        role: 'قلب دفاع (CB) / ظهير أيسر (LB)',
        position: 'CB' as const,
        points: { shooting: 0, passing: 2, dribbling: 2, dexterity: 5, lowerBody: 6, aerial: 6, defending: 11 },
        featured: true
      },
      {
        card: cardVieira,
        title: '⚔️ باتريك فييرا أرسنال - قاطع الكرات الأعظم (103 OVR)',
        description: 'التحام جسدي 99، شراسة 99، قطع كرات 98. يغلق منتصف الملعب بالكامل ويقطع كل الكرات الهوائية والأرضية.',
        role: 'لاعب ارتكاز دفاعي (DMF)',
        position: 'DMF' as const,
        points: { shooting: 0, passing: 4, dribbling: 3, dexterity: 5, lowerBody: 6, aerial: 5, defending: 10 },
        featured: true
      }
    ];

    for (const conf of seedConfigs) {
      if (!conf.card) continue;
      const statsCalc = calculateProgressionStats(conf.card, conf.points, true);
      const usedPoints = calculateUsedPoints(conf.points);
      const availablePoints = calculateAvailablePoints(conf.card);
      const now = new Date().toISOString();

      this.developmentsCache.push({
        id: `dev_${conf.card.id}`,
        cardId: conf.card.id,
        cardSnapshot: {
          playerName: conf.card.playerName,
          arabicName: conf.card.arabicName,
          cardName: conf.card.cardName,
          cardImageUrl: conf.card.cardImageUrl,
          cardType: conf.card.cardType,
          overall: conf.card.overall,
          position: conf.card.position,
          team: conf.card.team,
          nationality: conf.card.nationality,
          source: conf.card.source,
          sourceUrl: conf.card.sourceUrl,
          sourceVersion: conf.card.sourceVersion,
          sourceCardId: conf.card.sourceCardId,
          lastUpdated: conf.card.lastUpdated
        },
        title: conf.title,
        description: conf.description,
        role: conf.role,
        position: conf.position,
        developmentPoints: conf.points,
        usedPoints,
        availablePoints,
        finalOverall: statsCalc.finalOverall,
        statsBefore: statsCalc.statsBefore,
        statsAfter: statsCalc.statsAfter,
        statChanges: statsCalc.statChanges,
        published: true,
        featured: conf.featured,
        author: 'PES ARENA Pro Staff',
        createdAt: now,
        updatedAt: now
      });
    }

    this.saveDevelopmentsToStorage();
    this.notifyDevListeners();
  }
}

export const playerCardDb = new PlayerCardDatabaseService();
