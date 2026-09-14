export type FormationId = 
  | '4-2-1-3' 
  | '4-1-2-3' 
  | '4-3-1-2' 
  | '4-2-2-2' 
  | '3-2-2-3' 
  | '5-2-1-2' 
  | '4-2-3-1' 
  | '4-4-2';

export type PlaystyleId = 'quick_counter' | 'possession' | 'long_ball_counter' | 'out_wide';

export interface PlayerNode {
  id: string;
  role: string;
  label: string;
  x: number; // percentage 0 to 100
  y: number; // percentage 0 to 100
  category: 'attack' | 'midfield' | 'defense' | 'gk';
  isVulnerable?: boolean;
}

export interface TacticalPreset {
  id: string;
  name: string;
  formation: FormationId;
  playstyle: PlaystyleId;
  description: string;
  hasAnchorMan: boolean;
  offensiveFullbacks: boolean;
  cfType: 'goal_poacher' | 'deep_lying' | 'target_man';
  expectedScore: number;
}

export interface TacticalReport {
  overallScore: number;
  defenseBalance: number;
  attackBalance: number;
  formationName: string;
  playstyleName: string;
  strengths: string[];
  errors: Array<{
    title: string;
    desc: string;
    severity: 'critical' | 'high' | 'medium';
    fix: string;
  }>;
  individualInstructions: Array<{
    targetPlayer: string;
    instruction: string;
    instructionType: 'Defensive' | 'Anchoring' | 'Counter Target' | 'Deep Line' | 'Tight Marking';
    reason: string;
  }>;
  idealProfiles: Array<{
    position: string;
    recommendedStyle: string;
    recommendedPlayers: string;
    why: string;
  }>;
  counterTactic: {
    bestCounterFormation: string;
    playstyleAdvice: string;
    vulnerabilityToExploit: string;
  };
}

