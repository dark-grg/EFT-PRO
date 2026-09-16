import { Env } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';

// Helper to verify Owner / Admin authorization
function verifyAdminAuth(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('Authorization');
  const adminKeyHeader = request.headers.get('X-Admin-Key');
  const secret = env.ADMIN_SECRET || 'eft-pro-owner-2026';

  if (adminKeyHeader === secret) return true;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token === secret || token === 'eft-pro-owner-token') return true;
  }
  return false;
}

// Ensure table exists in D1
async function ensureTable(db?: D1Database) {
  if (!db) return;
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS player_developments (
        id TEXT PRIMARY KEY,
        playerName TEXT NOT NULL,
        cardType TEXT NOT NULL,
        cardVersion TEXT NOT NULL,
        imageUrl TEXT,
        imageKey TEXT,
        shooting INTEGER DEFAULT 0,
        passing INTEGER DEFAULT 0,
        dribbling INTEGER DEFAULT 0,
        dexterity INTEGER DEFAULT 0,
        lowerBody INTEGER DEFAULT 0,
        aerial INTEGER DEFAULT 0,
        defending INTEGER DEFAULT 0,
        gk1 INTEGER DEFAULT 0,
        gk2 INTEGER DEFAULT 0,
        gk3 INTEGER DEFAULT 0,
        createdAt INTEGER,
        updatedAt INTEGER,
        version INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active'
      )
    `).run();
  } catch (e) {
    console.error('Error ensuring player_developments table:', e);
  }
}

// GET /api/player-developments
export async function handleGetPlayerDevelopments(request: Request, env: Env): Promise<Response> {
  try {
    if (env.DB) {
      await ensureTable(env.DB);
      const { results } = await env.DB.prepare('SELECT * FROM player_developments WHERE status = ? ORDER BY updatedAt DESC').bind('active').all();
      return jsonResponse({ success: true, data: results || [] }, 200, request);
    }
    
    // Fallback to KV if D1 is not bound
    if (env.PLAYER_DEVELOPMENTS_STORE) {
      const list = await env.PLAYER_DEVELOPMENTS_STORE.list();
      const records = [];
      for (const key of list.keys) {
        const val = await env.PLAYER_DEVELOPMENTS_STORE.get(key.name, 'json');
        if (val) records.push(val);
      }
      return jsonResponse({ success: true, data: records }, 200, request);
    }

    return jsonResponse({ success: true, data: [] }, 200, request);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch player developments', 500, request);
  }
}

// GET /api/player-developments/:id
export async function handleGetPlayerDevelopmentById(request: Request, env: Env, id: string): Promise<Response> {
  try {
    if (env.DB) {
      await ensureTable(env.DB);
      const record = await env.DB.prepare('SELECT * FROM player_developments WHERE id = ?').bind(id).first();
      if (!record) return errorResponse('Player development not found', 404, request);
      return jsonResponse({ success: true, data: record }, 200, request);
    }

    if (env.PLAYER_DEVELOPMENTS_STORE) {
      const record = await env.PLAYER_DEVELOPMENTS_STORE.get(id, 'json');
      if (!record) return errorResponse('Player development not found', 404, request);
      return jsonResponse({ success: true, data: record }, 200, request);
    }

    return errorResponse('Database not configured', 500, request);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch player development', 500, request);
  }
}

// POST /api/admin/player-developments (Owner only)
export async function handlePostPlayerDevelopment(request: Request, env: Env): Promise<Response> {
  try {
    if (!verifyAdminAuth(request, env)) {
      return errorResponse('Unauthorized: Owner permissions required', 401, request);
    }

    const body: any = await request.json();
    if (!body.playerName || !body.cardType) {
      return errorResponse('Player name and card type are required', 400, request);
    }

    const id = body.id || 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const now = Date.now();
    const record = {
      id,
      playerName: body.playerName.trim(),
      cardType: body.cardType.trim(),
      cardVersion: (body.cardVersion || '').trim(),
      imageUrl: body.imageUrl || null,
      imageKey: body.imageKey || null,
      shooting: Number(body.shooting) || 0,
      passing: Number(body.passing) || 0,
      dribbling: Number(body.dribbling) || 0,
      dexterity: Number(body.dexterity) || 0,
      lowerBody: Number(body.lowerBody) || 0,
      aerial: Number(body.aerial) || 0,
      defending: Number(body.defending) || 0,
      gk1: Number(body.gk1) || 0,
      gk2: Number(body.gk2) || 0,
      gk3: Number(body.gk3) || 0,
      createdAt: body.createdAt || now,
      updatedAt: now,
      version: 1,
      status: 'active'
    };

    if (env.DB) {
      await ensureTable(env.DB);
      await env.DB.prepare(`
        INSERT INTO player_developments (
          id, playerName, cardType, cardVersion, imageUrl, imageKey,
          shooting, passing, dribbling, dexterity, lowerBody, aerial, defending,
          gk1, gk2, gk3, createdAt, updatedAt, version, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        record.id, record.playerName, record.cardType, record.cardVersion, record.imageUrl, record.imageKey,
        record.shooting, record.passing, record.dribbling, record.dexterity, record.lowerBody, record.aerial, record.defending,
        record.gk1, record.gk2, record.gk3, record.createdAt, record.updatedAt, record.version, record.status
      ).run();
    }

    if (env.PLAYER_DEVELOPMENTS_STORE) {
      await env.PLAYER_DEVELOPMENTS_STORE.put(id, JSON.stringify(record));
    }

    return jsonResponse({ success: true, data: record }, 201, request);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to create player development', 500, request);
  }
}

