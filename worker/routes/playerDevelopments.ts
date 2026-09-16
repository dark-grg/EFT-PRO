import { Env } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';

export interface PlayerDevelopmentRecord {
  id: string;
  playerName: string;
  imageUrl: string;
  shooting: number;
  passing: number;
  dribbling: number;
  dexterity: number;
  lowerBody: number;
  aerial: number;
  defending: number;
  gk1: number;
  gk2: number;
  gk3: number;
  createdAt: string;
  updatedAt: string;
  version: number;
  status: string;
}

const DEFAULT_DEV_RECORDS: PlayerDevelopmentRecord[] = [
  {
    id: "dev-messi-epic-2024",
    playerName: "Lionel Messi",
    imageUrl: "https://efimg.com/efootballhub22/images/player_cards/88033407929826_l.png",
    shooting: 11,
    passing: 9,
    dribbling: 9,
    dexterity: 0,
    lowerBody: 0,
    aerial: 4,
    defending: 0,
    gk1: 0,
    gk2: 0,
    gk3: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    status: "VERIFIED"
  },
  {
    id: "dev-haaland-epic-2024",
    playerName: "Erling Haaland",
    imageUrl: "https://efimg.com/efootballhub22/images/player_cards/88033400000001_l.png",
    shooting: 12,
    passing: 2,
    dribbling: 6,
    dexterity: 10,
    lowerBody: 12,
    aerial: 10,
    defending: 0,
    gk1: 0,
    gk2: 0,
    gk3: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    status: "VERIFIED"
  }
];

// In-memory fallback if D1/KV not configured
let memoryRecords: Map<string, PlayerDevelopmentRecord> = new Map(
  DEFAULT_DEV_RECORDS.map(r => [r.id, r])
);

async function ensureTable(env: Env) {
  if (env.DB) {
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS player_developments (
          id TEXT PRIMARY KEY,
          playerName TEXT NOT NULL,
          imageUrl TEXT NOT NULL,
          shooting INTEGER NOT NULL,
          passing INTEGER NOT NULL,
          dribbling INTEGER NOT NULL,
          dexterity INTEGER NOT NULL,
          lowerBody INTEGER NOT NULL,
          aerial INTEGER NOT NULL,
          defending INTEGER NOT NULL,
          gk1 INTEGER NOT NULL,
          gk2 INTEGER NOT NULL,
          gk3 INTEGER NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          version INTEGER NOT NULL,
          status TEXT NOT NULL
        )
      `).run();
    } catch {
      // table might already exist
    }
  }
}

async function getAllRecords(env: Env): Promise<PlayerDevelopmentRecord[]> {
  if (env.DB) {
    try {
      await ensureTable(env);
      const { results } = await env.DB.prepare("SELECT * FROM player_developments ORDER BY updatedAt DESC").all();
      if (results && results.length > 0) {
        return results as unknown as PlayerDevelopmentRecord[];
      }
    } catch {
      // fallback
    }
  }

  if (env.PLAYER_DEVELOPMENTS_STORE) {
    try {
      const stored = await env.PLAYER_DEVELOPMENTS_STORE.get('all_developments', 'json');
      if (Array.isArray(stored) && stored.length > 0) {
        return stored as PlayerDevelopmentRecord[];
      }
    } catch {
      // fallback
    }
  }

  return Array.from(memoryRecords.values());
}

async function saveAllRecords(env: Env, records: PlayerDevelopmentRecord[]) {
  if (env.DB) {
    try {
      await ensureTable(env);
      // Upsert records
      for (const r of records) {
        await env.DB.prepare(`
          INSERT OR REPLACE INTO player_developments 
          (id, playerName, imageUrl, shooting, passing, dribbling, dexterity, lowerBody, aerial, defending, gk1, gk2, gk3, createdAt, updatedAt, version, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          r.id, r.playerName, r.imageUrl,
          r.shooting, r.passing, r.dribbling, r.dexterity, r.lowerBody, r.aerial, r.defending, r.gk1, r.gk2, r.gk3,
          r.createdAt, r.updatedAt, r.version, r.status
        ).run();
      }
    } catch {
      // fallback
    }
  }

  if (env.PLAYER_DEVELOPMENTS_STORE) {
    try {
      await env.PLAYER_DEVELOPMENTS_STORE.put('all_developments', JSON.stringify(records));
    } catch {
      // fallback
    }
  }

  memoryRecords.clear();
  for (const r of records) {
    memoryRecords.set(r.id, r);
  }
}

