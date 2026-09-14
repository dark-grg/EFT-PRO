import React, { useState, useEffect } from 'react';
import { RefreshCw, ImageOff, ShieldAlert } from 'lucide-react';
import { imageCache } from '../storage/imageCache';

export interface CachedCardImageProps {
  cardId?: string | null;
  cardImageUrl?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  showRarityBorder?: boolean;
  priority?: boolean;
}

/**
 * Central Production-Grade Cached Card Image Component
 * 
 * Rules enforced:
 * 1. Checks Cache first. If found, displays cached image.
 * 2. If not found, fetches from network, displays, and stores in Cache.
 * 3. If offline, serves cached image.
 * 4. If image fails / missing, NEVER displays a random player or fake avatar.
 * 5. Displays: "صورة البطاقة غير متوفرة حالياً" with an [إعادة المحاولة] retry button.
 * 6. Responsive loading skeleton.
 */
export const CachedCardImage: React.FC<CachedCardImageProps> = ({
  cardId,
  cardImageUrl,
  alt = 'eFootball Card',
  className = '',
  containerClassName = '',
  priority = false
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    let isCancelled = false;

    if (!cardImageUrl || cardImageUrl.trim() === '') {
      setIsLoading(false);
      setHasError(true);
      setResolvedSrc(null);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Fetch through imageCache (handles Cache API -> Network -> Fallback)
    imageCache
      .getOrFetchImage(cardImageUrl)
      .then((src) => {
        if (!isCancelled) {
          setResolvedSrc(src);
          setIsLoading(false);
          setHasError(false);
        }
      })
      .catch((_err) => {
        if (!isCancelled) {
          // Direct URL fallback attempt if cache/blob fails in restricted WebViews
          setResolvedSrc(cardImageUrl);
          // Let standard img onError catch it if real network error
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [cardImageUrl, cardId, retryCount]);

  // Case 1: cardId or cardImageUrl is missing
  if (!cardId || !cardImageUrl || cardImageUrl.trim() === '') {
    return (
      <div 
        className={`w-full aspect-[3/4] rounded-2xl bg-gradient-to-b from-[#111625] to-[#080b12] border border-white/10 flex flex-col items-center justify-center p-3 text-center select-none shadow-xl ${containerClassName}`}
        dir="rtl"
      >
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-1 text-gray-500">
          <ImageOff size={20} />
        </div>
        <span className="text-[11px] font-bold text-gray-300">صورة البطاقة غير متوفرة حالياً</span>
        <span className="text-[9px] text-gray-500 mt-0.5">ID: {cardId || 'غير محدد'}</span>
      </div>
    );
  }

  // Case 2: Image failed to load -> Show friendly Arabic error with Retry
  if (hasError) {
    return (
      <div 
        className={`w-full aspect-[3/4] rounded-2xl bg-gradient-to-b from-[#180e14] to-[#0d070b] border border-red-500/30 flex flex-col items-center justify-center p-3 text-center select-none shadow-xl ${containerClassName}`}
        dir="rtl"
      >
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-1 text-red-400">
          <ShieldAlert size={20} />
        </div>
        <span className="text-[11px] font-bold text-red-300">صورة البطاقة غير متوفرة حالياً</span>
        <span className="text-[9px] text-gray-400 mt-0.5 mb-2">تحقق من اتصال الإنترنت</span>
        <button
          type="button"
          onClick={() => {
            setHasError(false);
            setIsLoading(true);
            setRetryCount((prev) => prev + 1);
          }}
          className="px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden flex items-center justify-center bg-[#070b14] select-none ${containerClassName}`}
    >
      {/* Loading Skeleton Placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#0d1322] animate-pulse flex flex-col items-center justify-center gap-2 z-0">
          <div className="w-7 h-7 rounded-full border-2 border-cyan-500/40 border-t-cyan-400 animate-spin" />
          <span className="text-[9px] text-gray-400 font-mono">جاري تحميل البطاقة...</span>
        </div>
      )}

      {/* The Cached eFootball Card Image */}
      {resolvedSrc && (
        <img
          key={`${cardId}-${retryCount}`}
          src={resolvedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          onLoad={() => {
            setIsLoading(false);
            setHasError(false);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`w-full h-full object-contain drop-shadow-2xl transition-all duration-300 ${
            isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          } ${className}`}
        />
      )}
    </div>
  );
};
