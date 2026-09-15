import { Env } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';
import { analyzeFormationWithGemini } from '../services/geminiService';

export async function handleAnalyzeFormation(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method Not Allowed', 405, request);
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorResponse('خدمة تحليل التشكيلة غير مهيأة حالياً.', 500, request);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400, request);
  }

  const image = body?.image;
  if (!image || typeof image !== 'string') {
    return errorResponse('الصورة غير صالحة أو لم يتم إرسالها بشكل صحيح.', 400, request);
  }

  const cleanBase64 = image.includes(',') ? image.split(',')[1] : image;

  const systemInstruction = `أنت محلل تكتيكي وخبير رؤية حاسوبية (Vision AI) متخصص في لقطات شاشات تشكيلات وخطة اللعب في ألعاب كرة القدم، وبشكل خاص eFootball و PES.
مهمتك فحص لقطة الشاشة (Screenshot) بدقة هندسية متناهية واستخراج البيانات التكتيكية الحقيقية فقط بدون أي تخمين أو اختراع.

قواعد صارمة لا تقبل الاستثناء:
1. تحقق أولاً هل الصورة تمثل لقطة شاشة حقيقية لخطة لعب / تشكيلة كرة قدم ('isFormationScreenshot': true أو false). إذا لم تكن كذلك، اجعل 'isReliable': false واجعل 'tacticalRating': null وضع السبب في 'unreliableReason'.
2. إذا كانت الصورة غير واضحة، مشوشة، مقطوعة، أو لم تظهر فيها بطاقات اللاعبين أو اسم التشكيلة، اجعل 'isReliable': false واجعل 'tacticalRating': null و 'unreliableReason': "لم أتمكن من قراءة التشكيلة بشكل موثوق، يرجى رفع صورة أوضح لخطة اللعب."
3. استخرج التشكيلة المستخدمة (مثل '4-2-1-3', '4-3-3', '4-2-2-2', '5-3-2', '4-1-2-3', '3-2-2-3', '4-4-2'). إذا لم تجد اسم التشكيلة مكتوباً صراحة بنص الشاشة، فاحسب عدد اللاعبين في كل خط (دفاع - وسط - هجوم) واستنتج التشكيلة بدقة هندسية، أو اجعلها null إذا تعذر الاستنتاج، لكن لا تمسح اللاعبين.
4. استخرج اسم المدرب (Coach) وأسلوب اللعب (Team Playstyle) مثل 'Quick Counter', 'Possession Game', 'Long Ball Counter', 'Out Wide' إن كانت ظاهرة بالصورة، وإلا اتركها فارغة "".
5. استخرج قوة الفريق أو التقييم الظاهر (Team Strength / Rating) إن وجد.
6. إذا كانت التشكيلة مقروءة بنجاح، قيم التشكيلة تكتيكياً بناءً على توازن الخطوط والترابط (tacticalRating من 0 إلى 100). أما إذا لم تكن كافية، اجعل tacticalRating: null، وممنوع منعاً باتاً وضع 85 أو أي رقم عشوائي.
7. استخرج نقاط القوة الحقيقية للتشكيلة المحددة (strengths: 3 إلى 4 نقاط باللغة العربية بناءً على مراكز اللاعبين وأسلوب اللعب المكتشف).
8. استخرج نقاط الضعف والثغرات التكتيكية (weaknesses: 3 إلى 4 نقاط باللغة العربية مثل المساحات خلف الأظهرة، ضعف المساندة، إلخ).
9. قدم نصائح تكتيكية دقيقة وقابلة للتطبيق (tacticalAdvice: 3 إلى 4 نصائح باللغة العربية).
10. بالنسبة للاعبين الأساسيين في أرضية الملعب (detectedPlayers):
    - استخرج كل لاعب ظاهر في التشكيلة الأساسية على عشب الملعب (حتى 11 لاعباً):
      * name: اسم اللاعب كما هو مكتوب بدقة على البطاقة/الملصق. إذا لم يكن واضحاً، اكتب 'unknown' واجعل isClear: false. لا تخترع أسماء!
      * position: رمز المركز الدقيق ('GK', 'CB', 'LB', 'RB', 'DMF', 'CMF', 'AMF', 'LMF', 'RMF', 'LWF', 'RWF', 'SS', 'CF').
      * rating: رقم التقييم العام (Overall) الظاهر على بطاقة اللاعب (مثل 102, 99, 97, 95). إذا كان غير مقروء، اجعله null. لا تخترع أرقاماً!
      * isClear: true إذا كان اسم اللاعب والمركز مقروءين بوضوح، و false إذا كان الاسم مموهاً أو غير مؤكد.
      * pitchX: موضع اللاعب الأفقي بالنسبة المئوية في الملعب (0 = أقصى اليسار، 50 = المنتصف، 100 = أقصى اليمين).
      * pitchY: موضع اللاعب الرأسي بالنسبة المئوية في الملعب (0 = خط الهجوم العلوي، 50 = دائرة السنتر، 100 = منطقة حارس المرمى السفلية).
11. ممنوع منعاً باتاً اختراع أي اسم لاعب أو تقييم. الالتزام بالحقيقة المرئية في الصورة فقط.
12. فصل التعرف على اللاعبين عن اسم التشكيلة: إذا تم رصد 3 لاعبين على الأقل ومواقعهم واضحة، فاجعل isReliable: true حتى لو كان formationName فارغاً أو null.
13. الرد يجب أن يكون بصيغة JSON نقية ومطابقة للمخطط التالي فقط.`;

  const prompt = `افحص لقطة شاشة التشكيلة بعناية تامة وأرجع كائن JSON بالهيكل التالي:
{
  "isFormationScreenshot": boolean,
  "isReliable": boolean,
  "unreliableReason": string,
  "gameName": string,
  "formationName": string,
  "coachName": string,
  "playstyle": string,
  "teamStrength": string,
  "tacticalRating": number,
  "strengths": [string],
  "weaknesses": [string],
  "tacticalAdvice": [string],
  "detectedPlayers": [
    {
      "name": string,
      "position": string,
      "rating": number,
      "isClear": boolean,
      "confidence": number,
      "pitchX": number,
      "pitchY": number
    }
  ]
}`;

  try {
    const rawResult = await analyzeFormationWithGemini(apiKey, cleanBase64, prompt, systemInstruction);
    
    // Log safe raw response keys in development
    console.log('Gemini Raw Response Keys:', Object.keys(rawResult || {}));

    const canonicalResult = normalizeFormationResult(rawResult);
    return jsonResponse(canonicalResult, 200, request);
  } catch (error: any) {
    const msg = (error?.message || '').toLowerCase();
    if (msg.includes('invalid') || msg.includes('decode') || msg.includes('image') || msg.includes('argument')) {
      return jsonResponse({
        isFormationScreenshot: false,
        isReliable: false,
        unreliableReason: 'الصورة المرفوعة غير صالحة أو تالفة، يرجى رفع لقطة شاشة واضحة لخطة اللعب.',
        gameName: null,
        formationName: null,
        tacticalRating: null,
        detectedPlayers: [],
        coachName: null,
        playstyle: null,
        teamStrength: null,
        strengths: [],
        weaknesses: [],
        tacticalAdvice: []
      }, 200, request);
    }
    return errorResponse(error?.message || 'تعذر فحص الصورة عبر خوادم الذكاء الاصطناعي.', 500, request);
  }
}

