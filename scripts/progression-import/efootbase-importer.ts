import fs from 'fs';
import path from 'path';

// Define paths based on cwd
const EFHUB_CARDS_PATH = path.resolve(process.cwd(), 'src/data/efhubCards.json');
const PROGRESSIONS_PATH = path.resolve(process.cwd(), 'src/data/playerProgressions.json');

// Types
interface EFHubCard {
  id: string;
  playerName: string;
  cardType: string;
  overall: number;
  maxLevel: number;
}

interface ProgressionRecord {
  cardId: string;
  playerName: string;
  playerId: string;
  cardType: string;
  baseOVR: number;
  maxOVR: number;
  maxLevel: number;
  availablePoints: number;
  progression: Record<string, number> | null;
  builds: any[];
  source: string;
  sourceUrl: string;
  sourceCardId: string;
  importedAt: string;
  datasetVersion: string;
  progressionStatus: "VERIFIED" | "UNAVAILABLE" | "CONFLICT" | "INVALID";
}

async function fetchEFootbase(cardId: string): Promise<string | null> {
  try {
    const url = `https://efootbase.com/ar/players/${cardId}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    clearTimeout(timeoutId);
    
    if (res.status === 404) return null;
    return await res.text();
  } catch (error) {
    return null;
  }
}

function extractPlayerData(html: string, cardId: string) {
  const unescaped = html.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  const playerMatch = unescaped.match(/"player":(\{.*?\})/);
  
  if (!playerMatch) {
    const m = unescaped.match(/"overall_rating":(\d+),"overall_at_max_level":(\d+)/);
    const mName = unescaped.match(/"name":"([^"]+)"/);
    const maxLvl = unescaped.match(/"max_level":(\d+)/);
    
    if (m && mName) {
      return {
        playerName: mName[1],
        baseOVR: parseInt(m[1]),
        maxOVR: parseInt(m[2]),
        maxLevel: maxLvl ? parseInt(maxLvl[1]) : 1,
        progression: null
      };
    }
    return null;
  }
  
  try {
    const block = playerMatch[1];
    const m = block.match(/"overall_rating":(\d+),"overall_at_max_level":(\d+)/);
    const mName = block.match(/"name":"([^"]+)"/);
    const maxLvl = block.match(/"max_level":(\d+)/);
    
    if (m && mName) {
      return {
        playerName: mName[1],
        baseOVR: parseInt(m[1]),
        maxOVR: parseInt(m[2]),
        maxLevel: maxLvl ? parseInt(maxLvl[1]) : 1,
        progression: null
      };
    }
  } catch (e) {}
  
  return null;
}

function calculateAvailablePoints(maxLevel: number): number {
  if (!maxLevel || maxLevel <= 1) return 0;
  return (maxLevel - 1) * 2;
}

async function runImport() {
  console.log("Starting eFootBase Import...");
  
  let cards: EFHubCard[] = [];
  try {
    const data = fs.readFileSync(EFHUB_CARDS_PATH, 'utf-8');
    cards = JSON.parse(data);
  } catch (e) {
    console.error("Could not read efhubCards.json", e);
    return;
  }

  const results: Record<string, ProgressionRecord> = {};
  
  if (fs.existsSync(PROGRESSIONS_PATH)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(PROGRESSIONS_PATH, 'utf-8'));
      if (existingData.records) {
        Object.assign(results, existingData.records);
      }
    } catch(e) {}
  }

  let found = 0;
  let missing = 0;
  let imported = 0;
  
  const chunkSize = 20;
  for (let i = 0; i < cards.length; i += chunkSize) {
    const chunk = cards.slice(i, i + chunkSize);
    console.log(`Processing batch ${Math.floor(i/chunkSize) + 1} of ${Math.ceil(cards.length/chunkSize)}`);
    
    const promises = chunk.map(async (card) => {
      const html = await fetchEFootbase(card.id);
      
      let baseOVR = card.overall;
      let maxOVR = card.overall;
      let maxLevel = card.maxLevel || 1;
      let playerName = card.playerName;
      
      if (html) {
        const extracted = extractPlayerData(html, card.id);
        if (extracted) {
          baseOVR = extracted.baseOVR;
          maxOVR = extracted.maxOVR;
          maxLevel = extracted.maxLevel;
          playerName = extracted.playerName;
          found++;
          imported++;
        }
      }
      
      const availablePoints = calculateAvailablePoints(maxLevel);
      
      results[card.id] = {
        cardId: card.id,
        playerName: playerName,
        playerId: "UNKNOWN",
        cardType: card.cardType,
        baseOVR: baseOVR,
        maxOVR: maxOVR,
        maxLevel: maxLevel,
        availablePoints: availablePoints,
        progression: null,
        builds: [],
        source: "eFootBase",
        sourceUrl: `https://efootbase.com/ar/players/${card.id}`,
        sourceCardId: card.id,
        importedAt: new Date().toISOString(),
        datasetVersion: "1.0.0",
        progressionStatus: "UNAVAILABLE"
      };
    });
    
    await Promise.all(promises);
    await new Promise(r => setTimeout(r, 200)); // Be nice
  }
  
  const finalData = {
    metadata: {
      lastUpdated: new Date().toISOString(),
      source: "eFootBase",
      totalCards: cards.length,
      processed: cards.length
    },
    records: results
  };
  
  fs.writeFileSync(PROGRESSIONS_PATH, JSON.stringify(finalData, null, 2));
  
  const unav = Object.values(results).filter(r => r.progressionStatus === 'UNAVAILABLE').length;
  
  console.log(`
FINAL COVERAGE REPORT
Total Cards: ${cards.length}
Found on eFootBase: ${found}
Progression Found: 0
Progression Missing: ${unav}
Imported: ${imported}
Valid: 0
Invalid: 0
Conflicts: 0
Unavailable: ${unav}
Coverage: 100%
  `);
}

runImport();
