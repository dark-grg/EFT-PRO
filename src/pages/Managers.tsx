import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ArrowRight, 
  Shield, 
  Sparkles, 
  Zap, 
  Users, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Info, 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { MANAGERS_LIST, Manager } from '../data/managers';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';

export const Managers: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaystyle, setSelectedPlaystyle] = useState<string>('all');
  const [selectedFormation, setSelectedFormation] = useState<string>('all');
  const [activeModalManager, setActiveModalManager] = useState<Manager | null>(null);
  const [savedManagerIds, setSavedManagerIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('saved_managers_ids') || '[]');
    } catch {
      return [];
    }
  });

  const toggleSaveManager = (id: string, name: string) => {
    setSavedManagerIds((prev) => {
      let updated: string[];
      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
        toast.success(`تمت إزالة ${name} من المفضلة`);
      } else {
        updated = [...prev, id];
        toast.success(`تم حفظ ${name} في المفضلة ⭐`);
      }
      localStorage.setItem('saved_managers_ids', JSON.stringify(updated));
      return updated;
    });
  };

  const playstyleFilters = [
    { key: 'all', label: 'الكل (50)' },
    { key: 'possession', label: 'استحواذ', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { key: 'quick-counter', label: 'مرتدات سريعة', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { key: 'long-ball-counter', label: 'مرتدات طويلة', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { key: 'out-wide', label: 'لعب على الأطراف', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
    { key: 'long-ball', label: 'كرات طويلة', color: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10' },
  ];

  const formationFilters = [
    'الكل',
    '4-3-3',
    '4-2-1-3',
    '4-2-2-2',
    '4-2-3-1',
    '3-4-2-1',
    '3-5-2',
    '4-4-2'
  ];

  const filteredManagers = useMemo(() => {
    return MANAGERS_LIST.filter((manager) => {
      // 1. Playstyle filter
      if (selectedPlaystyle !== 'all' && manager.playstyleCategory !== selectedPlaystyle) {
        return false;
      }
      // 2. Formation filter
      if (selectedFormation !== 'الكل' && !manager.formation.includes(selectedFormation)) {
        return false;
      }
      // 3. Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchName = manager.name.toLowerCase().includes(query);
        const matchInGame = manager.inGameName.toLowerCase().includes(query);
        const matchClub = manager.clubOrCountry.toLowerCase().includes(query);
        const matchFormation = manager.formation.toLowerCase().includes(query);
        const matchPlaystyle = manager.playstyle.toLowerCase().includes(query);
        return matchName || matchInGame || matchClub || matchFormation || matchPlaystyle;
      }
      return true;
    });
  }, [searchQuery, selectedPlaystyle, selectedFormation]);

  // Color mapper for playstyle
  const getPlaystyleBadge = (category: string, text: string, score: number) => {
    switch (category) {
      case 'possession':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {text} • {score}
          </span>
        );
      case 'quick-counter':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {text} • {score}
          </span>
        );
      case 'long-ball-counter':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {text} • {score}
          </span>
        );
      case 'out-wide':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            {text} • {score}
          </span>
        );
      case 'long-ball':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            {text} • {score}
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-500/15 text-gray-300 border border-gray-500/30">
            {text} • {score}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          <ArrowRight size={18} />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <h1 className="text-base font-black text-white">دليل مدربي بيس موبايل</h1>
            <span className="text-[10px] font-black bg-blue-500 text-black px-1.5 py-0.2 rounded font-mono">
              50 مدرب
            </span>
          </div>
          <span className="text-[11px] text-gray-400">التشكيلة المعتمدة، أسلوب اللعب ونقاط القوة</span>
        </div>

        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Users size={18} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم المدرب، النادي، الاسم باللعبة، أو التشكيلة..."
          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#0B1221]/90 border border-white/10 focus:border-blue-500 text-white text-xs placeholder:text-gray-500 focus:outline-none transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Playstyle Filter Pills */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-gray-400 px-1">تصفية بحسب أسلوب اللعب:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {playstyleFilters.map((filter) => {
            const isActive = selectedPlaystyle === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => setSelectedPlaystyle(filter.key)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30'
                    : 'bg-[#0B1221]/80 border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Formation Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-[10px] font-bold text-gray-500 shrink-0 ml-1">التشكيلة:</span>
        {formationFilters.map((form) => {
          const isActive = selectedFormation === form;
          return (
            <button
              key={form}
              onClick={() => setSelectedFormation(form)}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-[#0B1221]/60 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {form}
            </button>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="text-gray-400">
          تم العثور على <span className="font-bold text-white">{filteredManagers.length}</span> مدرب
        </span>
        {savedManagerIds.length > 0 && (
          <span className="text-[11px] text-amber-400 flex items-center gap-1">
            <BookmarkCheck size={13} />
            {savedManagerIds.length} مدرب في المفضلة
          </span>
        )}
      </div>

      {/* Managers Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredManagers.map((manager) => {
          const isSaved = savedManagerIds.includes(manager.id);
          return (
            <motion.div
              key={manager.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <Card className="p-3.5 bg-[#0B1221]/90 border border-white/10 hover:border-blue-500/40 transition-all shadow-md group relative overflow-hidden">
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    {/* In-Game Badge Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 border border-blue-500/30 flex flex-col items-center justify-center shrink-0 shadow-inner group-hover:border-blue-400 transition-colors">
                      <span className="text-xs font-black text-blue-300 font-mono">
                        {manager.playstyleScore}
                      </span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase">
                        RATING
                      </span>
                    </div>

                    <div className="flex flex-col text-right">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white group-hover:text-blue-300 transition-colors">
                          {manager.name}
                        </h3>
                        <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.2 rounded border border-white/5">
                          {manager.inGameName}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 mt-0.5">
                        {manager.clubOrCountry}
                      </span>
                    </div>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleSaveManager(manager.id, manager.name)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isSaved
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                    title="حفظ في المفضلة"
                  >
                    {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </button>
                </div>

                {/* Tags Section: Formation & Playstyle */}
                <div className="flex flex-wrap items-center gap-1.5 my-2">
                  {/* Formation Tag */}
                  <span className="text-[11px] font-black font-mono px-2 py-0.5 rounded-lg bg-white/10 text-white border border-white/15 flex items-center gap-1">
                    <Activity size={12} className="text-amber-400" />
                    {manager.formation}
                  </span>

                  {/* Playstyle Tag */}
                  {getPlaystyleBadge(manager.playstyleCategory, manager.playstyle, manager.playstyleScore)}

                  {/* Booster Tag if available */}
                  {manager.booster && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                      <Sparkles size={11} />
                      {manager.booster}
                    </span>
                  )}
                </div>

                {/* Brief description */}
                <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed text-right mb-3">
                  {manager.description}
                </p>

                {/* Tactical details button */}
                <button
                  onClick={() => setActiveModalManager(manager)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 hover:border-blue-400/60 text-blue-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all group/btn shadow-sm"
                >
                  <TrendingUp size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  <span>عرض التشكيلة والتكتيك الكامل</span>
                </button>
              </Card>
            </motion.div>
          );
        })}

        {filteredManagers.length === 0 && (
          <div className="p-8 rounded-2xl bg-[#0B1221]/50 border border-white/10 flex flex-col items-center justify-center text-center gap-3">
            <HelpCircle size={36} className="text-gray-500" />
            <span className="text-sm font-bold text-gray-300">لا يوجد مدرب يطابق بحثك</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPlaystyle('all');
                setSelectedFormation('الكل');
              }}
              className="text-xs text-blue-400 hover:underline"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* ================= TACTICAL DETAIL MODAL ================= */}
      <AnimatePresence>
        {activeModalManager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#080E1A] border-2 border-blue-500/40 shadow-2xl p-5 flex flex-col gap-4 text-right"
            >
              {/* Modal Top Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <button
                  onClick={() => setActiveModalManager(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 justify-end">
                    <h2 className="text-base font-black text-white">{activeModalManager.name}</h2>
                    <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-lg">
                      {activeModalManager.inGameName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 mt-0.5">{activeModalManager.clubOrCountry}</span>
                </div>
              </div>

              {/* Badges Overview */}
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="text-xs font-black font-mono px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  التشكيلة: {activeModalManager.formation}
                </span>
                <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  الأسلوب: {activeModalManager.playstyle}
                </span>
                <span className="text-xs font-black font-mono px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  الكفاءة: {activeModalManager.playstyleScore}
                </span>
              </div>

              {/* Booster Callout */}
              {activeModalManager.booster && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-blue-950/40 border border-pink-500/40 flex items-center gap-2.5">
                  <Sparkles size={18} className="text-pink-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-pink-300">ميزة البوستر الإضافية:</span>
                    <span className="text-xs font-bold text-white">{activeModalManager.booster}</span>
                  </div>
                </div>
              )}

              {/* Mini Pitch Simulation */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5 justify-end">
                  <span>المحاكاة التكتيكية لتشكيلة {activeModalManager.formation}</span>
                  <Activity size={14} className="text-emerald-400" />
                </span>
                <div className="relative w-full h-44 rounded-2xl bg-gradient-to-b from-emerald-950/50 via-emerald-900/40 to-emerald-950/50 border border-emerald-500/30 overflow-hidden flex flex-col justify-between p-3">
                  {/* Pitch markings */}
                  <div className="absolute inset-0 pointer-events-none opacity-25">
                    <div className="absolute top-0 left-1/4 right-1/4 h-8 border-b-2 border-l-2 border-r-2 border-white" />
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-8 border-t-2 border-l-2 border-r-2 border-white" />
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-white" />
                  </div>

                  {/* Formation Lineups Overlay Text */}
                  <div className="relative z-10 flex flex-col justify-between h-full text-center">
                    {/* Attack line */}
                    <div className="flex items-center justify-around">
                      <span className="text-[10px] font-bold bg-black/60 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full shadow">
                        الهجوم: خطورة وإنهاء
                      </span>
                    </div>
                    {/* Midfield line */}
                    <div className="flex items-center justify-around">
                      <span className="text-[10px] font-bold bg-black/60 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full shadow">
                        الوسط: تدوير وصناعة الفرص
                      </span>
                    </div>
                    {/* Defense line */}
                    <div className="flex items-center justify-around">
                      <span className="text-[10px] font-bold bg-black/60 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow">
                        الدفاع: تأمين الشباك والعمق
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tactical System Breakdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Offensive */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-amber-400">⚡ البناء الهجومي:</span>
                  <span className="text-gray-300 text-[11px] leading-relaxed">
                    {activeModalManager.tactics.offensive}
                  </span>
                </div>

                {/* Defensive */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-blue-400">🛡️ الأسلوب الدفاعي:</span>
                  <span className="text-gray-300 text-[11px] leading-relaxed">
                    {activeModalManager.tactics.defensive}
                  </span>
                </div>

                {/* BuildUp */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-emerald-400">⚽ تدرج الكرة:</span>
                  <span className="text-gray-300 text-[11px] leading-relaxed">
                    {activeModalManager.tactics.buildUp}
                  </span>
                </div>

                {/* Pressing */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-red-400">🔥 أسلوب الضغط:</span>
                  <span className="text-gray-300 text-[11px] leading-relaxed">
                    {activeModalManager.tactics.pressing}
                  </span>
                </div>
              </div>

              {/* Recommended Player Archetypes */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-white">البروفايلات واللاعبين الموصى بهم مع هذا المدرب:</span>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {activeModalManager.recommendedArchetypes.map((arch, index) => (
                    <span
                      key={index}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/25 flex items-center gap-1"
                    >
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      {arch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    toggleSaveManager(activeModalManager.id, activeModalManager.name);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Bookmark size={15} />
                  <span>
                    {savedManagerIds.includes(activeModalManager.id) ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    const shareText = `مدرب eFootball: ${activeModalManager.name} (${activeModalManager.inGameName}) | التشكيلة: ${activeModalManager.formation} | الأسلوب: ${activeModalManager.playstyle}`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(shareText);
                      toast.success('تم نسخ بيانات المدرب وتكتيكه بنجاح!');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 size={15} />
                  <span>نسخ التكتيك</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