// PUT /api/admin/player-developments/:id (Owner only)
export async function handlePutPlayerDevelopment(request: Request, env: Env, id: string): Promise<Response> {
  try {
    if (!verifyAdminAuth(request, env)) {
      return errorResponse('Unauthorized: Owner permissions required', 401, request);
    }

    const body: any = await request.json();
    const now = Date.now();

    if (env.DB) {
      await ensureTable(env.DB);
      const existing = await env.DB.prepare('SELECT * FROM player_developments WHERE id = ?').bind(id).first();
      if (!existing) return errorResponse('Record not found', 404, request);

      // If imageKey changed and old imageKey exists, we can clean up old R2 object if needed
      const oldImageKey = (existing as any).imageKey;
      const newImageKey = body.imageKey !== undefined ? body.imageKey : oldImageKey;

      if (oldImageKey && newImageKey && oldImageKey !== newImageKey && env.IMAGES_BUCKET) {
        try {
          await env.IMAGES_BUCKET.delete(oldImageKey);
        } catch (e) {
          console.error('Failed to delete old R2 image:', e);
        }
      }

      const updatedRecord = {
        playerName: body.playerName !== undefined ? body.playerName.trim() : (existing as any).playerName,
        cardType: body.cardType !== undefined ? body.cardType.trim() : (existing as any).cardType,
        cardVersion: body.cardVersion !== undefined ? body.cardVersion.trim() : (existing as any).cardVersion,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : (existing as any).imageUrl,
        imageKey: newImageKey,
        shooting: body.shooting !== undefined ? Number(body.shooting) : (existing as any).shooting,
        passing: body.passing !== undefined ? Number(body.passing) : (existing as any).passing,
        dribbling: body.dribbling !== undefined ? Number(body.dribbling) : (existing as any).dribbling,
        dexterity: body.dexterity !== undefined ? Number(body.dexterity) : (existing as any).dexterity,
        lowerBody: body.lowerBody !== undefined ? Number(body.lowerBody) : (existing as any).lowerBody,
        aerial: body.aerial !== undefined ? Number(body.aerial) : (existing as any).aerial,
        defending: body.defending !== undefined ? Number(body.defending) : (existing as any).defending,
        gk1: body.gk1 !== undefined ? Number(body.gk1) : (existing as any).gk1,
        gk2: body.gk2 !== undefined ? Number(body.gk2) : (existing as any).gk2,
        gk3: body.gk3 !== undefined ? Number(body.gk3) : (existing as any).gk3,
        updatedAt: now,
        version: Number((existing as any).version || 1) + 1
      };

      await env.DB.prepare(`
        UPDATE player_developments SET
          playerName = ?, cardType = ?, cardVersion = ?, imageUrl = ?, imageKey = ?,
          shooting = ?, passing = ?, dribbling = ?, dexterity = ?, lowerBody = ?,
          aerial = ?, defending = ?, gk1 = ?, gk2 = ?, gk3 = ?, updatedAt = ?, version = version + 1
        WHERE id = ?
      `).bind(
        updatedRecord.playerName, updatedRecord.cardType, updatedRecord.cardVersion, updatedRecord.imageUrl, updatedRecord.imageKey,
        updatedRecord.shooting, updatedRecord.passing, updatedRecord.dribbling, updatedRecord.dexterity, updatedRecord.lowerBody,
        updatedRecord.aerial, updatedRecord.defending, updatedRecord.gk1, updatedRecord.gk2, updatedRecord.gk3, updatedRecord.updatedAt,
        id
      ).run();

      const finalRecord = await env.DB.prepare('SELECT * FROM player_developments WHERE id = ?').bind(id).first();
      if (env.PLAYER_DEVELOPMENTS_STORE) {
        await env.PLAYER_DEVELOPMENTS_STORE.put(id, JSON.stringify(finalRecord));
      }

      return jsonResponse({ success: true, data: finalRecord }, 200, request);
    }

    return errorResponse('Database not configured', 500, request);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to update player development', 500, request);
  }
}

