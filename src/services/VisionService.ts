import { RawVisionOutput } from '../models/FormationAnalysis';
import { apiClient } from '../api/client';

export interface VisionProvider {
  id: string;
  name: string;
  analyzeImage(base64Image: string): Promise<RawVisionOutput>;
}

/**
 * GeminiVisionProvider sends the preprocessed image to the secure backend endpoint `/api/analyze-formation`.
 * This guarantees that the GEMINI_API_KEY is NEVER exposed to the frontend bundle or Android APK.
 */
export class GeminiVisionProvider implements VisionProvider {
  public id = 'gemini-vision';
  public name = 'Gemini Vision Analyzer';

  async analyzeImage(base64Image: string): Promise<RawVisionOutput> {
    // Clean data URL prefix if present
    const cleanBase64 = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;

    try {
      const data = await apiClient.post<RawVisionOutput>(
        '/api/analyze-formation',
        {
          image: cleanBase64,
          clientTimestamp: new Date().toISOString()
        },
        45000 // 45 seconds timeout for vision AI
      );

      return data;
    } catch (error: any) {
      if (error?.status === 429) {
        throw new Error('تم تجاوز حد طلبات التحليل المسموح به مؤقتاً. يرجى الانتظار بضع لحظات والمحاولة مجدداً.');
      }
      if (error?.status === 400) {
        throw new Error(error?.message || 'الصورة المرفوعة غير صالحة أو تالفة.');
      }
      if (error?.status === 503) {
        throw new Error(error?.message || 'خدمة الذكاء الاصطناعي تشهد ضغطاً مؤقتاً عالياً حالياً. يرجى المحاولة بعد لحظات.');
      }
      throw new Error(error?.message || 'تعذر تحليل الصورة. يرجى التأكد من وضوح لقطة الشاشة وإعادة المحاولة.');
    }
  }
}

/**
 * VisionService coordinates available vision providers.
 */
export class VisionService {
  private static instance: VisionService;
  private currentProvider: VisionProvider;

  private constructor() {
    this.currentProvider = new GeminiVisionProvider();
  }

  public static getInstance(): VisionService {
    if (!VisionService.instance) {
      VisionService.instance = new VisionService();
    }
    return VisionService.instance;
  }

  public setProvider(provider: VisionProvider): void {
    this.currentProvider = provider;
  }

  public getProvider(): VisionProvider {
    return this.currentProvider;
  }

  public async analyze(base64Image: string): Promise<RawVisionOutput> {
    if (!navigator.onLine) {
      throw new Error('تحليل التشكيلة يحتاج اتصالاً بالإنترنت حالياً.');
    }
    return await this.currentProvider.analyzeImage(base64Image);
  }
}
