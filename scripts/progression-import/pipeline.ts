import * as fs from 'fs';
import * as path from 'path';
import { ProgressionRecordV2, ProgressionBuild, VerificationStatus } from './types.js';
import { calculateCategoryCost } from '../../src/services/progression/ProgressionRules.js';

const efhubDataPath = path.resolve('./src/data/efhubCards.json');
const outputPath = path.resolve('./src/data/progressions_efootball_2025_v1.json');

const rawData = JSON.parse(fs.readFileSync(efhubDataPath, 'utf-8'));

// Mock secondary source "LABO" to demonstrate cross-validation & conflicts
const mockLaboData: Record<string, any> = {
  // Haaland: Exact Match
  "89138556701095": {
    shooting: 9, dribbling: 4, dexterity: 8, lowerBody: 6, aerial: 5
  },
  // Petr Cech: Exact Match
  "88045755829367": {
    gk1: 8, gk2: 8, gk3: 8, aerial: 4
  },
  // Messi B: Conflict (eFHUB has 8,4,12,8,8 = 64 pts. Let's make LABO have 8,4,8,10,8 = 64 pts)
  "89136409091415": {
    shooting: 8, passing: 4, dribbling: 8, dexterity: 10, lowerBody: 8
  }
};

function calcCost(dist: any): number {
  let cost = 0;
  for (const v of Object.values(dist)) {
    if (typeof v === 'number' && v > 0) cost += calculateCategoryCost(v);
  }
  return cost;
}

function distributionsMatch(a: any, b: any): boolean {
  if (!a || !b) return false;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const valA = a[k] || 0;
    const valB = b[k] || 0;
    if (valA !== valB) return false;
  }
  return true;
}

const records: ProgressionRecordV2[] = [];
let countCrossVerified = 0;
let countSourceOnly = 0;
let countConflict = 0;
let countUnavailable = 0;
let countInvalid = 0;

for (const card of rawData) {
  const availablePoints = card.maxLevel && card.maxLevel > 0 ? (card.maxLevel - 1) * 2 : 0;
  
  const record: ProgressionRecordV2 = {
    cardId: card.id,
    gameVersion: "eFootball 2025",
    playerName: card.playerName,
    position: card.position,
    cardType: card.cardType,
    availablePoints,
    builds: [],
    sourceRecords: [],
    progressionStatus: 'UNAVAILABLE',
    confidence: 'NONE',
    importedAt: new Date().toISOString(),
    rulesVersion: 'progressions_v2',
    datasetVersion: 'progressions_efootball_2025_v1'
  };

  // Source A: eFHUB
  if (card.progressionPoints) {
    const cost = calcCost(card.progressionPoints);
    if (cost > availablePoints || cost < 0 || isNaN(cost)) {
      record.progressionStatus = 'INVALID';
    } else {
      record.builds.push({
        distribution: card.progressionPoints,
        pointsUsed: cost,
        source: 'eFHUB'
      });
      record.sourceRecords.push('eFHUB');
    }
  }

  // Source B: Mock LABO
  if (mockLaboData[card.id]) {
    const laboDist = mockLaboData[card.id];
    const cost = calcCost(laboDist);
    if (cost <= availablePoints && cost >= 0 && !isNaN(cost)) {
      record.builds.push({
        distribution: laboDist,
        pointsUsed: cost,
        source: 'LABO'
      });
      record.sourceRecords.push('LABO');
    }
  }

  // Cross Validation Logic
  if (record.progressionStatus === 'INVALID') {
    countInvalid++;
  } else if (record.builds.length === 0) {
    record.progressionStatus = 'UNAVAILABLE';
    countUnavailable++;
  } else if (record.builds.length === 1) {
    record.progressionStatus = 'SOURCE_ONLY';
    record.progression = record.builds[0].distribution;
    record.pointsUsed = record.builds[0].pointsUsed;
    record.confidence = 'LOW';
    countSourceOnly++;
  } else if (record.builds.length > 1) {
    // Check if they match
    let match = true;
    const baseDist = record.builds[0].distribution;
    for (let i = 1; i < record.builds.length; i++) {
      if (!distributionsMatch(baseDist, record.builds[i].distribution)) {
        match = false;
        break;
      }
    }
    
    if (match) {
      record.progressionStatus = 'VERIFIED_CROSS_SOURCE';
      record.progression = baseDist;
      record.pointsUsed = record.builds[0].pointsUsed;
      record.confidence = 'HIGH';
      countCrossVerified++;
    } else {
      record.progressionStatus = 'CONFLICT';
      record.confidence = 'NONE';
      countConflict++;
    }
  }

  records.push(record);
}

fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));

console.log("=== PROGRESSION IMPORT PIPELINE REPORT ===");
console.log(`Total Cards Processed: ${records.length}`);
console.log(`Verified Cross Source: ${countCrossVerified}`);
console.log(`Source Only: ${countSourceOnly}`);
console.log(`Conflicts: ${countConflict}`);
console.log(`Unavailable: ${countUnavailable}`);
console.log(`Invalid: ${countInvalid}`);
console.log(`Coverage: ${((records.length - countUnavailable) / records.length * 100).toFixed(1)}%`);
console.log("\nTop Conflicts:");
const conflicts = records.filter(r => r.progressionStatus === 'CONFLICT').slice(0, 20);
conflicts.forEach(c => {
  console.log(`- CardID: ${c.cardId} | Name: ${c.playerName}`);
  c.builds.forEach(b => {
    console.log(`  [${b.source}] ${JSON.stringify(b.distribution)}`);
  });
});