/**
 * Normalizes any Gemini AI response into the exact canonical schema
 */
export function normalizeFormationResult(raw: any) {
  const isFormationScreenshot = raw?.isFormationScreenshot !== false;
  const isReliable = raw?.isReliable !== false && isFormationScreenshot;
  const unreliableReason = isReliable 
    ? null 
    : (raw?.unreliableReason || (!isFormationScreenshot ? 'الصورة المرفوعة ليست لقطة شاشة لتشكيلة كرة قدم صالحة.' : 'لم أتمكن من قراءة التشكيلة بشكل موثوق، يرجى رفع صورة أوضح.'));

  // Formation Name normalization (formation -> formationName)
  const formationName = typeof raw?.formationName === 'string' && raw.formationName.trim()
    ? raw.formationName.trim()
    : (typeof raw?.formation === 'string' && raw.formation.trim() ? raw.formation.trim() : null);

  // Tactical Rating (must be genuine tactical rating, not overall rating)
  let tacticalRating: number | null = null;
  if (typeof raw?.tacticalRating === 'number' && Number.isFinite(raw.tacticalRating)) {
    tacticalRating = Math.round(raw.tacticalRating);
  } else if (typeof raw?.tacticalScore === 'number' && Number.isFinite(raw.tacticalScore)) {
    tacticalRating = Math.round(raw.tacticalScore);
  }

  // Players normalization (players -> detectedPlayers)
  const rawPlayers = Array.isArray(raw?.detectedPlayers) 
    ? raw.detectedPlayers 
    : (Array.isArray(raw?.players) ? raw.players : []);

  const detectedPlayers = rawPlayers.map((p: any) => {
    const name = String(p?.name || p?.playerName || '').trim() || 'unknown';
    const position = String(p?.position || p?.pos || 'CF').trim().toUpperCase();
    
    let rating: number | null = null;
    if (typeof p?.rating === 'number' && Number.isFinite(p.rating)) {
      rating = Math.round(p.rating);
    } else if (typeof p?.overall === 'number' && Number.isFinite(p.overall)) {
      rating = Math.round(p.overall);
    }

    const pitchX = typeof p?.pitchX === 'number' && Number.isFinite(p.pitchX) 
      ? p.pitchX 
      : (typeof p?.x === 'number' && Number.isFinite(p.x) ? p.x : 50);

    const pitchY = typeof p?.pitchY === 'number' && Number.isFinite(p.pitchY) 
      ? p.pitchY 
      : (typeof p?.y === 'number' && Number.isFinite(p.y) ? p.y : 50);

    const isClear = p?.isClear !== false && name !== 'unknown';

    return {
      name,
      position,
      rating,
      pitchX,
      pitchY,
      isClear
    };
  });

  const coachName = typeof raw?.coachName === 'string' && raw.coachName.trim() 
    ? raw.coachName.trim() 
    : (typeof raw?.coach === 'string' && raw.coach.trim() ? raw.coach.trim() : null);

  const playstyle = typeof raw?.playstyle === 'string' && raw.playstyle.trim() 
    ? raw.playstyle.trim() 
    : (typeof raw?.teamPlaystyle === 'string' && raw.teamPlaystyle.trim() ? raw.teamPlaystyle.trim() : null);

  const teamStrength = typeof raw?.teamStrength === 'string' && raw.teamStrength.trim()
    ? raw.teamStrength.trim()
    : (typeof raw?.strength === 'string' && raw.strength.trim() ? raw.strength.trim() : null);

  const strengths = Array.isArray(raw?.strengths) 
    ? raw.strengths.filter((s: any) => typeof s === 'string' && s.trim()) 
    : [];

  const weaknesses = Array.isArray(raw?.weaknesses) 
    ? raw.weaknesses.filter((w: any) => typeof w === 'string' && w.trim()) 
    : [];

  const tacticalAdvice = Array.isArray(raw?.tacticalAdvice) 
    ? raw.tacticalAdvice.filter((a: any) => typeof a === 'string' && a.trim()) 
    : (Array.isArray(raw?.advice) ? raw.advice.filter((a: any) => typeof a === 'string' && a.trim()) : []);

  const canonical = {
    isFormationScreenshot,
    isReliable,
    unreliableReason,
    gameName: typeof raw?.gameName === 'string' && raw.gameName.trim() ? raw.gameName.trim() : null,
    formationName,
    tacticalRating,
    detectedPlayers,
    coachName,
    playstyle,
    teamStrength,
    strengths,
    weaknesses,
    tacticalAdvice
  };

  return validateFormationResult(canonical);
}

