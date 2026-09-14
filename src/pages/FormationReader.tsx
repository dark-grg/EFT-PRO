import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Camera,
  Upload,
  Scan,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { compressImageFile } from '../utils/imageCompression';
import { TacticalPitchBoard } from '../components/formation-scanner/TacticalPitchBoard';
import { formationApi } from '../api/formationApi';

interface VisionAnalysisResponse {
  isFormationScreenshot?: boolean;
  isReliable?: boolean;
  unreliableReason?: string;
  gameName?: string;
  formationName?: string;
  coachName?: string;
  playstyle?: string;
  teamStrength?: string;
  tacticalRating?: number;
  strengths?: string[];
  weaknesses?: string[];
  tacticalAdvice?: string[];
  detectedPlayers?: Array<{
    name: string;
    position: string;
    rating?: number | null;
    isClear?: boolean;
    confidence?: number;
    pitchX?: number;
    pitchY?: number;
  }>;
}

type StepState = 'idle' | 'preview' | 'analyzing' | 'success' | 'error';

const ANALYSIS_STAGES = [
  'جاري قراءة الصورة...',
  'جاري التعرف على مراكز وتمركز اللاعبين...',
  'جاري رسم وتوزيع التشكيلة على الملعب...',
  'جاري التحليل التكتيكي واستخراج الثغرات...'
];

