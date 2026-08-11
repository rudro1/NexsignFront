// src/components/layout/Navbar.jsx
import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Moon, Sun, Menu, X, LogOut,
  LayoutDashboard, ShieldCheck, LayoutTemplate,
  ChevronDown, FileSignature, Settings, User,
  Bell, FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

// ─── cn helper ────────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(' ');

// ─── Get initials ─────────────────────────────────────────────────
const getInitials = (name) =>
  (name || '?')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// ════════════════════════════════════════════════════════════════
// LOGO
// ════════════════════════════════════════════════════════════════
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
      <div className={cn(
        'w-9 h-9 bg-gradient-to-br from-sky-400 to-sky-600',
        'rounded-xl flex items-center justify-center',
        'shadow-md shadow-sky-500/30',
        'group-hover:shadow-sky-500/50 group-hover:scale-105',
        'transition-all duration-200',
      )}>
        <FileSignature size={17} className="text-white" />
      </div>
      <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
        NeX<span className="text-sky-500">sign</span>
      </span>
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════
// DARK MODE TOGGLE
// ════════════════════════════════════════════════════════════════
function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark',
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(d => !d)}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative w-9 h-9 rounded-xl flex items-center justify-center',
        'text-slate-500 dark:text-slate-400',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        'transition-all duration-200',
      )}
    >
      <Sun
        size={16}
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'opacity-100 rotate-0 text-amber-400' : 'opacity-0 rotate-90',
        )}
      />
      <Moon
        size={16}
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0',
        )}
      />
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// USER DROPDOWN MENU
// ════════════════════════════════════════════════════════════════
function UserMenu({ user, onLogout, isAdmin }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  // Outside click
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // ESC close
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  const initials = getInitials(user?.full_name || user?.name);

  const MENU_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard',   to: isAdmin ? '/admin'     : '/dashboard' },
    { icon: FileText,        label: 'Documents',   to: '/dashboard',  hide: isAdmin },
    { icon: LayoutTemplate,  label: 'Templates',   to: '/templates',  hide: isAdmin },
    { icon: Settings,        label: 'Settings',    to: '/settings'   },
  ].filter(i => !i.hide);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-xl',
          'hover:bg-slate-100 dark:hover:bg-slate-800',
          'transition-colors duration-150',
          open && 'bg-slate-100 dark:bg-slate-800',
        )}
      >
        {/* Avatar */}
        <div className="relative">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            'bg-gradient-to-br from-sky-400 to-sky-600',
            'text-white text-xs font-black shrink-0 shadow-sm',
          )}>
            {initials}
          </div>
          {/* Online dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
        </div>

        <span className="hidden sm:block text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-[90px] truncate">
          {(user?.full_name || user?.name)?.split(' ')[0]}
        </span>

        <ChevronDown
          size={14}
          className={cn(
            'text-slate-400 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className={cn(
          'absolute right-0 top-full mt-2 w-56 z-50',
          'bg-white dark:bg-slate-900',
          'border border-slate-200 dark:border-slate-700',
          'rounded-2xl shadow-2xl shadow-slate-200/60 dark:shadow-slate-900/60',
          'overflow-hidden',
          'animate-in fade-in zoom-in-95 duration-150',
        )}>

          {/* User info header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-sky-50 to-violet-50/50 dark:from-sky-900/20 dark:to-violet-900/10 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-black shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate leading-tight">
                  {user?.full_name || user?.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate leading-tight">
                  {user?.email}
                </p>
              </div>
            </div>
            {/* Role badge */}
            {isAdmin && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-black rounded-full uppercase tracking-wider">
                  <ShieldCheck size={9} /> Admin
                </span>
              </div>
            )}
          </div>

          {/* Nav links */}
          <div className="py-1.5">
            {MENU_ITEMS.map(({ icon: Icon, label, to }) => (
              <Link
                key={to + label}
                to={to}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5',
                  'text-sm font-medium text-slate-700 dark:text-slate-300',
                  'hover:bg-slate-50 dark:hover:bg-slate-800',
                  'transition-colors',
                )}
              >
                <Icon size={15} className="text-slate-400" />
                {label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 dark:border-slate-800 py-1.5">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5',
                'text-sm font-medium text-red-500',
                'hover:bg-red-50 dark:hover:bg-red-900/20',
                'transition-colors',
              )}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// NAV LINK  (desktop)
