import { DetectedPlayer, TacticalError } from '../models/FormationAnalysis';

export interface AttackAnalysisResult {
  attackScore: number;
  attackingBalance: number;
  errors: TacticalError[];
  strengths: string[];
  forwardCount: number;
  isCfIsolated: boolean;
  hasWingers: boolean;
}

export class AttackAnalyzer {
  /**
   * Deterministically analyze attacking structure based on verified player positions.
   * STRICTLY NO Math.random().
   */
  public static analyze(players: DetectedPlayer[]): AttackAnalysisResult {
    const errors: TacticalError[] = [];
    const strengths: string[] = [];

    const cfs = players.filter(p => p.position === 'CF');
    const sss = players.filter(p => p.position === 'SS');
    const lwfs = players.filter(p => p.position === 'LWF');
    const rwfs = players.filter(p => p.position === 'RWF');
    const lmfs = players.filter(p => p.position === 'LMF');
    const rmfs = players.filter(p => p.position === 'RMF');
    const amfs = players.filter(p => p.position === 'AMF');

    // Unknowns placed in forward third (y < 40)
    const unknownForwards = players.filter(p => 
      p.position === 'unknown' && p.y < 40
    );

    const forwards = [...cfs, ...sss, ...lwfs, ...rwfs, ...unknownForwards];
    const totalForwards = forwards.length;
    const hasWingers = lwfs.length > 0 || rwfs.length > 0 || lmfs.length > 0 || rmfs.length > 0;

    let attackScore = 70;

    // Rule 1: Forward Count & Strikers
    if (cfs.length === 0 && sss.length === 0 && unknownForwards.length === 0) {
      attackScore -= 22;
      errors.push({
        severity: 'high',
        title: 'غياب رأس حربة صريح (CF / Striker)',
        description: 'لا يوجد مهاجم متقدم لإنهاء الفرص داخل الصندوق، مما يفقد الفريق الفعالية التهديفية الحاسمة.',
        recommendation: 'ثبت مهاجماً كلاسيكياً (Goal Poacher أو Target Man) لقيادة الخط الأمامي.',
        affectedZone: 'attack'
      });
    } else if (cfs.length >= 1) {
      attackScore += 8;
      strengths.push('وجود رأس حربة صريح يشكل محطة إنهاء رئيسية داخل منطقة الجزاء');
    }

    if (totalForwards >= 2 && totalForwards <= 4) {
      attackScore += 8;
      strengths.push(`حضور هجومي قوي ومتنوع بتواجد (${totalForwards}) لاعبين في الثلث الأخير`);
    } else if (totalForwards === 1) {
      attackScore -= 10;
      errors.push({
        severity: 'medium',
        title: 'اعتماد هجومي على مهاجم وحيد',
        description: 'الفريق يعتمد على رأس حربة واحد بدون دعم هجومي كافٍ، مما يسهل مراقبته من قلبي دفاع الخصم.',
        recommendation: 'أضف جناحين نشيطين أو صانع ألعاب متأخر لمساندته.',
        affectedZone: 'attack'
      });
    }

    // Rule 2: Check if CF is isolated
    let isCfIsolated = false;
    if (cfs.length > 0) {
      const primaryCf = cfs[0];
      // Check distance to closest supporting player (AMF, SS, Wingers, CMF)
      const potentialSupporters = [...sss, ...amfs, ...lwfs, ...rwfs, ...players.filter(p => p.position === 'CMF' && p.y < 50)];
      
      if (potentialSupporters.length === 0) {
        isCfIsolated = true;
      } else {
        const minDistance = Math.min(...potentialSupporters.map(sup => {
          const dx = sup.x - primaryCf.x;
          const dy = sup.y - primaryCf.y;
          return Math.sqrt(dx * dx + dy * dy);
        }));

        if (minDistance > 32) {
          isCfIsolated = true;
        }
      }

      if (isCfIsolated) {
        attackScore -= 14;
        errors.push({
          severity: 'high',
          title: 'رأس الحربة معزول في الأمام (Isolated Striker)',
          description: `المهاجم الصريح (${primaryCf.name || 'CF'}) معزول تماماً عن خط الوسط وصناع اللعب دون وجود مساندة قريبة.`,
          recommendation: 'ارفع تمركز صانع الألعاب (AMF) أو غير أسلوب المهاجم إلى Deep-Lying Forward للنزول واستلام الكرة.',
          affectedZone: 'attack'
        });
      } else {
        attackScore += 6;
        strengths.push('ترابط وتناغم ممتاز بين المهاجم الصريح ولاعبي الدعم والمساندة');
      }
    }

    // Rule 3: Wingers and Pitch Width in Attack
    const leftAttackers = [...lwfs, ...lmfs, ...forwards.filter(f => f.x < 35)];
    const rightAttackers = [...rwfs, ...rmfs, ...forwards.filter(f => f.x > 65)];

    if (leftAttackers.length > 0 && rightAttackers.length > 0) {
      attackScore += 8;
      strengths.push('انتشار هجومي عريض ومتوازن على الجناحين يمدد دفاعات الخصم');
    } else if (leftAttackers.length === 0 && rightAttackers.length === 0) {
      attackScore -= 12;
      errors.push({
        severity: 'medium',
        title: 'انعدام الكثافة الهجومية على الأطراف (Narrow Attack)',
        description: 'الهجوم يقتصر كلياً على عمق الملعب بدون أجنحة، مما يسمح للخصم بتكديس مدافعيه في العمق وغلق المنافذ.',
        recommendation: 'فعل تقدم الأظهرة أو وسع تمركز المهاجمين لخلخلة تكتل دفاع الخصم.',
        affectedZone: 'attack'
      });
    }

    // Rule 4: One-sided attack asymmetry
    let attackingBalance = 80;
    if (leftAttackers.length > 0 && rightAttackers.length === 0) {
      attackingBalance = 50;
      attackScore -= 8;
      errors.push({
        severity: 'medium',
        title: 'هجوم أحادي الجانب (تركيز على الجبهة اليسرى فقط)',
        description: 'جميع الخيارات الهجومية محصورة في الجهة اليسرى، مما يجعل قراءة الهجمات سهلة جداً على دفاع الخصم.',
        recommendation: 'أضف جناحاً أيمن أو اجعل لاعب الوسط الأيمن يصعد كشريك هجومي.',
        affectedZone: 'right_flank'
      });
    } else if (rightAttackers.length > 0 && leftAttackers.length === 0) {
      attackingBalance = 50;
      attackScore -= 8;
      errors.push({
        severity: 'medium',
        title: 'هجوم أحادي الجانب (تركيز على الجبهة اليمنى فقط)',
        description: 'البناء الهجومي يتركز على الرواق الأيمن فقط مع غياب تام للخيارات على الرواق الأيسر.',
        recommendation: 'وازن بين الأجنحة عبر إضافة جناح أيسر أو إعطاء حرية هجومية للظهير الأيسر.',
        affectedZone: 'left_flank'
      });
    } else if (leftAttackers.length > 0 && rightAttackers.length > 0) {
      attackingBalance = 90;
    }

    const finalScore = Math.max(35, Math.min(98, attackScore));

    return {
      attackScore: finalScore,
      attackingBalance,
      errors,
      strengths,
      forwardCount: totalForwards,
      isCfIsolated,
      hasWingers
    };
  }
}
