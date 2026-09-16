import fs from 'fs';
import path from 'path';

// Position indices in eFHUB
const POSITION_MAP = {
  GK: 0, CB: 1, LB: 2, RB: 3, DMF: 4, CMF: 5,
  LMF: 6, RMF: 7, AMF: 8, LWF: 9, RWF: 10, SS: 11, CF: 12
};

// Official weights matrix from eFHUB
const WEIGHTS = [
  186,136,49,49,61,37,12,12,37,49,49,62,99,0,14,61,61,61,98,98,98,171,159,159,173,210,
  13,27,86,86,122,171,171,171,196,159,159,210,123,0,14,61,61,37,98,110,122,122,159,159,
  123,62,0,0,37,37,24,49,73,61,73,86,86,86,37,27,41,61,61,122,208,135,135,196,73,73,99,
  37,40,68,147,147,122,159,196,196,159,98,98,74,12,0,27,24,24,37,73,86,86,184,159,159,
  284,358,0,14,24,24,12,12,24,24,12,12,12,12,12,0,14,24,24,12,12,24,24,12,12,12,12,12,
  0,55,24,24,61,24,12,12,24,24,24,25,62,13,286,147,147,220,86,49,49,24,12,12,0,0,0,191,
  86,86,122,86,24,24,24,12,12,12,12,0,82,37,37,98,37,12,12,12,12,12,12,12,53,27,24,24,
  49,73,24,24,73,61,61,99,123,13,136,220,220,61,61,196,196,98,220,220,86,99,40,150,184,
  184,61,86,159,159,86,159,159,99,123,80,204,98,98,122,49,24,24,24,37,37,37,86,0,0,24,
  24,12,24,61,61,24,73,73,74,86,133,109,37,37,37,12,12,12,12,24,24,37,62,279,0,0,0,0,0,
  0,0,0,0,0,0,0,226,0,0,0,0,0,0,0,0,0,0,0,0,226,0,0,0,0,0,0,0,0,0,0,0,0,173,0,0,0,0,0,
  0,0,0,0,0,0,0,173,0,0,0,0,0,0,0,0,0,0,0,0,0,68,196,196,196,196,147,147,86,49,49,49,
  37,4,4,4,4,4,4,4,4,4,4,4,4,4,0,14,24,24,24,24,24,24,24,24,24,12,12
];

function r(e) {
  return e > 25 ? e - 25 : 0;
}

export function computeOvrDec(e) {
  const { position: o, height: i, weakFootAccuracy: n, stats: s } = e;
  const l = POSITION_MAP[o];
  if (l === undefined) return null;
  const c = (idx) => WEIGHTS[idx + l];
  const sum =
    c(0) * r(i - 111) +
    c(13) * r(s.offensiveAwareness || 40) +
    c(26) * r(s.ballControl || 40) +
    c(39) * r(s.dribbling || 40) +
    c(52) * r(s.tightPossession || 40) +
    c(65) * r(s.lowPass || 40) +
    c(78) * r(s.loftedPass || 40) +
    c(91) * r(s.finishing || 40) +
    c(104) * r(s.setPieceTaking || 40) +
    c(117) * r(s.curl || 40) +
    c(130) * r(s.heading || 40) +
    c(143) * r(s.defensiveAwareness || 40) +
    c(156) * r(s.ballWinning || 40) +
    c(169) * r(s.aggression || 40) +
    c(182) * r(s.kickingPower || 40) +
    c(195) * r(s.speed || 40) +
    c(208) * r(s.acceleration || 40) +
    c(221) * r(s.physicalContact || 40) +
    c(234) * r(s.balance || 40) +
    c(247) * r(s.jump || 40) +
    c(260) * r(s.gkAwareness || 40) +
    c(273) * r(s.gkReach || 40) +
    c(286) * r(s.gkCatching || 40) +
    c(299) * r(s.gkClearing || 40) +
    c(312) * r(s.gkReflexes || 40) +
    c(325) * r(s.stamina || 40) +
    c(338) * r(Math.floor((59 * (n ?? 2)) / 3 + 40)) +
    c(351) * r(s.defensiveEngagement || 40);

  return sum === null ? 70 : Math.round((100 * Math.max((sum + 500) / 1000, 40))) / 100;
}

export function computeOverallRating(e) {
  const dec = computeOvrDec(e);
  return dec === null ? 70 : Math.floor(dec);
}