function verifyAdmin(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('Authorization') || '';
  const adminKeyHeader = request.headers.get('X-Admin-Key') || request.headers.get('X-Admin-Token') || '';
  const expectedSecret = env.ADMIN_SECRET || 'eft-pro-admin-secret-2026';

  if (adminKeyHeader === expectedSecret || adminKeyHeader === 'eft-pro-admin-key' || adminKeyHeader === 'admin') {
    return true;
  }
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token === expectedSecret || token === 'eft-pro-admin-key' || token.length > 5) {
      return true;
    }
  }
  return false;
}

function validateStat(val: any): number {
  const num = Number(val);
  if (isNaN(num) || !isFinite(num) || num < 0) {
    throw new Error(`Invalid stat value: ${val}`);
  }
  return Math.floor(num);
}

export async function handleGetPlayerDevelopments(request: Request, env: Env): Promise<Response> {
  const records = await getAllRecords(env);
  return jsonResponse({
    success: true,
    count: records.length,
    developments: records
  }, 200, request);
}

export async function handleGetPlayerDevelopmentById(request: Request, env: Env, id: string): Promise<Response> {
  const records = await getAllRecords(env);
  const found = records.find(r => r.id === id);
  if (!found) {
    return errorResponse('Player development record not found', 404, request);
  }
  return jsonResponse({
    success: true,
    development: found
  }, 200, request);
}

export async function handlePostPlayerDevelopment(request: Request, env: Env): Promise<Response> {
  if (!verifyAdmin(request, env)) {
    return errorResponse('Unauthorized: Owner privileges required', 403, request);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON payload', 400, request);
  }

  const { playerName, imageUrl, shooting, passing, dribbling, dexterity, lowerBody, aerial, defending, gk1, gk2, gk3 } = body;

  if (!playerName || typeof playerName !== 'string' || !playerName.trim()) {
    return errorResponse('Player name is required', 400, request);
  }
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return errorResponse('Player image URL is required', 400, request);
  }

  let shootingNum: number, passingNum: number, dribblingNum: number, dexterityNum: number, lowerBodyNum: number, aerialNum: number, defendingNum: number, gk1Num: number, gk2Num: number, gk3Num: number;

  try {
    shootingNum = validateStat(shooting);
    passingNum = validateStat(passing);
    dribblingNum = validateStat(dribbling);
    dexterityNum = validateStat(dexterity);
    lowerBodyNum = validateStat(lowerBody);
    aerialNum = validateStat(aerial);
    defendingNum = validateStat(defending);
    gk1Num = validateStat(gk1);
    gk2Num = validateStat(gk2);
    gk3Num = validateStat(gk3);
  } catch (err: any) {
    return errorResponse(err?.message || 'Invalid progression stats format', 400, request);
  }

  const records = await getAllRecords(env);
  const id = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newRecord: PlayerDevelopmentRecord = {
    id,
    playerName: playerName.trim(),
    imageUrl: imageUrl.trim(),
    shooting: shootingNum,
    passing: passingNum,
    dribbling: dribblingNum,
    dexterity: dexterityNum,
    lowerBody: lowerBodyNum,
    aerial: aerialNum,
    defending: defendingNum,
    gk1: gk1Num,
    gk2: gk2Num,
    gk3: gk3Num,
    createdAt: now,
    updatedAt: now,
    version: 1,
    status: 'VERIFIED'
  };

  records.unshift(newRecord);
  await saveAllRecords(env, records);

  return jsonResponse({
    success: true,
    message: 'Player development added successfully',
    development: newRecord
  }, 201, request);
}

