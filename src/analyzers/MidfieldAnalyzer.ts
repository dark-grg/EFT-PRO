import { DetectedPlayer, TacticalError } from '../models/FormationAnalysis';

export interface MidfieldAnalysisResult {
  midfieldScore: number;
  midfieldBalance: number;
  errors: TacticalError[];
  strengths: string[];
  midfielderCount: number;
  hasPlaymaker: boolean;
  centerDominance: boolean;
}

export class MidfieldAnalyzer {
  /**
   * Deterministically analyze midfield structure based on verified player positions.
   * STRICTLY NO Math.random().
   */
  public static analyze(players: DetectedPlayer[]): MidfieldAnalysisResult {
    const errors: TacticalError[] = [];
    const strengths: string[] = [];

    const dmfs = players.filter(p => p.position === 'DMF');
    const cmfs = players.filter(p => p.position === 'CMF');
    const amfs = players.filter(p => p.position === 'AMF');
    const lmfs = players.filter(p => p.position === 'LMF');
    const rmfs = players.filter(p => p.position === 'RMF');

    // Also consider unknown positions placed in midfield zone
    const unknownMids = players.filter(p => 
      p.position === 'unknown' && p.y >= 35 && p.y < 70
    );

    const totalMids = dmfs.length + cmfs.length + amfs.length + lmfs.length + rmfs.length + unknownMids.length;
    const hasPlaymaker = amfs.length > 0 || cmfs.some(c => c.y < 50);
    const hasHoldingMid = dmfs.length > 0 || cmfs.some(c => c.y >= 60);

    let midfieldScore = 70;

    // Rule 1: Midfielder Count
    if (totalMids >= 3 && totalMids <= 5) {
      midfieldScore += 10;
      strengths.push(`كثافة مثالية في خط الوسط (${totalMids} لاعبين) تضمن السيطرة وبناء الهجمات`);
    } else if (totalMids < 3) {
      midfieldScore -= 18;
      errors.push({
        severity: 'high',
        title: 'فراغ عددي في خط الوسط',
        description: `خط الوسط يحتوي على (${totalMids}) لاعبين فقط، مما يمنح الخصم أريحية كاملة في تدوير الكرة وبناء الهجمات.`,
        recommendation: 'عزز منطقة المناورات بلاعب إضافي (CMF أو DMF) لمنع الاستحواذ العكسي.',
        affectedZone: 'midfield'
      });
    } else if (totalMids > 5) {
      midfieldScore -= 8;
      errors.push({
        severity: 'medium',
        title: 'تكدس وازدحام في خط الوسط',
        description: 'وجود أكثر من 5 لاعبين بالوسط يقلل من خيارات التمرير المباشر ويحد من سرعة التحولات.',
        recommendation: 'وسع نطاق الانتشار أو حول أحد لاعبي الوسط إلى جناح مهاجم أو مهاجم ثانٍ.',
        affectedZone: 'midfield'
      });
    }

    // Rule 2: Center dominance vs Flank distribution
    const centralMids = dmfs.length + cmfs.length + amfs.length;
    const centerDominance = centralMids >= 2;

    if (centerDominance) {
      midfieldScore += 6;
      strengths.push('عمق تكتيكي قوي وسيطرة على دائرة المنتصف (Center Dominance)');
    } else if (centralMids === 1) {
      midfieldScore -= 10;
      errors.push({
        severity: 'high',
        title: 'لاعب وسط وحيد في العمق',
        description: 'الاعتماد على لاعب وحيد في دائرة المنتصف يسهل عزله وحصاره من قبل خط وسط الخصم.',
        recommendation: 'وفر شريكاً في العمق لمساندته في تدوير اللعب وافتكاك الكرات الثانية.',
        affectedZone: 'center'
      });
    }

    // Rule 3: Vertical distance between Defense and Midfield
    const defPlayers = players.filter(p => ['CB', 'LB', 'RB'].includes(p.position) || p.y >= 70);
    const avgDefY = defPlayers.length > 0 ? defPlayers.reduce((acc, p) => acc + p.y, 0) / defPlayers.length : 78;
    const avgMidY = totalMids > 0 
      ? [...dmfs, ...cmfs, ...amfs, ...lmfs, ...rmfs, ...unknownMids].reduce((acc, p) => acc + p.y, 0) / totalMids 
      : 55;

    const defMidGap = avgDefY - avgMidY;
    if (defMidGap > 30) {
      midfieldScore -= 10;
      errors.push({
        severity: 'medium',
        title: 'تباعد الخطوط بين الدفاع والوسط',
        description: `المسافة العمودية بين خط الدفاع والوسط واسعة (${Math.round(defMidGap)} نقطة عمودية)، مما يتيح لصانع ألعاب الخصم الاستلام بين الخطوط بحرية.`,
        recommendation: 'قرّب لاعبي الارتكاز من قلوب الدفاع أو اسحب خط الدفاع للأمام لتقليص المساحة.',
        affectedZone: 'midfield'
      });
    } else {
      strengths.push('تقارب خطوط ممتاز بين الدفاع والوسط يضيق المساحات على الخصم');
    }

    // Rule 4: Balance between offense and defense in midfield
    let defensiveWeight = dmfs.length * 1.5 + cmfs.filter(c => c.y >= 52).length;
    let offensiveWeight = amfs.length * 1.5 + cmfs.filter(c => c.y < 52).length;

    let balanceRatio = 80;
    if (defensiveWeight === 0 && offensiveWeight > 0) {
      balanceRatio = 45;
      midfieldScore -= 12;
      errors.push({
        severity: 'high',
        title: 'وسط هجومي بحت يفتقر للستار الدفاعي',
        description: 'جميع لاعبي الوسط يميلون للأدوار الهجومية دون وجود لاعب يرتد للتغطية عند فقدان الكرة.',
        recommendation: 'أضف لاعب Box-to-Box أو Anchor Man لتحقيق التوازن التكتيكي.',
        affectedZone: 'midfield'
      });
    } else if (offensiveWeight === 0 && defensiveWeight > 0) {
      balanceRatio = 55;
      midfieldScore -= 8;
      errors.push({
        severity: 'medium',
        title: 'غياب صانع اللعب أو لاعب الربط المتقدم',
        description: 'خط الوسط يميل بشكل كامل للدفاع، مما يصعب إيصال الكرات الخطرة للمهاجمين.',
        recommendation: 'أضف صانع ألعاب (AMF) أو لاعب وسط مبدع (Orchestrator/Hole Player).',
        affectedZone: 'midfield'
      });
    } else {
      balanceRatio = 90;
      strengths.push('توازن مثالي في أدوار الوسط بين التغطية الدفاعية وصناعة الفرص');
    }

    const finalScore = Math.max(35, Math.min(98, midfieldScore));

    return {
      midfieldScore: finalScore,
      midfieldBalance: balanceRatio,
      errors,
      strengths,
      midfielderCount: totalMids,
      hasPlaymaker,
      centerDominance
    };
  }
}