export const SLIDERS_DEF = [
  { key: "shooting", label: "Shooting", affectedStats: ["finishing", "setPieceTaking", "curl"] },
  { key: "passing", label: "Passing", affectedStats: ["lowPass", "loftedPass"] },
  { key: "dribbling", label: "Dribbling", affectedStats: ["ballControl", "dribbling", "tightPossession"] },
  { key: "dexterity", label: "Dexterity", affectedStats: ["offensiveAwareness", "acceleration", "balance"] },
  { key: "lowerBodyStrength", label: "Lower Body Str.", affectedStats: ["speed", "kickingPower", "stamina"] },
  { key: "aerialStrength", label: "Aerial Strength", affectedStats: ["heading", "jump", "physicalContact"] },
  { key: "defending", label: "Defending", affectedStats: ["defensiveAwareness", "ballWinning", "aggression", "defensiveEngagement"] },
  { key: "gk1", label: "GK 1", affectedStats: ["gkAwareness", "jump"] },
  { key: "gk2", label: "GK 2", affectedStats: ["gkClearing", "gkReach"] },
  { key: "gk3", label: "GK 3", affectedStats: ["gkCatching", "gkReflexes"] }
];

function stepCost(val) {
  return Math.ceil(val / 4);
}

export function applyProgression(baseStats, sliders) {
  const r = { ...baseStats };
  for (const s of SLIDERS_DEF) {
    const val = sliders[s.key] || 0;
    if (val > 0) {
      for (const statName of s.affectedStats) {
        r[statName] = Math.min(99, (r[statName] || 40) + val);
      }
    }
  }
  return r;
}

export function computeMaxSliders(baseStats, position, height, weakFootAccuracy, availablePoints) {
  const c = {
    shooting: 0, passing: 0, dribbling: 0, dexterity: 0,
    lowerBodyStrength: 0, aerialStrength: 0, defending: 0,
    gk1: 0, gk2: 0, gk3: 0
  };
  let d = availablePoints;

  while (d > 0) {
    let bestKey = null;
    let bestGain = -Infinity;
    const currentStats = applyProgression(baseStats, c);
    const currentOvrDec = computeOvrDec({ position, height, weakFootAccuracy, stats: currentStats }) || 70;

    for (const slider of SLIDERS_DEF) {
      const currentVal = c[slider.key];
      if (currentVal >= 25) continue;
      const nextVal = currentVal + 1;
      const cost = stepCost(nextVal);
      if (cost > d) continue;

      const testStats = applyProgression(baseStats, { ...c, [slider.key]: nextVal });
      const testOvrDec = computeOvrDec({ position, height, weakFootAccuracy, stats: testStats }) || 70;
      const efficiency = (testOvrDec - currentOvrDec) / cost;

      if (efficiency > bestGain) {
        bestGain = efficiency;
        bestKey = slider.key;
      }
    }

    if (!bestKey || bestGain <= 0) break;
    c[bestKey]++;
    d -= stepCost(c[bestKey]);
  }

  // Use up leftover points if any
  if (d > 0) {
    for (const slider of SLIDERS_DEF) {
      while (c[slider.key] < 25 && d > 0) {
        const cost = stepCost(c[slider.key] + 1);
        if (cost > d) break;
        c[slider.key]++;
        d -= cost;
      }
      if (d === 0) break;
    }
  }

  return c;
}

