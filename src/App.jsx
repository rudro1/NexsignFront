// src/App.jsx
import React, {
  createContext, useContext, useEffect,
  useState, useCallback, Suspense, lazy,
} from 'react';
import {
  BrowserRouter as Router,
  Route, Routes, Navigate,
  useLocation,
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { Toaster } from 'sonner';
import { FileSignature } from 'lucide-react';
import Layout from '@/Layout';

const cn = (...c) => c.filter(Boolean).join(' ');

// ════════════════════════════════════════════════════════════════
// LAZY IMPORTS
// ════════════════════════════════════════════════════════════════
const Landing        = lazy(() => import('@/pages/Landing'));
const Pricing        = lazy(() => import('@/pages/Pricing'));
const Auth           = lazy(() => import('@/pages/Auth'));
const Dashboard      = lazy(() => import('@/pages/Dashboard'));
const DocumentEditor = lazy(() => import('@/pages/DocumentEditor'));
const DocumentDetail = lazy(() => import('@/pages/DocumentDetail'));
const SignerView      = lazy(() => import('@/pages/SignerView'));
const Templates      = lazy(() => import('@/pages/Templates'));
const NewTemplate    = lazy(() => import('@/pages/NewTemplate'));
const TemplateDetail = lazy(() => import('@/pages/TemplateDetail'));
const TemplateSigner = lazy(() => import('@/pages/TemplateSigner'));
const Audit          = lazy(() => import('@/pages/Audit'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const PageNotFound   = lazy(() => import('@/lib/PageNotFound'));

// ════════════════════════════════════════════════════════════════
// THEME CONTEXT
// ════════════════════════════════════════════════════════════════
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (document.documentElement.classList.contains('dark')) return 'dark';
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme(p => (p === 'light' ? 'dark' : 'light')),
    [],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ════════════════════════════════════════════════════════════════
// SCROLL TO TOP
// ════════════════════════════════════════════════════════════════
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// ════════════════════════════════════════════════════════════════
// LOADING SCREENS
// ════════════════════════════════════════════════════════════════
function AppLoader() {
  return (
    <div className="h-screen flex flex-col items-center 
                    justify-center gap-5 
                    bg-white dark:bg-slate-950">
      <div className="flex items-center gap-2.5 mb-2">
        <div className={cn(
          'w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600',
          'rounded-xl flex items-center justify-center',
          'shadow-lg shadow-sky-500/30',
        )}>
          <FileSignature size={20} className="text-white" />
        </div>
        <span className="font-extrabold text-2xl text-slate-900 
                         dark:text-white tracking-tight">
          NeX<span className="text-sky-500">sign</span>
        </span>
      </div>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 
                        border-slate-200 dark:border-slate-800" />
        <div className="absolute inset-0 rounded-full border-4 
                        border-t-sky-500 animate-spin" />
      </div>
      <p className="text-sm text-slate-400 font-medium animate-pulse">
        Loading…
      </p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center 
                    bg-white dark:bg-slate-950">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-4 
                        border-slate-200 dark:border-slate-800" />
        <div className="absolute inset-0 rounded-full border-4 
                        border-t-sky-500 animate-spin" />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PROTECTED ROUTE
// ════════════════════════════════════════════════════════════════
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  if (adminOnly) {
    const isAdmin =
      user.role === 'admin' || user.role === 'super_admin';
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading)         return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

// ════════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════════
function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <AppLoader />;

  return (
    <Layout>
      <ScrollToTop />
      <Routes>

        {/* ── Public ──────────────────────────────────────── */}
        <Route path="/"        element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* ── Auth (guest only) ────────────────────────────── */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Auth initialMode="login" />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Auth initialMode="register" />
            </GuestRoute>
          }
        />

        {/* ── Public signing ───────────────────────────────── */}
        <Route path="/sign/:token"
               element={<SignerView />} />
        <Route path="/template-sign/:token"
               element={<TemplateSigner />} />

        {/* ── Protected: Dashboard ─────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Documents ─────────────────────────── */}
        {/*
          CRITICAL: /documents/new BEFORE /documents/:id
        */}
        <Route
          path="/documents/new"
          element={
            <ProtectedRoute>
              <DocumentEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/document-editor"
          element={
            <ProtectedRoute>
              <DocumentEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/DocumentEditor"
          element={<Navigate to="/document-editor" replace />}
        />
        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <DocumentEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
              <DocumentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/:id"
          element={
            <ProtectedRoute>
              <DocumentDetail />
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Templates ─────────────────────────── */}
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <Templates />
            </ProtectedRoute>
          }
        />
        {/*
          CRITICAL: /templates/new BEFORE /templates/:id
        */}
        <Route
          path="/templates/new"
          element={
            <ProtectedRoute>
              <NewTemplate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-template"
          element={<Navigate to="/templates/new" replace />}
        />
        <Route
          path="/templates/:id"
          element={
            <ProtectedRoute>
              <TemplateDetail />
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Audit ─────────────────────────────── */}
        <Route
          path="/audit/:id"
          element={
            <ProtectedRoute>
              <Audit />
            </ProtectedRoute>
          }
        />

        {/* ── Admin only ───────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── 404 ─────────────────────────────────────────── */}
        <Route path="*" element={<PageNotFound />} />

      </Routes>
    </Layout>
  );
}

// ════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Toaster
                position="top-right"
                richColors
                expand={false}
                toastOptions={{
                  duration: 3500,
                  style: { zIndex: 9999 },
                  classNames: {
                    toast: 'rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl',
                    title: 'font-bold text-sm',
                    description: 'text-xs text-slate-500',
                  },
                }}
              />
              <AppRoutes />
            </Suspense>
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}