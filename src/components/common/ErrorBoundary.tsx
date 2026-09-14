import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-6 text-center select-none"
          dir="rtl"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <AlertTriangle size={32} />
          </div>

          <h2 className="text-xl font-black mb-2">حدث خطأ غير متوقع</h2>
          <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
            واجه التطبيق مشكلة تقنية مؤقتة. تم حفظ بياناتك المحلية بأمان، يمكنك إعادة تحميل الصفحة للمتابعة.
          </p>

          <button
            onClick={this.handleReload}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw size={16} />
            <span>إعادة المحاولة والتشغيل</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
