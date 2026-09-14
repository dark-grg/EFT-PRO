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
مهمتك فحص لقطة الشاشة (Screenshot) بدقة هندسية واستخراج البيانات التكتيكية الحقيقية فقط بدون أي تخمين أو اختراع.

قواعد صارمة لا تقبل الاستثناء:
1. تحقق أولاً هل الصورة تمثل لقطة شاشة حقيقية لخطة لعب / تشكيلة كرة قدم ('isFormationScreenshot': true أو false). إذا لم تكن كذلك، اجعل 'isReliable': false وضع السبب في 'unreliableReason'.
2. إذا كانت الصورة غير واضحة، مشوشة، أو مقطوعة لدرجة تمنع قراءة التشكيلة بدقة، اجعل 'isReliable': false و 'unreliableReason': "لم أتمكن من قراءة التشكيلة بشكل موثوق، يرجى رفع صورة أوضح."
3. استخرج التشكيلة المستخدمة (مثل '4-2-1-3', '4-3-3', '4-2-2-2', '5-3-2', '4-1-2-3', '3-2-2-3', '4-4-2').
4. استخرج اسم المدرب (Coach) وأسلوب اللعب (Team Playstyle) مثل 'Quick Counter', 'Possession Game', 'Long Ball Counter', 'Out Wide' إن كانت ظاهرة بالصورة، وإلا اتركها فارغة "".
5. استخرج قوة الفريق أو التقييم الظاهر (Team Strength / Rating) إن وجد.
6. قيم التشكيلة تكتيكياً بناءً على توازن الخطوط والترابط (tacticalRating من 0 إلى 100).
7. استخرج نقاط القوة الحقيقية للتشكيلة المحددة (strengths: 3 إلى 4 نقاط باللغة العربية بناءً على مراكز اللاعبين وأسلوب اللعب المكتشف).
8. استخرج نقاط الضعف والثغرات التكتيكية (weaknesses: 3 إلى 4 نقاط باللغة العربية مثل المساحات خلف الأظهرة، ضعف المساندة، إلخ).
9. قدم نصائح تكتيكية دقيقة وقابلة للتطبيق (tacticalAdvice: 3 إلى 4 نصائح باللغة العربية).
10. بالنسبة للاعبين الأساسيين في أرضية الملعب (detectedPlayers):
    - استخرج كل لاعب ظاهر في التشكيلة الأساسية (حتى 11 لاعباً):
      * name: اسم اللاعب كما هو مكتوب بدقة على البطاقة/الملصق. إذا لم يكن واضحاً، اكتب 'unknown' واجعل isClear: false. لا تخترع أسماء!
      * position: رمز المركز الدقيق ('GK', 'CB', 'LB', 'RB', 'DMF', 'CMF', 'AMF', 'LMF', 'RMF', 'LWF', 'RWF', 'SS', 'CF').
      * rating: رقم التقييم العام (Overall) الظاهر على بطاقة اللاعب (مثل 102, 99, 97, 95). إذا كان غير مقروء، اجعله null. لا تخترع أرقاماً!
      * isClear: true إذا كان اسم اللاعب والمركز مقروءين بوضوح، و false إذا كان الاسم مموهاً أو غير مؤكد.
      * pitchX: موضع اللاعب الأفقي بالنسبة المئوية في الملعب (0 = أقصى اليسار، 50 = المنتصف، 100 = أقصى اليمين).
      * pitchY: موضع اللاعب الرأسي بالنسبة المئوية في الملعب (0 = خط الهجوم العلوي، 50 = دائرة السنتر، 100 = منطقة حارس المرمى السفلية).
11. ممنوع منعاً باتاً اختراع أي اسم لاعب أو تقييم. الالتزام بالحقيقة المرئية في الصورة فقط.
12. الرد يجب أن يكون بصيغة JSON نقية ومطابقة للمخطط التالي فقط.`;

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
    const analysisResult = await analyzeFormationWithGemini(apiKey, cleanBase64, prompt, systemInstruction);
    return jsonResponse(analysisResult, 200, request);
  } catch (error: any) {
    const msg = error?.message || 'تعذر فحص الصورة عبر خوادم الذكاء الاصطناعي.';
    return errorResponse(msg, 500, request);
  }
}
