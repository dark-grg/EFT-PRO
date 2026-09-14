import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Scan, 
  Image as ImageIcon, 
  X, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  WifiOff
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FormationScannerService } from '../../services/FormationScannerService';
import { FormationAnalysisService } from '../../services/FormationAnalysisService';
import { FormationAnalysis } from '../../models/FormationAnalysis';
import { ProcessedImageResult } from '../../native/FormationScannerBridge';
import toast from 'react-hot-toast';

interface FormationScannerProps {
  onAnalysisComplete: (analysis: FormationAnalysis, thumbnail?: string) => void;
  onCancel?: () => void;
}

const STAGES = [
  'قراءة الصورة وفحص الجودة...',
  'اكتشاف التشكيلة ونوع اللعبة...',
  'قراءة اللاعبين والمراكز والتقييمات...',
  'تحليل المراكز والمسافات البينية...',
  'فحص التوازن والثغرات الدفاعية...',
  'إنشاء النصائح التكتيكية والتعليمات الفردية...',
  'اكتمل التحليل ✓'
];

export const FormationScanner: React.FC<FormationScannerProps> = ({
  onAnalysisComplete,
  onCancel
}) => {
  const [processedImage, setProcessedImage] = useState<ProcessedImageResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [stageText, setStageText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerService = useRef(new FormationScannerService()).current;
  const analysisService = useRef(new FormationAnalysisService()).current;

  // Handle Photo Picker
  const handlePickPhoto = async () => {
    setErrorMessage(null);
    try {
      const result = await scannerService.selectAndPrepareImage();
      if (result) {
        setProcessedImage(result);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'تعذر اختيار الصورة');
    }
  };

  // Handle File Input directly (e.g. from change event)
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);

    try {
      const result = await scannerService.prepareFile(file);
      setProcessedImage(result);
    } catch (err: any) {
      toast.error(err.message || 'تعذر معالجة الصورة');
    }
  };

  // Start Analysis
  const handleStartAnalysis = async () => {
    if (!processedImage) return;

    if (!navigator.onLine) {
      setErrorMessage('تحليل التشكيلة يحتاج اتصالاً بالإنترنت حالياً.');
      return;
    }

    setIsAnalyzing(true);
    setCurrentStage(1);
    setStageText(STAGES[0]);
    setErrorMessage(null);

    try {
      const analysis = await analysisService.analyzeImage(
        processedImage.base64,
        (stageIndex, stageName) => {
          setCurrentStage(stageIndex);
          setStageText(stageName);
        }
      );

      // Brief delay to display completed stage
      setTimeout(() => {
        setIsAnalyzing(false);
        onAnalysisComplete(analysis, processedImage.base64);
        toast.success('تم تحليل التشكيلة بنجاح!');
      }, 500);
    } catch (err: any) {
      setIsAnalyzing(false);
      const msg = err.message || 'تعذر إجراء التحليل حالياً. حاول مرة أخرى.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleClearImage = () => {
    setProcessedImage(null);
    setErrorMessage(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col gap-4 text-right">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        accept="image/jpeg,image/png,image/webp,image/jpg" 
        className="hidden" 
      />

      {/* Upload / Preview Card */}
      <Card className="p-4 bg-[#0B1221] border-2 border-cyan-500/30 rounded-3xl shadow-xl flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Scan size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">فحص سكرين شوت التشكيلة</span>
              <span className="text-[10px] text-gray-400">تحليل مراكز اللاعبين والأخطاء</span>
            </div>
          </div>

          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full">
            JPG / PNG / WEBP
          </span>
        </div>

        {/* Picker or Image Preview */}
        {!processedImage ? (
          <div 
            onClick={handlePickPhoto}
            className="w-full h-48 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/5 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all p-4 text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <Upload size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-white">
                اضغط لاختيار لقطة شاشة التشكيلة من المعرض
              </span>
              <span className="text-[10px] text-gray-400">
                من شاشة خطة اللعب (Game Plan) داخل اللعبة
              </span>
            </div>
            <span className="text-[10px] font-black text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              فتح معرض الصور (Photo Picker)
            </span>
          </div>
        ) : (
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-black min-h-[180px] flex items-center justify-center">
            <img 
              src={processedImage.base64} 
              alt="معاينة التشكيلة" 
              className={`w-full max-h-60 object-contain filter ${isAnalyzing ? 'brightness-40 blur-[1px]' : 'brightness-95'}`}
            />

            {/* Analysis In-Progress Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 gap-3.5 z-20">
                <div className="w-14 h-14 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                
                <div className="flex flex-col items-center text-center gap-1.5 w-full max-w-xs">
                  <span className="text-xs font-black text-cyan-300">
                    {stageText || 'جاري التحليل...'}
                  </span>
                  
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
                      initial={{ width: '10%' }}
                      animate={{ width: `${Math.min(100, (currentStage / 7) * 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  <span className="text-[10px] text-gray-400 font-mono">
                    المرحلة {currentStage} من 7
                  </span>
                </div>
              </div>
            )}

            {/* Image Specs Tag */}
            {!isAnalyzing && (
              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/15 text-[9px] text-gray-300 font-mono">
                {processedImage.processedWidth}x{processedImage.processedHeight} • {processedImage.fileSizeKB}KB
              </div>
            )}
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-start gap-2 text-right">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-red-200">تعذر التحليل</span>
              <span className="text-[11px] text-gray-300 mt-0.5">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        {processedImage && !isAnalyzing && (
          <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
            <Button
              onClick={handleStartAnalysis}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2"
            >
              <Scan size={16} />
              <span>تحليل التشكيلة</span>
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePickPhoto}
                className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>تغيير الصورة</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearImage}
                className="w-full text-xs font-bold text-gray-400 hover:text-white rounded-xl flex items-center justify-center gap-1.5"
              >
                <X size={13} />
                <span>إلغاء</span>
              </Button>
            </div>
          </div>
        )}

        {/* Cancel button if no image yet */}
        {!processedImage && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="w-full text-xs text-gray-400 hover:text-white mt-1"
          >
            إلغاء
          </Button>
        )}
      </Card>
    </div>
  );
};