// ════════════════════════════════════════════════════════════════
function NavLink({ to, onClick, children, active, variant = 'default', icon: Icon }) {
  const base = 'relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150';

  const variants = {
    default: cn(
      base,
      active
        ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800',
    ),
    admin: cn(
      base,
      active
        ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'
        : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20',
    ),
  };

  const cls = variants[variant] || variants.default;

  if (to) {
    return (
      <Link to={to} className={cls}>
        {Icon && <Icon size={15} />}
        {children}
        {active && (
          <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-sky-500 rounded-full" />
        )}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// MOBILE NAV LINK
// ════════════════════════════════════════════════════════════════
function MobileNavLink({ to, onClick, children, active, icon: Icon, variant = 'default' }) {
  const base = cn(
    'w-full flex items-center gap-3 px-4 py-3',
    'text-sm font-semibold rounded-xl transition-colors',
    variant === 'admin'
      ? cn(
          'text-rose-600',
          active ? 'bg-rose-50 dark:bg-rose-900/20' : 'hover:bg-rose-50 dark:hover:bg-rose-900/20',
        )
      : cn(
          active
            ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
        ),
  );

  if (to) {
    return (
      <Link to={to} className={base} onClick={onClick}>
        {Icon && <Icon size={16} className="flex-shrink-0" />}
        {children}
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cn(base, 'text-left')}>
      {Icon && <Icon size={16} className="flex-shrink-0" />}
      {children}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN NAVBAR
// ════════════════════════════════════════════════════════════════
export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  // ── Active path check ──────────────────────────────────────
  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  // ── Scroll shadow ──────────────────────────────────────────
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // ── Close mobile on route change ───────────────────────────
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // ── Body scroll lock + ESC ─────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // ── Handle scroll-to on navigation state ──────────────────
  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        document.getElementById(location.state.scrollTo)
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.state]);

  const scrollToSection = useCallback((id) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.pathname, navigate]);

  const handleLogout = useCallback(async () => {
    setMobileOpen(false);
    await logout({ redirect: false, showToast: true });
    navigate('/', { replace: true });
  }, [logout, navigate]);

  // ── Public nav links ───────────────────────────────────────
  const PUBLIC_LINKS = [
    { label: 'Features',     action: () => scrollToSection('features')     },
    { label: 'How It Works', action: () => scrollToSection('how-it-works') },
    { label: 'Pricing',      to: '/pricing' },
  ];

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'transition-all duration-300',
        scrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50 border-b border-slate-200/80 dark:border-slate-800/80'
          : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800',
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Logo />

            {/* ── Desktop nav ─────────────────────────────── */}
            <div className="hidden md:flex items-center gap-0.5">
              {/* Public links */}
              {PUBLIC_LINKS.map(l => (
                <NavLink
                  key={l.label}
                  to={l.to}
                  onClick={l.action}
                  active={l.to ? isActive(l.to) : false}
                >
                  {l.label}
                </NavLink>
              ))}

              {/* Authenticated links */}
              {isAuthenticated && (
                <>
                  <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

                  {isAdmin ? (
                    <NavLink
                      to="/admin"
                      active={isActive('/admin')}
                      icon={ShieldCheck}
                      variant="admin"
                    >
                      Admin
                    </NavLink>
                  ) : (
                    <>
                      <NavLink to="/dashboard" active={isActive('/dashboard')} icon={LayoutDashboard}>
                        Dashboard
                      </NavLink>
                      <NavLink to="/templates" active={isActive('/templates')} icon={LayoutTemplate}>
                        Templates
                      </NavLink>
                    </>
                  )}
                </>
              )}
            </div>

            {/* ── Right side ──────────────────────────────── */}
            <div className="flex items-center gap-1.5 shrink-0">

              <ThemeToggle />

              {!isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login">
                    <button className="px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="px-5 py-2 text-sm font-bold bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-500/25 transition-all active:scale-[0.97]">
                      Get Started
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="hidden md:block">
                  <UserMenu
                    user={user}
                    onLogout={handleLogout}
                    isAdmin={isAdmin}
                  />
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className={cn(
                  'md:hidden w-9 h-9 rounded-xl',
                  'flex items-center justify-center',
                  'text-slate-500 transition-colors',
                  mobileOpen
                    ? 'bg-slate-100 dark:bg-slate-800'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                )}
              >
                <div className="relative w-5 h-5">
                  <Menu
                    size={20}
                    className={cn(
                      'absolute inset-0 transition-all duration-200',
                      mobileOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0',
                    )}
                  />
                  <X
                    size={20}
                    className={cn(
                      'absolute inset-0 transition-all duration-200',
                      mobileOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90',
                    )}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ─────────────────────────────────── */}
        <div className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          'border-t border-slate-200 dark:border-slate-800',
          'bg-white dark:bg-slate-900',
          mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
        )}>
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">

            {/* Public nav */}
            {PUBLIC_LINKS.map(l => (
              <MobileNavLink
                key={l.label}
                to={l.to}
                onClick={l.action || (() => setMobileOpen(false))}
                active={l.to ? isActive(l.to) : false}
              >
                {l.label}
              </MobileNavLink>
            ))}

            {/* Authenticated mobile links */}
            {isAuthenticated && (
              <>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                {isAdmin ? (
                  <MobileNavLink
                    to="/admin"
                    active={isActive('/admin')}
                    icon={ShieldCheck}
                    variant="admin"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin Panel
                  </MobileNavLink>
                ) : (
                  <>
                    <MobileNavLink to="/dashboard" active={isActive('/dashboard')} icon={LayoutDashboard} onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </MobileNavLink>
                    <MobileNavLink to="/templates"  active={isActive('/templates')}  icon={LayoutTemplate}  onClick={() => setMobileOpen(false)}>
                      Templates
                    </MobileNavLink>
                  </>
                )}
              </>
            )}

            {/* Auth section */}
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <button className="w-full py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <button className="w-full py-2.5 text-sm font-bold rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 transition-all active:scale-[0.97]">
                    Get Started
                  </button>
                </Link>
              </div>
            ) : (
              <div className="pb-2 space-y-1">
                {/* Profile card */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-black shrink-0">
                    {getInitials(user?.full_name || user?.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {user?.full_name || user?.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  {isAdmin && (
                    <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-black rounded-full uppercase">
                      Admin
                    </span>
                  )}
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}