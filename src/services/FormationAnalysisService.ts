import { FormationAnalysis, SavedAnalysisRecord } from '../models/FormationAnalysis';
import { FormationVisionAnalyzer } from '../analyzers/FormationVisionAnalyzer';

const HISTORY_STORAGE_KEY = 'FormationAnalysisHistory';

export interface FormationComparisonResult {
  formationA: FormationAnalysis | SavedAnalysisRecord;
  formationB: FormationAnalysis | SavedAnalysisRecord;
  betterAttack: 'A' | 'B' | 'EQUAL';
  betterDefense: 'A' | 'B' | 'EQUAL';
  betterMidfield: 'A' | 'B' | 'EQUAL';
  betterBalance: 'A' | 'B' | 'EQUAL';
  betterOverall: 'A' | 'B' | 'EQUAL';
  overallDelta: number;
  attackDelta: number;
  defenseDelta: number;
  midfieldDelta: number;
  balanceDelta: number;
  summary: string;
}

export class FormationAnalysisService {
  private analyzer: FormationVisionAnalyzer;

  constructor() {
    this.analyzer = new FormationVisionAnalyzer();
  }

  /**
   * Run the full formation analysis with sequential progress updates
   */
  public async analyzeImage(
    base64Image: string,
    onStageUpdate?: (stage: number, stageName: string) => void
  ): Promise<FormationAnalysis> {
    return await this.analyzer.analyzeFormationScreenshot(base64Image, onStageUpdate);
  }

  /**
   * Saves analysis record to local history
   */
  public saveAnalysisToHistory(analysis: FormationAnalysis, saveScreenshot: boolean = false, previewThumbnail?: string): SavedAnalysisRecord {
    const records = this.getHistory();

    const newRecord: SavedAnalysisRecord = {
      id: analysis.id || `record-${Date.now()}`,
      date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      formation: analysis.formation,
      overallScore: analysis.overallScore,
      attackScore: analysis.attackScore,
      defenseScore: analysis.defenseScore,
      midfieldScore: analysis.midfieldScore,
      balanceScore: analysis.balanceScore,
      weaknesses: analysis.weaknesses || [],
      recommendations: analysis.recommendations || [],
      strengths: analysis.strengths || [],
      playersCount: analysis.players?.length || 11,
      previewThumbnail: saveScreenshot ? previewThumbnail : undefined
    };

    // Keep up to 30 records
    const updated = [newRecord, ...records.filter(r => r.id !== newRecord.id)].slice(0, 30);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }

    return newRecord;
  }

  /**
   * Retrieves saved history
   */
  public getHistory(): SavedAnalysisRecord[] {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Delete a record from history
   */
  public deleteHistoryRecord(id: string): void {
    const records = this.getHistory().filter(r => r.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
  }

  /**
   * Clear all history
   */
  public clearHistory(): void {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  }

  /**
   * Compares two formations (A and B) and returns comparative tactical metrics
   */
  public compareFormations(
    a: FormationAnalysis | SavedAnalysisRecord,
    b: FormationAnalysis | SavedAnalysisRecord
  ): FormationComparisonResult {
    const attackDelta = a.attackScore - b.attackScore;
    const defenseDelta = a.defenseScore - b.defenseScore;
    const midfieldDelta = a.midfieldScore - b.midfieldScore;
    const balanceDelta = a.balanceScore - b.balanceScore;
    const overallDelta = a.overallScore - b.overallScore;

    const betterAttack = attackDelta > 0 ? 'A' : attackDelta < 0 ? 'B' : 'EQUAL';
    const betterDefense = defenseDelta > 0 ? 'A' : defenseDelta < 0 ? 'B' : 'EQUAL';
    const betterMidfield = midfieldDelta > 0 ? 'A' : midfieldDelta < 0 ? 'B' : 'EQUAL';
    const betterBalance = balanceDelta > 0 ? 'A' : balanceDelta < 0 ? 'B' : 'EQUAL';
    const betterOverall = overallDelta > 0 ? 'A' : overallDelta < 0 ? 'B' : 'EQUAL';

    let summary = '';
    if (overallDelta > 0) {
      summary = `التشكيلة (${a.formation}) تتفوق إجمالاً بفارق +${overallDelta} نقطة عن (${b.formation}).`;
    } else if (overallDelta < 0) {
      summary = `التشكيلة (${b.formation}) تتفوق إجمالاً بفارق +${Math.abs(overallDelta)} نقطة عن (${a.formation}).`;
    } else {
      summary = `التشكيلتان متساويتان في التقييم العام (${a.overallScore}/100) مع اختلاف التوزيع التكتيكي للخطوط.`;
    }

    return {
      formationA: a,
      formationB: b,
      betterAttack,
      betterDefense,
      betterMidfield,
      betterBalance,
      betterOverall,
      overallDelta,
      attackDelta,
      defenseDelta,
      midfieldDelta,
      balanceDelta,
      summary
    };
  }
}
