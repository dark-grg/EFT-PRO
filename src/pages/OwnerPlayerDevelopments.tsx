import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  Trash2, 
  Edit3,
  ExternalLink, 
  Sliders, 
  Flame, 
  Trophy, 
  Layers, 
  Info, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  UploadCloud,
  CheckCircle2,
  Calendar,
  Tag,
  Eye,
  Wand2,
  Copy,
  Globe,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { playerCardDb } from '../services/playerCardDatabase';
import { PlayerCard, PlayerDevelopment, ProgressionAllocation, CardRarityType, PlayerPositionType } from '../types/playerCard';
import { calculateProgressionStats, calculateAvailablePoints, calculateUsedPoints, STAT_DEFINITIONS } from '../services/progressionEngine';
import { ExactCardImage } from '../components/ExactCardImage';
import { generateExactCardSvgDataUri } from '../services/cardImageGenerator';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

export const OwnerPlayerDevelopments: React.FC = () => {
  const navigate = useNavigate();

  // Active section tab: 'cards' (Cards Management) vs 'developments' (Developments Management)
  const [activeTab, setActiveTab] = useState<'cards' | 'developments'>('cards');

  // Real-time collections
  const [developments, setDevelopments] = useState<PlayerDevelopment[]>([]);
  const [cards, setCards] = useState<PlayerCard[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSummary, setSyncSummary] = useState<{ added: number; updated: number; total: number } | null>(null);

  // Filters for Cards table
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [cardTypeFilter, setCardTypeFilter] = useState<string>('ALL');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');

  // Modal states
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const [isAddDevOpen, setIsAddDevOpen] = useState(false);

  // --- CARD FORM STATE (FOR ADDING & EDITING) ---
  const [cardForm, setCardForm] = useState({
    playerName: '',
    arabicName: '',
    cardName: '',
    playerId: '',
    cardType: 'Big Time' as CardRarityType,
    version: '2025',
    position: 'CF' as PlayerPositionType,
    overall: 88,
    maxOverall: 104,
    cardImageUrl: '',
    team: '',
    nationality: '',
    playingStyle: 'Prolific Winger',
    source: 'eFHUB' as 'eFHUB' | 'PES Master' | 'eFootballLAB' | 'Konami Official' | 'Manual Source Import',
    sourceCardId: '',
    sourceVersion: 'eFootball 2025 v4.2.0',
    sourceUrl: 'https://efhub.com/tr',
    maxLevel: 28,
    skills: 'Double Touch, First-Time Shot, Through Passing, Long Range Curler',
    baseFinishing: 88,
    baseSpeed: 88,
    baseDribbling: 90,
    baseBallControl: 90,
    basePassing: 82,
    basePhysical: 80,
    baseDefending: 50
  });

  // --- eFHUB IMPORT MODAL STATES ---
  const [isEFHubModalOpen, setIsEFHubModalOpen] = useState(false);
  const [efhubInput, setEfhubInput] = useState('');
  const [isParsingEFHub, setIsParsingEFHub] = useState(false);
  const [efhubCardPreview, setEfhubCardPreview] = useState<Partial<PlayerCard> | null>(null);

  // --- ADD DEVELOPMENT WORKFLOW STATES ---
  const [devSearchQuery, setDevSearchQuery] = useState('');
  const [selectedCardForDev, setSelectedCardForDev] = useState<PlayerCard | null>(null);
  const [devTitle, setDevTitle] = useState('');
  const [devRole, setDevRole] = useState('');
  const [devDescription, setDevDescription] = useState('');
  const [devPoints, setDevPoints] = useState<ProgressionAllocation>({
    shooting: 0,
    passing: 0,
    dribbling: 0,
    dexterity: 0,
    lowerBody: 0,
    aerial: 0,
    defending: 0,
    gk1: 0,
    gk2: 0,
    gk3: 0
  });
  const [isSubmittingDev, setIsSubmittingDev] = useState(false);

  // Full Re-Sync Modal & Flow States (Requirement 9)
  const [isReSyncModalOpen, setIsReSyncModalOpen] = useState(false);
  const [reSyncStage, setReSyncStage] = useState<'confirm' | 'progress' | 'success' | 'error'>('confirm');
  const [reSyncStep, setReSyncStep] = useState(0);
  const [reSyncResult, setReSyncResult] = useState<{
    playersCount: number;
    cardsCount: number;
    invalidCount: number;
    duplicatesCount: number;
  } | null>(null);
  const [reSyncError, setReSyncError] = useState<string | null>(null);

  const RE_SYNC_STEPS = [
    'جاري الاتصال بالمصدر...',
    'جاري جلب البيانات...',
    'جاري التحقق...',
    'جاري تجهيز البطاقات...',
    'جاري استبدال قاعدة البيانات...',
    'جاري التحقق النهائي...'
  ];

  // Subscribe to real-time snapshots
  useEffect(() => {
    const unsubDevs = playerCardDb.onDevelopmentsSnapshot((updatedDevs) => {
      setDevelopments(updatedDevs);
    });

    const unsubCards = playerCardDb.onCardsSnapshot((updatedCards) => {
      setCards(updatedCards);
    });

    return () => {
      unsubDevs();
      unsubCards();
    };
  }, []);

  // Filtered cards list
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      const q = cardSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        c.playerName.toLowerCase().includes(q) ||
        (c.arabicName && c.arabicName.toLowerCase().includes(q)) ||
        c.team.toLowerCase().includes(q) ||
        c.position.toLowerCase().includes(q) ||
        c.cardType.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);

      const matchesType = cardTypeFilter === 'ALL' || c.cardType === cardTypeFilter;
      const matchesPos = positionFilter === 'ALL' || c.position === positionFilter;

      return matchesSearch && matchesType && matchesPos;
    });
  }, [cards, cardSearchQuery, cardTypeFilter, positionFilter]);

  // Handle Sync / Update
  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      const res = await playerCardDb.syncCardsDatabase();
      setSyncSummary(res);
      toast.success(`تم تحديث قاعدة البيانات بنجاح: ${res.updated} بطاقة محدثة`);
    } catch (err: any) {
      toast.error('حدث خطأ أثناء مزامنة قاعدة البيانات');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Full Re-Sync (Requirement 9)
  const handleStartFullReSync = async () => {
    setReSyncStage('progress');
    setReSyncStep(0);
    setReSyncError(null);

    // Simulate progressive step transitions during the full sync pipeline
    const interval = setInterval(() => {
      setReSyncStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 650);

    try {
      const res = await playerCardDb.fullReSync();
      clearInterval(interval);

      if (res.success && res.cards) {
        setReSyncStep(5); // Final validation step
        setTimeout(() => {
          setReSyncResult({
            playersCount: res.playersCount || 0,
            cardsCount: res.cardsCount || 0,
            invalidCount: res.invalidCount || 0,
            duplicatesCount: res.duplicatesCount || 0
          });
          setReSyncStage('success');
          toast.success('تمت إعادة استيراد قاعدة اللاعبين بالكامل بنجاح!');
        }, 500);
      } else {
        setReSyncError(res.error || 'فشل تحديث اللاعبين، تم الاحتفاظ بالبيانات الحالية.');
        setReSyncStage('error');
        toast.error('فشل تحديث اللاعبين، تم الاحتفاظ بالبيانات الحالية.');
      }
    } catch (err: any) {
      clearInterval(interval);
      setReSyncError(err?.message || 'فشل تحديث اللاعبين، تم الاحتفاظ بالبيانات الحالية.');
      setReSyncStage('error');
      toast.error('فشل تحديث اللاعبين، تم الاحتفاظ بالبيانات الحالية.');
    }
  };

  // Open Card Modal in Create Mode
  const handleOpenAddCard = () => {
    setEditingCardId(null);
    setCardForm({
      playerName: '',
      arabicName: '',
      cardName: '',
      playerId: '',
      cardType: 'Big Time',
      version: '2025',
      position: 'CF',
      overall: 88,
      maxOverall: 104,
      cardImageUrl: '',
      team: '',
      nationality: '',
      playingStyle: 'Prolific Winger',
      source: 'PES Master',
      sourceCardId: `src_${Date.now()}`,
      sourceVersion: 'eFootball 2025 v4.2.0',
      sourceUrl: 'https://pesmaster.com',
      maxLevel: 28,
      skills: 'Double Touch, First-Time Shot, Through Passing, Long Range Curler',
      baseFinishing: 88,
      baseSpeed: 88,
      baseDribbling: 90,
      baseBallControl: 90,
      basePassing: 82,
      basePhysical: 80,
      baseDefending: 50
    });
    setIsCardModalOpen(true);
  };

  // Open Card Modal in Edit Mode (Strictly updates existing cardId)
  const handleOpenEditCard = (card: PlayerCard) => {
    setEditingCardId(card.id);
    setCardForm({
      playerName: card.playerName,
      arabicName: card.arabicName || '',
      cardName: card.cardName,
      playerId: card.playerId,
      cardType: card.cardType,
      version: card.version || card.sourceVersion || '2025',
      position: card.position,
      overall: card.overall,
      maxOverall: card.maxOverall,
      cardImageUrl: card.cardImageUrl,
      team: card.team,
      nationality: card.nationality,
      playingStyle: card.playingStyle || 'Balanced',
      source: card.source as any,
      sourceCardId: card.sourceCardId,
      sourceVersion: card.sourceVersion,
      sourceUrl: card.sourceUrl,
      maxLevel: card.maxLevel,
      skills: card.skills.join(', '),
      baseFinishing: card.baseStats.finishing || 85,
      baseSpeed: card.baseStats.speed || 85,
      baseDribbling: card.baseStats.dribbling || 85,
      baseBallControl: card.baseStats.ballControl || 85,
      basePassing: card.baseStats.lowPass || 80,
      basePhysical: card.baseStats.physicalContact || 80,
      baseDefending: card.baseStats.defensiveAwareness || 50
    });
    setIsCardModalOpen(true);
  };

  // Quick Generate SVG Card Image URL
  const handleGenerateCardImage = () => {
    if (!cardForm.playerName.trim()) {
      toast.error('يرجى كتابة اسم اللاعب أولاً لتوليد البطاقة');
      return;
    }
    const svgUri = generateExactCardSvgDataUri({
      cardId: editingCardId || `gen_${Date.now()}`,
      playerName: cardForm.playerName,
      arabicName: cardForm.arabicName || cardForm.playerName,
      cardType: cardForm.cardType,
      version: cardForm.version,
      position: cardForm.position,
      overall: Number(cardForm.overall),
      maxOverall: Number(cardForm.maxOverall),
      team: cardForm.team || 'eFootball Club',
      nationality: cardForm.nationality || 'World'
    });
    setCardForm(prev => ({ ...prev, cardImageUrl: svgUri }));
    toast.success('تم توليد تصميم بطاقة eFootball رسمية بنجاح!');
  };

  // Save Card (Add or Edit)
  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardForm.playerName.trim()) {
      toast.error('يرجى كتابة اسم اللاعب');
      return;
    }
    if (!cardForm.cardImageUrl.trim()) {
      toast.error('يرجى تحديد أو توليد صورة البطاقة');
      return;
    }

    try {
      const skillsArray = cardForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      const computedPlayerId = cardForm.playerId.trim() || cardForm.playerName.toLowerCase().replace(/\s+/g, '-');
      const computedCardName = cardForm.cardName.trim() || `${cardForm.playerName} (${cardForm.cardType} ${cardForm.version})`;

      const savedCard = await playerCardDb.saveCard({
        id: editingCardId || undefined,
        cardId: editingCardId || undefined,
        source: cardForm.source,
        sourceUrl: cardForm.sourceUrl || 'https://pesmaster.com',
        sourceCardId: cardForm.sourceCardId || `src_${Date.now()}`,
        sourceVersion: cardForm.sourceVersion || `eFootball ${cardForm.version}`,
        version: cardForm.version,
        playerId: computedPlayerId,
        playerName: cardForm.playerName.trim(),
        arabicName: cardForm.arabicName.trim() || cardForm.playerName.trim(),
        cardName: computedCardName,
        cardType: cardForm.cardType,
        cardImageUrl: cardForm.cardImageUrl.trim(),
        overall: Number(cardForm.overall),
        maxOverall: Number(cardForm.maxOverall),
        position: cardForm.position,
        team: cardForm.team.trim() || 'Club',
        nationality: cardForm.nationality.trim() || 'International',
        playingStyle: cardForm.playingStyle.trim() || 'Balanced',
        level: 1,
        maxLevel: Number(cardForm.maxLevel),
        baseStats: {
          offensiveAwareness: Number(cardForm.baseFinishing) - 2,
          ballControl: Number(cardForm.baseBallControl),
          dribbling: Number(cardForm.baseDribbling),
          tightPossession: Number(cardForm.baseDribbling) - 2,
          lowPass: Number(cardForm.basePassing),
          loftedPass: Number(cardForm.basePassing) - 3,
          finishing: Number(cardForm.baseFinishing),
          heading: 75,
          placeKicking: 80,
          curl: 80,
          speed: Number(cardForm.baseSpeed),
          acceleration: Number(cardForm.baseSpeed) + 1,
          kickingPower: 86,
          jump: 78,
          physicalContact: Number(cardForm.basePhysical),
          balance: 84,
          stamina: 82,
          defensiveAwareness: Number(cardForm.baseDefending),
          tackling: Number(cardForm.baseDefending)
        },
        skills: skillsArray
      });

      if (editingCardId) {
        toast.success(`تم تحديث البطاقة بنجاح لنفس المعرّف (${savedCard.id})!`);
      } else {
        toast.success(`تمت إضافة البطاقة الجديدة بنجاح (${savedCard.id})!`);
      }

      setIsCardModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'فشل حفظ البطاقة');
    }
  };

  // Delete Card
  const handleDeleteCard = async (cardId: string) => {
    if (window.confirm(`هل أنت متأكد من حذف هذه البطاقة؟ (معرّف البطاقة: ${cardId})`)) {
      await playerCardDb.deleteCard(cardId);
      toast.success('تم حذف البطاقة بنجاح من قاعدة البيانات');
    }
  };

  // eFHUB Card Import Handlers
  const handleParseEFHubCard = async (overrideInput?: string) => {
    const targetInput = overrideInput || efhubInput;
    if (!targetInput.trim()) {
      toast.error('يرجى إدخال رابط أو معرف بطاقة eFHUB');
      return;
    }
    setIsParsingEFHub(true);
    try {
      const data = await apiClient.post<{ success: boolean; card: any; message?: string }>(
        '/api/efhub/parse',
        { input: targetInput.trim() },
        15000
      );
      if (!data.success) {
        throw new Error(data.message || 'فشل جلب بيانات البطاقة من eFHUB');
      }
      setEfhubCardPreview(data.card);
      toast.success('تم التعرف على بطاقة eFHUB الأصلية بنجاح!');
    } catch (err: any) {
      // Direct regex fallback extraction if API is blocked or offline
      const match = targetInput.match(/(?:players|player_cards)\/(\d+)/) || targetInput.match(/^(\d{5,25})$/);
      if (match && match[1]) {
        const sourceCardId = match[1];
        setEfhubCardPreview({
          source: 'eFHUB',
          sourceCardId,
          sourceUrl: `https://efhub.com/tr/players/${sourceCardId}`,
          cardImageUrl: `https://efimg.com/efootballhub22/images/player_cards/${sourceCardId}_l.png`,
          sourceVersion: 'eFootball 2025 v4.2.0',
          playerName: 'eFHUB Player',
          arabicName: 'لاعب eFHUB',
          position: 'CF',
          overall: 85,
          maxOverall: 98,
          cardType: 'Highlight',
          version: '2025',
          team: 'eFootball Club',
          nationality: 'World'
        });
        toast.success('تم استخراج معرف البطاقة ورابط صورة eFHUB الرسمية!');
      } else {
        toast.error(err.message || 'تعذر استخراج بيانات بطاقة eFHUB');
      }
    } finally {
      setIsParsingEFHub(false);
    }
  };

  const handleSaveEFHubCard = async () => {
    if (!efhubCardPreview || !efhubCardPreview.sourceCardId) {
      toast.error('لا توجد بطاقة صالحة للحفظ');
      return;
    }
    try {
      const cardId = `efhub_${efhubCardPreview.sourceCardId}`;
      const newCard: any = {
        id: cardId,
        cardId: cardId,
        source: 'eFHUB',
        sourceUrl: efhubCardPreview.sourceUrl || `https://efhub.com/tr/players/${efhubCardPreview.sourceCardId}`,
        sourceCardId: efhubCardPreview.sourceCardId,
        sourceVersion: efhubCardPreview.sourceVersion || 'eFootball 2025 v4.2.0',
        version: efhubCardPreview.version || '2025',
        playerId: efhubCardPreview.playerName?.toLowerCase().replace(/\s+/g, '-') || 'player',
        playerName: efhubCardPreview.playerName || 'Player',
        arabicName: efhubCardPreview.arabicName || efhubCardPreview.playerName || 'لاعب',
        cardName: `${efhubCardPreview.playerName} (${efhubCardPreview.cardType} ${efhubCardPreview.version || '2025'})`,
        cardType: (efhubCardPreview.cardType as CardRarityType) || 'Highlight',
        cardImageUrl: efhubCardPreview.cardImageUrl!,
        overall: efhubCardPreview.overall || 85,
        maxOverall: efhubCardPreview.maxOverall || 98,
        position: efhubCardPreview.position || 'CF',
        team: efhubCardPreview.team || 'Club',
        nationality: efhubCardPreview.nationality || 'International',
        playingStyle: efhubCardPreview.playingStyle || 'Balanced',
        level: 1,
        maxLevel: 28,
        baseStats: {
          offensiveAwareness: 85,
          ballControl: 85,
          dribbling: 85,
          tightPossession: 85,
          lowPass: 80,
          loftedPass: 78,
          finishing: 85,
          heading: 75,
          placeKicking: 78,
          curl: 80,
          speed: 86,
          acceleration: 86,
          kickingPower: 86,
          jump: 78,
          physicalContact: 80,
          balance: 85,
          stamina: 84,
          defensiveAwareness: 50,
          tackling: 50,
          defensiveEngagement: 50,
          aggression: 50
        },
        skills: ['Double Touch', 'First-Time Shot', 'Through Passing']
      };

      await playerCardDb.saveCard(newCard);
      toast.success(`تم حفظ بطاقة ${newCard.playerName} من eFHUB بنجاح في قاعدة البطاقات!`);
      setIsEFHubModalOpen(false);
      setEfhubCardPreview(null);
      setEfhubInput('');
    } catch (err: any) {
      toast.error('حدث خطأ أثناء حفظ البطاقة');
    }
  };

  // Open Development Creator pre-selecting a card
  const handleOpenAddDevForCard = (card: PlayerCard) => {
    setSelectedCardForDev(card);
    setDevTitle(`⚡ تطويرة ${card.playerName} (${card.cardType} ${card.version || ''})`);
    setDevRole(card.position);
    setDevDescription(`أفضل توزيع نقاط لمركز ${card.position} للحصول على أقصى تقييم ${card.maxOverall} OVR.`);
    setDevPoints({
      shooting: 0,
      passing: 0,
      dribbling: 0,
      dexterity: 0,
      lowerBody: 0,
      aerial: 0,
      defending: 0,
      gk1: 0,
      gk2: 0,
      gk3: 0
    });
    setIsAddDevOpen(true);
  };

  // Handle Development Submission
  const handleCreateDevelopment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardForDev) {
      toast.error('يرجى اختيار بطاقة اللاعب أولاً');
      return;
    }
    if (!devTitle.trim()) {
      toast.error('يرجى كتابة عنوان التطوير');
      return;
    }

    setIsSubmittingDev(true);
    try {
      await playerCardDb.saveDevelopment({
        cardId: selectedCardForDev.id,
        title: devTitle.trim(),
        description: devDescription.trim() || 'تطوير دقيق تم حسابه وفق ميكانيكا eFootball الرسمية.',
        role: devRole.trim() || selectedCardForDev.position,
        position: selectedCardForDev.position,
        developmentPoints: devPoints,
        published: true,
        featured: true
      });

      toast.success('تم نشر تطوير اللاعب بنجاح في قاعدة البيانات وتحديث التطبيق لحظياً!');
      setIsAddDevOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'فشل حفظ التطوير');
    } finally {
      setIsSubmittingDev(false);
    }
  };

  const handleDeleteDev = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التطوير؟')) {
      await playerCardDb.deleteDevelopment(id);
      toast.success('تم حذف التطوير بنجاح');
    }
  };

  // Progression metrics for the active dev form
  const availablePoints = selectedCardForDev ? calculateAvailablePoints(selectedCardForDev) : 0;
  const usedPoints = calculateUsedPoints(devPoints);
  const remainingPoints = availablePoints - usedPoints;
  const currentDevCalc = selectedCardForDev ? calculateProgressionStats(selectedCardForDev, devPoints, true) : null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-24 text-right" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="text-purple-400" size={24} />
            <h1 className="text-xl font-black text-white">إدارة تطويرات وبطاقات اللاعبين (Owner Dashboard)</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            إدارة مباشرة لـ <span className="text-blue-400 font-bold">Player Cards</span> وربط التطويرات بالـ <span className="text-purple-400 font-bold">Exact Card</span> الحقيقية بنسبة 100%.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin')}
          className="p-2 rounded-xl bg-surface border border-white/10 text-gray-300 hover:text-white transition-colors"
          title="رجوع إلى لوحة الإدارة"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Main Tabs Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0f1422] border border-white/10 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'cards'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers size={16} />
          <span>بطاقات اللاعبين (Player Cards - {cards.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('developments')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'developments'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles size={16} />
          <span>تطويرات اللاعبين (Player Developments - {developments.length})</span>
        </button>
      </div>

      {/* Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setReSyncStage('confirm');
            setReSyncError(null);
            setReSyncResult(null);
            setIsReSyncModalOpen(true);
          }}
          className="p-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 transition-all text-sm border border-orange-400/30"
        >
          <RefreshCw size={18} />
          <span>🔄 إعادة استيراد جميع اللاعبين (Full Re-Sync)</span>
        </button>

        <button
          onClick={() => {
            setEfhubInput('');
            setEfhubCardPreview(null);
            setIsEFHubModalOpen(true);
          }}
          className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm"
        >
          <Globe size={18} />
          <span>استيراد بطاقة من eFHUB</span>
        </button>

        <button
          onClick={handleOpenAddCard}
          className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm"
        >
          <Plus size={18} />
          <span>إضافة بطاقة يدوية (Add Card)</span>
        </button>

        <button
          onClick={() => {
            setSelectedCardForDev(null);
            setIsAddDevOpen(true);
          }}
          className="p-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all text-sm"
        >
          <Plus size={18} />
          <span>إضافة تطويرة جديدة (Add Dev)</span>
        </button>
      </div>

      {/* Sync Status Banner */}
      {syncSummary && (
        <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between text-xs text-blue-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>حالة المزامنة: تم فحص {syncSummary.total} بطاقة ({syncSummary.added} جديدة، {syncSummary.updated} محدثة بدون تكرار).</span>
          </div>
          <button onClick={() => setSyncSummary(null)} className="text-gray-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: CARDS MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="p-4 rounded-2xl bg-[#0e121d] border border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="ابحث عن بطاقة لاعب بالاسم، النادي، المركز، أو معرّف الكارد..."
                value={cardSearchQuery}
                onChange={(e) => setCardSearchQuery(e.target.value)}
                className="w-full bg-[#121724] border border-white/10 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={cardTypeFilter}
                onChange={(e) => setCardTypeFilter(e.target.value)}
                className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none"
              >
                <option value="ALL">جميع أنواع البطاقات</option>
                <option value="Big Time">Big Time</option>
                <option value="Epic Booster">Epic Booster</option>
                <option value="Show Time">Show Time</option>
                <option value="Highlight">Highlight</option>
                <option value="POTW">POTW</option>
              </select>

              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none"
              >
                <option value="ALL">جميع المراكز</option>
                {['CF', 'SS', 'LWF', 'RWF', 'AMF', 'CMF', 'DMF', 'CB', 'LB', 'RB', 'GK'].map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.length === 0 ? (
              <div className="col-span-full p-10 rounded-2xl bg-surface/50 border border-white/5 text-center text-gray-400 text-sm">
                لم يتم العثور على بطاقات مطابقة لخيارات البحث.
              </div>
            ) : (
              filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl bg-[#0e1320] border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between gap-3 shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    {/* Exact Card Thumbnail */}
                    <div className="w-16 h-22 rounded-xl overflow-hidden shrink-0 bg-black/60 border border-white/10">
                      <ExactCardImage
                        cardId={card.id}
                        cardImageUrl={card.cardImageUrl}
                        alt={card.cardName}
                        containerClassName="!aspect-auto w-full h-full"
                      />
                    </div>

                    {/* Card Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/30">
                          {card.cardType}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                          {card.position}
                        </span>
                        <span className="text-[10px] text-gray-400 mr-auto font-mono">
                          {card.version}
                        </span>
                      </div>

                      <h4 className="font-black text-sm text-white truncate">{card.playerName}</h4>
                      <p className="text-[11px] text-gray-400 truncate">{card.arabicName || card.playerName}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{card.team} • {card.nationality}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-black text-emerald-400 font-mono">
                          {card.overall} → {card.maxOverall} OVR
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          ({card.source})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card ID Bar */}
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span className="truncate max-w-[190px]">ID: {card.id}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(card.id);
                        toast.success('تم نسخ cardId بنجاح!');
                      }}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Copy size={11} />
                      <span>نسخ</span>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditCard(card)}
                      className="flex-1 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Edit3 size={13} />
                      <span>تعديل الكارد</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAddDevForCard(card)}
                      className="py-1.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      title="إنشاء تطويرة لهذه البطاقة"
                    >
                      <Sparkles size={13} />
                      <span>تطوير</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                      title="حذف البطاقة"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: DEVELOPMENTS MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'developments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {developments.length === 0 ? (
              <div className="p-10 rounded-2xl bg-surface/50 border border-white/5 text-center text-gray-400 text-sm">
                لا توجد تطويرات حالياً. اضغط على "إضافة تطويرة جديدة" للبدء.
              </div>
            ) : (
              developments.map((dev) => (
                <div 
                  key={dev.id} 
                  className="p-4 rounded-2xl bg-gradient-to-br from-[#0e1628] to-[#070b14] border border-white/10 hover:border-blue-500/30 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between relative overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-22 rounded-xl overflow-hidden bg-black/60 border border-amber-400/30 shrink-0 relative shadow-md">
                      <ExactCardImage
                        cardId={dev.cardId}
                        cardImageUrl={dev.cardSnapshot?.cardImageUrl}
                        alt={dev.cardSnapshot?.playerName || 'Card'}
                        containerClassName="!aspect-auto w-full h-full"
                      />
                      <div className="absolute top-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] font-black text-amber-300 font-mono">
                        {dev.finalOverall}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                          {dev.position}
                        </span>
                        <span className="text-xs font-black text-white">
                          {dev.cardSnapshot?.playerName} ({dev.cardSnapshot?.cardType})
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          cardId: {dev.cardId}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-gray-200">{dev.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-1">{dev.description}</p>

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono mt-1">
                        <span>النقاط: <strong className="text-blue-400">{dev.usedPoints}</strong>/{dev.availablePoints}</span>
                        <span>التقييم: <strong className="text-emerald-400">{dev.cardSnapshot?.overall} ← {dev.finalOverall}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteDev(dev.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-xs flex items-center gap-1.5"
                    >
                      <Trash2 size={15} />
                      <span>حذف التطوير</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT CARD (With Real-Time Exact Image Preview) */}
      {/* ========================================================================= */}
      {isCardModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1320] border border-white/15 rounded-3xl w-full max-w-4xl p-6 shadow-2xl my-8 text-right max-h-[90vh] overflow-y-auto" dir="rtl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Layers size={18} className="text-blue-400" />
                  <span>{editingCardId ? `تعديل بطاقة اللاعب (معرّف البطاقة: ${editingCardId})` : 'إضافة بطاقة لاعب جديدة (Player Card)'}</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {editingCardId 
                    ? 'يتم تحديث نفس معرّف البطاقة (cardId) ومزامنة كافة التطويرات المرتبطة به فوراً دون إنشاء بطاقة جديدة.'
                    : 'إدخال بيانات بطاقة eFootball رسمية وتوليد أو ربط الصورة الأصلية 100%.'
                  }
                </p>
              </div>
              <button onClick={() => setIsCardModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left (or Right in RTL): Live Card Preview */}
                <div className="lg:col-span-4 flex flex-col items-center">
                  <div className="w-full max-w-[240px]">
                    <span className="block text-xs font-bold text-gray-300 mb-2 text-center flex items-center justify-center gap-1.5">
                      <Eye size={14} className="text-blue-400" />
                      <span>معاينة حقيقية للكارد (Live Preview)</span>
                    </span>

                    {/* Real-Time Exact Card Preview */}
                    <ExactCardImage
                      cardId={editingCardId || 'preview_card'}
                      cardImageUrl={cardForm.cardImageUrl}
                      alt={cardForm.playerName || 'Card Preview'}
                      containerClassName="border border-white/15 shadow-2xl"
                    />

                    {/* SVG Generator Button */}
                    <button
                      type="button"
                      onClick={handleGenerateCardImage}
                      className="w-full mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-600/40 transition-all"
                    >
                      <Wand2 size={14} />
                      <span>توليد تصميم eFootball SVG تلقائي</span>
                    </button>
                  </div>
                </div>

                {/* Main Form Fields */}
                <div className="lg:col-span-8 space-y-4">
                  
                  {/* Player Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-300">اسم اللاعب بالإنجليزية (Player) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lionel Messi"
                        value={cardForm.playerName}
                        onChange={(e) => setCardForm({ ...cardForm, playerName: e.target.value })}
                        className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-300">اسم اللاعب بالعربية</label>
                      <input
                        type="text"
                        placeholder="e.g. ليونيل ميسي"
                        value={cardForm.arabicName}
                        onChange={(e) => setCardForm({ ...cardForm, arabicName: e.target.value })}
                        className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Card Type, Version & Position */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-300">نوع الكارد (Card Type) *</label>
                      <select
                        value={cardForm.cardType}
                        onChange={(e) => setCardForm({ ...cardForm, cardType: e.target.value as any })}
                        className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="Big Time">Big Time</option>
                        <option value="Epic Booster">Epic Booster</option>
                        <option value="Show Time">Show Time</option>
                        <option value="Highlight">Highlight</option>
                        <option value="POTW">POTW</option>
                        <option value="Standard">Standard</option>
                        <option value="Club Selection">Club Selection</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-300">الإصدار (Version) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2022 أو 2015 أو 2025"
                        value={cardForm.version}
                        onChange={(e) => setCardForm({ ...cardForm, version: e.target.value })}
                        className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-300">المركز (Position) *</label>
                      <select
                        value={cardForm.position}
                        onChange={(e) => setCardForm({ ...cardForm, position: e.target.value as any })}
                        className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        {['CF', 'SS', 'LWF', 'RWF', 'AMF', 'CMF', 'DMF', 'CB', 'LB', 'RB', 'GK'].map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Overalls */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-300">التقييم الأساسي (Base OVR) *</label>
                      <input
                        type="number"
                        required
                        value={cardForm.overall}
                        onChange={(e) => setCardForm({ ...cardForm, overall: Number(e.target.value) })}
                        className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-300">أقصى تقييم بعد التطوير (Max OVR) *</label>
                      <input
                        type="number"
                        required
                        value={cardForm.maxOverall}
                        onChange={(e) => setCardForm({ ...cardForm, maxOverall: Number(e.target.value) })}
                        className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Card Image URL (With instant live update) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-300">رابط صورة الكارد الدقيقة (Card Image URL) *</label>
                    <input
                      type="text"
                      required
                      placeholder="https://... أو data:image/svg+xml..."
                      value={cardForm.cardImageUrl}
                      onChange={(e) => setCardForm({ ...cardForm, cardImageUrl: e.target.value })}
                      className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-left"
                    />
                  </div>

                  {/* Source and Source Card ID */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-300">المصدر (Source) *</label>
                      <select
                        value={cardForm.source}
                        onChange={(e) => setCardForm({ ...cardForm, source: e.target.value as any })}
                        className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="PES Master">PES Master</option>
                        <option value="eFootballLAB">eFootballLAB</option>
                        <option value="Konami Official">Konami Official</option>
                        <option value="Manual Source Import">Manual Source Import</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-300">معرّف البطاقة بالمصدر (Source Card ID) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 10558482"
                        value={cardForm.sourceCardId}
                        onChange={(e) => setCardForm({ ...cardForm, sourceCardId: e.target.value })}
                        className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-300">إصدار المصدر</label>
                      <input
                        type="text"
                        value={cardForm.sourceVersion}
                        onChange={(e) => setCardForm({ ...cardForm, sourceVersion: e.target.value })}
                        className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Team & Nationality */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-300">النادي (Team)</label>
                      <input
                        type="text"
                        placeholder="e.g. Argentina أو Barcelona"
                        value={cardForm.team}
                        onChange={(e) => setCardForm({ ...cardForm, team: e.target.value })}
                        className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-300">الجنسية (Nationality)</label>
                      <input
                        type="text"
                        placeholder="e.g. Argentina"
                        value={cardForm.nationality}
                        onChange={(e) => setCardForm({ ...cardForm, nationality: e.target.value })}
                        className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-lg shadow-blue-500/25"
                >
                  {editingCardId ? 'حفظ تعديلات الكارد (تحديث نفس cardId)' : 'حفظ الكارد في قاعدة البيانات'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD DEVELOPMENT FOR A CARD */}
      {/* ========================================================================= */}
      {isAddDevOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1320] border border-white/15 rounded-3xl w-full max-w-4xl p-6 shadow-2xl my-8 text-right max-h-[90vh] overflow-y-auto" dir="rtl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-400" />
                  <span>إنشاء تطوير مربوط بـ Exact Player Card</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  اختر البطاقة بدقة، وحدد نقاط التدريب وسيتم حساب الإحصائيات قبل وبعد التطوير رياضياً.
                </p>
              </div>
              <button onClick={() => setIsAddDevOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Step 1: Select Card if not pre-selected */}
            {!selectedCardForDev && (
              <div className="space-y-3 mb-6 p-4 rounded-2xl bg-[#121724] border border-white/10">
                <label className="text-xs font-bold text-gray-300">1. اختر البطاقة المراد تطويرها:</label>
                <input
                  type="text"
                  placeholder="ابحث عن بطاقة لاعب..."
                  value={devSearchQuery}
                  onChange={(e) => setDevSearchQuery(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {cards
                    .filter(c => !devSearchQuery || c.playerName.toLowerCase().includes(devSearchQuery.toLowerCase()) || c.cardType.toLowerCase().includes(devSearchQuery.toLowerCase()))
                    .map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleOpenAddDevForCard(c)}
                        className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/40 text-right flex items-center gap-3 transition-all"
                      >
                        <div className="w-10 h-14 rounded overflow-hidden bg-black shrink-0">
                          <ExactCardImage cardId={c.id} cardImageUrl={c.cardImageUrl} alt={c.cardName} containerClassName="!aspect-auto w-full h-full" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-extrabold">{c.cardType}</span>
                          <h5 className="font-bold text-xs text-white truncate mt-1">{c.playerName}</h5>
                          <span className="text-[10px] text-gray-400 font-mono">{c.position} • {c.maxOverall} OVR</span>
                        </div>
                      </button>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Step 2: Configure Development if card selected */}
            {selectedCardForDev && (
              <form onSubmit={handleCreateDevelopment} className="space-y-5">
                {/* Selected Card Banner */}
                <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 rounded overflow-hidden bg-black shrink-0 border border-white/10">
                      <ExactCardImage cardId={selectedCardForDev.id} cardImageUrl={selectedCardForDev.cardImageUrl} alt={selectedCardForDev.cardName} containerClassName="!aspect-auto w-full h-full" />
                    </div>
                    <div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-extrabold">{selectedCardForDev.cardType}</span>
                      <h4 className="font-black text-sm text-white">{selectedCardForDev.playerName}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">cardId: {selectedCardForDev.id}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCardForDev(null)}
                    className="text-xs text-gray-400 hover:text-white underline"
                  >
                    تغيير البطاقة
                  </button>
                </div>

                {/* Title & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-300">عنوان التطوير *</label>
                    <input
                      type="text"
                      required
                      value={devTitle}
                      onChange={(e) => setDevTitle(e.target.value)}
                      className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-300">الدور التكتيكي (Role)</label>
                    <input
                      type="text"
                      value={devRole}
                      onChange={(e) => setDevRole(e.target.value)}
                      className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-300">وصف التطوير والنصائح التكتيكية</label>
                  <textarea
                    rows={2}
                    value={devDescription}
                    onChange={(e) => setDevDescription(e.target.value)}
                    className="bg-[#121724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Progression Points Sliders */}
                <div className="p-4 rounded-2xl bg-[#121724] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-200">توزيع نقاط التطوير (Points Budget):</span>
                    <span className="font-mono">
                      المستخدم: <strong className="text-blue-400">{usedPoints}</strong> / {availablePoints} (المتبقي: <strong className={remainingPoints < 0 ? 'text-red-400' : 'text-emerald-400'}>{remainingPoints}</strong>)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCardForDev.position === 'GK' ? (
                      <>
                        {['aerial', 'gk1', 'gk2', 'gk3'].map((key) => (
                          <div key={key} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] text-xs">
                            <span className="text-gray-300">{key === 'aerial' ? 'ارتقاء' : `حراسة مرمى ${key.replace('gk', '')}`}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={15}
                                value={(devPoints as any)[key] || 0}
                                onChange={(e) => setDevPoints({ ...devPoints, [key]: Number(e.target.value) })}
                                className="w-24 accent-blue-500"
                              />
                              <span className="font-mono font-bold w-5 text-left text-blue-400">+{(devPoints as any)[key] || 0}</span>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {[
                          { key: 'shooting', label: 'تسديد (Shooting)' },
                          { key: 'passing', label: 'تمرير (Passing)' },
                          { key: 'dribbling', label: 'مراوغة (Dribbling)' },
                          { key: 'dexterity', label: 'رشاقة (Dexterity)' },
                          { key: 'lowerBody', label: 'جزء سفلي (Lower Body)' },
                          { key: 'aerial', label: 'ارتقاء (Aerial)' },
                          { key: 'defending', label: 'دفاع (Defending)' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] text-xs">
                            <span className="text-gray-300">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={15}
                                value={(devPoints as any)[item.key] || 0}
                                onChange={(e) => setDevPoints({ ...devPoints, [item.key]: Number(e.target.value) })}
                                className="w-24 accent-blue-500"
                              />
                              <span className="font-mono font-bold w-5 text-left text-blue-400">+{(devPoints as any)[item.key] || 0}</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Stat Preview */}
                {currentDevCalc && (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between font-mono">
                    <span>التقييم المحسوب: {selectedCardForDev.overall} ← <strong className="text-white text-sm">{currentDevCalc.finalOverall} OVR</strong></span>
                    <span>معادلة eFootball الرسمية نشطة</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddDevOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDev}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
                  >
                    {isSubmittingDev ? 'جاري النشر...' : 'نشر التطوير فوراً'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: eFHUB CARD IMPORT MODAL */}
      {/* ========================================================================= */}
      {isEFHubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0b0f19] border border-emerald-500/30 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Globe size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">استيراد بطاقة رسمية من eFHUB</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                      eFHUB Exact Card
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    جلب وربط صورة البطاقة الأصلية 100% مباشرة من eFHUB (efimg.com) بدون صور عشوائية
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEFHubModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Fast Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300">أمثلة سريعة للاعبين المطلوبين:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '🐺 كونها POTW (97)', id: '105873896755947' },
                  { label: '⚡ سيمينيو POTW (95)', id: '105872823014123' },
                  { label: '🚀 سوبوسلاي شو تايم (99)', id: '105871749272300' },
                  { label: '🥶 بالمر شو تايم (102)', id: '105869601788654' },
                  { label: '🔥 ميسي بيج تايم 2022 (105)', id: '105696729355001' },
                  { label: '🚀 رونالدو بوستر 2008 (104)', id: '105589355172600' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setEfhubInput(`https://efhub.com/tr/players/${preset.id}`);
                      handleParseEFHubCard(preset.id);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-300 border border-white/5 hover:border-emerald-500/30 text-[11px] font-bold transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input URL or ID */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300">
                رابط صفحة اللاعب في eFHUB أو معرف البطاقة (Card ID):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  dir="ltr"
                  placeholder="مثال: https://efhub.com/tr/players/105873896755947 أو 105873896755947"
                  value={efhubInput}
                  onChange={(e) => setEfhubInput(e.target.value)}
                  className="flex-1 bg-[#121724] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleParseEFHubCard()}
                  disabled={isParsingEFHub || !efhubInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isParsingEFHub ? 'animate-spin' : ''} />
                  <span>{isParsingEFHub ? 'جاري الفحص...' : 'فحص وجلب البطاقة'}</span>
                </button>
              </div>
            </div>

            {/* Card Preview When Parsed */}
            {efhubCardPreview && (
              <div className="p-4 rounded-2xl bg-[#121724] border border-emerald-500/30 space-y-4">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  <span>تم استخراج ومعاينة بطاقة eFootball الرسمية المطابقة بنجاح:</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Exact Card Preview */}
                  <div className="w-36 h-48 shrink-0 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl relative">
                    <ExactCardImage
                      cardId={`efhub_${efhubCardPreview.sourceCardId}`}
                      cardImageUrl={efhubCardPreview.cardImageUrl}
                      alt={efhubCardPreview.playerName || 'eFHUB Card'}
                      containerClassName="!aspect-auto w-full h-full"
                    />
                  </div>

                  {/* Card Metadata Fields */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[11px] text-gray-400">اسم اللاعب (English):</label>
                        <input
                          type="text"
                          value={efhubCardPreview.playerName || ''}
                          onChange={(e) => setEfhubCardPreview({ ...efhubCardPreview, playerName: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400">الاسم بالعربية:</label>
                        <input
                          type="text"
                          value={efhubCardPreview.arabicName || ''}
                          onChange={(e) => setEfhubCardPreview({ ...efhubCardPreview, arabicName: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400">المركز (Position):</label>
                        <select
                          value={efhubCardPreview.position || 'CF'}
                          onChange={(e) => setEfhubCardPreview({ ...efhubCardPreview, position: e.target.value as any })}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white font-bold"
                        >
                          {['CF', 'SS', 'LWF', 'RWF', 'AMF', 'CMF', 'DMF', 'CB', 'LB', 'RB', 'GK'].map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400">نوع الكارد (Card Type):</label>
                        <select
                          value={efhubCardPreview.cardType || 'Highlight'}
                          onChange={(e) => setEfhubCardPreview({ ...efhubCardPreview, cardType: e.target.value as any })}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white font-bold"
                        >
                          {['Big Time', 'Epic Booster', 'Show Time', 'Highlight', 'POTW'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400">طاقة البداية (OVR):</label>
                        <input
                          type="number"
                          value={efhubCardPreview.overall || 85}
                          onChange={(e) => setEfhubCardPreview({ ...efhubCardPreview, overall: Number(e.target.value) })}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400">أقصى طاقة (Max OVR):</label>
                        <input
                          type="number"
                          value={efhubCardPreview.maxOverall || 98}
                          onChange={(e) => setEfhubCardPreview({ ...efhubCardPreview, maxOverall: Number(e.target.value) })}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-emerald-400 font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-400 space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span>معرف البطاقة:</span>
                        <strong className="text-white">{efhubCardPreview.sourceCardId}</strong>
                      </div>
                      <div className="flex justify-between truncate">
                        <span>المصدر:</span>
                        <span className="text-emerald-400">{efhubCardPreview.sourceUrl}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEfhubCardPreview(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-bold"
                  >
                    مسح المعاينة
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEFHubCard}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                  >
                    <Check size={16} />
                    <span>حفظ البطاقة في قاعدة playerCards المعتمدة</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 4. FULL RE-SYNC MODAL (REQUIREMENT 9)                                */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isReSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0f1422] border border-orange-500/30 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 text-right">
            
            {/* STAGE: CONFIRM */}
            {reSyncStage === 'confirm' && (
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto">
                  <ShieldAlert size={32} />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-lg font-black text-white">تحذير: إعادة استيراد جميع اللاعبين (Full Re-Sync)</h3>
                  <p className="text-sm font-semibold text-orange-300 bg-orange-950/40 p-3 rounded-xl border border-orange-500/20">
                    سيتم استبدال قاعدة اللاعبين الحالية بالكامل ببيانات eFHUB.
                    <br />
                    هل أنت متأكد؟
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    المصدر الوحيد: <span className="text-emerald-400 font-mono">https://efhub.com/tr</span>.
                    سيتم مسح جميع سجلات البطاقات القديمة أو الوهمية وحفظ البطاقات الحقيقية المعتمدة فقط. لن يتم مسح أي بيانات مستخدمين أو تشكيلات أو بطولات.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsReSyncModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-sm transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleStartFullReSync}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-sm shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    <span>متابعة الاستيراد</span>
                  </button>
                </div>
              </div>
            )}

            {/* STAGE: PROGRESS */}
            {reSyncStage === 'progress' && (
              <div className="space-y-6 py-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-3 animate-spin">
                    <RefreshCw size={26} />
                  </div>
                  <h3 className="text-base font-black text-white">جاري معالجة الاستيراد الشامل من eFHUB</h3>
                  <p className="text-xs text-gray-400">يرجى الانتظار، تتم العملية خطوة بخطوة بأمان...</p>
                </div>

                {/* Progressive Checklist */}
                <div className="space-y-2.5 bg-black/40 border border-white/5 rounded-2xl p-4">
                  {RE_SYNC_STEPS.map((stepText, idx) => {
                    const isDone = reSyncStep > idx;
                    const isCurrent = reSyncStep === idx;
                    return (
                      <div 
                        key={idx}
                        className={`flex items-center gap-3 text-xs font-bold transition-all p-2 rounded-xl ${
                          isDone 
                            ? 'text-emerald-400 bg-emerald-950/20' 
                            : isCurrent 
                            ? 'text-blue-300 bg-blue-950/40 border border-blue-500/30 animate-pulse' 
                            : 'text-gray-500'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                        )}
                        <span>{stepText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STAGE: SUCCESS */}
            {reSyncStage === 'success' && reSyncResult && (
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 size={32} />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-white">تمت إعادة الاستيراد بنجاح</h3>
                  <p className="text-xs text-emerald-400 font-bold">تم استبدال قاعدة اللاعبين بالكامل ببيانات eFHUB المعتمدة بنجاح 100%.</p>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Players</span>
                    <strong className="text-lg font-black text-white">{reSyncResult.playersCount}</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Cards</span>
                    <strong className="text-lg font-black text-blue-400">{reSyncResult.cardsCount}</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Invalid</span>
                    <strong className="text-lg font-black text-amber-400">{reSyncResult.invalidCount}</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Duplicates</span>
                    <strong className="text-lg font-black text-purple-400">{reSyncResult.duplicatesCount}</strong>
                  </div>
                </div>

                <div className="flex justify-center pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsReSyncModalOpen(false)}
                    className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-lg shadow-emerald-500/25"
                  >
                    إغلاق وتحديث العرض
                  </button>
                </div>
              </div>
            )}

            {/* STAGE: ERROR */}
            {reSyncStage === 'error' && (
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                  <ShieldAlert size={32} />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-base font-black text-red-400">فشل تحديث اللاعبين، تم الاحتفاظ بالبيانات الحالية.</h3>
                  {reSyncError && (
                    <p className="text-xs text-gray-400 bg-black/40 p-3 rounded-xl border border-red-500/20 font-mono">
                      {reSyncError}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400">
                    تم تفعيل آلية الاستبدال الآمن (Safe Replacement). لم يتم حذف أو تفريغ أي بيانات من قاعدة البيانات الحالية.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsReSyncModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs"
                  >
                    إغلاق
                  </button>
                  <button
                    type="button"
                    onClick={handleStartFullReSync}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    <span>إعادة المحاولة (Retry)</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
