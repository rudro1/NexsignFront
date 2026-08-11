// src/pages/Pricing.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import {
  Check, X, Zap, Shield, Users, FileSignature,
  ArrowRight, Lock, Star, ChevronDown, Sparkles,
  Building2, User, Crown, HelpCircle,
} from 'lucide-react';

// ─── cn helper ───────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(' ');

// ─── Btn primitive ───────────────────────────────────────────────
const Btn = ({ children, variant = 'primary', className, ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-150 active:scale-[0.97] cursor-pointer select-none';
  const variants = {
    primary: 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white shadow-lg shadow-sky-500/25',
    outline: 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    ghost:   'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
  };
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

// ════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════
const PLANS = [
  {
    id:        'free',
    name:      'Free',
    icon:      User,
    color:     'slate',
    monthlyPrice: 0,
    yearlyPrice:  0,
    desc:      'Perfect for individuals just getting started.',
    highlight: false,
    badge:     null,
    features: [
      { text: '5 documents per month',    included: true  },
      { text: 'Standard e-signature',     included: true  },
      { text: 'Email notifications',      included: true  },
      { text: 'Secure PDF storage',       included: true  },
      { text: 'Custom branding',          included: false },
      { text: 'Team collaboration',       included: false },
      { text: 'API access',               included: false },
      { text: 'Priority support',         included: false },
    ],
    cta: 'Get Started Free',
    ctaHref: '/register',
  },
  {
    id:        'pro',
    name:      'Pro',
    icon:      Crown,
    color:     'sky',
    monthlyPrice: 29,
    yearlyPrice:  23,
    desc:      'For professionals and growing teams.',
    highlight: true,
    badge:     'Most Popular',
    features: [
      { text: 'Unlimited documents',      included: true },
      { text: 'Sequential signing',       included: true },
      { text: 'Custom branding',          included: true },
      { text: 'Priority support',         included: true },
      { text: 'Team collaboration',       included: true },
      { text: 'Audit trail & logs',       included: true },
      { text: 'API access',               included: false },
      { text: 'Dedicated manager',        included: false },
    ],
    cta: 'Start Free Trial',
    ctaHref: '/register?plan=pro',
  },
  {
    id:        'enterprise',
    name:      'Enterprise',
    icon:      Building2,
    color:     'violet',
    monthlyPrice: 99,
    yearlyPrice:  79,
    desc:      'Advanced security and control at scale.',
    highlight: false,
    badge:     null,
    features: [
      { text: 'Everything in Pro',        included: true },
      { text: 'Bulk sending (500+)',       included: true },
      { text: 'API & webhooks',           included: true },
      { text: 'SAML SSO',                 included: true },
      { text: 'Dedicated manager',        included: true },
      { text: 'Advanced analytics',       included: true },
      { text: 'SLA guarantee',            included: true },
      { text: 'Custom integrations',      included: true },
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
  },
];

const FAQS = [
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, you can cancel at any time. Your plan remains active until the end of your billing period, and you won\'t be charged again.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'The Pro plan includes a 14-day free trial. No credit card required to start. Enterprise plans can request a custom demo.',
  },
  {
    q: 'Are signatures legally binding?',
    a: 'Yes. NexSign signatures comply with eIDAS (EU), ESIGN (US), and other global e-signature regulations, making them fully legally binding.',
  },
  {
    q: 'How is my data secured?',
    a: 'All documents are encrypted with AES-256. Data is stored in SOC 2 Type II certified infrastructure with full audit trails.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Absolutely. You can upgrade or downgrade your plan at any time from your dashboard settings.',
  },
];

const TRUST = [
  { icon: Lock,   text: 'SSL Encrypted'    },
  { icon: Shield, text: 'GDPR Compliant'   },
  { icon: Star,   text: '4.9★ Rated'       },
  { icon: Zap,    text: '99.9% Uptime'     },
];

// color tokens
const C = {
  sky:    { iconBg: 'bg-sky-100 dark:bg-sky-900/40',    iconText: 'text-sky-500',    ring: 'ring-sky-500/20',    btn: 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25'    },
  violet: { iconBg: 'bg-violet-100 dark:bg-violet-900/40', iconText: 'text-violet-500', ring: 'ring-violet-500/20', btn: 'bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/25' },
  slate:  { iconBg: 'bg-slate-100 dark:bg-slate-800',   iconText: 'text-slate-500',  ring: 'ring-slate-200/60',  btn: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700' },
};

// ════════════════════════════════════════════════════════════════
// FAQ ITEM
// ════════════════════════════════════════════════════════════════
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <span className="font-semibold text-sm text-slate-900 dark:text-white">{q}</span>
        <ChevronDown
          size={18}
          className={cn('text-slate-400 flex-shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
export default function Pricing() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleCTA = (plan) => {
    if (plan.id === 'enterprise') {
      navigate('/contact');
      return;
    }
    if (user) {
      navigate(isAdmin ? '/admin' : '/dashboard');
    } else {
      navigate(plan.ctaHref);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 antialiased">

      {/* ── Simple top nav ──────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center">
              <FileSignature size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">
              NeX<span className="text-sky-500">sign</span>
            </span>
          </Link>
          <div className="flex items-center gap-2.5">
            {user ? (
              <Btn
                onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
                className="px-5 py-2.5"
              >
                Dashboard <ArrowRight size={15} />
              </Btn>
            ) : (
              <>
                <Link to="/login">
                  <Btn variant="ghost" className="px-4 py-2.5 text-sm">Sign In</Btn>
                </Link>
                <Link to="/register">
                  <Btn className="px-5 py-2.5 text-sm">Get Started</Btn>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <main>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          {/* bg */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-50/60 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-sky-400/8 dark:bg-sky-500/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 mb-6"
            >
              <Sparkles size={12} className="text-sky-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-sky-600 dark:text-sky-400">
                Simple Pricing
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-5"
            >
              Plans for every{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-violet-500">
                team size
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed"
            >
              No hidden fees. No contracts. Cancel anytime.
            </motion.p>

            {/* Billing toggle */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-4 bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700"
            >
              <button
                onClick={() => setYearly(false)}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
                  !yearly
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400',
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2',
                  yearly
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400',
                )}
              >
                Yearly
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-wide">
                  Save 20%
                </span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* ── Pricing cards ─────────────────────────────────────── */}
        <section className="pb-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start md:items-center">
              {PLANS.map((plan, i) => {
                const PlanIcon = plan.icon;
                const color    = C[plan.color];
                const price    = yearly ? plan.yearlyPrice : plan.monthlyPrice;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    className={cn(
                      'relative flex flex-col rounded-3xl border transition-all duration-300',
                      plan.highlight
                        ? [
                            'bg-white dark:bg-slate-800/80',
                            'border-sky-300 dark:border-sky-600',
                            'shadow-2xl shadow-sky-500/15 dark:shadow-sky-900/30',
                            'md:scale-[1.04] md:z-10',
                            'ring-1 ring-sky-300 dark:ring-sky-600',
                          ]
                        : [
                            'bg-white dark:bg-slate-900/60',
                            'border-slate-200 dark:border-slate-800',
                            'hover:border-slate-300 dark:hover:border-slate-700',
                            'hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-900/40',
                          ],
                    )}
                  >
                    {/* Popular badge */}
                    {plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="inline-flex items-center gap-1 px-4 py-1 bg-sky-500 text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-lg shadow-sky-500/30">
                          <Sparkles size={10} /> {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className="p-7 lg:p-8 flex flex-col flex-1">
                      {/* Plan header */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', color.iconBg)}>
                          <PlanIcon size={20} className={color.iconText} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 dark:text-white leading-tight">{plan.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{plan.desc}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-7">
                        <div className="flex items-end gap-1.5">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={price}
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              transition={{ duration: 0.2 }}
                              className="text-5xl font-extrabold text-slate-900 dark:text-white tabular-nums leading-none"
                            >
                              ${price}
                            </motion.span>
                          </AnimatePresence>
                          <div className="pb-1">
                            <span className="text-sm text-slate-400 font-medium">/mo</span>
                            {yearly && price > 0 && (
                              <p className="text-[10px] text-emerald-500 font-bold leading-tight">Billed annually</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3.5 mb-8 flex-1">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-3">
                            {f.included ? (
                              <div className="w-5 h-5 bg-sky-100 dark:bg-sky-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check size={11} className="text-sky-600 dark:text-sky-400" strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                                <X size={11} className="text-slate-400" strokeWidth={3} />
                              </div>
                            )}
                            <span className={cn(
                              'text-sm leading-snug',
                              f.included
                                ? 'text-slate-700 dark:text-slate-300 font-medium'
                                : 'text-slate-400 dark:text-slate-600 line-through',
                            )}>
                              {f.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA button */}
                      <button
                        onClick={() => handleCTA(plan)}
                        className={cn(
                          'w-full py-3.5 rounded-2xl text-sm font-black transition-all duration-150 active:scale-[0.97]',
                          plan.highlight
                            ? 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white shadow-lg shadow-sky-500/25'
                            : color.btn,
                        )}
                      >
                        {plan.cta}
                        {plan.id !== 'enterprise' && <ArrowRight size={14} className="inline ml-1" />}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Trust badges ──────────────────────────────────────── */}
        <section className="py-12 border-y border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {TRUST.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <Icon size={15} className="text-emerald-500" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature comparison table (sm hidden, md+ shown) ───── */}
        <section className="py-20 lg:py-28 bg-white dark:bg-slate-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                Compare plans in detail
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                See exactly what's included in each plan.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left min-w-[560px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 w-1/2">
                      Feature
                    </th>
                    {PLANS.map(p => (
                      <th key={p.id} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-center">
                        <span className={cn(
                          p.highlight ? 'text-sky-500' : 'text-slate-400',
                        )}>{p.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {[
                    { label: 'Documents / month',      vals: ['5',     'Unlimited', 'Unlimited'] },
                    { label: 'Sequential signing',      vals: [false,   true,        true        ] },
                    { label: 'Bulk send (templates)',   vals: [false,   false,       true        ] },
                    { label: 'Custom branding',         vals: [false,   true,        true        ] },
                    { label: 'Audit trail',             vals: [false,   true,        true        ] },
                    { label: 'Team members',            vals: ['1',     '5',         'Unlimited' ] },
                    { label: 'API access',              vals: [false,   false,       true        ] },
                    { label: 'SAML SSO',                vals: [false,   false,       true        ] },
                    { label: 'Dedicated support',       vals: [false,   false,       true        ] },
                    { label: 'SLA guarantee',           vals: [false,   false,       true        ] },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {row.label}
                      </td>
                      {row.vals.map((v, j) => (
                        <td key={j} className="px-6 py-4 text-center">
                          {typeof v === 'boolean' ? (
                            v
                              ? <div className="w-5 h-5 bg-sky-100 dark:bg-sky-900/40 rounded-full flex items-center justify-center mx-auto"><Check size={11} className="text-sky-600 dark:text-sky-400" strokeWidth={3} /></div>
                              : <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto"><X size={11} className="text-slate-300 dark:text-slate-600" strokeWidth={3} /></div>
                          ) : (
                            <span className={cn(
                              'text-sm font-bold',
                              j === 1 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400',
                            )}>{v}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 mb-4">
                <HelpCircle size={11} className="text-sky-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-sky-600 dark:text-sky-400">FAQ</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                Frequently asked questions
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Still have questions?{' '}
                <Link to="/contact" className="text-sky-500 hover:text-sky-600 font-semibold">
                  Contact our team →
                </Link>
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ────────────────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-slate-900 dark:bg-black relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-600/20 via-transparent to-violet-600/20" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,0.2) 1px,transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
          </div>
          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
              Still deciding?{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-violet-300">
                Start free.
              </span>
            </h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              The Free plan never expires. Upgrade only when you're ready.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={user ? '/dashboard' : '/register'}>
                <button className="px-8 py-4 bg-white hover:bg-slate-100 text-sky-600 font-black rounded-2xl shadow-xl transition-all active:scale-[0.97] inline-flex items-center gap-2 text-sm">
                  {user ? 'Go to Dashboard' : 'Get Started — It\'s Free'}
                  <ArrowRight size={16} />
                </button>
              </Link>
              <Link to="/contact">
                <button className="px-8 py-4 border-2 border-white/20 text-white/80 hover:bg-white/10 font-bold rounded-2xl transition-all text-sm">
                  Talk to Sales
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center">
              <FileSignature size={14} className="text-white" />
            </div>
            <span className="font-extrabold text-white">NeX<span className="text-sky-400">sign</span></span>
          </Link>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} NexSign. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-slate-600">
            <Link to="#" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-slate-400 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}