/**
 * Infer tactical structure (e.g. 4-2-1-3, 4-3-3, 4-2-2-2) based on pitch positions
 */
export function inferFormationFromPlayers(players: any[]): string | null {
  if (!Array.isArray(players) || players.length < 3) return null;

  let defenders = 0;
  let dmfs = 0;
  let cmfs = 0;
  let amfs = 0;
  let forwards = 0;

  for (const p of players) {
    const pos = String(p?.position || p?.role || '').trim().toUpperCase();
    if (pos.includes('GK') || pos === 'حارس') {
      continue;
    } else if (pos.includes('CB') || pos.includes('LB') || pos.includes('RB') || pos.includes('LWB') || pos.includes('RWB') || pos === 'DEF') {
      defenders++;
    } else if (pos.includes('DMF')) {
      dmfs++;
    } else if (pos.includes('AMF')) {
      amfs++;
    } else if (pos.includes('CMF') || pos.includes('LMF') || pos.includes('RMF') || pos === 'MID') {
      cmfs++;
    } else if (pos.includes('CF') || pos.includes('SS') || pos.includes('LWF') || pos.includes('RWF') || pos === 'FWD') {
      forwards++;
    } else {
      // Coordinate fallback if position unknown (pitchY: 0=attack/top, 100=defense/bottom)
      const y = typeof p?.pitchY === 'number' ? p.pitchY : (typeof p?.y === 'number' ? p.y : 50);
      if (y >= 68) defenders++;
      else if (y >= 35) cmfs++;
      else forwards++;
    }
  }

  const mids = dmfs + cmfs + amfs;

  // Infer well-known formations
  if (defenders > 0 && mids > 0 && forwards > 0) {
    if (defenders === 4 && dmfs === 2 && amfs === 1 && forwards === 3) return '4-2-1-3';
    if (defenders === 4 && dmfs === 1 && (cmfs + amfs) === 2 && forwards === 3) return '4-3-3';
    if (defenders === 4 && dmfs === 2 && (cmfs + amfs) === 2 && forwards === 2) return '4-2-2-2';
    if (defenders === 4 && (dmfs + cmfs) === 2 && amfs === 3 && forwards === 1) return '4-2-3-1';
    if (defenders === 4 && mids === 4 && forwards === 2) return '4-4-2';
    if (defenders === 3 && dmfs === 2 && (cmfs + amfs) === 4 && forwards === 1) return '3-2-4-1';
    if (defenders === 3 && mids === 5 && forwards === 2) return '3-5-2';
    if (defenders === 5 && mids === 3 && forwards === 2) return '5-3-2';
    if (defenders === 5 && mids === 2 && forwards === 3) return '5-2-3';

    if (dmfs > 0 && amfs > 0) {
      return `${defenders}-${dmfs}-${amfs}-${forwards}`;
    }
    return `${defenders}-${mids}-${forwards}`;
  } else if (defenders > 0 && mids > 0) {
    return `${defenders}-${mids}`;
  }

  return null;
}

