// src/pages/Landing.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  FileSignature, Zap, Shield, Users, CheckCircle,
  ArrowRight, Star, Globe, Lock, Clock, ChevronDown,
  FileText, Send, Award, BarChart3, Menu, X,
  Sparkles, TrendingUp, Bell, MousePointer2,
} from 'lucide-react';

// ─── cn helper ───────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(' ');

// ════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════
const FEATURES = [
  {
    icon: Zap, color: 'sky',
    title: 'Lightning Fast',
    desc: 'Send documents for signature in seconds. No printing, scanning, or faxing required.',
  },
  {
    icon: Shield, color: 'violet',
    title: 'Bank-Level Security',
    desc: 'AES-256 encryption, tamper-proof audit trails, and compliance with global e-sign laws.',
  },
  {
    icon: Users, color: 'emerald',
    title: 'Multi-Party Signing',
    desc: 'Add multiple signers in any order. Automated reminders keep everyone on track.',
  },
  {
    icon: Globe, color: 'amber',
    title: 'Sign Anywhere',
    desc: 'Works on any device — desktop, tablet, or mobile. No app download required.',
  },
  {
    icon: FileText, color: 'rose',
    title: 'Smart Templates',
    desc: 'Create reusable document templates. Send to hundreds of signers with one click.',
  },
  {
    icon: BarChart3, color: 'indigo',
    title: 'Real-time Tracking',
    desc: 'See exactly when documents are opened, signed, and completed with live updates.',
  },
];

const STEPS = [
  {
    step: '01', icon: FileText, color: 'sky',
    title: 'Upload Document',
    desc: 'Upload any PDF. Drag & drop signature fields exactly where you need them.',
  },
  {
    step: '02', icon: Send, color: 'violet',
    title: 'Send for Signature',
    desc: 'Add signers by email. They receive a secure signing link instantly.',
  },
  {
    step: '03', icon: CheckCircle, color: 'emerald',
    title: 'Signed & Done',
    desc: 'Get notified the moment it\'s signed. Download the completed PDF with full audit trail.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Johnson', role: 'HR Director, TechCorp',
    avatar: 'SJ', color: 'sky', rating: 5,
    text: 'NeXsign reduced our contract turnaround from days to minutes. Absolutely game-changing for our HR team.',
  },
  {
    name: 'Ahmed Hassan', role: 'Legal Counsel, LawFirm Pro',
    avatar: 'AH', color: 'violet', rating: 5,
    text: 'The audit trail feature is exceptional. Every signature is legally compliant and fully traceable.',
  },
  {
    name: 'Emily Chen', role: 'Operations Lead, StartupXYZ',
    avatar: 'EC', color: 'emerald', rating: 5,
    text: 'We send 500+ contracts monthly using bulk send. NeXsign handles it flawlessly every time.',
  },
];

const STATS = [
  { value: 50000, display: '50K+',  label: 'Documents Signed',   icon: FileSignature, color: 'sky'     },
  { value: 99.9,  display: '99.9%', label: 'Uptime Guaranteed',  icon: Zap,           color: 'emerald' },
  { value: 150,   display: '150+',  label: 'Countries Supported', icon: Globe,         color: 'violet'  },
  { value: 4.9,   display: '4.9★',  label: 'Average Rating',     icon: Star,          color: 'amber'   },
];

