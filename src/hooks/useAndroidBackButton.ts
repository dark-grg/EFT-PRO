import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { toast } from 'react-hot-toast';

/**
 * Modal Close Handler Registry.
 * Components with open modals register their close handler here.
 */
const modalCloseHandlers: Array<() => boolean> = [];

export const registerModalCloseHandler = (handler: () => boolean) => {
  modalCloseHandlers.push(handler);
  return () => {
    const idx = modalCloseHandlers.indexOf(handler);
    if (idx !== -1) modalCloseHandlers.splice(idx, 1);
  };
};

export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPressTimeRef = useRef<number>(0);

  useEffect(() => {
    // 1. Native Capacitor Hardware Back Button handler
    let capListenerHandle: { remove: () => void } | null = null;

    const setupCapacitorBackButton = async () => {
      try {
        const handle = await App.addListener('backButton', ({ canGoBack }) => {
          // A. If any registered modal is open, close it first
          for (let i = modalCloseHandlers.length - 1; i >= 0; i--) {
            const handled = modalCloseHandlers[i]();
            if (handled) {
              return;
            }
          }

          // B. If not on Home page, navigate to previous page
          if (location.pathname !== '/') {
            navigate(-1);
            return;
          }

          // C. On Home page: Double-press back button to exit
          const now = Date.now();
          if (now - lastBackPressTimeRef.current < 2000) {
            App.exitApp();
          } else {
            lastBackPressTimeRef.current = now;
            toast('اضغط مرة أخرى للخروج من التطبيق', {
              icon: '🚪',
              duration: 2000,
              style: {
                background: '#121212',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '13px'
              }
            });
          }
        });
        capListenerHandle = handle;
      } catch {
        // Not in native environment, fallback to standard web events
      }
    };

    setupCapacitorBackButton();

    // 2. Standard Web fallback listener
    const handlePopState = (_e: PopStateEvent) => {
      for (let i = modalCloseHandlers.length - 1; i >= 0; i--) {
        const handled = modalCloseHandlers[i]();
        if (handled) {
          window.history.pushState(null, '', window.location.href);
          return;
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      if (capListenerHandle) {
        capListenerHandle.remove();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, navigate]);
};
