export interface Manager {
  id: string;
  name: string;
  inGameName: string;
  clubOrCountry: string;
  flag?: string;
  playstyle: string;
  playstyleCategory: 'possession' | 'quick-counter' | 'long-ball-counter' | 'out-wide' | 'long-ball';
  playstyleScore: number;
  formation: string;
  booster?: string;
  tactics: {
    offensive: string;
    defensive: string;
    buildUp: string;
    pressing: string;
  };
  recommendedArchetypes: string[];
  description: string;
}

export const MANAGERS_LIST: Manager[] = [
  {
    id: 'm-1',
    name: 'بيب غوارديولا',
    inGameName: 'L. ROMAN',
    clubOrCountry: 'مانشستر سيتي',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 88,
    formation: '4-3-3',
    booster: '+1 التمرير المنخفض والوعي التكتيكي',
    tactics: {
      offensive: 'استحواذ هجومي من العمق وتناقل كرات قصيرة وسريعة',
      defensive: 'ضغط عالٍ شرس وخط دفاع متقدم لخنق الخصم',
      buildUp: 'بناء اللعب من الخلف عبر حارس المرمى ولاعبي الارتكاز',
      pressing: 'ضغط عنيف ومكثف فور فقدان الكرة لاسترجاعها خلال 5 ثوانٍ'
    },
    recommendedArchetypes: ['صانع ألعاب كلاسيكي', 'حارس هجومي', 'مهاجم وهمي', 'محور منظم'],
    description: 'أفضل مدرب لأسلوب الاستحواذ في بيس موبايل. يعتمد على خلق مساحات بالتمريرات القصيرة المثلثة مع تقدم الأظهرة كلاعبي وسط إضافيين.'
  },
  {
    id: 'm-2',
    name: 'يورغن كلوب',
    inGameName: 'G. ZEITZLER',
    clubOrCountry: 'ليفربول',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 87,
    formation: '4-3-3',
    booster: '+1 السرعة والتسارع البدني',
    tactics: {
      offensive: 'انطلاقات سريعة ومباشرة فور افتكاك الكرة نحو المرمى',
      defensive: 'الضغط العكسي الشامل (Gegenpressing) في منتصف ملعب الخصم',
      buildUp: 'كرات بينية سريعة وساقطة خلف المدافعين',
      pressing: 'ضغط خانق بالثلاثي الهجومي ولاعبي الوسط'
    },
    recommendedArchetypes: ['قناص Goal Poacher', 'جناح ساطع Roaming Flank', 'محور قاطع للكرات Destroyer'],
    description: 'مدرب المرتدات السريعة الأكثر فتكاً. يمنح لاعبيك سرعة استجابة هائلة فور قطع الكرة واندفاع هجومي صاعق نحو دفاعات المنافس.'
  },
  {
    id: 'm-3',
    name: 'كارلو أنشيلوتي',
    inGameName: 'G. PESTRONE',
    clubOrCountry: 'ريال مدريد',
    playstyle: 'هجمة مرتدة طويلة (Long Ball Counter)',
    playstyleCategory: 'long-ball-counter',
    playstyleScore: 86,
    formation: '4-4-2 ماسي (4-1-2-1-2)',
    booster: '+1 الوعي الدفاعي والإنهاء',
    tactics: {
      offensive: 'تحولات هجومية مرنة تعتمد على المهارات الفردية والانطلاقات السريعة',
      defensive: 'تكتل دفاعي منخفض يحمي منطقة الجزاء ويغلق المساحات',
      buildUp: 'كرات طويلة ذكية في المساحات الشاغرة للأجنحة والمهاجمين',
      pressing: 'دفاع المنطقة وتأمين الثغرات الخلفية بذكاء وهدوء'
    },
    recommendedArchetypes: ['صانع ألعاب متقدم AMF', 'مهاجم سريع', 'قلب دفاع صلب Build Up'],
    description: 'مدرب التوازن والدهاء التكتيكي. مثالي لمن يفضل تأمين دفاعاته تماماً ضد الخصوم أصحاب السرعات ثم ضربهم بمرتدات قاتلة.'
  },
  {
    id: 'm-4',
    name: 'تشابي ألونسو',
    inGameName: 'XABI ALONSO (بوستر)',
    clubOrCountry: 'باير ليفركوزن',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 88,
    formation: '3-4-2-1',
    booster: '+1 التسارع وقوة التسديد',
    tactics: {
      offensive: 'زيادة عددية كاسحة بواسطة لاعبي الوسط وثنائي صناعة اللعب خلف المهاجم',
      defensive: 'ثلاثي دفاعي صلب مع ارتداد لاعبي الجناح كأظهرة وقت الدفاع',
      buildUp: 'تمريرات عمودية دقيقة وسريعة بين خطوط الخصم',
      pressing: 'ضغط مكثف واسترجاع الكرة بأسرع وقت'
    },
    recommendedArchetypes: ['محور شامل Box-to-Box', 'صانع ألعاب هول براير Hole Player', 'حارس هجومي'],
    description: 'النسخة البوستر الأشهر في اللعبة التي حققت أعلى شعبية بين لاعبي الديفيجن الأول بفضل السرعة والقوة التكتيكية الخارقة.'
  },
  {
    id: 'm-5',
    name: 'دييغو سيميوني',
    inGameName: 'C. VALBUENA',
    clubOrCountry: 'أتلتيكو مدريد',
    playstyle: 'هجمة مرتدة طويلة (Long Ball Counter)',
    playstyleCategory: 'long-ball-counter',
    playstyleScore: 86,
    formation: '4-4-2',
    booster: '+1 الاحتكاك البدني والوعي الدفاعي',
    tactics: {
      offensive: 'كرات مباشرة للمهاجمين المزدوجين مع مساندة الأطراف',
      defensive: 'جدار دفاعي فولاذي بخطين من 4 لاعبين متقاربين بشدة',
      buildUp: 'إخراج الكرة بأمان تام وتفادي أي خطأ في الثلث الخلفي',
      pressing: 'ضغط دفاعي شرس داخل حدود نصف الملعب الخاص بك'
    },
    recommendedArchetypes: ['مهاجم قناص', 'قلب دفاع مدمر Destroyer', 'وسط دفاعي صلب Anchor Man'],
    description: 'رمز الصلابة الدفاعية في بيس موبايل. أفضل مدرب لمن يعاني من استقبال الأهداف السهلة ويرغب في إغلاق المرمى تماماً.'
  },
  {
    id: 'm-6',
    name: 'ميكيل أرتيتا',
    inGameName: 'M. ARTETA',
    clubOrCountry: 'آرسنال',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 86,
    formation: '4-3-3',
    booster: '+1 التمرير المنخفض والمراوغة',
    tactics: {
      offensive: 'السيطرة على الثلث الأخير وتوزيع اللعب عبر الأجنحة الحرة',
      defensive: 'ضغط أمامي منسق لمنع تدرج الخصم بالكرة',
      buildUp: 'تمركز ذكي للأظهرة لفتح زوايا تمرير إضافية',
      pressing: 'اعتراض التمريرات وقفل مسارات التحول'
    },
    recommendedArchetypes: ['جناح بارع Prolific Winger', 'وسط مبدع Orchestrator', 'مدافع قناص'],
    description: 'تطبيق عصري وديناميكي للاستحواذ. يمنح الفريق تماسكاً وتفوقاً هجومياً مستمراً مع خيارات تمرير لا تنتهي.'
  },
  {
    id: 'm-7',
    name: 'لويس إنريكي',
    inGameName: 'L. ENRIQUE',
    clubOrCountry: 'باريس سان جيرمان',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 87,
    formation: '4-3-3',
    booster: '+1 التحكم بالكرة وقوة الركل',
    tactics: {
      offensive: 'هجوم شامل واستغلال مهارات وسرعات أجنحة الهجوم',
      defensive: 'خط دفاعي متقدم مع حارس مرمى يقظ للتغطية',
      buildUp: 'تدوير هادئ للكرة حتى تظهر ثغرة في دفاع المنافس',
      pressing: 'استخلاص الكرة في منتصف ملعب المنافس مباشرة'
    },
    recommendedArchetypes: ['أجنحة مهارية', 'مهاجم متكامل', 'محور قاطع الكرات'],
    description: 'يجمع بين الاستحواذ الإسباني الصارم والحدة الهجومية المباشرة للأجنحة لضرب المنافسين بعمق وتنوع تكتيكي.'
  },
  {
    id: 'm-8',
    name: 'إريك تين هاغ',
    inGameName: 'E. TEN HAG (بوستر)',
    clubOrCountry: 'مانشستر يونايتد',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 86,
    formation: '4-2-1-3',
    booster: '+1 السرعة والتحكم بالكرة',
    tactics: {
      offensive: 'استغلال سرعة صانع اللعب والأجنحة في المساحات',
      defensive: 'تأمين المحاور المزدوجة لحماية عمق الملعب',
      buildUp: 'نقل سريع للكرة من الارتكاز إلى صانع الألعاب',
      pressing: 'ضغط جماعي موجه لإجبار الخصم على الخطأ'
    },
    recommendedArchetypes: ['صانع ألعاب AMF مهاري', 'أجنحة نفاثة', 'محور قاطع كرات صلب'],
    description: 'تشكيلة 4-2-1-3 المفضلة للاعبي بيس المحترفين، تجمع بين هيبة المرتدة السريعة وتواجد صانع لعب حر خلف ثلاثي الهجوم.'
  },
  {
    id: 'm-9',
    name: 'هانسي فليك',
    inGameName: 'H. FLICK',
    clubOrCountry: 'برشلونة',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 87,
    formation: '4-2-3-1',
    booster: '+1 الوعي الهجومي والإنهاء',
    tactics: {
      offensive: 'ضغط هجومي ساحق وتواجد مكثف داخل منطقة الجزاء',
      defensive: 'مصيدة تسلل متقدمة وجريئة لحرمان الخصم من الانفرادات',
      buildUp: 'هجمات عمودية سريعة ومباغتة بأقل عدد تمريرات',
      pressing: 'ضغط شرس مستمر من الدقيقة الأولى وحتى صافرة النهاية'
    },
    recommendedArchetypes: ['مهاجم إنهاء 99', 'صانع ألعاب ذكي', 'أظهرة سريعة جداً'],
    description: 'الضغط العالي الألماني الصارم. يمتاز بفريقه الشرس الذي لا يرحم دفاعات الخصم ويسجل من أنصاف الفرص.'
  },
  {
    id: 'm-10',
    name: 'ليونيل سكالوني',
    inGameName: 'L. SCALONI',
    clubOrCountry: 'الأرجنتين (بطل العالم)',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 87,
    formation: '4-3-3 متوازنة',
    booster: '+1 التمرير المنخفض والروح القتالية',
    tactics: {
      offensive: 'حرية كاملة للاعبي الهجوم مع تدرج سريع وتناغم بين الخطوط',
      defensive: 'قتالية عالية وتقارب مذهل بين لاعبي الوسط والدفاع',
      buildUp: 'بناء لعب ذكي عبر تمريرات بينية ساحرة',
      pressing: 'تضييق الخناق على مفاتيح لعب الخصم'
    },
    recommendedArchetypes: ['مهاجم وهمي SS', 'وسط بوكس تو بوكس مقاتل', 'محور ارتكاز متزن'],
    description: 'تكتيك بطل العالم في قطر 2022. تمتاز تشكيلته بالروح العالية والقدرة الفائقة على الحسم في المباريات الحساسة والديربيات.'
  },
  {
    id: 'm-11',
    name: 'ديدييه ديشان',
    inGameName: 'D. DESCHAMPS',
    clubOrCountry: 'منتخب فرنسا',
    playstyle: 'هجمة مرتدة طويلة (Long Ball Counter)',
    playstyleCategory: 'long-ball-counter',
    playstyleScore: 86,
    formation: '4-2-3-1',
    booster: '+1 القوة البدنية والسرعة',
    tactics: {
      offensive: 'استغلال سرعة الأجنحة الفتاكة في المساحات الخالية',
      defensive: 'كتلة دفاعية قوية ومنظمة تصعب اختراقها',
      buildUp: 'كرات ساقطة ومباشرة خلف خط ظهر المنافس',
      pressing: 'دفاع متوازن وانقضاض سريع لقطع الكرة'
    },
    recommendedArchetypes: ['جناح فائق السرعة', 'مهاجم محطة Target Man', 'مدافع فولاذي'],
    description: 'تكتيك الواقعية والفاعلية المطلقة. يتيح لك استغلال نجومك السريعين مثل مبابي لضرب أي خصم بهجمة مرتدة واحدة.'
  },
  {
    id: 'm-12',
    name: 'سيموني إنزاغي',
    inGameName: 'S. INZAGHI',
    clubOrCountry: 'إنتر ميلان',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 85,
    formation: '3-5-2 (3-2-3-2)',
    booster: '+1 التمركز والوعي التكتيكي',
    tactics: {
      offensive: 'ثنائي هجومي متناغم يساند بعضه مع انطلاقات لاعبي الأطراف',
      defensive: 'خماسي دفاعي عند الارتداد لحصانة تامة للعمق والأطراف',
      buildUp: 'تدرج بالكرة من قلوب الدفاع الثلاثة وصانع الألعاب',
      pressing: 'محاصرة حامل الكرة في أطراف الملعب'
    },
    recommendedArchetypes: ['ثنائي مهاجمين متكامل', 'لاعبي أجنحة RMF/LMF سريعين', 'ثلاثي دفاعي صلب'],
    description: 'سيد خطة 3-5-2 الإيطالية المعاصرة. تمنحك كثافة لا تقهر في وسط الملعب وثنائية هجومية تشكل خطورة دائمة.'
  },
  {
    id: 'm-13',
    name: 'روبين أموريم',
    inGameName: 'R. AMORIM',
    clubOrCountry: 'مانشستر يونايتد / سبورتينغ',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 86,
    formation: '3-4-2-1',
    booster: '+1 التسارع والتمرير الحاسم',
    tactics: {
      offensive: 'تواجد ثنائي صانعي لعب خلف مهاجم قناص لخلخلة العمق',
      defensive: 'تحول فوري إلى 5 مدافعين عند فقدان الاستحواذ',
      buildUp: 'كرات عمودية حادة تخترق خطوط الخصم المتقدمة',
      pressing: 'ضغط شديد وموجه لاستخلاص الكرات الثانية'
    },
    recommendedArchetypes: ['صناع لعب أذكياء AMF', 'أظهرة أجنحة RWB/LWB بدنيين', 'مهاجم قناص طويل'],
    description: 'المدرب التكتيكي الشاب الذي حظي بتفضيل كبير لدى عشاق كرة القدم وتشكيلة 3-4-2-1 المبتكرة.'
  },
  {
    id: 'm-14',
    name: 'جوزيه مورينيو',
    inGameName: 'J. MOURINHO',
    clubOrCountry: 'فنربخشة / روما',
    playstyle: 'هجمة مرتدة طويلة (Long Ball Counter)',
    playstyleCategory: 'long-ball-counter',
    playstyleScore: 86,
    formation: '4-2-3-1',
    booster: '+1 الوعي الدفاعي والالتحام القوي',
    tactics: {
      offensive: 'هجمات خاطفة بأقل عدد من التمريرات نحو مرمى المنافس',
      defensive: 'ركن الحافلة الشهير، تكتل صارم أمام الحارس لمنع التسديدات',
      buildUp: 'كرات طويلة من الدفاع مباشرة للمهاجم المتقدم',
      pressing: 'دفاع شرس وقطع الكرات العرضية والبينية بحزم'
    },
    recommendedArchetypes: ['مهاجم طويل قوي بدنياً', 'محور دفاعي حديدي Anchor Man', 'مدافعون طوال القامة'],
    description: 'المدرب "السبيشال ون". مثالي لمن يحب الحسم التكتيكي والانضباط والانتصارات الصعبة بهدف نظيف.'
  },
  {
    id: 'm-15',
    name: 'أليكس فيرغسون',
    inGameName: 'SIR ALEX FERGUSON (أسطوري)',
    clubOrCountry: 'مانشستر يونايتد الأسطوري',
    playstyle: 'لعب على الأطراف (Out Wide)',
    playstyleCategory: 'out-wide',
    playstyleScore: 88,
    formation: '4-4-2 مسطحة',
    booster: '+1 الكرات العرضية والإنهاء بالرأس',
    tactics: {
      offensive: 'اختراقات ساحقة من الأطراف وكرات عرضية خطيرة داخل الصندوق',
      defensive: 'انضباط بريطاني صارم وتراجع دفاعي سريع',
      buildUp: 'توزيع الكرة بدقة إلى الأجنحة الكلاسيكية',
      pressing: 'ضغط مستمر حتى الدقائق الإضافية (الوقت الفيرغي الشهير)'
    },
    recommendedArchetypes: ['أجنحة عرضيات دقيقة Cross Specialist', 'مهاجم إنهاء بالرأس 95+', 'وسط متوازن'],
    description: 'أفضل مدرب لأسلوب اللعب على الأطراف (Out Wide) في تاريخ اللعبة. يعطي العرضيات دقة خارقة مع استغلال الكرات الرأسية.'
  },
  {
    id: 'm-16',
    name: 'فينسنت كومباني',
    inGameName: 'V. KOMPANY',
    clubOrCountry: 'بايرن ميونخ',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 86,
    formation: '4-2-3-1',
    booster: '+1 التحكم بالكرة وقوة التسديد',
    tactics: {
      offensive: 'سيطرة محكمة على الإيقاع وتمركز دائم في نصف ملعب المنافس',
      defensive: 'خط دفاعي متقدم لإبعاد الخطر عن منطقة الجزاء',
      buildUp: 'تمريرات أرضية محكمة من الخلف',
      pressing: 'ضغط عالٍ لاسترجاع الكرة وتدويرها فوراً'
    },
    recommendedArchetypes: ['مهاجم متكامل Complete Forward', 'وسط هجومي AMF هداف', 'مدافع Build Up'],
    description: 'التكتيك البافاري الهجومي المتدفق لفرض السيطرة المطلقة على مجريات المباراة وصناعة العديد من الفرص.'
  },
  {
    id: 'm-17',
    name: 'يوهان كرويف',
    inGameName: 'J. CRUYFF (أسطوري)',
    clubOrCountry: 'برشلونة الكلاسيكي',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 88,
    formation: '3-4-3 ماسي',
    booster: '+1 المراوغة والتمرير المنخفض',
    tactics: {
      offensive: 'الكرة الشاملة، تبادل المراكز والتناغم الفني بين جميع اللاعبين',
      defensive: 'دفاع جماعي معتمد على الاستحواذ كأفضل وسيلة للدفاع',
      buildUp: 'مثلثات تمرير متقنة في كل زاوية من الملعب',
      pressing: 'استعادة الكرة الذكية بالضغط على حاملها'
    },
    recommendedArchetypes: ['لاعبين يتمتعون بتحكم عالي بالكرة 90+', 'صانع ألعاب عبقري', 'أجنحة حرة'],
    description: 'أب الكرة الشاملة وأسطورة التكتيك. تشكيلته الماسية تعطي منظومة لعب فنية ساحرة لا يضاهيها أي أسلوب آخر.'
  },
  {
    id: 'm-18',
    name: 'أرسين فينغر',
    inGameName: 'A. WENGER (أسطوري)',
    clubOrCountry: 'آرسنال الذهبي',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 88,
    formation: '4-2-3-1',
    booster: '+1 التمرير المنخفض والتسارع',
    tactics: {
      offensive: 'التيكي تاكا اللندنية السريعة، لمسة واحدة ولمستين وانطلاقات في العمق',
      defensive: 'تمركز ذكي وقراءة مسارات تمرير الخصم',
      buildUp: 'تدرج سريع للغاية بالكرة دون تباطؤ',
      pressing: 'ضغط ناعم ومنظم لعزل مهاجمي الخصم'
    },
    recommendedArchetypes: ['صانع ألعاب لمسة واحدة One-touch Pass', 'مهاجم سريع خفيف الحركة', 'وسط ارتكاز ذكي'],
    description: 'مدرب الجيل الذهبي الذي لا يقهر (The Invincibles). يعشق اللعب الجمالي السلس والتمريرات البينية الساحرة.'
  },
  {
    id: 'm-19',
    name: 'فابيو كابيلو',
    inGameName: 'F. CAPELLO (أسطوري)',
    clubOrCountry: 'ميلان التاريخي',
    playstyle: 'هجمة مرتدة طويلة (Long Ball Counter)',
    playstyleCategory: 'long-ball-counter',
    playstyleScore: 87,
    formation: '4-4-2',
    booster: '+1 الوعي الدفاعي والقدرة على التحمل',
    tactics: {
      offensive: 'هجوم حاسم وسريع واستغلال أخطاء تمرير المنافس',
      defensive: 'منظومة دفاعية صلبة مستوحاة من مدرسة الكاتيناتشو الصارمة',
      buildUp: 'كرات متقنة من الدفاع والوسط نحو الثنائي الهجومي',
      pressing: 'تغطية المساحات ومنع أي تسديدة من خارج المنطقة'
    },
    recommendedArchetypes: ['قلوب دفاع أساطير', 'محاور دفاعية صلبة', 'مهاجمون حاسمون أمام الشباك'],
    description: 'مدرب البطولات الكبرى والصلابة الإيطالية. يجعل فريقك لا يتلقى سوى أقل عدد ممكن من الأهداف طوال الموسم.'
  },
  {
    id: 'm-20',
    name: 'زيكو',
    inGameName: 'ZICO (بوستر)',
    clubOrCountry: 'البرازيل / كاشيما أنتلرز',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 88,
    formation: '4-2-2-2 (بصانعي ألعاب AMF)',
    booster: '+1 ركلات حرة والتحكم بالكرة',
    tactics: {
      offensive: 'إبداع سامبا برازيلية ومهارات فردية عالية عبر ثنائي AMF',
      defensive: 'تأمين الوسط بمحوري ارتكاز DMF للموازنة',
      buildUp: 'تمريرات قصيرة وبينية ساحرة تخترق الدفاعات',
      pressing: 'ضغط متوازن في منطقة الوسط'
    },
    recommendedArchetypes: ['ثنائي AMF بمهارات دبل تاتش ومراوغة', 'مهاجمان سريعان', 'محور ارتكاز صلب'],
    description: 'نسخة بوستر أسطورية مفضلة في اللعبة. التشكيلة الأشهر والأقوى في الديفيجن لاختراق أي دفاع عبر ثنائي صناعة اللعب.'
  },
  {
    id: 'm-21',
    name: 'يوليان ناغلسمان',
    inGameName: 'J. NAGELSMANN',
    clubOrCountry: 'منتخب ألمانيا',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 86,
    formation: '4-2-2-2',
    booster: '+1 التسارع والتمرير الدقيق',
    tactics: {
      offensive: 'زيادة عددية وسرعة في تبادل الكرات بين الأجنحة والمهاجمين',
      defensive: 'خط دفاعي متقدم مع حرمان المنافس من التفكير',
      buildUp: 'انتقال سريع ومفاجئ من الحالة الدفاعية إلى الهجوم',
      pressing: 'ضغط ألماني حاد على خط دفاع الخصم'
    },
    recommendedArchetypes: ['مهاجم سريع', 'أجنحة صناعة ألعاب سريعة', 'حارس مرمى هجومي'],
    description: 'المدرب التكتيكي العصري للمانشافت. يمنحك ديناميكية هجومية مذهلة وخطوط متقاربة تخنق الخصوم.'
  },
  {
    id: 'm-22',
    name: 'أنطونيو كونتي',
    inGameName: 'A. CONTE',
    clubOrCountry: 'نابولي',
    playstyle: 'هجمة مرتدة طويلة (Long Ball Counter)',
    playstyleCategory: 'long-ball-counter',
    playstyleScore: 86,
    formation: '3-4-2-1',
    booster: '+1 الروح القتالية والتحمل',
    tactics: {
      offensive: 'استغلال الأطراف والانطلاقات السريعة خلف دفاع الخصم',
      defensive: 'تراجع خماسي دفاعي وإحكام الرقابة الفردية على النجوم',
      buildUp: 'كرات طويلة من قلوب الدفاع للمهاجم المحطة',
      pressing: 'ضغط شرس وشخصية قتالية في كل كرة مشتركة'
    },
    recommendedArchetypes: ['مهاجم محطة قوي بدنياً', 'لاعبي أطراف بمخزون لياقة عالي', 'ثلاثي دفاعي صلب'],
    description: 'شخصية قيادية ملهمة وقتالية لا تهدأ. يمنح لاعبيك شحنة طاقة إضافية في الصراعات البدنية والكرات الهوائية.'
  },
  {
    id: 'm-23',
    name: 'تياغو موتا',
    inGameName: 'T. MOTTA',
    clubOrCountry: 'يوفنتوس',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 85,
    formation: '4-2-3-1',
    booster: '+1 التمرير المنخفض والوعي الدفاعي',
    tactics: {
      offensive: 'تمركز مرن جداً وتبادل للأدوار بين الظهير ولاعب الوسط',
      defensive: 'تأمين مساحات العمق واستعادة سريعة للكرة',
      buildUp: 'بناء تدريجي ذكي بمشاركة حارس المرمى',
      pressing: 'ضغط متوسط ذكي يوجه الخصم نحو الأطراف'
    },
    recommendedArchetypes: ['لاعبو وسط يجيدون التمرير', 'أجنحة قاطعة للداخل Inside Forward', 'مهاجم متحرك'],
    description: 'عراب الكرة الإيطالية الجديدة المتطورة. يقدم تكتيك استحواذ سلس يربك تنظيم الخصوم الدفاعي.'
  },
  {
    id: 'm-24',
    name: 'تشافي هيرنانديز',
    inGameName: 'XAVI HERNANDEZ',
    clubOrCountry: 'برشلونة الكلاسيكي',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 87,
    formation: '4-3-3',
    booster: '+1 التمرير العالي والمنخفض',
    tactics: {
      offensive: 'استحواذ كامل وحرمان الخصم من لمس الكرة حتى فتح الثغرة',
      defensive: 'ضغط فوري متقن في مناطق الخصم لمنع الهجمات المرتدة',
      buildUp: 'تدرج بالكرة بدقة متناهية لا تقبل الخطأ',
      pressing: 'تضييق المساحات على حامل الكرة جماعياً'
    },
    recommendedArchetypes: ['وسط ذكي يمرر بدقة 95+', 'أجنحة تفتح أطراف الملعب', 'مهاجم ذكي بالتحركات'],
    description: 'مهندس خط الوسط التاريخي. نسخته التدريبية تعكس فلسفة الاستحواذ الإسبانية بأعلى مقاييس الإتقان.'
  },
  {
    id: 'm-25',
    name: 'روبيرتو دي زيربي',
    inGameName: 'R. DE ZERBI',
    clubOrCountry: 'مارسيليا / برايتون',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 85,
    formation: '4-2-3-1',
    booster: '+1 التمرير المنخفض والسرعة',
    tactics: {
      offensive: 'استدراج لاعبي الخصم للضغط ثم ضربهم بتمريرة عمودية كاسرة',
      defensive: 'ضغط عالٍ ودفاع شجاع في الثلث الأول',
      buildUp: 'الوقوف على الكرة لجذب ضغط المنافس ثم التمرير السريع',
      pressing: 'استرجاع فوري وعنيف عند خسارة الكرة'
    },
    recommendedArchetypes: ['محاور يجيدون الخروج من الضغط', 'أجنحة نفاثة في المساحة', 'حارس تمرير دقيق'],
    description: 'التكتيك الأكثر إثارة للإعجاب من قبل غوارديولا. يعتمد على استدراج الخصم ثم تمزيق خطوطه بالهجوم السريع.'
  },
  {
    id: 'm-26',
    name: 'لوتشيانو سباليتي',
    inGameName: 'L. SPALLETTI',
    clubOrCountry: 'منتخب إيطاليا / نابولي',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 85,
    formation: '4-3-3',
    booster: '+1 التسديد والوعي الهجومي',
    tactics: {
      offensive: 'كرة هجومية ممتعة وسريعة الإيقاع وتبادل كرات مثلثات',
      defensive: 'توازن دفاعي منضبط يغلق زوايا التمرير',
      buildUp: 'انطلاقات عبر الأجنحة والعمق بشكل متزامن',
      pressing: 'ضغط متوازن في كل أرجاء الملعب'
    },
    recommendedArchetypes: ['أجنحة مهارية سريعة', 'مهاجم هداف وقوي بدنياً', 'وسط صانع ألعاب'],
    description: 'بطل الدوري الإيطالي مع نابولي بتكتيك هجومي مبهر حطم كل الأرقام القياسية وسحر عشاق اللعبة.'
  },
  {
    id: 'm-27',
    name: 'أوناي إيمري',
    inGameName: 'U. EMERY',
    clubOrCountry: 'أستون فيلا',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 85,
    formation: '4-2-2-2 متقاربة',
    booster: '+1 الوعي التكتيكي والسرعة',
    tactics: {
      offensive: 'توظيف ثنائي الهجوم مع صانعي لعب مائلين للأطراف لضرب العمق',
      defensive: 'مصيدة تسلل بالغة الدقة تحبط هجمات الخصوم المباشرة',
      buildUp: 'تحولات فائقة السرعة بلمسات مباشرة ومدروسة',
      pressing: 'تضييق ممر التمرير المركزي'
    },
    recommendedArchetypes: ['مهاجمان يجيدان التمركز', 'أظهرة سريعة للتغطية', 'حارس يقظ'],
    description: 'داهية الكؤوس الأوروبية وتكتيك مصيدة التسلل الصارمة التي تحرم المنافسين من الهجمات المرتدة.'
  },
  {
    id: 'm-28',
    name: 'أنجي بوستيكوغلو',
    inGameName: 'A. POSTECOGLOU',
    clubOrCountry: 'توتنهام هوتسبير',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 85,
    formation: '4-2-1-3',
    booster: '+1 التسارع والتمرير المنخفض',
    tactics: {
      offensive: 'هجوم هادر بدون توقف "Ange-Ball" مع تقدم كاسح للأظهرة',
      defensive: 'خط دفاعي متقدم للغاية عند خط منتصف الملعب',
      buildUp: 'تمرير شجاع وسريع للأمام دائماً',
      pressing: 'ضغط انتحاري شرس في مناطق الخصم'
    },
    recommendedArchetypes: ['حارس مرمى سويبر سريع جداً', 'أجنحة هجومية حادة', 'وسط ارتكاز ديناميكي'],
    description: 'فلسفة الهجوم الشامل الجريئة. مناسب للمتحمسين الذين يريدون تسجيل أكبر عدد من الأهداف طوال 90 دقيقة.'
  },
  {
    id: 'm-29',
    name: 'ماسيميليانو أليغري',
    inGameName: 'M. ALLEGRI',
    clubOrCountry: 'يوفنتوس',
    playstyle: 'هجمة مرتدة طويلة (Long Ball Counter)',
    playstyleCategory: 'long-ball-counter',
    playstyleScore: 84,
    formation: '3-5-2',
    booster: '+1 الوعي الدفاعي والالتحام',
    tactics: {
      offensive: 'استغلال الفرص الفردية والكرات الثابتة بأعلى كفاءة',
      defensive: 'دفاع منطقة صارم ومنظم يصيب الخصم بالإحباط',
      buildUp: 'كرات مباشرة من الدفاع للعمق الهجومي',
      pressing: 'تأمين المرمى وتقليل المساحات أمام المهاجمين'
    },
    recommendedArchetypes: ['مهاجم ألعاب هوائية', 'مدافعون بخبرة عالية', 'حارس مرمى طويل القامة'],
    description: 'أستاذ إدارة المباريات والانتصار بفارق هدف (Corto Muso). يمنح فريقك تماسكاً دفاعياً لا ينكسر.'
  },
  {
    id: 'm-30',
    name: 'ستيفانو بيولي',
    inGameName: 'S. PIOLI',
    clubOrCountry: 'النصر السعودي / ميلان',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 84,
    formation: '4-2-3-1',
    booster: '+1 السرعة وقوة التسديد',
    tactics: {
      offensive: 'اعتماد على سرعة الجناح الأيسر واختراقات صانع الألعاب',
      defensive: 'ضغط وسط الملعب وافتكاك الكرات وبدء المرتدة',
      buildUp: 'نقل سريع للكرة نحو المهاجم الصريح',
      pressing: 'انقضاض على لاعبي ارتكاز المنافس'
    },
    recommendedArchetypes: ['جناح أيسر خارق السرعة', 'مهاجم صندوق كلاسيكي', 'وسط بوكس تو بوكس'],
    description: 'تكتيك مرن وسريع يركز على إطلاق العنان لنجوم الهجوم وتوفير دعم مستمر لهم من خط الوسط.'
  },
  {
    id: 'm-31',
    name: 'خورخي خيسوس',
    inGameName: 'J. JESUS',
    clubOrCountry: 'الهلال السعودي',
    playstyle: 'لعب على الأطراف (Out Wide)',
    playstyleCategory: 'out-wide',
    playstyleScore: 85,
    formation: '4-2-3-1',
    booster: '+1 العرضيات والوعي الهجومي',
    tactics: {
      offensive: 'عرضيات متقنة وتوغل لاعبي الوسط لداخل الصندوق للتسجيل',
      defensive: 'خط دفاعي متماسك مع ضغط منظم في الثلث الأوسط',
      buildUp: 'توسيع رقعة اللعب عبر الأطراف لخلخلة تكتل الخصم',
      pressing: 'ضغط جماعي لإجبار المنافس على تشتيت الكرة'
    },
    recommendedArchetypes: ['مهاجم هداف بالرأس والقدمين', 'أجنحة عرضيات دقيقة', 'صانع ألعاب AMF ماكر'],
    description: 'صاحب السلسلة التاريخية للانتصارات المتتالية. يقدم تكتيكاً متكاملاً لا يرحم دفاعات المنافسين.'
  },
  {
    id: 'm-32',
    name: 'مارسيلو بيلسا',
    inGameName: 'M. BIELSA',
    clubOrCountry: 'منتخب أوروغواي',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 85,
    formation: '4-3-3',
    booster: '+1 اللياقة والتحمل والروح القتالية',
    tactics: {
      offensive: 'هجوم متواصل وسريع وسحق الخصم باللياقة والاندفاع',
      defensive: 'رقابة رجل لرجل (Man-marking) شرسة في كل مكان',
      buildUp: 'تمريرات عمودية مباشرة وسريعة للأمام',
      pressing: 'ضغط خانق يرهق الخصم بدنياً وذهنياً'
    },
    recommendedArchetypes: ['لاعبون بمعدل لياقة 95+', 'أجنحة مقاتلة', 'محاور قاطعة للكرات'],
    description: 'المدرب المجنون (El Loco). يجعل كل لاعب في تشكيلتك يقاتل على كل كرة حتى الرمق الأخير.'
  },
  {
    id: 'm-33',
    name: 'إيدي هاو',
    inGameName: 'E. HOWE',
    clubOrCountry: 'نيوكاسل يونايتد',
    playstyle: 'لعب على الأطراف (Out Wide)',
    playstyleCategory: 'out-wide',
    playstyleScore: 84,
    formation: '4-3-3',
    booster: '+1 الالتحام البدني والسرعة',
    tactics: {
      offensive: 'قوة بدنية وسرعة على الأطراف مع عرضيات حاسمة',
      defensive: 'كتلة دفاعية قوية بدنية تلتحم بشراسة',
      buildUp: 'تحويل سريع للعب نحو الجناحين الشاغرين',
      pressing: 'ضغط بدني عالي لاستخلاص الكرات الثانية'
    },
    recommendedArchetypes: ['أجنحة قوية وسريعة', 'وسط بدني عملاق', 'مهاجم قناص'],
    description: 'تكتيك بدني إنجليزي قوي يعتمد على القوة والسرعة والعرضيات لحسم المباريات الشاقة.'
  },
  {
    id: 'm-34',
    name: 'روبرتو مانشيني',
    inGameName: 'R. MANCINI',
    clubOrCountry: 'منتخب السعودية / إيطاليا',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 84,
    formation: '4-3-3',
    booster: '+1 التمرير المنخفض والتوازن',
    tactics: {
      offensive: 'استحواذ هادئ وفتح زوايا تمرير بالأجنحة',
      defensive: 'دفاع كروي إيطالي كلاسيكي يؤمن الثلث الأخير',
      buildUp: 'بناء اللعب عبر ثلاثي خط الوسط',
      pressing: 'ضغط هادئ ومدروس لاستهداف نقاط ضعف الخصم'
    },
    recommendedArchetypes: ['وسط موزع ألعاب Regista', 'أجنحة حاسمة', 'مدافعون أذكياء'],
    description: 'بطل يورو 2020 مع الآتزوري، يمزج بين دقة الاستحواذ والتأمين الدفاعي الإيطالي المتزن.'
  },
  {
    id: 'm-35',
    name: 'جيان بييرو غاسبيريني',
    inGameName: 'G. GASPERINI',
    clubOrCountry: 'أتالانتا',
    playstyle: 'لعب على الأطراف (Out Wide)',
    playstyleCategory: 'out-wide',
    playstyleScore: 84,
    formation: '3-4-1-2',
    booster: '+1 السرعة والكرات العرضية',
    tactics: {
      offensive: 'تقدم مكثف للاعبي الجناح والوسط لتسجيل الأهداف بغزارة',
      defensive: 'رقابة فردية صارمة مع تحول لثلاثي دفاعي صلب',
      buildUp: 'انطلاقات عبر الأطراف وتحويل كرات عرضية خطيرة',
      pressing: 'ضغط أمامي شرس في ملعب المنافس'
    },
    recommendedArchetypes: ['أجنحة بمواصفات هجومية', 'ثنائي هجومي متناغم', 'مدافعون سريعون'],
    description: 'قاهر الكبار وبطل الدوري الأوروبي. تشكيلته 3-4-1-2 توفر كثافة هجومية خارقة تعجز الدفاعات عن إيقافها.'
  },
  {
    id: 'm-36',
    name: 'لويس فيليبي سكولاري',
    inGameName: 'L. SCOLARI (أسطوري)',
    clubOrCountry: 'البرازيل 2002',
    playstyle: 'كرات طويلة (Long Ball)',
    playstyleCategory: 'long-ball',
    playstyleScore: 86,
    formation: '3-4-1-2 (3-2-2-3)',
    booster: '+1 الإنهاء وقوة التسديد',
    tactics: {
      offensive: 'ثلاثي هجومي أسطوري (3R) مدعوم بكرات مباشرة وساقطة خلف الدفاع',
      defensive: 'ثلاثي دفاعي مدعوم بمحوري ارتكاز حديديين',
      buildUp: 'كرات طويلة ومباشرة نحو المهاجمين لإحداث الفارق الفردي',
      pressing: 'تأمين العمق الدفاعي والاعتماد على العبقرية الهجومية'
    },
    recommendedArchetypes: ['مهاجم أسطوري مثل رونالدو الظاهرة', 'صانع ألعاب عبقري مثل رونالدينيو', 'محاور صلبة'],
    description: 'التكتيك البرازيلي الفائز بمونديال 2002. قوة هجومية كاسحة تحسم أي مباراة بلمحة سحرية واحدة.'
  },
  {
    id: 'm-37',
    name: 'رالف رانغنيك',
    inGameName: 'R. RANGNICK',
    clubOrCountry: 'منتخب النمسا',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 85,
    formation: '4-2-2-2 متقاربة',
    booster: '+1 التسارع والروح القتالية',
    tactics: {
      offensive: 'هجوم عمودي مباشر وصاعق خلال 8 ثوانٍ فقط من قطع الكرة',
      defensive: 'ضغط عكسي صارم في أسرع وقت ممكن',
      buildUp: 'كرات عمودية سريعة تتجاوز خطوط الخصم',
      pressing: 'مخترع أسلوب الغيغنبول (Gegenpressing) العصري'
    },
    recommendedArchetypes: ['لاعبون ذوو سرعة تسارع عالية', 'محاور قاطعة كرات', 'مهاجمون لا يتوقفون عن الركض'],
    description: 'الأب الروحي للمدرسة الألمانية الحديثة للمرتدات السريعة. خيار رائع لمن يفضل اللعب العمودي الصاروخي.'
  },
  {
    id: 'm-38',
    name: 'غاريث ساوثغيت',
    inGameName: 'G. SOUTHGATE',
    clubOrCountry: 'منتخب إنجلترا السابق',
    playstyle: 'هجمة مرتدة طويلة (Long Ball Counter)',
    playstyleCategory: 'long-ball-counter',
    playstyleScore: 83,
    formation: '4-2-3-1',
    booster: '+1 الوعي الدفاعي والتمركّز',
    tactics: {
      offensive: 'استغلال الكرات الثابتة وانطلاقات الأجنحة السريعة',
      defensive: 'تأمين الدفاع المزدوج وتجنب المخاطرة في الثلث الدفاعي',
      buildUp: 'كرات طويلة من الحارس والمدافعين نحو المهاجم الصريح',
      pressing: 'دفاع متوازن في منتصف الملعب'
    },
    recommendedArchetypes: ['مهاجم صندوق هداف', 'أجنحة مهارية', 'مدافعون يجيدون الرأسيات'],
    description: 'تكتيك براغماتي يركز على النتائج وتأمين الشباك واستغلال اللحظات الحاسمة في نهاية المباريات.'
  },
  {
    id: 'm-39',
    name: 'فرناندو دينيز',
    inGameName: 'F. DINIZ',
    clubOrCountry: 'فلومينينسي / البرازيل',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 84,
    formation: '4-2-3-1 حرة',
    booster: '+1 التحكم بالكرة والمراوغة',
    tactics: {
      offensive: 'الكرة اللامركزية (Relationism)، تجمع اللاعبين قرب الكرة للتمرير القصير',
      defensive: 'تغطية سريعة واستعادة للكرة في المساحات الضيقة',
      buildUp: 'لمسات قصيرة جداً ومثلثات مستمرة',
      pressing: 'ضغط جماعي مفاجئ ومكثف'
    },
    recommendedArchetypes: ['لاعبون برازيليون ذوو مهارات استثنائية', 'محاور تجيد اللعب السريع', 'أظهرة مهارية'],
    description: 'مبتكر أسلوب الكرة اللامركزية، يمنح اللاعبين حرية غير مسبوقة في التحرك والتمرير الخاطف.'
  },
  {
    id: 'm-40',
    name: 'سيباستيان هونيس',
    inGameName: 'S. HOENESS',
    clubOrCountry: 'شتوتغارت',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 84,
    formation: '4-2-3-1',
    booster: '+1 التمرير المنخفض والسرعة',
    tactics: {
      offensive: 'تدرج ممتع وتمرير سلس يخترق أعتى التكتلات الدفاعية',
      defensive: 'تنظيم دفاعي متماسك مع خط دفاع مرن',
      buildUp: 'بناء اللعب السريع عبر لاعبي الارتكاز',
      pressing: 'ضغط جماعي ذكي ومستمر'
    },
    recommendedArchetypes: ['صانع ألعاب مبدع', 'مهاجم قناص متحرك', 'أظهرة مساندة'],
    description: 'مفاجأة الدوري الألماني، يقدم تكتيك استحواذ حديث أثبت جدارته في التفوق على كبار الأندية.'
  },
  {
    id: 'm-41',
    name: 'ميتشيل',
    inGameName: 'MICHEL',
    clubOrCountry: 'جيرونا الإسباني',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 84,
    formation: '4-3-3',
    booster: '+1 المراوغة والتمرير الحاسم',
    tactics: {
      offensive: 'تحريك سريع للكرة وفتح مساحات شاغرة على الجناحين',
      defensive: 'تغطية سريعة لردع الهجمات المرتدة',
      buildUp: 'تدرج بالكرة بأسلوب هندسي دقيق',
      pressing: 'ضغط متواصل في مناطق الخصم'
    },
    recommendedArchetypes: ['أجنحة مهارية', 'مهاجم صندوق ذكي', 'وسط هجومي'],
    description: 'صانع معجزة جيرونا ومفاجأة الليغا الإسبانية بكرة هجومية ساحرة تنافس عمالقة الكرة الأوروبية.'
  },
  {
    id: 'm-42',
    name: 'باولو فونسيكا',
    inGameName: 'P. FONSECA',
    clubOrCountry: 'ميلان',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 83,
    formation: '4-2-3-1',
    booster: '+1 التسارع والتمرير المنخفض',
    tactics: {
      offensive: 'توليد فرص مستمرة بواسطة صانع الألعاب والأجنحة السريعة',
      defensive: 'تأمين العمق بالثنائي الدفاعي ولاعبي الارتكاز',
      buildUp: 'نقل الكرة بهدوء ثم تسريع الرتم فجأة',
      pressing: 'محاصرة الخصم في مناطقه'
    },
    recommendedArchetypes: ['جناح هجومي قاطع للداخل', 'مهاجم إنهاء', 'وسط بوكس تو بوكس'],
    description: 'تكتيك برتغالي هجومي متوازن يناسب من يبحث عن الاستحواذ مع المحافظة على السرعة والخطورة.'
  },
  {
    id: 'm-43',
    name: 'إيمانويل ألغواسيل',
    inGameName: 'I. ALGUACIL',
    clubOrCountry: 'ريال سوسيداد',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 84,
    formation: '4-3-3',
    booster: '+1 التمرير المنخفض والوعي التكتيكي',
    tactics: {
      offensive: 'تناقل كرات بينية سريعة في أنصاف المساحات',
      defensive: 'انضباط تكتيكي عالي وتقارب وثيق بين الخطوط',
      buildUp: 'بناء اللعب عبر لاعبي الوسط المهاريين',
      pressing: 'ضغط منظم يخنق مفاتيح لعب الخصم'
    },
    recommendedArchetypes: ['صانع ألعاب تقني', 'جناح سريع', 'مدافع قاطع كرات'],
    description: 'الانضباط الباسكي المتقن. تشكيلة تجمع بين المتعة البصرية والصرامة التكتيكية الدفاعية.'
  },
  {
    id: 'm-44',
    name: 'دانييلي دي روسي',
    inGameName: 'D. DE ROSSI',
    clubOrCountry: 'روما السابق',
    playstyle: 'استحواذ (Possession Game)',
    playstyleCategory: 'possession',
    playstyleScore: 83,
    formation: '4-3-3',
    booster: '+1 الروح القتالية والتمرير',
    tactics: {
      offensive: 'هجوم حماسي مباشر ومساندة قوية من لاعبي الوسط',
      defensive: 'قتالية شرسة في كل التحام دفاعي بالكرة',
      buildUp: 'تمرير قصير سريع واستغلال الأجنحة',
      pressing: 'ضغط قوي لاستعادة الهيبة في منتصف الملعب'
    },
    recommendedArchetypes: ['وسط مقاتل ذو روح عالية', 'مهاجم صندوق حاسم', 'أجنحة سريعة'],
    description: 'شخصية قيادية محبوبة تزرع الشغف والقتالية في قلوب اللاعبين مع أسلوب لعب هجومي شجاع.'
  },
  {
    id: 'm-45',
    name: 'زلاتكو داليتش',
    inGameName: 'Z. DALIC',
    clubOrCountry: 'منتخب كرواتيا',
    playstyle: 'هجمة مرتدة طويلة (Long Ball Counter)',
    playstyleCategory: 'long-ball-counter',
    playstyleScore: 84,
    formation: '4-3-3',
    booster: '+1 الوعي الدفاعي والتحمل',
    tactics: {
      offensive: 'استغلال مهارات خط الوسط الأسطوري في تسيير دفة المباراة',
      defensive: 'صلابة دفاعية خارقة تقود المباريات إلى الأشواط الإضافية وركلات الترجيح',
      buildUp: 'كرات دقيقة في عمق دفاعات المنافس',
      pressing: 'تغطية دفاعية متكاملة وقراءة رائعة للخصم'
    },
    recommendedArchetypes: ['وسط موزع كرات أسطوري كـ مودريتش', 'قلوب دفاع متمرسون', 'حارس ركلات جزاء'],
    description: 'صانع إنجازات كرواتيا في كؤوس العالم. فريق لا يستسلم أبداً ويجيد الفوز تحت أقسى الضغوط.'
  },
  {
    id: 'm-46',
    name: 'يورغن كلينسمان',
    inGameName: 'J. KLINSMANN',
    clubOrCountry: 'ألمانيا / كوريا الجنوبية',
    playstyle: 'كرات طويلة (Long Ball)',
    playstyleCategory: 'long-ball',
    playstyleScore: 83,
    formation: '4-4-2',
    booster: '+1 الرأسيات والارتقاء الهوائي',
    tactics: {
      offensive: 'كرات عالية وطويلة من الدفاع مباشرة نحو ثنائي الهجوم الصريح',
      defensive: 'تأمين منطقة الجزاء والاعتماد على الكرات المرتدة الهوائية',
      buildUp: 'تخطي مرحلة بناء الوسط واللعب مباشرة في الصندوق',
      pressing: 'ضغط على دفاعات الخصم لإجبارهم على إرجاع الكرة للحارس'
    },
    recommendedArchetypes: ['مهاجمان طويلا القامة يجيدان الرأسيات', 'أجنحة سريعة', 'مدافعون ذوو بنية قوية'],
    description: 'التكتيك الكلاسيكي للكرات الطويلة والهوائية. رائع لمن يمتلك مهاجمين عمالقة مثل هالاند وكولر.'
  },
  {
    id: 'm-47',
    name: 'ديفيد مويس',
    inGameName: 'D. MOYES',
    clubOrCountry: 'وست هام يونايتد',
    playstyle: 'هجمة مرتدة طويلة (Long Ball Counter)',
    playstyleCategory: 'long-ball-counter',
    playstyleScore: 84,
    formation: '4-2-3-1',
    booster: '+1 الكرات الثابتة والالتحام',
    tactics: {
      offensive: 'خطورة بالغة في الكرات الثابتة والركنيات والمرتدات السريعة',
      defensive: 'دفاع بريطاني صلب في قلب منطقة العمليات',
      buildUp: 'كرات طولية مباشرة للمهاجم مع انطلاق الجناحين',
      pressing: 'إبعاد الخطر فوراً وتجنب التمرير الخاطئ في الخلف'
    },
    recommendedArchetypes: ['متخصص ركلات ركنية وثابتة', 'مدافعون ذوو قامات فارعة', 'مهاجم بدني قوي'],
    description: 'بطل دوري المؤتمر الأوروبي. يمنح فريقك تفوقاً حاسماً في الكرات الثابتة والدفاع المحكم.'
  },
  {
    id: 'm-48',
    name: 'والتر ماتزاري',
    inGameName: 'W. MAZZARRI',
    clubOrCountry: 'نابولي / كالياري',
    playstyle: 'كرات طويلة (Long Ball)',
    playstyleCategory: 'long-ball',
    playstyleScore: 82,
    formation: '3-5-2',
    booster: '+1 الالتحام البدني والتمركز',
    tactics: {
      offensive: 'كرات مباشرة من الثلاثي الخلفي إلى مهاجمي الصندوق',
      defensive: 'تراجع خماسي دفاعي يغلق كل المنافذ',
      buildUp: 'تشتيت الكرات وتحويلها لفرص هجومية مباغتة',
      pressing: 'دفاع صارم داخل الثلث الأخير'
    },
    recommendedArchetypes: ['مهاجم بدني قوي', 'محاور قاطعة كرات', 'حارس مرمى صامد'],
    description: 'الخبير الإيطالي الكلاسيكي في الدفاع الثلاثي والكرات المباشرة القاتلة.'
  },
  {
    id: 'm-49',
    name: 'فرانك لامبارد',
    inGameName: 'F. LAMPARD',
    clubOrCountry: 'تشيلسي الأسطوري',
    playstyle: 'لعب على الأطراف (Out Wide)',
    playstyleCategory: 'out-wide',
    playstyleScore: 83,
    formation: '4-3-3',
    booster: '+1 قوة التسديد والإنهاء',
    tactics: {
      offensive: 'تسديدات صاروخية من خارج منطقة الجزاء وتوغل لاعبي الوسط',
      defensive: 'توازن دفاعي منضبط في خط الوسط',
      buildUp: 'توزيع الكرة نحو الأطراف وتمريرها للقادمين من الخلف',
      pressing: 'ضغط هجومي منظم'
    },
    recommendedArchetypes: ['وسط يسدد بقوة 90+ من خارج المنطقة', 'أجنحة عرضيات', 'مهاجم قناص'],
    description: 'أسطورة خط الوسط الإنجليزي الهداف. يركز أسلوبه على التسديدات البعيدة الصاروخية ومباغتة الحراس.'
  },
  {
    id: 'm-50',
    name: 'باتريك فييرا',
    inGameName: 'P. VIEIRA',
    clubOrCountry: 'ستراسبورغ / آرسنال الأسطوري',
    playstyle: 'هجمة مرتدة سريعة (Quick Counter)',
    playstyleCategory: 'quick-counter',
    playstyleScore: 84,
    formation: '4-3-3',
    booster: '+1 قطع الكرات والالتحام البدني',
    tactics: {
      offensive: 'انطلاق كاسح فور افتكاك الكرة وهيمنة كاملة على خط الوسط',
      defensive: 'افتكاك الكرات بقوة بدنية لا تقاوم وتطهير منتصف الملعب',
      buildUp: 'تمريرات عمودية سريعة ومتقنة للمهاجمين',
      pressing: 'ضغط بدني جبار يمنع الخصم من بناء أي هجمة'
    },
    recommendedArchetypes: ['محاور عملاقة Destroyer', 'مهاجمون سريعون', 'مدافعون صلبون'],
    description: 'قائد آرسنال الأسطوري وأقوى لاعب وسط دفاعي. يعطي تشكيلتك هيبة بدنية ترهب أي منافس في اللعبة.'
  }
];
