import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, RefreshCw, WifiOff, Globe, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { registerPlugin, Capacitor } from '@capacitor/core';

interface EFootBaseWebViewPlugin {
  open(options: { url: string }): Promise<{ success: boolean }>;
}

const EFootBaseWebView = registerPlugin<EFootBaseWebViewPlugin>('EFootBaseWebView');

export const PlayerDevelopmentsWebView: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Try opening native Android WebView Activity if on Capacitor Native Android
    const openNativeWebView = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await EFootBaseWebView.open({ url: 'https://efootbase.com/ar' });
          // Automatically go back in app history when native activity closes
          navigate(-1);
        } catch (e) {
          console.log('Native plugin open failed, using iframe/web view fallback', e);
          setUseIframeFallback(true);
        }
      } else {
        setUseIframeFallback(true);
      }
    };

    openNativeWebView();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  const handleOpenNative = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await EFootBaseWebView.open({ url: 'https://efootbase.com/ar' });
      } catch (e) {
        setUseIframeFallback(true);
      }
    } else {
      setUseIframeFallback(true);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = 'https://efootbase.com/ar';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050B14] flex flex-col text-white" dir="rtl">
      {/* Top Header */}
      <div className="bg-[#0B1221] border-b border-blue-900/30 px-4 py-3.5 flex items-center justify-between shrink-0 shadow-md z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="p-2 rounded-xl bg-blue-950/40 text-blue-400 hover:bg-blue-900/40 transition border border-blue-500/20 flex items-center justify-center"
            aria-label="رجوع"
          >
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-base font-black text-white tracking-wide">تطويرات اللاعبين</h1>
        </div>
        <div className="flex items-center gap-2">
          {Capacitor.isNativePlatform() && (
            <button
              onClick={handleOpenNative}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Globe className="w-4 h-4" />
              فتح الشاشة الأصلية
            </button>
          )}
          <button
            onClick={handleReload}
            className="p-2 rounded-xl bg-blue-950/40 text-blue-400 hover:bg-blue-900/40 transition border border-blue-500/20"
            title="إعادة تحميل"
            aria-label="إعادة تحميل"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative w-full h-full overflow-hidden bg-[#050B14] flex flex-col">
        {!isOnline ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
              <WifiOff className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="font-bold text-base text-white">لا يوجد اتصال بالإنترنت</h3>
              <p className="text-xs text-gray-400">يتطلب قسم تطويرات اللاعبين اتصالاً بالإنترنت.</p>
            </div>
            <button
              onClick={handleReload}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </button>
          </div>
        ) : useIframeFallback && !Capacitor.isNativePlatform() ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="max-w-md w-full bg-[#0B1221] border border-blue-900/40 p-8 rounded-3xl shadow-2xl space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-inner">
                <Globe className="w-10 h-10 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-black text-white">تطويرات اللاعبين (eFootBase)</h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  هذا القسم مخصص للعمل داخل تطبيق الأندرويد (APK) باستخدام شاشة Android WebView الأصلية بالكامل.
                </p>
              </div>
              <a
                href="https://efootbase.com/ar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 no-underline"
              >
                <ExternalLink className="w-5 h-5" />
                تصفح eFootBase
              </a>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src="https://efootbase.com/ar"
            title="تطويرات اللاعبين - eFootBase"
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>
    </div>
  );
};