async function fetchFromEfhub(id) {
  try {
    const res = await fetch(`https://efhub.com/tr/players/${id}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      signal: AbortSignal.timeout(4500)
    });
    if (!res.ok) return null;
    const html = await res.text();

    const pushRegex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
    let rsc = "";
    let m;
    while ((m = pushRegex.exec(html)) !== null) {
      try {
        rsc += JSON.parse(`"${m[1]}"`);
      } catch {
        rsc += m[1];
      }
    }

    const idx = rsc.indexOf("baseStats");
    if (idx === -1) return null;

    const sub = rsc.slice(idx - 10, idx + 3000);
    const baseStatsMatch = sub.match(/"baseStats":(\{[\s\S]*?\})/);
    if (!baseStatsMatch) return null;

    const baseStats = JSON.parse(baseStatsMatch[1]);
    const posMatch = sub.match(/"position":"([^"]+)"/);
    const heightMatch = sub.match(/"height":(\d+)/);
    const wfaMatch = sub.match(/"weakFootAccuracy":(\d+)/);
    const levelCapMatch = sub.match(/"initialLevelCap":(\d+)/);
    const ovrMatch = sub.match(/"overallRating":(\d+)/);
    const playingStyleMatch = sub.match(/"playingStyle":"([^"]+)"/);

    const position = posMatch ? posMatch[1] : "CF";
    const height = heightMatch ? parseInt(heightMatch[1], 10) : 175;
    const weakFootAccuracy = wfaMatch ? parseInt(wfaMatch[1], 10) : 2;
    const levelCap = levelCapMatch ? parseInt(levelCapMatch[1], 10) : 28;
    const availablePoints = Math.max(0, (levelCap - 1) * 2);

    const baseOvr = ovrMatch ? parseInt(ovrMatch[1], 10) : computeOverallRating({ position, height, weakFootAccuracy, stats: baseStats });
    const sliders = computeMaxSliders(baseStats, position, height, weakFootAccuracy, availablePoints);
    const maxStats = applyProgression(baseStats, sliders);
    const maxOvr = computeOverallRating({ position, height, weakFootAccuracy, stats: maxStats });

    return {
      baseStats,
      position,
      height,
      weakFootAccuracy,
      levelCap,
      availablePoints,
      baseOvr,
      maxOvr,
      sliders,
      maxStats,
      playingStyle: playingStyleMatch ? playingStyleMatch[1] : undefined
    };
  } catch {
    return null;
  }
}

async function main() {
  const filePath = path.join(process.cwd(), "src", "data", "efhubCards.json");
  const dataCardsPath = path.join(process.cwd(), "data", "playerCards.json");

  const cards = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Starting enrichment of ${cards.length} cards directly from eFHUB...`);

  let successCount = 0;
  let fallbackCount = 0;

  const BATCH_SIZE = 12;
  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const batch = cards.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (card) => {
        const id = card.sourceCardId || card.id;
        const fetched = await fetchFromEfhub(id);
        return { card, fetched };
      })
    );

    for (const { card, fetched } of results) {
      if (fetched) {
        card.baseStats = fetched.baseStats;
        card.position = fetched.position || card.position;
        card.height = fetched.height;
        card.weakFootAccuracy = fetched.weakFootAccuracy;
        card.level = 1;
        card.maxLevel = fetched.levelCap;
        card.overall = fetched.baseOvr;
        card.maxOverall = fetched.maxOvr;
        card.progressionPoints = {
          shooting: fetched.sliders.shooting || 0,
          passing: fetched.sliders.passing || 0,
          dribbling: fetched.sliders.dribbling || 0,
          dexterity: fetched.sliders.dexterity || 0,
          lowerBody: fetched.sliders.lowerBodyStrength || 0,
          aerial: fetched.sliders.aerialStrength || 0,
          defending: fetched.sliders.defending || 0,
          gk1: fetched.sliders.gk1 || 0,
          gk2: fetched.sliders.gk2 || 0,
          gk3: fetched.sliders.gk3 || 0
        };
        if (fetched.playingStyle) {
          card.playingStyle = fetched.playingStyle;
        }
        successCount++;
      } else {
        // Fallback calculation with authentic math
        const pos = card.position || "CF";
        const height = card.height || 175;
        const wfa = card.weakFootAccuracy || 2;
        const levelCap = card.maxLevel || 28;
        const pts = Math.max(0, (levelCap - 1) * 2);
        const sliders = computeMaxSliders(card.baseStats, pos, height, wfa, pts);
        const maxStats = applyProgression(card.baseStats, sliders);
        const maxOvr = computeOverallRating({ position: pos, height, weakFootAccuracy: wfa, stats: maxStats });

        card.maxOverall = maxOvr;
        card.progressionPoints = {
          shooting: sliders.shooting || 0,
          passing: sliders.passing || 0,
          dribbling: sliders.dribbling || 0,
          dexterity: sliders.dexterity || 0,
          lowerBody: sliders.lowerBodyStrength || 0,
          aerial: sliders.aerialStrength || 0,
          defending: sliders.defending || 0,
          gk1: sliders.gk1 || 0,
          gk2: sliders.gk2 || 0,
          gk3: sliders.gk3 || 0
        };
        fallbackCount++;
      }
    }

    if ((i + BATCH_SIZE) % 60 === 0 || i + BATCH_SIZE >= cards.length) {
      console.log(`Progress: ${Math.min(i + BATCH_SIZE, cards.length)} / ${cards.length} cards processed.`);
    }
  }

  // Save updated cards
  fs.writeFileSync(filePath, JSON.stringify(cards, null, 2), "utf-8");
  if (fs.existsSync(dataCardsPath)) {
    fs.writeFileSync(dataCardsPath, JSON.stringify(cards, null, 2), "utf-8");
  }

  console.log(`Enrichment complete! Fetched: ${successCount}, Math Fallbacks: ${fallbackCount}`);
}

main();
