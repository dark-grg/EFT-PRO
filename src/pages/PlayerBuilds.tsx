import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  SlidersHorizontal, 
  X, 
  ChevronLeft, 
  TrendingUp, 
  ExternalLink, 
  Layers, 
  Flame, 
  ShieldCheck, 
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { playerCardDb } from '../services/playerCardDatabase';
import { PlayerDevelopment, PlayerCard, StatDiffItem, ProgressionAllocation } from '../types/playerCard';
import { calculateProgressionStats } from '../services/progressionEngine';
import { ExactCardImage } from '../components/ExactCardImage';

type CategoryType = 'ALL' | 'FW' | 'MF' | 'DF' | 'GK';

export const PlayerBuilds: React.FC = () => {
  const navigate = useNavigate();
  const [developments, setDevelopments] = useState<PlayerDevelopment[]>([]);
  const [cards, setCards] = useState<PlayerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL');
  const [selectedCardType, setSelectedCardType] = useState<string>('ALL');
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [selectedCardForModal, setSelectedCardForModal] = useState<PlayerCard | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubDevs = playerCardDb.onDevelopmentsSnapshot((updatedDevs) => {
      setDevelopments(updatedDevs);
    });

    const unsubCards = playerCardDb.onCardsSnapshot((updatedCards) => {
      setCards(updatedCards);
      setLoading(false);
    });

    return () => {
      unsubDevs();
      unsubCards();
    };
  }, []);

  // Compute or retrieve development for any card
  const getCardDevelopment = (card: PlayerCard) => {
    // 1. Check if an explicit development exists in DB
    const existing = developments.find(d => d.cardId === card.id || d.cardId === card.cardId);
    if (existing) {
      return {
        title: existing.title,
        description: existing.description,
        points: existing.developmentPoints,
        usedPoints: existing.usedPoints,
        availablePoints: existing.availablePoints,
        finalOverall: existing.finalOverall,
        statChanges: existing.statChanges
      };
    }

    // 2. Generate optimal default progression according to card position
    const pos = card.position;
    let defaultPoints: ProgressionAllocation = {
      shooting: 0,
      passing: 0,
      dribbling: 0,
      dexterity: 0,
      lowerBody: 0,
      aerial: 0,
      defending: 0
    };

    if (pos === 'GK') {
      defaultPoints = {
        shooting: 0,
        passing: 0,
        dribbling: 0,
        dexterity: 0,
        lowerBody: 0,
        aerial: 4,
        defending: 0,
        gk1: 8,
        gk2: 8,
        gk3: 8
      };
    } else if (['CF', 'SS'].includes(pos)) {
      defaultPoints = {
        shooting: 8,
        passing: 4,
        dribbling: 8,
        dexterity: 8,
        lowerBody: 8,
        aerial: 0,
        defending: 0
      };
    } else if (['LWF', 'RWF'].includes(pos)) {
      defaultPoints = {
        shooting: 7,
        passing: 4,
        dribbling: 9,
        dexterity: 9,
        lowerBody: 8,
        aerial: 0,
        defending: 0
      };
    } else if (['AMF', 'LMF', 'RMF'].includes(pos)) {
      defaultPoints = {
        shooting: 6,
        passing: 8,
        dribbling: 8,
        dexterity: 8,
        lowerBody: 6,
        aerial: 0,
        defending: 0
      };
    } else if (['CMF', 'DMF'].includes(pos)) {
      defaultPoints = {
        shooting: 2,
        passing: 8,
        dribbling: 6,
        dexterity: 6,
        lowerBody: 6,
        aerial: 4,
        defending: 8
      };
    } else if (['CB'].includes(pos)) {
      defaultPoints = {
        shooting: 0,
        passing: 2,
        dribbling: 0,
        dexterity: 4,
        lowerBody: 4,
        aerial: 8,
        defending: 12
      };
    } else {
      // LB, RB
      defaultPoints = {
        shooting: 0,
        passing: 6,
        dribbling: 4,
        dexterity: 6,
        lowerBody: 8,
        aerial: 4,
        defending: 8
      };
    }

    const calc = calculateProgressionStats(card, defaultPoints, true);
    const used = Object.values(defaultPoints).reduce((a, b) => a + (b || 0), 0);

    return {
      title: `تطويرة ${card.playerName} الرسمية (${card.maxOverall} OVR)`,
      description: `توزيع نقاط احترافي دقيق لمركز ${card.position} يمنح اللاعب أقصى طاقات وتأثير حقيقي في الملعب.`,
      points: defaultPoints,
      usedPoints: used,
      availablePoints: Math.max(used, 36),
      finalOverall: card.maxOverall,
      statChanges: calc.statChanges
    };
  };

  // Copy Progression Points to Clipboard
  const copyCardProgression = (card: PlayerCard, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const dev = getCardDevelopment(card);
    const p = dev.points;
    let text = `🎮 نقاط تطويرة اللاعب في eFootball 2025:\n`;
    text += `اللاعب: ${card.playerName} ${card.arabicName ? `(${card.arabicName})` : ''}\n`;
    text += `المركز: ${card.position} | الطاقات: ${card.overall} ➔ ${dev.finalOverall} OVR\n`;
    text += `نوع البطاقة: ${card.cardType}\n`;
    text += `النادي: ${card.clubName || card.team}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `توزيع نقاط التطوير (Progression):\n`;

    if (card.position === 'GK') {
      text += `• ارتقاء (Aerial): ${p.aerial || 0}\n`;
      text += `• حراسة مرمى 1: ${p.gk1 || 0}\n`;
      text += `• حراسة مرمى 2: ${p.gk2 || 0}\n`;
      text += `• حراسة مرمى 3: ${p.gk3 || 0}\n`;
    } else {
      if (p.shooting) text += `• تسديد (Shooting): ${p.shooting}\n`;
      if (p.passing) text += `• تمرير (Passing): ${p.passing}\n`;
      if (p.dribbling) text += `• مراوغة (Dribbling): ${p.dribbling}\n`;
      if (p.dexterity) text += `• رشاقة (Dexterity): ${p.dexterity}\n`;
      if (p.lowerBody) text += `• قوة الجزء السفلي (Lower Body): ${p.lowerBody}\n`;
      if (p.aerial) text += `• ارتقاء وقوة هوائية (Aerial): ${p.aerial}\n`;
      if (p.defending) text += `• دفاع (Defending): ${p.defending}\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `النقاط المستخدمة: ${dev.usedPoints}/${dev.availablePoints}\n`;
    text += `المصدر الرسمي: eFHUB (${card.sourceVersion || 'eFootball 2025'})\n`;
    text += `#PES_ARENA #ExactCardMatching #eFootball2025`;

    navigator.clipboard.writeText(text);
    setCopiedCardId(card.id);
    toast.success(`تم نسخ نقاط تطويرة ${card.playerName} بنجاح!`);
    setTimeout(() => setCopiedCardId(null), 2500);
  };

  const getPositionBadge = (pos: string) => {
    if (['CF', 'SS', 'LWF', 'RWF'].includes(pos)) {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
    if (['AMF', 'CMF', 'DMF', 'LMF', 'RMF'].includes(pos)) {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
    if (['CB', 'LB', 'RB'].includes(pos)) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  };

  const getCardTypeBadge = (type: string) => {
    switch (type) {
      case 'Big Time':
        return 'bg-purple-900/40 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]';
      case 'Epic Booster':
      case 'Epic':
        return 'bg-amber-900/40 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
      case 'Show Time':
        return 'bg-cyan-900/40 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]';
      case 'Highlight':
      case 'POTW':
        return 'bg-emerald-900/40 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-blue-900/40 text-blue-300 border-blue-500/40';
    }
  };

  // Filtered Cards list showing ALL players
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Category filter
      let matchesCategory = true;
      if (selectedCategory === 'FW') {
        matchesCategory = ['CF', 'SS', 'LWF', 'RWF'].includes(card.position);
      } else if (selectedCategory === 'MF') {
        matchesCategory = ['AMF', 'CMF', 'DMF', 'LMF', 'RMF'].includes(card.position);
      } else if (selectedCategory === 'DF') {
        matchesCategory = ['CB', 'LB', 'RB'].includes(card.position);
      } else if (selectedCategory === 'GK') {
        matchesCategory = card.position === 'GK';
      }

      // Card type filter
      const matchesCardType = selectedCardType === 'ALL' || card.cardType === selectedCardType;

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        card.playerName.toLowerCase().includes(q) ||
        (card.arabicName && card.arabicName.toLowerCase().includes(q)) ||
        (card.team && card.team.toLowerCase().includes(q)) ||
        (card.clubName && card.clubName.toLowerCase().includes(q)) ||
        card.position.toLowerCase().includes(q) ||
        card.cardType.toLowerCase().includes(q) ||
        card.id.toLowerCase().includes(q);

      return matchesCategory && matchesCardType && matchesQuery;
    }).sort((a, b) => (b.maxOverall || 0) - (a.maxOverall || 0));
  }, [cards, searchQuery, selectedCategory, selectedCardType]);

  // Alternative cards for the modal player
  const alternativeCards = useMemo(() => {
    if (!selectedCardForModal) return [];
    return cards.filter(
      c => c.playerId.toLowerCase() === selectedCardForModal.playerId.toLowerCase() && c.id !== selectedCardForModal.id
    );
  }, [cards, selectedCardForModal]);

  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans selection:bg-blue-600 selection:text-white" dir="rtl">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button 
            type="button"
            onClick={() => navigate('/')} 
            className="p-2.5 rounded-xl bg-[#0e1628] border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="الرجوع للرئيسية"
          >
            <ChevronLeft size={18} />
            <span>الرئيسية</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400 font-mono">
              eFHUB Official Database
            </span>
          </div>
        </div>

        {/* Title & Introduction */}
        <div className="mb-6 text-center sm:text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
            <Sparkles size={14} />
            <span>نظام تطويرات وبطاقات اللاعبين (Exact Player Cards 100%)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-display">
            جميع بطاقات وتطويرات اللاعبين
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
            استعرض جميع بطاقات اللاعبين الأصلية مع صور بطاقاتهم الدقيقة من eFHUB، ونقاط التطوير المثالية قبل وبعد الترقية مع إمكانية نسخ التوزيع بضغطة زر.
          </p>
        </div>

        {/* Unified Search & Filters Toolbar */}
        <div className="bg-[#0e121d] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-xl mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full lg:flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ابحث عن أي لاعب (ميسي، رونالدو، هالاند، فييرا...)، نادٍ، أو مركز..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121724] border border-white/10 rounded-2xl pr-10 pl-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Position Filters */}
            <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
              {(['ALL', 'FW', 'MF', 'DF', 'GK'] as CategoryType[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat === 'ALL' && 'جميع المراكز'}
                  {cat === 'FW' && 'الهجوم (FW)'}
                  {cat === 'MF' && 'الوسط (MF)'}
                  {cat === 'DF' && 'الدفاع (DF)'}
                  {cat === 'GK' && 'الحراسة (GK)'}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter: Card Rarity */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/5 text-xs text-gray-400">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-gray-500 ml-1">نوع البطاقة:</span>
              {['ALL', 'Big Time', 'Epic Booster', 'Show Time', 'Highlight'].map((rarity) => (
                <button
                  key={rarity}
                  type="button"
                  onClick={() => setSelectedCardType(rarity)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedCardType === rarity
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                      : 'bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {rarity === 'ALL' ? 'الكل' : rarity}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 font-mono text-gray-400">
              <span>عرض</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                {filteredCards.length}
              </span>
              <span>لاعب وبطاقة معتمدة</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm font-bold">جاري تحميل وتجهيز بطاقات اللاعبين من eFHUB...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCards.length === 0 && (
          <div className="p-12 rounded-3xl bg-[#0e121d] border border-white/10 text-center max-w-md mx-auto my-12">
            <Layers className="mx-auto text-gray-600 mb-3" size={40} />
            <h3 className="text-lg font-bold text-white mb-1">لا توجد نتائج مطابقة</h3>
            <p className="text-xs text-gray-400 mb-4">
              لم نتمكن من العثور على أي لاعب يطابق معايير البحث الحالية. جرّب كتابة اسم آخر أو اختيار مركز مختلف.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedCardType('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}

        {/* All Players Catalog Grid */}
        {!loading && filteredCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredCards.map((card) => {
              const dev = getCardDevelopment(card);
              const isCopied = copiedCardId === card.id;

              return (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedCardForModal(card)}
                  className="bg-[#0e121d] border border-white/10 hover:border-blue-500/50 rounded-3xl p-4 shadow-xl transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                >
                  {/* Glowing background hint on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-600/[0.04] pointer-events-none" />

                  <div>
                    {/* Exact Card Display */}
                    <div className="w-full max-w-[210px] mx-auto mb-3.5 relative">
                      <ExactCardImage
                        cardId={card.id}
                        cardImageUrl={card.cardImageUrl}
                        alt={card.cardName || card.playerName}
                        containerClassName="border border-white/10 shadow-lg group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>

                    {/* Meta badges row */}
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold border truncate max-w-[110px] ${getCardTypeBadge(card.cardType)}`}>
                        {card.cardType}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${getPositionBadge(card.position)}`}>
                        {card.position}
                      </span>
                      <div className="mr-auto text-left flex items-baseline gap-1">
                        <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 font-mono">
                          {card.maxOverall}
                        </span>
                        <span className="text-[9px] text-gray-500 font-bold">OVR</span>
                      </div>
                    </div>

                    {/* Names & Team */}
                    <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                      {card.playerName}
                    </h3>
                    {card.arabicName && card.arabicName !== card.playerName && (
                      <p className="text-[11px] text-gray-400 line-clamp-1">{card.arabicName}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-1 font-mono">
                      {card.clubName || card.team} • {card.version}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => copyCardProgression(card, e)}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                      title="نسخ نقاط التطوير مباشرة"
                    >
                      {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{isCopied ? 'تم النسخ!' : 'نسخ النقاط'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCardForModal(card)}
                      className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <span>التفاصيل</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PLAYER CARD & DEVELOPMENT DETAIL MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedCardForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCardForModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0d121f] border-2 border-white/10 rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-right"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedCardForModal(null)}
                className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors"
                title="إغلاق"
              >
                <X size={20} />
              </button>

              {(() => {
                const card = selectedCardForModal;
                const dev = getCardDevelopment(card);
                const p = dev.points;
                const isCopied = copiedCardId === card.id;

                return (
                  <div className="space-y-6">
                    {/* Top Modal Header */}
                    <div className="flex flex-wrap items-center gap-2 pr-1">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-extrabold border ${getCardTypeBadge(card.cardType)}`}>
                        {card.cardType}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${getPositionBadge(card.position)}`}>
                        {card.position}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                        {card.clubName || card.team}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 border border-white/10">
                        {card.nationality}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        المصدر: eFHUB
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      {/* Left: Card Display */}
                      <div className="md:col-span-5 flex flex-col items-center">
                        <div className="w-full max-w-[280px]">
                          <ExactCardImage
                            cardId={card.id}
                            cardImageUrl={card.cardImageUrl}
                            alt={card.cardName || card.playerName}
                            containerClassName="shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-white/10"
                            priority={true}
                          />
                        </div>

                        {/* Quick Metadata Box */}
                        <div className="w-full max-w-[280px] mt-4 p-3 rounded-2xl bg-white/[0.02] border border-white/10 text-xs space-y-1.5 text-gray-300">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">الاسم الكامل:</span>
                            <span className="font-bold text-white">{card.playerName}</span>
                          </div>
                          {card.arabicName && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">الاسم بالعربية:</span>
                              <span className="font-bold text-amber-300">{card.arabicName}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">التقييم الأصلي ➔ الأقصى:</span>
                            <span className="font-bold text-emerald-400 font-mono">
                              {card.overall} ➔ {card.maxOverall} OVR
                            </span>
                          </div>
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-gray-400">معرّف البطاقة:</span>
                            <span className="text-blue-300 truncate max-w-[140px] text-[11px]">{card.id}</span>
                          </div>
                        </div>

                        {/* Alternative Versions for the same player if available */}
                        {alternativeCards.length > 0 && (
                          <div className="w-full max-w-[280px] mt-4 pt-3 border-t border-white/10">
                            <span className="block text-[11px] font-bold text-gray-400 mb-2">
                              بطاقات وإصدارات أخرى لنفس اللاعب ({alternativeCards.length}):
                            </span>
                            <div className="flex flex-col gap-1.5">
                              {alternativeCards.map((alt) => (
                                <button
                                  key={alt.id}
                                  type="button"
                                  onClick={() => setSelectedCardForModal(alt)}
                                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-right flex items-center justify-between transition-colors text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white truncate max-w-[130px]">{alt.cardName || alt.version}</span>
                                    <span className="text-[10px] text-gray-400">({alt.cardType})</span>
                                  </div>
                                  <span className="font-mono font-bold text-emerald-400">{alt.maxOverall} OVR</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Development Progression Points & Stats */}
                      <div className="md:col-span-7 space-y-5">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                            {dev.title}
                          </h2>
                          <p className="text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed">
                            {dev.description}
                          </p>
                        </div>

                        {/* Points Allocation Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#121727] border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <SlidersHorizontal size={17} className="text-blue-400" />
                              <h3 className="font-bold text-sm text-gray-200">توزيع نقاط التطوير (Progression):</h3>
                            </div>
                            <span className="text-xs font-mono text-gray-400">
                              النقاط: <span className="text-blue-400 font-bold">{dev.usedPoints}</span> / {dev.availablePoints}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {card.position === 'GK' ? (
                              <>
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                  <span className="block text-[11px] text-gray-400">ارتقاء (Aerial)</span>
                                  <span className="text-lg font-black text-blue-400 font-mono">+{p.aerial || 0}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                  <span className="block text-[11px] text-gray-400">حراسة 1 (GK 1)</span>
                                  <span className="text-lg font-black text-blue-400 font-mono">+{p.gk1 || 0}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                  <span className="block text-[11px] text-gray-400">حراسة 2 (GK 2)</span>
                                  <span className="text-lg font-black text-blue-400 font-mono">+{p.gk2 || 0}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                  <span className="block text-[11px] text-gray-400">حراسة 3 (GK 3)</span>
                                  <span className="text-lg font-black text-blue-400 font-mono">+{p.gk3 || 0}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                  <span className="block text-[11px] text-gray-400">تسديد (Shooting)</span>
                                  <span className="text-lg font-black text-blue-400 font-mono">+{p.shooting || 0}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                  <span className="block text-[11px] text-gray-400">تمرير (Passing)</span>
                                  <span className="text-lg font-black text-blue-400 font-mono">+{p.passing || 0}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                  <span className="block text-[11px] text-gray-400">مراوغة (Dribbling)</span>
                                  <span className="text-lg font-black text-blue-400 font-mono">+{p.dribbling || 0}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                  <span className="block text-[11px] text-gray-400">رشاقة (Dexterity)</span>
                                  <span className="text-lg font-black text-blue-400 font-mono">+{p.dexterity || 0}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                  <span className="block text-[11px] text-gray-400">جزء سفلي (Lower)</span>
                                  <span className="text-lg font-black text-blue-400 font-mono">+{p.lowerBody || 0}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                  <span className="block text-[11px] text-gray-400">ارتقاء (Aerial)</span>
                                  <span className="text-lg font-black text-blue-400 font-mono">+{p.aerial || 0}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center col-span-2">
                                  <span className="block text-[11px] text-gray-400">دفاع (Defending)</span>
                                  <span className="text-lg font-black text-blue-400 font-mono">+{p.defending || 0}</span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Quick Copy Button */}
                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => copyCardProgression(card)}
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/30"
                            >
                              {isCopied ? <Check size={15} /> : <Copy size={15} />}
                              <span>{isCopied ? 'تم نسخ النقاط بنجاح!' : 'نسخ نقاط التطوير'}</span>
                            </button>
                            <span className="text-[11px] text-gray-400">جاهزة للتطبيق داخل eFootball</span>
                          </div>
                        </div>

                        {/* Before vs After Stats Breakdown */}
                        {dev.statChanges && Object.keys(dev.statChanges).length > 0 && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-[#101524] border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <TrendingUp size={17} className="text-emerald-400" />
                                <h3 className="font-bold text-sm text-gray-200">الإحصائيات قبل وبعد التطوير:</h3>
                              </div>
                              <span className="text-xs text-emerald-400 font-bold font-mono">
                                {card.overall} ➔ {dev.finalOverall} OVR
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                              {(Object.values(dev.statChanges) as StatDiffItem[]).map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                                  <span className="text-gray-300 font-medium truncate max-w-[130px]">
                                    {item.arabicName || item.name}
                                  </span>
                                  <div className="flex items-center gap-2 font-mono shrink-0">
                                    <span className="text-gray-500">{item.before}</span>
                                    <span className="text-gray-600">→</span>
                                    <span className="font-bold text-white">{item.after}</span>
                                    {item.diff > 0 && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                                        +{item.diff}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
