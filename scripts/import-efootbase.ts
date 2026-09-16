import fs from 'fs';
import path from 'path';

export interface EfootbaseProgressionData {
  shooting?: number;
  passing?: number;
  dribbling?: number;
  dexterity?: number;
  lowerBodyStrength?: number;
  aerialStrength?: number;
  defending?: number;
  gk1?: number;
  gk2?: number;
  gk3?: number;
}

export interface EfootbaseCardRecord {
  cardId: string;
  playerName: string;
  position: string;
  club: string;
  cardType: string;
  baseOverall: number;
  maxOverall?: number;
  maxProgressionPoints?: number;
  pointsAvailable: number;
  pointsUsed: number;
  progression: EfootbaseProgressionData | null;
  source: string;
  sourceUrl: string;
  sourceVersion?: string;
  status: 'VERIFIED_SOURCE' | 'NOT_AVAILABLE' | 'CONFLICT';
  dataVersion: string;
  importedAt: string;
  conflictDetails?: string;
}

export interface EfootbaseDatabase {
  dataVersion: string;
  source: string;
  importedAt: string;
  records: Record<string, EfootbaseCardRecord>;
}

export interface ImportReport {
  totalCards: number;
  matched: number;
  unmatched: number;
  withProgression: number;
  withoutProgression: number;
  conflicts: number;
  invalid: number;
  datasetVersion: string;
  source: string;
  importedAt: string;
  sourceUrls: string[];
}

export class EfootbaseImporter {
  static runImport(): { db: EfootbaseDatabase; report: ImportReport } {
    const root = process.cwd();
    const cardsPath = path.join(root, 'src', 'data', 'efhubCards.json');
    const exportPath = path.join(root, 'data', 'efootbase-export.json');
    const outDbPath = path.join(root, 'src', 'data', 'efootbaseProgressions.json');
    const outReportPath = path.join(root, 'data', 'efootbase-import-report.json');

    const efhubCards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));

    let externalRecords: Record<string, any> = {};
    if (fs.existsSync(exportPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
        if (Array.isArray(raw)) {
          raw.forEach(r => { if (r.cardId) externalRecords[String(r.cardId)] = r; });
        } else if (raw && typeof raw === 'object') {
          externalRecords = raw.records || raw;
        }
      } catch (err: any) {
        console.error('Error reading efootbase-export.json:', err.message);
      }
    }

    const now = new Date().toISOString();
    const dataVersion = 'efootbase-v1';
    const db: EfootbaseDatabase = {
      dataVersion,
      source: 'eFootBase',
      importedAt: now,
      records: {}
    };

    let matched = 0;
    let withProgression = 0;
    let withoutProgression = 0;
    let conflicts = 0;
    let invalid = 0;
    const sourceUrls: string[] = [];

    for (const card of efhubCards) {
      const cardId = String(card.id);
      const ext = externalRecords[cardId];

      if (ext && ext.progression && typeof ext.progression === 'object') {
        const prog: EfootbaseProgressionData = {
          shooting: Number(ext.progression.shooting || 0),
          passing: Number(ext.progression.passing || 0),
          dribbling: Number(ext.progression.dribbling || 0),
          dexterity: Number(ext.progression.dexterity || 0),
          lowerBodyStrength: Number(ext.progression.lowerBodyStrength || ext.progression.lowerBody || 0),
          aerialStrength: Number(ext.progression.aerialStrength || ext.progression.aerial || 0),
          defending: Number(ext.progression.defending || 0),
          gk1: Number(ext.progression.gk1 || 0),
          gk2: Number(ext.progression.gk2 || 0),
          gk3: Number(ext.progression.gk3 || 0),
        };

        const pointsUsed = Object.values(prog).reduce((sum, val) => sum + (val || 0), 0);
        const sourceUrl = ext.sourceUrl || `https://efootbase.com/ar/players/${cardId}`;
        sourceUrls.push(sourceUrl);

        db.records[cardId] = {
          cardId,
          playerName: card.playerName || ext.playerName || '',
          position: card.position || ext.position || '',
          club: card.teamName || card.club || ext.club || '',
          cardType: card.cardType || ext.cardType || 'Standard',
          baseOverall: Number(card.overallRating || card.baseOverall || ext.baseOverall || 0),
          maxOverall: Number(card.maxOverall || ext.maxOverall || 0),
          maxProgressionPoints: Number(ext.maxProgressionPoints || ext.pointsAvailable || pointsUsed),
          pointsAvailable: Number(ext.pointsAvailable || ext.maxProgressionPoints || pointsUsed),
          pointsUsed,
          progression: prog,
          source: 'eFootBase',
          sourceUrl,
          sourceVersion: ext.sourceVersion || 'eFootBase 2025/2026',
          status: 'VERIFIED_SOURCE',
          dataVersion,
          importedAt: now
        };
        matched++;
        withProgression++;
      } else {
        const sourceUrl = `https://efootbase.com/ar/players/${cardId}`;
        db.records[cardId] = {
          cardId,
          playerName: card.playerName || '',
          position: card.position || '',
          club: card.teamName || card.club || '',
          cardType: card.cardType || 'Standard',
          baseOverall: Number(card.overallRating || 0),
          maxOverall: Number(card.maxOverall || 0),
          maxProgressionPoints: 0,
          pointsAvailable: 0,
          pointsUsed: 0,
          progression: null,
          source: 'eFootBase',
          sourceUrl,
          sourceVersion: 'eFootBase 2025/2026',
          status: 'NOT_AVAILABLE',
          dataVersion,
          importedAt: now
        };
        withoutProgression++;
      }
    }

    const report: ImportReport = {
      totalCards: efhubCards.length,
      matched,
      unmatched: efhubCards.length - matched,
      withProgression,
      withoutProgression,
      conflicts,
      invalid,
      datasetVersion: dataVersion,
      source: 'eFootBase',
      importedAt: now,
      sourceUrls: sourceUrls.slice(0, 50)
    };

    fs.writeFileSync(outDbPath, JSON.stringify(db, null, 2), 'utf8');
    fs.writeFileSync(outReportPath, JSON.stringify(report, null, 2), 'utf8');

    return { db, report };
  }
}

// If run directly via node/tsx
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = EfootbaseImporter.runImport();
  console.log('eFootBase Importer finished successfully!');
  console.log('Report:', JSON.stringify(result.report, null, 2));
}
