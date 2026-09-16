import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const showError = (message, stack) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="color:red; padding:20px; font-family:monospace; background:black; height:100vh;">
      <h3>CRASH!</h3>
      <p>${message}</p>
      <pre>${stack}</pre>
    </div>`;
  }
};

window.addEventListener('error', (e) => {
  showError(e.message, e.error?.stack);
});
window.addEventListener('unhandledrejection', (e) => {
  showError(e.reason?.message || e.reason, e.reason?.stack);
});

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (e) {
  showError(e.message, e.stack);
}