export function validateFormationResult(result: any) {
  const UNRELIABLE_MSG = 'لم أتمكن من قراءة التشكيلة بشكل موثوق، يرجى رفع صورة أوضح.';

  // 1. Not a formation screenshot
  if (result.isFormationScreenshot === false) {
    result.isReliable = false;
    result.unreliableReason = UNRELIABLE_MSG;
    result.formationName = null;
    result.formationInferred = false;
    result.tacticalRating = null;
    result.detectedPlayers = [];
    return result;
  }

  const validPlayersCount = Array.isArray(result.detectedPlayers) ? result.detectedPlayers.length : 0;

  // 2. Incomplete or missing players (less than 3 players detected)
  if (validPlayersCount < 3) {
    result.isReliable = false;
    result.unreliableReason = UNRELIABLE_MSG;
    result.formationName = null;
    result.formationInferred = false;
    result.tacticalRating = null;
    result.detectedPlayers = [];
    return result;
  }

  // 3. Player detection is valid (validPlayersCount >= 3)
  // FORMATION NAME IS NOT REQUIRED for player detection!
  result.isReliable = true;
  result.unreliableReason = null;

  // If formationName is not present, attempt to infer it from pitch positions
  const hasFormationName = typeof result.formationName === 'string' && result.formationName.trim().length > 0;
  if (!hasFormationName) {
    const inferred = inferFormationFromPlayers(result.detectedPlayers);
    if (inferred) {
      result.formationName = inferred;
      result.formationInferred = true;
    } else {
      result.formationName = null;
      result.formationInferred = false;
    }
  } else {
    result.formationInferred = false;
  }

  // 4. Tactical Rating: never default to 85 or any arbitrary number!
  // If provided and valid (1-100), keep it. If missing/invalid, calculate from genuine player ratings if available, else null.
  if (
    typeof result.tacticalRating !== 'number' ||
    !Number.isFinite(result.tacticalRating) ||
    result.tacticalRating <= 0 ||
    result.tacticalRating > 100
  ) {
    const ratedPlayers = result.detectedPlayers.filter(
      (p: any) => typeof p?.rating === 'number' && Number.isFinite(p.rating) && p.rating > 0 && p.rating <= 120
    );
    if (ratedPlayers.length >= 5) {
      const avg = ratedPlayers.reduce((acc: number, p: any) => acc + p.rating, 0) / ratedPlayers.length;
      result.tacticalRating = Math.min(100, Math.round(avg));
    } else {
      result.tacticalRating = null;
    }
  }

  return result;
}
