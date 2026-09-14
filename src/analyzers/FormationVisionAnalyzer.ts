import { FormationAnalysis, validateAndNormalizeVision } from '../models/FormationAnalysis';
import { VisionService } from '../services/VisionService';
import { TacticalAnalysisEngine } from './TacticalAnalysisEngine';

export class FormationVisionAnalyzer {
  private visionService: VisionService;

  constructor() {
    this.visionService = VisionService.getInstance();
  }

  /**
   * Complete pipeline:
   * Image Preprocessing -> Vision Provider -> Data Validation & Normalization -> Tactical Analysis Engine
   */
  public async analyzeFormationScreenshot(
    base64Image: string,
    onStageUpdate?: (stage: number, stageName: string) => void
  ): Promise<FormationAnalysis> {
    // Stage 1: Reading image
    onStageUpdate?.(1, 'قراءة الصورة وفحص الجودة...');

    // Stage 2: Vision model inference
    onStageUpdate?.(2, 'اكتشاف التشكيلة ونوع اللعبة...');
    const rawOutput = await this.visionService.analyze(base64Image);

    // Stage 3: Player detection & parsing
    onStageUpdate?.(3, 'قراءة اللاعبين والمراكز والتقييمات...');
    const validationResult = validateAndNormalizeVision(rawOutput);

    if (!validationResult.isValid || !validationResult.normalizedData) {
      throw new Error(validationResult.errorMessage || 'لم نتمكن من اكتشاف تشكيلة واضحة في الصورة.');
    }

    const { 
      formation, 
      confidence, 
      players, 
      gameName, 
      coach, 
      playstyle, 
      imageClarityNote 
    } = validationResult.normalizedData;

    // Stage 4: Tactical positioning
    onStageUpdate?.(4, 'تحليل المراكز والمسافات البينية...');

    // Stage 5: Balance & Vulnerability check
    onStageUpdate?.(5, 'فحص التوازن والثغرات الدفاعية...');

    // Stage 6: Generating recommendations & instructions
    onStageUpdate?.(6, 'إنشاء النصائح التكتيكية والتعليمات الفردية...');

    const analysis = TacticalAnalysisEngine.evaluate(
      players || [],
      formation || '4-2-1-3',
      confidence || 75,
      {
        coach,
        playstyle,
        gameName,
        imageClarityNote
      }
    );

    // Stage 7: Complete
    onStageUpdate?.(7, 'اكتمل التحليل ✓');

    return analysis;
  }
}
