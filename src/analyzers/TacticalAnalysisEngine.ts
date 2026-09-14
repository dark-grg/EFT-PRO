import { 
  DetectedPlayer, 
  FormationAnalysis, 
  TacticalCoverageMetrics, 
  TacticalError 
} from '../models/FormationAnalysis';
import { DefensiveAnalyzer } from './DefensiveAnalyzer';
import { MidfieldAnalyzer } from './MidfieldAnalyzer';
import { AttackAnalyzer } from './AttackAnalyzer';

export class TacticalAnalysisEngine {
  /**
   * Evaluates complete tactical structure using deterministic rules.
   * STRICTLY NO Math.random().
   */
  public static evaluate(
    players: DetectedPlayer[],
    formationName: string,
    confidence: number,
    metadata?: {
      coach?: string;
      playstyle?: string;
      gameName?: string;
      imageClarityNote?: string;
    }
  ): FormationAnalysis {
    // 1. Run Domain Analyzers
    const defResult = DefensiveAnalyzer.analyze(players);
    const midResult = MidfieldAnalyzer.analyze(players);
    const attResult = AttackAnalyzer.analyze(players);

    // 2. Calculate Pitch Physical Metrics (Width, Depth, Coverage)
    const metrics = this.calculatePitchMetrics(players, defResult.defensiveBalance, midResult.midfieldBalance, attResult.attackingBalance);

    // 3. Aggregate Errors
    const allErrors: TacticalError[] = [
      ...defResult.errors,
      ...midResult.errors,
      ...attResult.errors
    ];

    // Sort by severity: high first, then medium, then low
    const severityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
    allErrors.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // 4. Calculate Balance Score (0 - 100)
    // Balance takes into account distribution across lines and flanks
    const balanceScore = Math.round(
      (defResult.defensiveBalance * 0.35) +
      (midResult.midfieldBalance * 0.35) +
      (attResult.attackingBalance * 0.30)
    );

    // 5. Calculate Overall Score (0 - 100)
    // Overall score combines Attack (30%), Midfield (25%), Defense (30%), Balance (15%)
    let rawOverall = Math.round(
      (attResult.attackScore * 0.30) +
      (midResult.midfieldScore * 0.25) +
      (defResult.defenseScore * 0.30) +
      (balanceScore * 0.15)
    );

    // Penalty for critical errors
    const highErrorsCount = allErrors.filter(e => e.severity === 'high').length;
    rawOverall = Math.max(30, Math.min(99, rawOverall - (highErrorsCount * 3)));

    // 6. Strengths aggregation
    const strengths = [
      ...defResult.strengths,
      ...midResult.strengths,
      ...attResult.strengths
    ];

    // 7. Tactical Warnings
    const warnings: string[] = [];
    if (highErrorsCount > 0) {
      warnings.push(`تم رصد ${highErrorsCount} ثغرات تكتيكية حاسمة قد تسبب استقبال أهداف سهلة في المباريات التنافسية.`);
    }
    if (metrics.width < 50) {
      warnings.push('ضيق انتشار الملعب يجعل الفريق عرضة للاختناق ضد التكتلات الدفاعية.');
    }
    if (!defResult.hasAnchorMan) {
      warnings.push('العمق الدفاعي مهدد بالمرتدات السريعة بسبب عدم وجود ارتكاز دفاعي صريح.');
    }

    // 8. Tactical Recommendations
    const recommendations: string[] = allErrors.map(e => e.recommendation);
    if (recommendations.length === 0) {
      recommendations.push('التشكيلة متوازنة للغاية. حافظ على انسجام اللاعبين وقم بضبط التعليمات الفردية حسب الخصم.');
    }

    const weaknesses = allErrors.map(e => e.title);

    return {
      id: `analysis-${Date.now()}-${Math.round(confidence)}`,
      timestamp: new Date().toISOString(),
      formation: formationName,
      confidence,
      players,
      strengths,
      weaknesses,
      warnings,
      recommendations,
      tacticalErrors: allErrors,
      attackScore: attResult.attackScore,
      defenseScore: defResult.defenseScore,
      midfieldScore: midResult.midfieldScore,
      balanceScore,
      overallScore: rawOverall,
      coverageMetrics: metrics,
      gameName: metadata?.gameName || 'eFootball',
      coach: metadata?.coach,
      playstyle: metadata?.playstyle,
      imageClarityNote: metadata?.imageClarityNote
    };
  }

  /**
   * Deterministically calculates width, depth, and spatial coverage of players on the field.
   */
  private static calculatePitchMetrics(
    players: DetectedPlayer[],
    defensiveBalance: number,
    midfieldBalance: number,
    attackingBalance: number
  ): TacticalCoverageMetrics {
    if (players.length === 0) {
      return {
        defensiveBalance: 70,
        midfieldBalance: 70,
        attackingBalance: 70,
        width: 70,
        depth: 75,
        coverage: 72
      };
    }

    const xCoords = players.map(p => p.x);
    const yCoords = players.map(p => p.y);

    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    // Width: difference between leftmost and rightmost player (0 to 100)
    const rawWidth = maxX - minX;
    const width = Math.round(Math.max(30, Math.min(100, rawWidth * 1.15)));

    // Depth: vertical distance between highest forward and lowest defender (0 to 100)
    const rawDepth = maxY - minY;
    const depth = Math.round(Math.max(30, Math.min(100, rawDepth * 1.12)));

    // Pitch Coverage (spatial density)
    const coverage = Math.round((width * 0.45) + (depth * 0.45) + (players.length >= 10 ? 10 : 5));

    return {
      defensiveBalance,
      midfieldBalance,
      attackingBalance,
      width,
      depth,
      coverage: Math.min(98, coverage)
    };
  }
}
