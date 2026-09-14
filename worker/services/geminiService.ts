/**
 * Gemini Vision Service for Cloudflare Workers
 * Uses native fetch to invoke Google Gemini REST API with fallback models.
 */

export async function analyzeFormationWithGemini(
  apiKey: string,
  cleanBase64: string,
  prompt: string,
  systemInstruction: string
): Promise<any> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in Cloudflare Worker environment bindings.');
  }

  // Candidate multimodal vision models supported by Google Gemini
  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash'
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
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
          const errBody = await response.json().catch(() => ({}));
          const status = response.status;
          const errMsg = (errBody as any)?.error?.message || `HTTP ${status}`;
          
          if (status === 503 || status === 429 || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('demand')) {
            lastError = new Error(errMsg);
            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 1000));
              continue;
            }
            break; // Try next model
          }
          throw new Error(errMsg);
        }

        const data: any = await response.json();
        const candidate = data?.candidates?.[0];
        const textPart = candidate?.content?.parts?.[0]?.text;

        if (!textPart) {
          throw new Error('لم يتم استلام نص صالح من خوادم الذكاء الاصطناعي.');
        }

        const trimmed = textPart.trim();
        try {
          return JSON.parse(trimmed);
        } catch {
          const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (match) {
            return JSON.parse(match[1]);
          }
          throw new Error('تنسيق الرد من نموذج الذكاء الاصطناعي غير صالح.');
        }
      } catch (err: any) {
        lastError = err;
        if (attempt >= 2) {
          break;
        }
      }
    }
  }

  throw lastError || new Error('فشلت جميع محاولات تحليل التشكيلة عبر نماذج الذكاء الاصطناعي.');
}
