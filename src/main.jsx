// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from '@/App.jsx';
import '@/index.css';

// ── Dev: performance mark ─────────────────────────────────────
if (import.meta.env.DEV) {
  performance.mark('nexsign-init');
}

// ── Root-level Error Boundary ─────────────────────────────────
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[NexSign] Root error:', error, info);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950 p-8 text-center">
          {/* Logo */}
          <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.232 5.232l3.536 3.536M9 11l6.5-6.5a2.121 2.121 0 013 3L12 14H9v-3z" />
            </svg>
          </div>

          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            NexSign ran into an unexpected error. Please refresh the page to continue.
          </p>

          {/* Error detail (dev only) */}
          {import.meta.env.DEV && (
            <pre className="mt-2 text-left text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl max-w-lg w-full overflow-auto max-h-40">
              {this.state.error?.toString()}
            </pre>
          )}

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-sky-500/25 mt-2"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Mount ─────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </RootErrorBoundary>
  </React.StrictMode>,
);

// ── Dev: log load time ────────────────────────────────────────
if (import.meta.env.DEV) {
  performance.mark('nexsign-mounted');
  performance.measure('nexsign-boot', 'nexsign-init', 'nexsign-mounted');
  const [entry] = performance.getEntriesByName('nexsign-boot');
  console.log(`%c⚡ NexSign booted in ${entry?.duration?.toFixed(1)}ms`, 'color:#0ea5e9;font-weight:bold');
}