export const FORMATIONS_PITCH_MAP: Record<FormationId, { name: string; nodes: PlayerNode[] }> = {
  '4-2-1-3': {
    name: '4-2-1-3 (هجوم كاسح وجناحين)',
    nodes: [
      { id: 'cf', role: 'CF', label: 'مهاجم صريح', x: 50, y: 15, category: 'attack' },
      { id: 'lwf', role: 'LWF', label: 'جناح أيسر', x: 20, y: 22, category: 'attack' },
      { id: 'rwf', role: 'RWF', label: 'جناح أيمن', x: 80, y: 22, category: 'attack' },
      { id: 'amf', role: 'AMF', label: 'صانع ألعاب', x: 50, y: 38, category: 'midfield' },
      { id: 'cmf', role: 'CMF', label: 'محور مساند', x: 35, y: 55, category: 'midfield' },
      { id: 'dmf', role: 'DMF', label: 'ارتكاز دفاعي', x: 65, y: 60, category: 'midfield' },
      { id: 'lb', role: 'LB', label: 'ظهير أيسر', x: 15, y: 72, category: 'defense' },
      { id: 'cb1', role: 'CB', label: 'قلب دفاع', x: 38, y: 76, category: 'defense' },
      { id: 'cb2', role: 'CB', label: 'قلب دفاع', x: 62, y: 76, category: 'defense' },
      { id: 'rb', role: 'RB', label: 'ظهير أيمن', x: 85, y: 72, category: 'defense' },
      { id: 'gk', role: 'GK', label: 'حارس مرمى', x: 50, y: 92, category: 'gk' }
    ]
  },
  '4-1-2-3': {
    name: '4-1-2-3 (هجوم مزدوج بـ 2 AMF)',
    nodes: [
      { id: 'cf', role: 'CF', label: 'مهاجم صريح', x: 50, y: 14, category: 'attack' },
      { id: 'lwf', role: 'LWF', label: 'جناح أيسر', x: 20, y: 22, category: 'attack' },
      { id: 'rwf', role: 'RWF', label: 'جناح أيمن', x: 80, y: 22, category: 'attack' },
      { id: 'amf1', role: 'AMF', label: 'صانع ألعاب أيسر', x: 36, y: 38, category: 'midfield' },
      { id: 'amf2', role: 'AMF', label: 'صانع ألعاب أيمن', x: 64, y: 38, category: 'midfield' },
      { id: 'dmf', role: 'DMF', label: 'ارتكاز وحيد', x: 50, y: 58, category: 'midfield' },
      { id: 'lb', role: 'LB', label: 'ظهير أيسر', x: 15, y: 73, category: 'defense' },
      { id: 'cb1', role: 'CB', label: 'قلب دفاع', x: 38, y: 76, category: 'defense' },
      { id: 'cb2', role: 'CB', label: 'قلب دفاع', x: 62, y: 76, category: 'defense' },
      { id: 'rb', role: 'RB', label: 'ظهير أيمن', x: 85, y: 73, category: 'defense' },
      { id: 'gk', role: 'GK', label: 'حارس مرمى', x: 50, y: 92, category: 'gk' }
    ]
  },
  '4-3-1-2': {
    name: '4-3-1-2 (ماسة العمق والتيكي تاكا)',
    nodes: [
      { id: 'cf1', role: 'CF', label: 'مهاجم أول', x: 38, y: 16, category: 'attack' },
      { id: 'cf2', role: 'CF', label: 'مهاجم ثانٍ', x: 62, y: 16, category: 'attack' },
      { id: 'amf', role: 'AMF', label: 'صانع ألعاب ماسي', x: 50, y: 34, category: 'midfield' },
      { id: 'cmf1', role: 'CMF', label: 'محور أيسر', x: 28, y: 50, category: 'midfield' },
      { id: 'dmf', role: 'DMF', label: 'قاعدة الماسة DMF', x: 50, y: 58, category: 'midfield' },
      { id: 'cmf2', role: 'CMF', label: 'محور أيمن', x: 72, y: 50, category: 'midfield' },
      { id: 'lb', role: 'LB', label: 'ظهير أيسر', x: 15, y: 73, category: 'defense' },
      { id: 'cb1', role: 'CB', label: 'قلب دفاع', x: 38, y: 76, category: 'defense' },
      { id: 'cb2', role: 'CB', label: 'قلب دفاع', x: 62, y: 76, category: 'defense' },
      { id: 'rb', role: 'RB', label: 'ظهير أيمن', x: 85, y: 73, category: 'defense' },
      { id: 'gk', role: 'GK', label: 'حارس مرمى', x: 50, y: 92, category: 'gk' }
    ]
  },
  '4-2-2-2': {
    name: '4-2-2-2 (التوازن الكلاسيكي 2 CF و 2 AMF)',
    nodes: [
      { id: 'cf1', role: 'CF', label: 'مهاجم أيسر', x: 38, y: 15, category: 'attack' },
      { id: 'cf2', role: 'CF', label: 'مهاجم أيمن', x: 62, y: 15, category: 'attack' },
      { id: 'amf1', role: 'AMF', label: 'صانع ألعاب أيسر', x: 28, y: 35, category: 'midfield' },
      { id: 'amf2', role: 'AMF', label: 'صانع ألعاب أيمن', x: 72, y: 35, category: 'midfield' },
      { id: 'dmf1', role: 'DMF', label: 'ارتكاز دفاعي', x: 38, y: 56, category: 'midfield' },
      { id: 'dmf2', role: 'CMF', label: 'محور ثانٍ', x: 62, y: 56, category: 'midfield' },
      { id: 'lb', role: 'LB', label: 'ظهير أيسر', x: 15, y: 73, category: 'defense' },
      { id: 'cb1', role: 'CB', label: 'قلب دفاع', x: 38, y: 76, category: 'defense' },
      { id: 'cb2', role: 'CB', label: 'قلب دفاع', x: 62, y: 76, category: 'defense' },
      { id: 'rb', role: 'RB', label: 'ظهير أيمن', x: 85, y: 73, category: 'defense' },
      { id: 'gk', role: 'GK', label: 'حارس مرمى', x: 50, y: 92, category: 'gk' }
    ]
  },
  '3-2-2-3': {
    name: '3-2-2-3 (الثلاثي الخلفي مع أجنحة)',
    nodes: [
      { id: 'cf', role: 'CF', label: 'مهاجم صريح', x: 50, y: 15, category: 'attack' },
      { id: 'lwf', role: 'LWF', label: 'جناح أيسر', x: 20, y: 22, category: 'attack' },
      { id: 'rwf', role: 'RWF', label: 'جناح أيمن', x: 80, y: 22, category: 'attack' },
      { id: 'amf1', role: 'AMF', label: 'صانع لعب', x: 38, y: 38, category: 'midfield' },
      { id: 'amf2', role: 'AMF', label: 'صانع لعب', x: 62, y: 38, category: 'midfield' },
      { id: 'dmf1', role: 'DMF', label: 'ارتكاز أيسر', x: 38, y: 56, category: 'midfield' },
      { id: 'dmf2', role: 'DMF', label: 'ارتكاز أيمن', x: 62, y: 56, category: 'midfield' },
      { id: 'cb1', role: 'CB', label: 'مدافع أيسر', x: 26, y: 75, category: 'defense' },
      { id: 'cb2', role: 'CB', label: 'مدافع قلب', x: 50, y: 76, category: 'defense' },
      { id: 'cb3', role: 'CB', label: 'مدافع أيمن', x: 74, y: 75, category: 'defense' },
      { id: 'gk', role: 'GK', label: 'حارس مرمى', x: 50, y: 92, category: 'gk' }
    ]
  },
  '5-2-1-2': {
    name: '5-2-1-2 (الجدار الدفاعي المحكم)',
    nodes: [
      { id: 'cf1', role: 'CF', label: 'مهاجم أول', x: 38, y: 16, category: 'attack' },
      { id: 'cf2', role: 'CF', label: 'مهاجم ثانٍ', x: 62, y: 16, category: 'attack' },
      { id: 'amf', role: 'AMF', label: 'صانع ألعاب', x: 50, y: 36, category: 'midfield' },
      { id: 'cmf', role: 'CMF', label: 'محور CMF', x: 38, y: 54, category: 'midfield' },
      { id: 'dmf', role: 'DMF', label: 'ارتكاز DMF', x: 62, y: 54, category: 'midfield' },
      { id: 'lwb', role: 'LWB', label: 'جناح دفاعي أيسر', x: 14, y: 68, category: 'defense' },
      { id: 'cb1', role: 'CB', label: 'قلب دفاع أيسر', x: 32, y: 76, category: 'defense' },
      { id: 'cb2', role: 'CB', label: 'قلب دفاع سنتر', x: 50, y: 77, category: 'defense' },
      { id: 'cb3', role: 'CB', label: 'قلب دفاع أيمن', x: 68, y: 76, category: 'defense' },
      { id: 'rwb', role: 'RWB', label: 'جناح دفاعي أيمن', x: 86, y: 68, category: 'defense' },
      { id: 'gk', role: 'GK', label: 'حارس مرمى', x: 50, y: 92, category: 'gk' }
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1 (التحكم والتدرج المتوازن)',
    nodes: [
      { id: 'cf', role: 'CF', label: 'مهاجم صريح', x: 50, y: 15, category: 'attack' },
      { id: 'lmf', role: 'LMF', label: 'وسط هجومي أيسر', x: 22, y: 32, category: 'midfield' },
      { id: 'amf', role: 'AMF', label: 'صانع ألعاب', x: 50, y: 34, category: 'midfield' },
      { id: 'rmf', role: 'RMF', label: 'وسط هجومي أيمن', x: 78, y: 32, category: 'midfield' },
      { id: 'dmf1', role: 'DMF', label: 'ارتكاز دفاعي', x: 38, y: 56, category: 'midfield' },
      { id: 'dmf2', role: 'CMF', label: 'محور توزيع', x: 62, y: 56, category: 'midfield' },
      { id: 'lb', role: 'LB', label: 'ظهير أيسر', x: 15, y: 73, category: 'defense' },
      { id: 'cb1', role: 'CB', label: 'قلب دفاع', x: 38, y: 76, category: 'defense' },
      { id: 'cb2', role: 'CB', label: 'قلب دفاع', x: 62, y: 76, category: 'defense' },
      { id: 'rb', role: 'RB', label: 'ظهير أيمن', x: 85, y: 73, category: 'defense' },
      { id: 'gk', role: 'GK', label: 'حارس مرمى', x: 50, y: 92, category: 'gk' }
    ]
  },
  '4-4-2': {
    name: '4-4-2 (الخطين المتوازيين الكلاسيكية)',
    nodes: [
      { id: 'cf1', role: 'CF', label: 'مهاجم أول', x: 38, y: 16, category: 'attack' },
      { id: 'cf2', role: 'CF', label: 'مهاجم ثانٍ', x: 62, y: 16, category: 'attack' },
      { id: 'lmf', role: 'LMF', label: 'وسط أيسر', x: 18, y: 44, category: 'midfield' },
      { id: 'cmf1', role: 'CMF', label: 'محور ارتكاز', x: 40, y: 48, category: 'midfield' },
      { id: 'cmf2', role: 'CMF', label: 'محور هجومي', x: 60, y: 48, category: 'midfield' },
      { id: 'rmf', role: 'RMF', label: 'وسط أيمن', x: 82, y: 44, category: 'midfield' },
      { id: 'lb', role: 'LB', label: 'ظهير أيسر', x: 15, y: 73, category: 'defense' },
      { id: 'cb1', role: 'CB', label: 'قلب دفاع', x: 38, y: 76, category: 'defense' },
      { id: 'cb2', role: 'CB', label: 'قلب دفاع', x: 62, y: 76, category: 'defense' },
      { id: 'rb', role: 'RB', label: 'ظهير أيمن', x: 85, y: 73, category: 'defense' },
      { id: 'gk', role: 'GK', label: 'حارس مرمى', x: 50, y: 92, category: 'gk' }
    ]
  }
};

export const TACTICAL_PRESETS: TacticalPreset[] = [
  {
    id: 'p_4213_qc',
    name: '4-2-1-3 هجوم كاسح (ثغرة ارتداد وأظهرة)',
    formation: '4-2-1-3',
    playstyle: 'quick_counter',
    description: 'خطة هجومية فتاكة بـ 3 مهاجمين، ولكن تترك شوارع مفتوحة خلف الظهيرين في المرتدات السريعة.',
    hasAnchorMan: false,
    offensiveFullbacks: true,
    cfType: 'goal_poacher',
    expectedScore: 73
  },
  {
    id: 'p_4123_high_risk',
    name: '4-1-2-3 مجازفة وسط (ارتكاز وحيد ودفاع هش)',
    formation: '4-1-2-3',
    playstyle: 'quick_counter',
    description: '2 صناع لعب مع ارتكاز وحيد، أي تمريرة مقطوعة تتحول لانفراد مباشر على قلوب الدفاع.',
    hasAnchorMan: false,
    offensiveFullbacks: true,
    cfType: 'goal_poacher',
    expectedScore: 65
  },
  {
    id: 'p_4312_tiki',
    name: '4-3-1-2 ماسة التيكي تاكا (اختناق الأطراف)',
    formation: '4-3-1-2',
    playstyle: 'possession',
    description: 'سيطرة تامة على عمق الملعب، لكنها تعاني بشدة أمام الخصوم المتكتلين لعدم وجود أجنحة أو عرضيات.',
    hasAnchorMan: true,
    offensiveFullbacks: false,
    cfType: 'deep_lying',
    expectedScore: 84
  },
  {
    id: 'p_4222_meta',
    name: '4-2-2-2 ميتـا المحترفين (توازن ثنائي)',
    formation: '4-2-2-2',
    playstyle: 'long_ball_counter',
    description: 'توازن دفاعي وهجومي ممتاز بـ 2 ارتكاز ومهاجمين، التشكيلة المفضلة لدى أبطال بطولات eFootball.',
    hasAnchorMan: true,
    offensiveFullbacks: false,
    cfType: 'goal_poacher',
    expectedScore: 92
  },
  {
    id: 'p_5212_wall',
    name: '5-2-1-2 الجدار الدفاعي الخماسي',
    formation: '5-2-1-2',
    playstyle: 'long_ball_counter',
    description: 'إغلاق حديدي لكافة منافذ المرمى مع الاعتماد على المرتدات السريعة بالمهاجمين.',
    hasAnchorMan: true,
    offensiveFullbacks: true,
    cfType: 'goal_poacher',
    expectedScore: 88
  },
  {
    id: 'p_3223_wings',
    name: '3-2-2-3 القوة الهجومية الثلاثية',
    formation: '3-2-2-3',
    playstyle: 'out_wide',
    description: 'استغلال كامل لعرض الملعب بالعرضيات، ولكن تتطلب قلوب دفاع سريعين جداً لتأمين الأطراف.',
    hasAnchorMan: true,
    offensiveFullbacks: false,
    cfType: 'target_man',
    expectedScore: 80
  }
];

export interface TacticalInputOptions {
  formation: FormationId;
  playstyle: PlaystyleId;
  hasAnchorMan: boolean;
  offensiveFullbacks: boolean;
  cbDestroyerBuildUpCombo: boolean;
  cfType: 'goal_poacher' | 'deep_lying' | 'target_man';
}

export function generateTacticalReport(options: TacticalInputOptions): TacticalReport {
  let score = 82;
  let defenseScore = 80;
  let attackScore = 84;

  const strengths: string[] = [];
  const errors: TacticalReport['errors'] = [];
  const individualInstructions: TacticalReport['individualInstructions'] = [];
  const idealProfiles: TacticalReport['idealProfiles'] = [];

  const fData = FORMATIONS_PITCH_MAP[options.formation];

  // 1. Formation Analysis
  if (options.formation === '4-2-1-3') {
    strengths.push('كثافة هجومية ثلاثية خارقة (LWF + CF + RWF) مع AMF مساند يشكل رباعي ضغط مرعب.');
    strengths.push('اتساع عرضي ممتاز يجبر دفاع الخصم على التباعد مما يفتح ممرات التمرير للعمق.');
    if (options.offensiveFullbacks) {
      score -= 8;
      defenseScore -= 18;
      errors.push({
        title: 'ثغرة المساحات الشاسعة خلف الظهيرين في المرتدات',
        desc: 'تقدم الظهيرين (LB/RB) للهجوم مع اللعب بـ 3 مهاجمين يترك قلبي الدفاع في موقف 2 ضد 2 أو 2 ضد 3 عند قطع الكرة.',
        severity: 'critical',
        fix: 'ضع تعليمة "Defensive" على أحد الظهيرين (أو كلاهما)، أو استخدم ظهير دفاعي صريح (Defensive Full-back).'
      });
      individualInstructions.push({
        targetPlayer: 'LB أو RB (الظهير الأكثر تقدماً)',
        instruction: 'Defensive (دفاعي)',
        instructionType: 'Defensive',
        reason: 'منع الظهير من الصعود العشوائي وتأمين التغطية خلف الجناح أثناء هجمات الخصم المرتدة.'
      });
    }
  } else if (options.formation === '4-1-2-3') {
    strengths.push('قوة اختراق هجومية ساحقة بتواجد 5 لاعبين في الثلث الأخير من ملعب الخصم.');
    score -= 14;
    defenseScore -= 24;
    errors.push({
      title: 'كارثة الارتكاز الوحيد (Single Pivot Collapse)',
      desc: 'تواجد لاعب ارتكاز وحيد خلف 2 AMF يجعل وسطك مكشوفاً تماماً، وسينهار تحت أي ضغط مرتد سريع من الخصم.',
      severity: 'critical',
      fix: 'حوّل أحد صناع اللعب AMF إلى لاعب محور متوازن CMF (Box-to-Box)، وضع تعليمة Deep Line على لاعب الارتكاز.'
    });
    individualInstructions.push({
      targetPlayer: 'DMF (لاعب الارتكاز الوحيد)',
      instruction: 'Deep Line (خط عميق)',
      instructionType: 'Deep Line',
      reason: 'نزول الارتكاز بين قلبي الدفاع ليصبح مدافعاً ثالثاً عند فقدان الكرة لإغلاق الثغرة العرضية.'
    });
  } else if (options.formation === '4-3-1-2') {
    strengths.push('تحكم كروي وتيكي تاكا استثنائية في عمق الملعب بتواجد 4 لاعبين وسط متقاربين.');
    strengths.push('ثنائية هجومية 2 CF تتيح تمريرات الـ One-Two السريعة لضرب خط التسلل.');
    attackScore -= 10;
    errors.push({
      title: 'عقم تكتيكي على الأطراف وتكدس العمق (No Width)',
      desc: 'التشكيلة ضيقة جداً وتفتقر للأجنحة، والخصوم الذين يلعبون بتكتل دفاعي منخفض سيعزلون مهاجميك بسهولة.',
      severity: 'medium',
      fix: 'استخدم ظهيراً هجومياً بنزعة عرضيات (Cross Specialist / Offensive Full-back) لمنح الفريق متنفساً على الأطراف.'
    });
  } else if (options.formation === '4-2-2-2') {
    strengths.push('توازن مثالي وأقوى تشكيلات الميتـا التنافسية؛ ثنائي هجومي مع ثنائي صناعة وثنائي ارتكاز.');
    strengths.push('صلابة دفاعية محورية عالية وصعوبة بالغة في اختراق عمق فريقك.');
    score += 8;
    defenseScore += 8;
    attackScore += 6;
  } else if (options.formation === '5-2-1-2') {
    strengths.push('جدار دفاعي فولاذي بخمسة مدافعين يغلق منطقة الجزاء تماماً أمام أي اختراق.');
    defenseScore += 16;
    if (!options.offensiveFullbacks) {
      attackScore -= 15;
      errors.push({
        title: 'عزلة خط الهجوم وبطء نقل الكرة للأمام',
        desc: 'اللعب بـ 5 مدافعين مع بقاء الأظهرة في الخلف يجعل صناعة اللعب بطيئة وتعتمد فقط على كرات عشوائية.',
        severity: 'medium',
        fix: 'فعل صعود الأجنحة الدفاعية (LWB/RWB) كأظهرة هجومية سريعة لربط الدفاع بالهجوم.'
      });
    }
  } else if (options.formation === '3-2-2-3') {
    strengths.push('ضغط هجومي عالي واستحواذ كثيف على الثلث الأوسط ومناطق الخصم.');
    if (options.playstyle === 'quick_counter') {
      defenseScore -= 16;
      errors.push({
        title: 'خطر الانكشاف الجانبي السريع لقلوب الدفاع',
        desc: '3 مدافعين فقط مع خط دفاعي متقدم يجعل أي كرة ساقطة في المساحة الجانبية انفراداً محققاً للخصم.',
        severity: 'critical',
        fix: 'يجب أن يمتلك قلبا الدفاع الجانبيان سرعة تفوق 84 مع وعي دفاعي عالي.'
      });
    }
  }

  // 2. Playstyle Rules
  if (options.playstyle === 'quick_counter') {
    strengths.push('ضغط عكسي عنيف واستخلاص فوري للكرة في ملعب الخصم للتسديد المباشر.');
    score -= 4;
    errors.push({
      title: 'خط الدفاع المتقدم جداً (High Defensive Line Vulnerability)',
      desc: 'أسلوب الهجوم المضاد السريع يرفع خط دفاعك لمنتصف الملعب تلقائياً، وأي كرة بينية (Through Ball) خلف المدافعين تشكل هدفاً مؤكداً لمهاجم سريع.',
      severity: 'high',
      fix: 'اعتمد قلبي دفاع سريعين (سرعة 82+) ولا تضغط بالقلب للأمام قبل أن يعود خط الوسط للتغطية.'
    });
    individualInstructions.push({
      targetPlayer: 'صانع الألعاب أو الجناح الأساسي',
      instruction: 'Counter Target (هدف مرتد)',
      instructionType: 'Counter Target',
      reason: 'إبقاء اللاعب في الأمام دون استنزاف طاقته في الدفاع، ليكون متاحاً دائماً للتمرير عند قطع الكرة.'
    });
  } else if (options.playstyle === 'possession') {
    strengths.push('تقارب رائع بين الخطوط وهدوء في بناء الهجمة وتفكيك دفاعات الخصم بالصبر.');
    if (options.cfType === 'target_man') {
      errors.push({
        title: 'عدم توافق أسلوب المهاجم المحطة مع الاستحواذ القصير',
        desc: 'المهاجم المحطة الكلاسيكي بطيء في الحركة والتمرير القصير، مما يبطئ رتم الاستحواذ ويقطع الهجمة.',
        severity: 'medium',
        fix: 'استخدم مهاجماً بأسلوب Deep-Lying Forward (مثل ميسي أو ديبالا) أو Goal Poacher سريع ومرن.'
      });
    }
  } else if (options.playstyle === 'long_ball_counter') {
    strengths.push('دفاع متكتل منخفض (Low Block) يمنع الأهداف البينية مع سرعة تحول عمودي خيالية.');
    score += 4;
    defenseScore += 6;
  }

  // 3. Anchor Man Rule
  if (!options.hasAnchorMan) {
    score -= 10;
    defenseScore -= 14;
    errors.push({
      title: 'غياب لاعب ارتكاز دفاعي صريح (No Anchor Man)',
      desc: 'إذا كان لاعب الوسط بأسلوب Box-to-Box أو Orchestrator فإنه سيتقدم حتماً للهجوم، تاركاً مساحة أمام قلبي الدفاع يستغلها صانع ألعاب الخصم للتسديد المريح.',
      severity: 'high',
      fix: 'أشرك لاعباً بأسلوب ارتكاز دفاعي صريح (Anchor Man) مثل رودري، كاسيميرو، فابينيو، أو غيلبرتو سيلفا.'
    });
    individualInstructions.push({
      targetPlayer: 'أقوى لاعب وسط دفاعي DMF',
      instruction: 'Anchoring (تثبيت التمركز)',
      instructionType: 'Anchoring',
      reason: 'إلزام لاعب الوسط بالبقاء في موقعه بالعمق لمنع تشتت ارتكاز الفريق.'
    });
  } else {
    strengths.push('تأمين محوري صلب أمام قلبي الدفاع بفضل وجود لاعب ارتكاز دفاعي Anchor Man.');
  }

  // 4. Ideal Profiles
  idealProfiles.push({
    position: 'قلب الدفاع (CB)',
    recommendedStyle: 'Destroyer بجوار Build Up سريع',
    recommendedPlayers: 'روديغر / كوليبالي (Destroyer) + ساليبا / مالديني (Build Up)',
    why: 'توليفة المدافع الكاسح يفتك بالكرات، ومدافع البناء يغطي المساحة خلفه بتمركز هادئ.'
  });

  idealProfiles.push({
    position: 'الارتكاز (DMF)',
    recommendedStyle: 'Anchor Man (ارتكاز صريح)',
    recommendedPlayers: 'رودري، كاسيميرو، فييرا، رايكارد',
    why: 'التمركز المستمر أمام خط الدفاع وحماية المساحة الحيوية (Zone 14) أمام منطقة الجزاء.'
  });

  idealProfiles.push({
    position: 'صانع الألعاب (AMF)',
    recommendedStyle: 'Hole Player أو Creative Playmaker',
    recommendedPlayers: 'كرويف، بيلينغهام، ميسي، كيفين دي بروين',
    why: 'القناص الخفي (Hole Player) يخترق منطقة الجزاء فجأة ليسجل أهدافاً غير متوقعة.'
  });

  // 5. Counter Tactic
  let bestCounter = '4-2-2-2 هجوم مضاد طويل';
  let counterAdvice = 'استدرج خط دفاعه المتقدم واضربه بالكرات البينية الطويلة خلف الأظهرة.';
  let counterVulnerability = 'المساحات الواسعة خلف خط دفاعه والضغط العكسي المنفلت.';

  if (options.formation === '4-3-1-2') {
    bestCounter = '4-2-1-3 اللعب على الأطراف (Out Wide)';
    counterAdvice = 'العب على الأجنحة بكثافة؛ لأن خصمك لا يمتلك أجنحة دفاعية، وستكون العرضيات كابوساً له.';
    counterVulnerability = 'انعدام الأجنحة واختناق العمق بالكامل.';
  } else if (options.formation === '5-2-1-2') {
    bestCounter = '4-3-3 أو 4-2-3-1 مع تسديدات من خارج المنطقة';
    counterAdvice = 'تجنب الاختراق العرضي في صندوقه المتكدس، واعتمد على التسديدات المقوسة (Curler) من حدود الـ 18.';
    counterVulnerability = 'التراجع المفرط وترك حرية التسديد على حدود المنطقة.';
  }

  // Adjust bounds
  score = Math.min(96, Math.max(54, score));
  defenseScore = Math.min(98, Math.max(50, defenseScore));
  attackScore = Math.min(98, Math.max(50, attackScore));

  return {
    overallScore: score,
    defenseBalance: defenseScore,
    attackBalance: attackScore,
    formationName: fData.name,
    playstyleName: options.playstyle === 'quick_counter' 
      ? 'هجوم مضاد سريع (Quick Counter)' 
      : options.playstyle === 'possession' 
      ? 'استحواذ (Possession)' 
      : options.playstyle === 'long_ball_counter' 
      ? 'هجوم مضاد طويل (Long Ball Counter)' 
      : 'لعب على الأطراف (Out Wide)',
    strengths,
    errors,
    individualInstructions,
    idealProfiles,
    counterTactic: {
      bestCounterFormation: bestCounter,
      playstyleAdvice: counterAdvice,
      vulnerabilityToExploit: counterVulnerability
    }
  };
}