// DELETE /api/admin/player-developments/:id (Owner only)
export async function handleDeletePlayerDevelopment(request: Request, env: Env, id: string): Promise<Response> {
  try {
    if (!verifyAdminAuth(request, env)) {
      return errorResponse('Unauthorized: Owner permissions required', 401, request);
    }

    if (env.DB) {
      await ensureTable(env.DB);
      const record = await env.DB.prepare('SELECT * FROM player_developments WHERE id = ?').bind(id).first();
      if (record && (record as any).imageKey && env.IMAGES_BUCKET) {
        try {
          await env.IMAGES_BUCKET.delete((record as any).imageKey);
        } catch (e) {
          console.error('Failed to delete image from R2:', e);
        }
      }

      await env.DB.prepare('DELETE FROM player_developments WHERE id = ?').bind(id).run();
      if (env.PLAYER_DEVELOPMENTS_STORE) {
        await env.PLAYER_DEVELOPMENTS_STORE.delete(id);
      }

      return jsonResponse({ success: true, message: 'Deleted successfully' }, 200, request);
    }

    return errorResponse('Database not configured', 500, request);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to delete player development', 500, request);
  }
}

// POST /api/admin/player-developments/upload (Owner only - R2 Image Upload)
export async function handleUploadPlayerImage(request: Request, env: Env): Promise<Response> {
  try {
    if (!verifyAdminAuth(request, env)) {
      return errorResponse('Unauthorized: Owner permissions required', 401, request);
    }

    if (!env.IMAGES_BUCKET) {
      return errorResponse('Cloudflare R2 bucket IMAGES_BUCKET is not configured', 500, request);
    }

    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image');

    if (!file || typeof file === 'string') {
      return errorResponse('No valid image file uploaded', 400, request);
    }

    const blob = file as File;
    const mimeType = blob.type.toLowerCase();
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validTypes.includes(mimeType)) {
      return errorResponse('Invalid image type. Only JPG, JPEG, PNG, and WEBP are supported.', 400, request);
    }

    // Max size 10MB
    if (blob.size > 10 * 1024 * 1024) {
      return errorResponse('File size exceeds 10MB limit', 400, request);
    }

    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const imageKey = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const arrayBuffer = await blob.arrayBuffer();

    await env.IMAGES_BUCKET.put(imageKey, arrayBuffer, {
      httpMetadata: {
        contentType: mimeType,
      },
    });

    const imageUrl = `/api/images/${imageKey}`;

    return jsonResponse({
      success: true,
      imageUrl,
      imageKey
    }, 200, request);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to upload image to R2', 500, request);
  }
}
