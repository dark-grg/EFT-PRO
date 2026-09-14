import { DetectedPlayer, TacticalError } from '../models/FormationAnalysis';

export interface DefenseAnalysisResult {
  defenseScore: number; // 0 - 100
  defensiveBalance: number; // 0 - 100
  errors: TacticalError[];
  strengths: string[];
  hasAnchorMan: boolean;
  cbCount: number;
  fullbackCount: number;
}

export class DefensiveAnalyzer {
  /**
   * Deterministically analyze defensive structure based on verified player positions.
   * STRICTLY NO Math.random().
   */
  public static analyze(players: DetectedPlayer[]): DefenseAnalysisResult {
    const errors: TacticalError[] = [];
    const strengths: string[] = [];

    const cbs = players.filter(p => p.position === 'CB' || (p.position === 'unknown' && p.y >= 75 && p.x >= 30 && p.x <= 70));
    const lbs = players.filter(p => p.position === 'LB' || p.position === 'LWB' || (p.position === 'unknown' && p.y >= 65 && p.x < 30));
    const rbs = players.filter(p => p.position === 'RB' || p.position === 'RWB' || (p.position === 'unknown' && p.y >= 65 && p.x > 70));
    const dmfs = players.filter(p => p.position === 'DMF' || (p.position === 'unknown' && p.y >= 55 && p.y < 75 && p.x >= 30 && p.x <= 70));

    const totalDefenders = cbs.length + lbs.length + rbs.length;
    const hasAnchor = dmfs.length > 0;

    // Base defense calculation
    let defenseScore = 70;

    // Rule 1: CB counts
    if (cbs.length === 2) {
      defenseScore += 10;
      strengths.push('شراكة ثنائية متناسقة في قلب الدفاع (CBs)');
    } else if (cbs.length >= 3) {
      defenseScore += 12;
      strengths.push('عمق دفاعي ثلاثي صلب يحمي منطقة الجزاء ضد الكرات البينية');
    } else if (cbs.length === 1) {
      defenseScore -= 20;
      errors.push({
        severity: 'high',
        title: 'نقص عددي حرج في قلوب الدفاع',
        description: 'تم رصد قلب دفاع واحد فقط (Single CB)، مما يترك مساحات شاسعة للمهاجمين للتوغل والانفراد.',
        recommendation: 'ثبت على الأقل قلبي دفاع (2 CBs) لضمان حماية عمق منطقة الجزاء.',
        affectedZone: 'defense'
      });
    }

    // Rule 2: Spacing between CBs
    if (cbs.length >= 2) {
      const sortedCbs = [...cbs].sort((a, b) => a.x - b.x);
      let wideGapDetected = false;
      for (let i = 0; i < sortedCbs.length - 1; i++) {
        const gap = sortedCbs[i + 1].x - sortedCbs[i].x;
        if (gap > 32) {
          wideGapDetected = true;
          defenseScore -= 8;
          errors.push({
            severity: 'medium',
            title: 'فجوة تباعد واسعة بين قلبي الدفاع',
            description: `المسافة الأفقية بين قلبي الدفاع متباعدة (${Math.round(gap)}%)، مما يسمح للخصم بضرب التمريرات البينية السريعة (Through Balls).`,
            recommendation: 'قرّب قلبي الدفاع من بعضهما أو فعل تعليمة Deep Line لتضييق الثغرة.',
            affectedZone: 'center'
          });
          break;
        }
      }
      if (!wideGapDetected && cbs.length >= 2) {
        defenseScore += 5;
        strengths.push('مسافات مثالية ومحكمة بين قلبي الدفاع تمنع البينيات');
      }
    }

    // Rule 3: Fullbacks Presence & Exposure
    if (lbs.length === 0 && rbs.length === 0 && cbs.length < 4) {
      defenseScore -= 12;
      errors.push({
        severity: 'high',
        title: 'غياب كامل للأظهرة الدفاعية (LB / RB)',
        description: 'الأطراف الدفاعية مكشوفة تماماً أمام أجنحة الخصم السريعة والعرضيات.',
        recommendation: 'استخدم ظهيرين دفاعيين أو حول لاعبي الأطراف إلى أظهرة لتأمين الرواقين.',
        affectedZone: 'defense'
      });
    } else {
      if (lbs.length > 0 && rbs.length > 0) {
        strengths.push('تغطية متوازنة على طرفي الدفاع (الأيمن والأيسر)');
      }
    }

    // Check high fullback vulnerability
    lbs.forEach(lb => {
      if (lb.y < 60) {
        defenseScore -= 6;
        errors.push({
          severity: 'medium',
          title: 'اندفاع متقدم للظهير الأيسر',
          description: `الظهير الأيسر (${lb.name || 'LB'}) متقدم بشكل هجومي، تاركاً مساحة فارغة خلفه في الهجمات المرتدة.`,
          recommendation: 'ضع تعليمة دفاعية (Defensive Instruction) على الظهير الأيسر أو اعتمد ظهير بشخصية Defensive Full-back.',
          affectedZone: 'left_flank'
        });
      }
    });

    rbs.forEach(rb => {
      if (rb.y < 60) {
        defenseScore -= 6;
        errors.push({
          severity: 'medium',
          title: 'اندفاع متقدم للظهير الأيمن',
          description: `الظهير الأيمن (${rb.name || 'RB'}) متقدم للأمام بشكل ملحوظ مما يهدد الجبهة اليمنى بالمرتدات.`,
          recommendation: 'ضع تعليمة فردية (Defensive) للحد من صعوده بدون تغطية.',
          affectedZone: 'right_flank'
        });
      }
    });

    // Rule 4: DMF (Pivot / Anchor) coverage
    if (hasAnchor) {
      defenseScore += 10;
      strengths.push('وجود ارتكاز دفاعي (DMF) يحمي خط الظهر ويقطع الكرات المرتدة');
    } else {
      defenseScore -= 14;
      errors.push({
        severity: 'high',
        title: 'غياب لاعب ارتكاز دفاعي (Anchor Man / DMF)',
        description: 'لا يوجد لاعب وسط دفاعي متأخر يغطي المساحة بين الدفاع والوسط، مما يعرض خط الظهر لضغط مباشر ومستمر.',
        recommendation: 'أضف لاعب DMF صريح يتميز بأسلوب Anchor Man أو Destroyer مثل رودري أو كاسيميرو.',
        affectedZone: 'defense'
      });
    }

    // Defensive Balance (Left vs Right symmetry)
    let leftWeight = lbs.length * 10 + cbs.filter(c => c.x < 50).length * 8;
    let rightWeight = rbs.length * 10 + cbs.filter(c => c.x >= 50).length * 8;
    const balanceDiff = Math.abs(leftWeight - rightWeight);
    const defensiveBalance = Math.max(50, Math.min(100, 100 - (balanceDiff * 5)));

    if (balanceDiff >= 12) {
      errors.push({
        severity: 'low',
        title: 'عدم توازن جانبي في الانتشار الدفاعي',
        description: 'إحدى الجهات الدفاعية تحتوي على كثافة عددية أكبر بكثير من الجهة المقابلة.',
        recommendation: 'وازن مواقع أظهرتك وقلوب الدفاع لتغطية المساحات بالتساوي.',
        affectedZone: 'defense'
      });
    }

    // Clamp score
    const finalScore = Math.max(35, Math.min(98, defenseScore));

    return {
      defenseScore: finalScore,
      defensiveBalance,
      errors,
      strengths,
      hasAnchorMan: hasAnchor,
      cbCount: cbs.length,
      fullbackCount: lbs.length + rbs.length
    };
  }
}
