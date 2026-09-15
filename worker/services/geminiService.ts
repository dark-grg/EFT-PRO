/**
 * Gemini Vision Service for Cloudflare Workers
 * Uses Google Gemini Interactions API & generateContent API with gemini-3.6-flash.
 */

export const FORMATION_AI_MODEL = 'gemini-3.6-flash';

// Supported fallback models confirmed active
const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest'
];

/**
 * Extracts and safely parses JSON from model output text
 */
function parseJsonFromText(rawText: string): any {
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1].trim());
    }
    const jsonMatch = trimmed.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    throw new Error('تنسيق الرد من نموذج الذكاء الاصطناعي غير صالح.');
  }
}

/**
 * Attempt analysis using the modern Google Gemini Interactions API
 */
async function callInteractionsApi(
  apiKey: string,
  model: string,
  cleanBase64: string,
  prompt: string,
  systemInstruction: string
): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`;

  const payload = {
    model,
    system_instruction: systemInstruction,
    input: [
      {
        type: 'image',
        mime_type: 'image/jpeg',
        data: cleanBase64
      },
      {
        type: 'text',
        text: prompt
      }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'pes-arena-worker'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errBody: any = await response.json().catch(() => ({}));
    const errMsg = errBody?.error?.message || `Interactions API HTTP ${response.status}`;
    throw new Error(errMsg);
  }

  const data: any = await response.json();

  // Check output_text or iterate steps
  if (data?.output_text) {
    return parseJsonFromText(data.output_text);
  }

  let combinedText = '';
  if (Array.isArray(data?.steps)) {
    for (const step of data.steps) {
      if (step.type === 'model_output' && Array.isArray(step.content)) {
        for (const part of step.content) {
          if (part.type === 'text' && part.text) {
            combinedText += part.text;
          }
        }
      }
    }
  }

  if (combinedText) {
    return parseJsonFromText(combinedText);
  }

  throw new Error('لم يتم استلام نص صالح من واجهة التفاعل.');
}

/**
 * Attempt analysis using the standard generateContent REST API
 */
async function callGenerateContentApi(
  apiKey: string,
  model: string,
  cleanBase64: string,
  prompt: string,
  systemInstruction: string
): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        {
          text: systemInstruction
        }
      ]
    },
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'pes-arena-worker'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errBody: any = await response.json().catch(() => ({}));
    const errMsg = errBody?.error?.message || `generateContent HTTP ${response.status}`;
    throw new Error(errMsg);
  }

  const data: any = await response.json();
  const candidate = data?.candidates?.[0];
  const textPart = candidate?.content?.parts?.[0]?.text;

  if (!textPart) {
    throw new Error('لم يتم استلام نص صالح من خوادم الذكاء الاصطناعي.');
  }

  return parseJsonFromText(textPart);
}

/**
 * Main entry point for formation analysis with resilient fallback
 */
export async function analyzeFormationWithGemini(
  apiKey: string,
  cleanBase64: string,
  prompt: string,
  systemInstruction: string
): Promise<any> {
  if (!apiKey) {
    throw new Error('خدمة تحليل التشكيلة غير مهيأة حالياً (مفتاح API مفقود).');
  }

  let lastError: any = null;

  // 1. Primary call: generateContent with gemini-3.6-flash
  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await callGenerateContentApi(apiKey, model, cleanBase64, prompt, systemInstruction);
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '');
        const isTransient = msg.includes('503') || msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('demand');
        if (isTransient && attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        break; // Try next candidate model
      }
    }
  }

  // 2. Secondary fallback: Interactions API if generateContent failed
  try {
    return await callInteractionsApi(apiKey, FORMATION_AI_MODEL, cleanBase64, prompt, systemInstruction);
  } catch (err: any) {
    console.warn(`Interactions API fallback failed:`, err?.message || err);
  }

  throw lastError || new Error('تعذر الاتصال بخدمة تحليل التشكيلة حالياً، حاول مرة أخرى.');
}
