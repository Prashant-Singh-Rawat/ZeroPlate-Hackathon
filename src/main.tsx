import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ─── Apply saved theme SYNCHRONOUSLY before first paint ─────────────────────
// This prevents FOUC (flash of unstyled content) and ensures the
// correct dark/light class is on <html> before React renders anything.
(function applyInitialTheme() {
  try {
    const saved = localStorage.getItem('zeroplate_theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Default to light — also clear any stale 'dark' class
      document.documentElement.classList.remove('dark');
      if (!saved) {
        localStorage.setItem('zeroplate_theme', 'light');
      }
    }
  } catch (e) {
    document.documentElement.classList.remove('dark');
  }
})();
// ─────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