export const FormationReader: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState<StepState>('idle');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageSizeKb, setImageSizeKb] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Analysis progress & result
  const [currentStageText, setCurrentStageText] = useState<string>(ANALYSIS_STAGES[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<VisionAnalysisResponse | null>(null);

  // Refs for file inputs
  const filePickerRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup temporary preview data URL if leaving component
      if (imageDataUrl) {
        setImageDataUrl(null);
        setImageBase64(null);
      }
    };
  }, []);

  // Handle incoming file selection
  const handleProcessFile = async (file: File) => {
    try {
      setErrorMessage(null);
      toast.loading('جاري تجهيز وضغط الصورة...', { id: 'img-compress' });

      const result = await compressImageFile(file);
      toast.dismiss('img-compress');

      setImageDataUrl(result.dataUrl);
      setImageBase64(result.base64);
      setImageSizeKb(result.compressedSizeKb);
      setStep('preview');
      toast.success('تم تحميل الصورة بنجاح');
    } catch (err: any) {
      toast.dismiss('img-compress');
      console.error('File compression error:', err);
      toast.error(err?.message || 'تعذر معالجة ملف الصورة');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // reset input value so re-selecting the same file works
    e.target.value = '';
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Trigger analysis call to backend Vision AI
  const handleStartAnalysis = async () => {
    if (!imageBase64) {
      toast.error('يرجى اختيار صورة أولاً');
      return;
    }

    if (!navigator.onLine) {
      setErrorMessage('تحليل التشكيلة بالذكاء الاصطناعي يحتاج اتصالاً نشطاً بالإنترنت.');
      setStep('error');
      return;
    }

    setStep('analyzing');
    setErrorMessage(null);

    // Stage 1
    setCurrentStageText(ANALYSIS_STAGES[0]);

    // Timed stage progression updates
    const timer1 = setTimeout(() => setCurrentStageText(ANALYSIS_STAGES[1]), 1200);
    const timer2 = setTimeout(() => setCurrentStageText(ANALYSIS_STAGES[2]), 2400);
    const timer3 = setTimeout(() => setCurrentStageText(ANALYSIS_STAGES[3]), 3600);

    try {
      const result = await formationApi.analyzeFormation(imageBase64);

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      // Check reliability per strict rule:
      // إذا الصورة غير واضحة: "لم أتمكن من قراءة التشكيلة بشكل موثوق، يرجى رفع صورة أوضح."
      if (result.isFormationScreenshot === false || result.isReliable === false) {
        const failureReason =
          result.unreliableReason ||
          'لم أتمكن من قراءة التشكيلة بشكل موثوق، يرجى رفع صورة أوضح.';
        setErrorMessage(failureReason);
        setStep('error');
        return;
      }

      setAnalysisData(result as VisionAnalysisResponse);
      setStep('success');
      toast.success('اكتمل تحليل التشكيلة بنجاح!');
    } catch (err: any) {
      console.error('Analysis error:', err);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setErrorMessage(err?.message || 'حدث خطأ أثناء فحص وتحليل الصورة. حاول مرة أخرى.');
      setStep('error');
    }
  };

  // Reset to initial state and delete temporary image
  const handleReset = () => {
    setImageDataUrl(null);
    setImageBase64(null);
    setImageSizeKb(0);
    setAnalysisData(null);
    setErrorMessage(null);
    setStep('idle');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-start py-6 px-4 font-sans select-none" dir="rtl">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={filePickerRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <div className="w-full max-w-md mx-auto flex flex-col gap-5">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-2xl bg-[#111116] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:border-cyan-500/40 transition-colors"
            title="العودة للرئيسية"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Scan size={20} />
            </div>
            <div className="text-right">
              <h1 className="text-base font-black text-white tracking-wide">حلّل تشكيلتك</h1>
              <p className="text-[10px] text-gray-400">فحص ذكي بلقطة الشاشة • Vision AI</p>
            </div>
          </div>

          {/* Reset or info action */}
          {step !== 'idle' ? (
            <button
              onClick={handleReset}
              className="w-10 h-10 rounded-2xl bg-[#111116] border border-white/10 flex items-center justify-center text-gray-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
              title="صورة جديدة"
            >
              <RotateCcw size={18} />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STATE 1: IDLE (UPLOAD / CAPTURE VIEW) */}
        {/* ------------------------------------------------------------- */}
        {step === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col gap-4"
          >
            {/* Box container exactly as specified:
                ┌─────────────────────────┐
                │      📸 حلّل تشكيلتك     │
                │                         │
                │   أرسل صورة تشكيلتك     │
                │                         │
                │   [ اختيار صورة ]        │
                │   [ التقاط صورة ]        │
                └─────────────────────────┘
            */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-3xl p-6 bg-[#0d0d12]/90 border transition-all duration-300 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/20 scale-[1.02]'
                  : 'border-white/10 hover:border-cyan-500/30'
              }`}
            >
              {/* Background ambient glow */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/15 via-blue-600/15 to-purple-600/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner mb-3">
                <Camera size={32} />
              </div>

              <h2 className="text-lg font-black text-white flex items-center gap-1.5">
                📸 حلّل تشكيلتك
              </h2>

              <p className="text-xs text-gray-300 mt-1.5 leading-relaxed max-w-xs">
                أرسل صورة تشكيلتك للبدء
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 mb-6">
                ارفع Screenshot من شاشة التشكيلة (Game Plan) في eFootball / PES
              </p>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => filePickerRef.current?.click()}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Upload size={18} />
                  <span>اختيار صورة</span>
                </button>

                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#16161f] hover:bg-[#1f1f2d] border border-white/10 hover:border-cyan-500/40 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Camera size={18} className="text-cyan-400" />
                  <span>التقاط صورة</span>
                </button>
              </div>

              <div className="mt-5 flex items-center gap-2 text-[10px] text-gray-400">
                <span>يدعم JPG, PNG, WEBP</span>
                <span>•</span>
                <span>ضغط فوري آمن ومحلي</span>
              </div>
            </div>

            {/* Instruction Tip */}
            <div className="p-3.5 rounded-2xl bg-[#0d0d12]/60 border border-white/5 flex items-start gap-3 text-right">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                <Info size={14} />
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                للحصول على أفضل نتيجة، التقط لقطة الشاشة من شاشة خطة اللعب الرئيسية باللعبة بحيث تكون أسماء ومراكز اللاعبين الأساسيين الـ11 واضحة.
              </p>
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 2: PREVIEW UPLOADED IMAGE */}
        {/* ------------------------------------------------------------- */}
        {step === 'preview' && imageDataUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-3xl p-4 bg-[#0d0d12]/90 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-gray-300 px-1">
                <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                  <Scan size={14} />
                  معاينة لقطة الشاشة
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {imageSizeKb > 0 ? `${imageSizeKb} KB` : 'جاهزة'}
                </span>
              </div>

              {/* Preview Image Frame */}
              <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/10 max-h-[360px] flex items-center justify-center group">
                <img
                  src={imageDataUrl}
                  alt="تشكيلة eFootball"
                  className="w-full h-auto max-h-[360px] object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 mt-2">
                <button
                  onClick={handleStartAnalysis}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:opacity-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Sparkles size={18} className="text-yellow-300 animate-pulse" />
                  <span>🔍 بدء التحليل</span>
                </button>

                <button
                  onClick={handleReset}
                  className="w-full py-2.5 px-3 rounded-2xl bg-[#15151e] hover:bg-[#1e1e2c] border border-white/10 text-gray-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>تغيير الصورة / إلغاء</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 3: ANALYZING (PROGRESS) */}
        {/* ------------------------------------------------------------- */}
        {step === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-6 bg-[#0d0d12]/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center gap-5"
          >
            {/* Pulsing Scanning Visual */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-30" />
              <div className="absolute inset-2 rounded-full border-2 border-cyan-400/40 border-t-cyan-400 animate-spin" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
                <Scan size={32} className="animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-black text-cyan-400 font-mono tracking-wide">
                {currentStageText}
              </span>
              <span className="text-[11px] text-gray-400">
                يقوم Vision AI بفحص التشكيلة وقراءة أسماء اللاعبين ومراكزهم...
              </span>
            </div>

            {/* Stages indicators */}
            <div className="w-full flex flex-col gap-2 mt-2">
              {ANALYSIS_STAGES.map((st, idx) => {
                const isCurrent = currentStageText === st;
                const isPast = ANALYSIS_STAGES.indexOf(currentStageText) > idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold'
                        : isPast
                        ? 'text-gray-400 line-through opacity-70'
                        : 'text-gray-400 opacity-40'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isCurrent
                          ? 'bg-cyan-400 animate-pulse'
                          : isPast
                          ? 'bg-green-500'
                          : 'bg-gray-600'
                      }`}
                    />
                    <span className="text-[11px]">{st}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 4: ERROR / UNRELIABLE */}
        {/* ------------------------------------------------------------- */}
        {step === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-6 bg-[#0d0d12]/90 border border-red-500/30 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle size={30} />
            </div>

            <div className="flex flex-col gap-1.5 max-w-xs">
              <h3 className="text-base font-black text-white">تعذر إكمال التحليل</h3>
              <p className="text-xs text-red-300 leading-relaxed">
                {errorMessage || 'لم أتمكن من قراءة التشكيلة بشكل موثوق، يرجى رفع صورة أوضح.'}
              </p>
            </div>

            <div className="w-full flex flex-col gap-2 mt-2">
              <button
                onClick={handleReset}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>رفع صورة أخرى أوضح</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 5: SUCCESS - ANALYSIS RESULT */}
        {/* ------------------------------------------------------------- */}
        {step === 'success' && analysisData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5"
          >
            {/* 1. Main Header Card */}
            <div className="rounded-3xl p-5 bg-[#0d0d12]/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <h2 className="text-lg font-black text-white">تحليل تشكيلتك</h2>
                </div>
                {analysisData.formationName && (
                  <span className="px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono font-black text-xs">
                    {analysisData.formationName}
                  </span>
                )}
              </div>

              {/* Formation & Rating Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Formation Box */}
                <div className="p-3.5 rounded-2xl bg-[#14141d] border border-white/5 flex flex-col justify-between">
                  <span className="text-[11px] text-gray-400">التشكيلة</span>
                  <span className="text-xl font-black text-white font-mono mt-1">
                    {analysisData.formationName || 'غير محددة'}
                  </span>
                  {analysisData.playstyle && (
                    <span className="text-[10px] text-cyan-400 mt-1 truncate">
                      {analysisData.playstyle}
                    </span>
                  )}
                </div>

                {/* Rating Box */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-purple-950/40 border border-cyan-500/30 flex flex-col justify-between">
                  <span className="text-[11px] text-gray-300 flex items-center gap-1">
                    ⭐ التقييم
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-cyan-300 font-mono">
                      {analysisData.tacticalRating ?? 85}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">/100</span>
                  </div>
                  {analysisData.teamStrength && (
                    <span className="text-[10px] text-gray-400 mt-1">
                      قوة الفريق: <span className="font-mono text-white">{analysisData.teamStrength}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Coach & Playstyle banner if available */}
              {(analysisData.coachName || analysisData.playstyle) && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#14141d] border border-white/5 text-[11px]">
                  {analysisData.coachName && (
                    <span className="text-gray-300">
                      المدرب: <strong className="text-white">{analysisData.coachName}</strong>
                    </span>
                  )}
                  {analysisData.playstyle && (
                    <span className="text-cyan-400 font-medium">
                      {analysisData.playstyle}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 2. Tactical Pitch Board - رسم الخطة على الملعب */}
            <div className="rounded-3xl p-5 bg-[#0d0d12]/90 border border-emerald-500/30 backdrop-blur-xl shadow-2xl">
              <TacticalPitchBoard
                formationName={analysisData.formationName}
                playstyle={analysisData.playstyle}
                coachName={analysisData.coachName}
                players={analysisData.detectedPlayers || []}
                tacticalRating={analysisData.tacticalRating}
              />
            </div>

            {/* 3. Strengths (نقاط القوة) */}
            {analysisData.strengths && analysisData.strengths.length > 0 && (
              <div className="rounded-3xl p-5 bg-[#0d0d12]/90 border border-green-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-green-400 font-black text-sm">
                  <span>🟢</span>
                  <h3>نقاط القوة</h3>
                </div>
                <ul className="flex flex-col gap-2">
                  {analysisData.strengths.map((s, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-gray-200 leading-relaxed bg-[#14141d]/70 p-2.5 rounded-xl border border-white/5"
                    >
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 4. Weaknesses (نقاط الضعف) */}
            {analysisData.weaknesses && analysisData.weaknesses.length > 0 && (
              <div className="rounded-3xl p-5 bg-[#0d0d12]/90 border border-red-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-red-400 font-black text-sm">
                  <span>🔴</span>
                  <h3>نقاط الضعف</h3>
                </div>
                <ul className="flex flex-col gap-2">
                  {analysisData.weaknesses.map((w, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-gray-200 leading-relaxed bg-[#14141d]/70 p-2.5 rounded-xl border border-white/5"
                    >
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. Tips / Advice (نصائح تكتيكية) */}
            {analysisData.tacticalAdvice && analysisData.tacticalAdvice.length > 0 && (
              <div className="rounded-3xl p-5 bg-[#0d0d12]/90 border border-yellow-500/20 backdrop-blur-xl shadow-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-yellow-400 font-black text-sm">
                  <span>💡</span>
                  <h3>نصائح تكتيكية</h3>
                </div>
                <ul className="flex flex-col gap-2">
                  {analysisData.tacticalAdvice.map((adv, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-gray-200 leading-relaxed bg-[#14141d]/70 p-2.5 rounded-xl border border-white/5"
                    >
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bottom Reset Button */}
            <button
              onClick={handleReset}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#14141d] hover:bg-[#1a1a26] border border-white/10 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-lg mt-2"
            >
              <RotateCcw size={16} className="text-cyan-400" />
              <span>📸 تحليل تشكيلة أخرى</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
