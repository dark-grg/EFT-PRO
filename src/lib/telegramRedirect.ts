export const TELEGRAM_CHANNEL_URL = 'https://t.me/P2_B3';

/**
 * Immediately opens the Telegram channel in an external tab/app,
 * and navigates the web application to the Wheel of Fortune (/wheel) page
 * so that when the user returns/switches back to the app, the wheel is open and ready.
 */
export const openTelegramAndWheel = (navigate?: (path: string) => void) => {
  // 1. Immediately launch the Telegram channel URL
  try {
    const openedWindow = window.open(TELEGRAM_CHANNEL_URL, '_blank', 'noopener,noreferrer');
    if (!openedWindow || openedWindow.closed || typeof openedWindow.closed === 'undefined') {
      const anchor = document.createElement('a');
      anchor.href = TELEGRAM_CHANNEL_URL;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  } catch (err) {
    console.warn('Could not launch Telegram URL:', err);
  }

  // 2. Mark verification status in storage so wheel is completely unlocked
  try {
    sessionStorage.setItem('eft_telegram_just_returned', 'true');
    localStorage.setItem('eft_telegram_wheel_verified_user_v4', 'verified_member');
    localStorage.setItem('eft_telegram_wheel_verified_status_v4', 'verified');
  } catch (e) {
    console.warn('Storage unavailable', e);
  }

  // 3. Navigate the app to /wheel route
  if (navigate) {
    navigate('/wheel');
  }
};