// ─── Color tokens ────────────────────────────────────────────────
const C = {
  sky:     { light: 'bg-sky-50',     icon: 'text-sky-500',     glow: 'shadow-sky-500/20',     border: 'border-sky-200',     dark: 'dark:bg-sky-900/20',     pill: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'     },
  violet:  { light: 'bg-violet-50',  icon: 'text-violet-500',  glow: 'shadow-violet-500/20',  border: 'border-violet-200',  dark: 'dark:bg-violet-900/20',  pill: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'  },
  emerald: { light: 'bg-emerald-50', icon: 'text-emerald-500', glow: 'shadow-emerald-500/20', border: 'border-emerald-200', dark: 'dark:bg-emerald-900/20', pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  amber:   { light: 'bg-amber-50',   icon: 'text-amber-500',   glow: 'shadow-amber-500/20',   border: 'border-amber-200',   dark: 'dark:bg-amber-900/20',   pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'   },
  rose:    { light: 'bg-rose-50',    icon: 'text-rose-500',    glow: 'shadow-rose-500/20',    border: 'border-rose-200',    dark: 'dark:bg-rose-900/20',    pill: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'    },
  indigo:  { light: 'bg-indigo-50',  icon: 'text-indigo-500',  glow: 'shadow-indigo-500/20',  border: 'border-indigo-200',  dark: 'dark:bg-indigo-900/20',  pill: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'  },
};

// ════════════════════════════════════════════════════════════════
// REUSABLE PRIMITIVES
// ════════════════════════════════════════════════════════════════

const Btn = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-150 active:scale-[0.97] select-none cursor-pointer';
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
    xl: 'px-10 py-4 text-lg',
  };
  const variants = {
    primary: 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white shadow-lg shadow-sky-500/25',
    outline: 'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800',
    ghost:   'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    white:   'bg-white hover:bg-slate-50 text-sky-600 font-bold shadow-xl',
    'white-outline': 'border-2 border-white/40 text-white hover:bg-white/10',
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

// Section label pill
const SectionLabel = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 text-[11px] font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 mb-4">
    <Sparkles size={10} />
    {children}
  </span>
);

// Section heading
const SectionHeading = ({ children, sub }) => (
  <div className="text-center mb-16">
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
      {children}
    </h2>
    {sub && (
      <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
        {sub}
      </p>
    )}
  </div>
);

// ════════════════════════════════════════════════════════════════
// NAVBAR
// ════════════════════════════════════════════════════════════════
function Navbar() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const NAV_LINKS = [
    { label: 'Features',     id: 'features'      },
    { label: 'How It Works', id: 'how-it-works'  },
    { label: 'Testimonials', id: 'testimonials'  },
    { label: 'Pricing',      href: '/pricing'     },
  ];

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50 border-b border-slate-200/80 dark:border-slate-800/80'
          : 'bg-transparent',
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:shadow-sky-500/50 transition-shadow">
                <FileSignature className="w-4.5 h-4.5 text-white" size={18} />
              </div>
              <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
                NeX<span className="text-sky-500">sign</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map(l => (
                l.href
                  ? <Link key={l.href} to={l.href} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                      {l.label}
                    </Link>
                  : <button key={l.id} onClick={() => scrollTo(l.id)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                      {l.label}
                    </button>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-2.5">
              {user ? (
                <Btn onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')} size="md">
                  Go to Dashboard <ArrowRight size={15} />
                </Btn>
              ) : (
                <>
                  <Link to="/login">
                    <Btn variant="ghost" size="md">Sign In</Btn>
                  </Link>
                  <Link to="/register">
                    <Btn size="md">
                      Get Started Free
                    </Btn>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile menu drawer */}
      <div className={cn(
        'fixed top-16 left-0 right-0 z-40 md:hidden transition-all duration-300',
        menuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-4 opacity-0 pointer-events-none',
      )}>
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl px-4 py-4">
          <nav className="space-y-1 mb-4">
            {NAV_LINKS.map(l => (
              l.href
                ? <Link key={l.href} to={l.href} onClick={() => setMenuOpen(false)} className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    {l.label}
                  </Link>
                : <button key={l.id} onClick={() => scrollTo(l.id)} className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    {l.label}
                  </button>
            ))}
          </nav>
          <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            {user ? (
              <Btn onClick={() => { setMenuOpen(false); navigate(isAdmin ? '/admin' : '/dashboard'); }} size="md" className="w-full">
                Go to Dashboard <ArrowRight size={15} />
              </Btn>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <Btn variant="outline" size="md" className="w-full">Sign In</Btn>
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  <Btn size="md" className="w-full">Get Started Free</Btn>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════════════
function HeroSection() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">

      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/80 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'linear-gradient(#0ea5e9 1px,transparent 1px),linear-gradient(to right,#0ea5e9 1px,transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Blobs */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-sky-400/10 dark:bg-sky-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col items-center text-center">

        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
            Trusted by 50,000+ professionals worldwide
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 dark:text-white leading-[1.05] tracking-tight mb-6 max-w-5xl">
          Sign Documents{' '}
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500">
              Instantly
            </span>
            {/* Underline decoration */}
            <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 300 8" preserveAspectRatio="none">
              <path d="M0,6 Q75,0 150,6 Q225,12 300,6" stroke="url(#u)" strokeWidth="3" fill="none" strokeLinecap="round" />
              <defs>
                <linearGradient id="u" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          {' '}From{' '}
          <br className="hidden sm:block" />
          Anywhere
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
          The fastest, most secure e-signature platform. Upload, send, and get legally binding documents signed in seconds.{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">No printing. No scanning. Just done.</span>
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
          <Btn
            size="xl"
            className="w-full sm:w-auto"
            onClick={() => navigate(user ? (isAdmin ? '/admin' : '/dashboard') : '/register')}
          >
            {user ? 'Go to Dashboard' : 'Start for Free — No Credit Card'}
            <ArrowRight size={18} />
          </Btn>
          <Btn
            variant="outline"
            size="xl"
            className="w-full sm:w-auto"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See How It Works
            <ChevronDown size={16} />
          </Btn>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500 dark:text-slate-400 mb-20">
          {[
            { icon: Lock,        text: 'SSL Encrypted'      },
            { icon: Award,       text: 'Legally Binding'    },
            { icon: CheckCircle, text: 'GDPR Compliant'     },
            { icon: Clock,       text: 'Sign in 60 seconds' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 font-medium">
              <Icon size={15} className="text-emerald-500" />
              {text}
            </div>
          ))}
        </div>

        {/* Floating product card preview */}
        <div className="relative w-full max-w-3xl">
          {/* Main card */}
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/80 dark:shadow-slate-900/80 p-6 overflow-hidden">
            {/* top bar */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="ml-4 flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded-lg" />
            </div>
            {/* Document preview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded-lg w-full" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded-lg w-5/6" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded-lg w-4/5" />
                <div className="mt-6 h-10 bg-sky-100 dark:bg-sky-900/40 rounded-xl border-2 border-dashed border-sky-300 dark:border-sky-700 flex items-center justify-center">
                  <span className="text-xs font-bold text-sky-500">Signature Field</span>
                </div>
              </div>
              <div className="space-y-3">
                {/* Signer status */}
                {[
                  { name: 'Party 1', color: 'emerald', status: 'Signed' },
                  { name: 'Party 2', color: 'amber',   status: 'Pending' },
                  { name: 'Party 3', color: 'slate',   status: 'Waiting' },
                ].map(p => (
                  <div key={p.name} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      p.color === 'emerald' ? 'bg-emerald-500' : p.color === 'amber' ? 'bg-amber-400' : 'bg-slate-300',
                    )} />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{p.name}</span>
                    <span className={cn(
                      'ml-auto text-[10px] font-black uppercase',
                      p.color === 'emerald' ? 'text-emerald-500' : p.color === 'amber' ? 'text-amber-500' : 'text-slate-400',
                    )}>{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating notification chips */}
          <div className="absolute -top-4 -right-4 sm:-right-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
              <CheckCircle size={16} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">Document Signed!</p>
              <p className="text-[10px] text-slate-400 leading-tight">2 seconds ago</p>
            </div>
          </div>

          <div className="absolute -bottom-4 -left-4 sm:-left-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900/40 rounded-full flex items-center justify-center">
              <Bell size={16} className="text-sky-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">New signer added</p>
              <p className="text-[10px] text-slate-400 leading-tight">sarah@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════════════
function StatsSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 bg-slate-900 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {STATS.map(({ display, label, icon: Icon, color }, i) => (
            <div
              key={label}
              className={cn(
                'text-center transition-all duration-700',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4',
                C[color]?.light, C[color]?.dark,
              )}>
                <Icon size={24} className={C[color]?.icon} />
              </div>
              <div className="text-4xl font-extrabold text-white mb-1 tabular-nums">
                {display}
              </div>
              <div className="text-sm text-slate-400 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// FEATURES
// ════════════════════════════════════════════════════════════════
function FeaturesSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="features" ref={ref} className="py-24 lg:py-32 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionLabel>Features</SectionLabel>
          <SectionHeading sub="Powerful tools designed for modern teams. Simple enough for anyone to use in minutes.">
            Everything you need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-violet-500">
              sign faster
            </span>
          </SectionHeading>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
            <div
              key={title}
              className={cn(
                'group relative p-6 rounded-2xl border border-slate-200 dark:border-slate-800',
                'bg-white dark:bg-slate-800/40',
                'hover:border-sky-300 dark:hover:border-sky-700',
                'hover:shadow-xl hover:shadow-sky-500/10 dark:hover:shadow-sky-900/20',
                'transition-all duration-300 hover:-translate-y-1.5 cursor-default',
                'transition-all duration-700',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
              )}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Icon */}
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-5',
                C[color]?.light, C[color]?.dark,
                'group-hover:scale-110 transition-transform duration-300',
              )}>
                <Icon size={22} className={C[color]?.icon} />
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>

              {/* Hover glow dot */}
              <div className={cn(
                'absolute top-4 right-4 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                color === 'sky' ? 'bg-sky-400' : color === 'violet' ? 'bg-violet-400' : color === 'emerald' ? 'bg-emerald-400' : 'bg-amber-400',
              )} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// HOW IT WORKS
// ════════════════════════════════════════════════════════════════
function HowItWorksSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={ref} className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionLabel>How It Works</SectionLabel>
          <SectionHeading sub="From upload to signed document in under 2 minutes. It's really that simple.">
            Sign in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-violet-500">
              3 simple steps
            </span>
          </SectionHeading>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8 lg:gap-16">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-[2px] bg-gradient-to-r from-sky-300 via-violet-300 to-emerald-300 dark:from-sky-800 dark:via-violet-800 dark:to-emerald-800">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-violet-400 opacity-50 blur-sm" />
          </div>

          {STEPS.map(({ icon: Icon, title, desc, color }, i) => (
            <div
              key={title}
              className={cn(
                'relative text-center transition-all duration-700',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
              )}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Icon circle */}
              <div className="relative inline-flex mb-8">
                <div className={cn(
                  'w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl',
                  C[color]?.light, C[color]?.dark,
                  'ring-4 ring-white dark:ring-slate-950',
                )}>
                  <Icon size={32} className={C[color]?.icon} />
                </div>
                {/* Step number badge */}
                <span className={cn(
                  'absolute -top-3 -right-3 w-8 h-8 rounded-full text-xs font-black flex items-center justify-center shadow-lg',
                  'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
                )}>
                  {i + 1}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link to="/register">
            <Btn size="xl">
              Get Started — It's Free
              <ArrowRight size={18} />
            </Btn>
          </Link>
          <p className="text-slate-400 text-sm mt-4">No credit card required · Free forever plan</p>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// TESTIMONIALS
// ════════════════════════════════════════════════════════════════
function TestimonialsSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="testimonials" ref={ref} className="py-24 lg:py-32 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionLabel>Testimonials</SectionLabel>
          <SectionHeading sub="Don't take our word for it. Here's what professionals say about NexSign.">
            Loved by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-violet-500">
              professionals worldwide
            </span>
          </SectionHeading>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, avatar, color, rating, text }, i) => (
            <div
              key={name}
              className={cn(
                'group p-7 rounded-2xl border border-slate-200 dark:border-slate-800',
                'bg-white dark:bg-slate-800/40',
                'hover:shadow-xl hover:shadow-slate-200/80 dark:hover:shadow-slate-900/60',
                'hover:-translate-y-1.5 transition-all duration-300',
                'transition-all duration-700',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: rating }).map((_, j) => (
                  <Star key={j} size={15} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">
                &ldquo;{text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-slate-100 dark:border-slate-700">
                <div className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0',
                  C[color]?.light, C[color]?.icon, C[color]?.dark,
                )}>
                  {avatar}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// CTA BANNER
// ════════════════════════════════════════════════════════════════
function CTASection() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-slate-900 dark:bg-black">
      {/* Mesh gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/30 via-transparent to-violet-600/30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/10 rounded-full blur-3xl" />
        {/* grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,0.15) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-8">
          <TrendingUp size={12} className="text-sky-300" />
          <span className="text-xs font-bold text-white/80">Join 50,000+ satisfied users</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Ready to go{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-violet-300">
            paperless?
          </span>
        </h2>

        <p className="text-lg text-white/70 mb-12 max-w-xl mx-auto leading-relaxed">
          Join thousands of professionals who trust NeXsign for secure, fast, legally binding document signing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Btn
            variant="white"
            size="xl"
            onClick={() => navigate(user ? (isAdmin ? '/admin' : '/dashboard') : '/register')}
          >
            {user ? 'Go to Dashboard' : 'Start Free Today'}
            <ArrowRight size={18} />
          </Btn>
          {!user && (
            <Link to="/login">
              <Btn variant="white-outline" size="xl">Sign In</Btn>
            </Link>
          )}
        </div>

        <p className="text-white/40 text-sm mt-6">No credit card required · Cancel anytime</p>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// FOOTER
// ════════════════════════════════════════════════════════════════
function Footer() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const PRODUCT_LINKS = [
    { label: 'Features',     id: 'features'     },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Testimonials', id: 'testimonials' },
    { label: 'Pricing',      href: '/pricing'   },
  ];

  const COMPANY_LINKS = [
    { label: 'About',            href: '#' },
    { label: 'Privacy Policy',   href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Contact',          href: '#' },
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center group-hover:bg-sky-400 transition-colors">
                <FileSignature size={18} className="text-white" />
              </div>
              <span className="font-extrabold text-lg text-white">
                NeX<span className="text-sky-400">sign</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              The fastest way to get documents signed. Secure, legal, and beautifully simple.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Lock size={12} className="text-emerald-500" />
              SSL Secured · GDPR Compliant
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-white text-sm mb-5 uppercase tracking-wider">Product</h4>
            <ul className="space-y-3.5">
              {PRODUCT_LINKS.map(l => (
                <li key={l.label}>
                  {l.href
                    ? <Link to={l.href} className="text-slate-400 hover:text-white text-sm transition-colors">{l.label}</Link>
                    : <button onClick={() => scrollTo(l.id)} className="text-slate-400 hover:text-white text-sm transition-colors">{l.label}</button>
                  }
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white text-sm mb-5 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3.5">
              {COMPANY_LINKS.map(l => (
                <li key={l.label}>
                  <Link to={l.href} className="text-slate-400 hover:text-white text-sm transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h4 className="font-bold text-white text-sm mb-5 uppercase tracking-wider">Get Started</h4>
            <ul className="space-y-3.5">
              <li><Link to="/register" className="text-slate-400 hover:text-white text-sm transition-colors">Sign Up Free</Link></li>
              <li><Link to="/login"    className="text-slate-400 hover:text-white text-sm transition-colors">Sign In</Link></li>
              <li><Link to="/pricing"  className="text-slate-400 hover:text-white text-sm transition-colors">View Pricing</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} NeXsign. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <Link to="#" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-slate-400 transition-colors">Terms</Link>
            <Link to="#" className="hover:text-slate-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════
export default function Landing() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}