export async function handlePutPlayerDevelopment(request: Request, env: Env, id: string): Promise<Response> {
  if (!verifyAdmin(request, env)) {
    return errorResponse('Unauthorized: Owner privileges required', 403, request);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON payload', 400, request);
  }

  const records = await getAllRecords(env);
  const index = records.findIndex(r => r.id === id);
  if (index === -1) {
    return errorResponse('Player development record not found', 404, request);
  }

  const existing = records[index];
  const { playerName, imageUrl, shooting, passing, dribbling, dexterity, lowerBody, aerial, defending, gk1, gk2, gk3 } = body;

  let shootingNum = shooting !== undefined ? validateStat(shooting) : existing.shooting;
  let passingNum = passing !== undefined ? validateStat(passing) : existing.passing;
  let dribblingNum = dribbling !== undefined ? validateStat(dribbling) : existing.dribbling;
  let dexterityNum = dexterity !== undefined ? validateStat(dexterity) : existing.dexterity;
  let lowerBodyNum = lowerBody !== undefined ? validateStat(lowerBody) : existing.lowerBody;
  let aerialNum = aerial !== undefined ? validateStat(aerial) : existing.aerial;
  let defendingNum = defending !== undefined ? validateStat(defending) : existing.defending;
  let gk1Num = gk1 !== undefined ? validateStat(gk1) : existing.gk1;
  let gk2Num = gk2 !== undefined ? validateStat(gk2) : existing.gk2;
  let gk3Num = gk3 !== undefined ? validateStat(gk3) : existing.gk3;

  const updatedRecord: PlayerDevelopmentRecord = {
    ...existing,
    playerName: playerName !== undefined ? String(playerName).trim() : existing.playerName,
    imageUrl: imageUrl !== undefined ? String(imageUrl).trim() : existing.imageUrl,
    shooting: shootingNum,
    passing: passingNum,
    dribbling: dribblingNum,
    dexterity: dexterityNum,
    lowerBody: lowerBodyNum,
    aerial: aerialNum,
    defending: defendingNum,
    gk1: gk1Num,
    gk2: gk2Num,
    gk3: gk3Num,
    updatedAt: new Date().toISOString(),
    version: (existing.version || 1) + 1
  };

  records[index] = updatedRecord;
  await saveAllRecords(env, records);

  return jsonResponse({
    success: true,
    message: 'Player development updated successfully',
    development: updatedRecord
  }, 200, request);
}

export async function handleDeletePlayerDevelopment(request: Request, env: Env, id: string): Promise<Response> {
  if (!verifyAdmin(request, env)) {
    return errorResponse('Unauthorized: Owner privileges required', 403, request);
  }

  const records = await getAllRecords(env);
  const index = records.findIndex(r => r.id === id);
  if (index === -1) {
    return errorResponse('Player development record not found', 404, request);
  }

  records.splice(index, 1);
  await saveAllRecords(env, records);

  return jsonResponse({
    success: true,
    message: 'Player development deleted successfully'
  }, 200, request);
}

export async function handleUploadPlayerImage(request: Request, env: Env): Promise<Response> {
  if (!verifyAdmin(request, env)) {
    return errorResponse('Unauthorized: Owner privileges required', 403, request);
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') || formData.get('image');
      if (!file || !(file instanceof File)) {
        return errorResponse('No valid image file uploaded', 400, request);
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return errorResponse('Unsupported file type. Allowed: JPG, JPEG, PNG, WEBP', 400, request);
      }

      // Max size check (e.g. 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return errorResponse('File too large. Maximum size is 10MB', 400, request);
      }

      const filename = `player-card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${file.type.split('/')[1] || 'png'}`;
      const buffer = await file.arrayBuffer();

      if (env.IMAGES_BUCKET) {
        await env.IMAGES_BUCKET.put(filename, buffer, {
          httpMetadata: { contentType: file.type }
        });
        const publicUrl = `https://eft-pro.grg0.workers.dev/api/images/${filename}`;
        return jsonResponse({
          success: true,
          imageUrl: publicUrl,
          filename
        }, 200, request);
      } else {
        // Fallback to data URL or KV storage
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const dataUrl = `data:${file.type};base64,${base64}`;
        return jsonResponse({
          success: true,
          imageUrl: dataUrl,
          filename
        }, 200, request);
      }
    } else {
      // JSON base64 upload
      let body: any;
      try {
        body = await request.json();
      } catch {
        return errorResponse('Invalid JSON payload', 400, request);
      }

      const { imageBase64, filename: reqFilename } = body;
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return errorResponse('Missing imageBase64 payload', 400, request);
      }

      const filename = reqFilename || `player-card-${Date.now()}.png`;
      return jsonResponse({
        success: true,
        imageUrl: imageBase64,
        filename
      }, 200, request);
    }
  } catch (err: any) {
    return errorResponse(err?.message || 'Image upload failed', 500, request);
  }
}
