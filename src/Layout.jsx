// src/Layout.jsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { useTheme } from '@/App';

// ─── Route config ──────────────────────────────────────────────
// Navbar hidden routes
const NO_NAVBAR_PATTERNS = [
  /^\/sign\//,
  /^\/template-sign\//,
  /^\/login$/,
  /^\/register$/,
  /^\/$/, // Landing has own Navbar
  /^\/pricing$/, // Pricing has own Navbar
];

// Full-width (no max-w, no padding) routes
const FULL_WIDTH_PATTERNS = [
  /^\/sign\//,
  /^\/template-sign\//,
  /^\/document-editor/,
  /^\/editor\//,
  /^\/documents\//,
  /^\/templates\//,
];

// No vertical padding routes
const NO_PADDING_PATTERNS = [
  /^\/document-editor/,
  /^\/editor\//,
  /^\/documents\//,
];

const matchesAny = (path, patterns) =>
  patterns.some(p => p.test(path));

// ════════════════════════════════════════════════════════════════
// LAYOUT
// ════════════════════════════════════════════════════════════════
export default function Layout({ children }) {
  const { pathname } = useLocation();
  const { theme }    = useTheme();

  const showNavbar   = !matchesAny(pathname, NO_NAVBAR_PATTERNS);
  const isFullWidth  =  matchesAny(pathname, FULL_WIDTH_PATTERNS);
  const noPadding    =  matchesAny(pathname, NO_PADDING_PATTERNS);

  // Sync theme class (safety net)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">

      {/* Navbar — already includes h-16 spacer internally */}
      {showNavbar && <Navbar />}

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {isFullWidth ? (
          // Full-width — editor / signer / detail pages
          <div className="flex-1 flex flex-col w-full h-full">
            {children}
          </div>
        ) : (
          // Constrained — dashboard / templates / audit
          <div className={cn(
            'flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
            noPadding ? '' : 'py-8',
          )}>
            {children}
          </div>
        )}
      </main>

    </div>
  );
}

// ─── cn helper ───────────────────────────────────────────────────
function cn(...c) { return c.filter(Boolean).join(' '); }