import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const cn = (...c) => c.filter(Boolean).join(' ');

const COLOR_MAP = {
  sky: {
    bg:     'bg-sky-50 dark:bg-sky-900/20',
    icon:   'text-sky-500',
    border: 'hover:border-sky-200 dark:hover:border-sky-800',
    glow:   'hover:shadow-sky-100/80 dark:hover:shadow-sky-900/30',
    dot:    'bg-sky-400',
  },
  green: {
    bg:     'bg-emerald-50 dark:bg-emerald-900/20',
    icon:   'text-emerald-500',
    border: 'hover:border-emerald-200 dark:hover:border-emerald-800',
    glow:   'hover:shadow-emerald-100/80 dark:hover:shadow-emerald-900/30',
    dot:    'bg-emerald-400',
  },
  amber: {
    bg:     'bg-amber-50 dark:bg-amber-900/20',
    icon:   'text-amber-500',
    border: 'hover:border-amber-200 dark:hover:border-amber-800',
    glow:   'hover:shadow-amber-100/80 dark:hover:shadow-amber-900/30',
    dot:    'bg-amber-400',
  },
  purple: {
    bg:     'bg-violet-50 dark:bg-violet-900/20',
    icon:   'text-violet-500',
    border: 'hover:border-violet-200 dark:hover:border-violet-800',
    glow:   'hover:shadow-violet-100/80 dark:hover:shadow-violet-900/30',
    dot:    'bg-violet-400',
  },
  violet: {
    bg:     'bg-violet-50 dark:bg-violet-900/20',
    icon:   'text-violet-500',
    border: 'hover:border-violet-200 dark:hover:border-violet-800',
    glow:   'hover:shadow-violet-100/80 dark:hover:shadow-violet-900/30',
    dot:    'bg-violet-400',
  },
  rose: {
    bg:     'bg-rose-50 dark:bg-rose-900/20',
    icon:   'text-rose-500',
    border: 'hover:border-rose-200 dark:hover:border-rose-800',
    glow:   'hover:shadow-rose-100/80 dark:hover:shadow-rose-900/30',
    dot:    'bg-rose-400',
  },
};

function useCountUp(target, duration = 800, enabled = true) {
  const [display, setDisplay] = useState(0);
  const rafRef  = useRef(null);
  const prevRef = useRef(0);

  useEffect(() => {
    if (!enabled || typeof target !== 'number') {
      setDisplay(target);
      return;
    }
    const startVal = prevRef.current;
    const startTs  = performance.now();
    const tick = (now) => {
      const p     = Math.min((now - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val   = Math.round(startVal + (target - startVal) * eased);
      setDisplay(val);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else prevRef.current = target;
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled]);

  return display;
}

const StatsCard = React.memo(({
  label, value, icon: Icon,
  color = 'sky', loading = false,
  trend, trendUp, subtitle, badge, onClick,
}) => {
  const animated = useCountUp(
    typeof value === 'number' ? value : 0,
    800,
    typeof value === 'number' && !loading,
  );
  const displayValue = typeof value === 'number' ? animated : value;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800/50
                      border border-slate-200 dark:border-slate-700/50
                      rounded-xl p-3 sm:p-4 overflow-hidden w-full">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-2.5 w-14 bg-slate-200 dark:bg-slate-700
                            rounded-full animate-pulse" />
            <div className="h-6 w-10 bg-slate-200 dark:bg-slate-700
                            rounded-lg animate-pulse" />
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-200
                          dark:bg-slate-700 animate-pulse shrink-0" />
        </div>
      </div>
    );
  }

  const c = COLOR_MAP[color] || COLOR_MAP.sky;
  const isClickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        // ✅ overflow-hidden + w-full — iPhone fix
        'group relative bg-white dark:bg-slate-800/50',
        'overflow-hidden w-full',
        'border border-slate-200 dark:border-slate-700/50',
        'rounded-xl',
        // ✅ smaller padding on mobile
        'p-3 sm:p-4',
        'transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5',
        'active:scale-[0.98]',
        c.border, c.glow,
        isClickable && 'cursor-pointer',
      )}
    >
      {/* Decorative circle */}
      <div className={cn(
        'absolute -right-4 -top-4 w-20 h-20 rounded-full',
        'opacity-30 group-hover:opacity-50',
        'transition-all duration-300 pointer-events-none',
        c.bg,
      )} />

      {/* Left accent */}
      <div className={cn(
        'absolute top-0 left-0 w-0.5 h-6 rounded-br-full opacity-70',
        'group-hover:h-10 transition-all duration-300',
        c.dot,
      )} />

      <div className="relative flex items-start justify-between gap-2">

        {/* Left */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="text-[9px] sm:text-[10px] font-black uppercase
                        tracking-[0.12em] text-slate-400
                        dark:text-slate-500 mb-1.5 leading-none truncate">
            {label}
          </p>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl sm:text-2xl font-black
                             text-slate-900 dark:text-white
                             leading-none tabular-nums">
              {displayValue ?? '—'}
            </span>

            {/* badge prop (e.g. "72%") */}
            {badge && (
              <span className={cn(
                'text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none',
                'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
              )}>
                {badge}
              </span>
            )}

            {trend && (
              <span className={cn(
                'inline-flex items-center gap-0.5 text-[9px]',
                'font-black px-1.5 py-0.5 rounded-full leading-none',
                trendUp === true
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                  : trendUp === false
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
              )}>
                {trendUp === true  && <TrendingUp   size={8} strokeWidth={2.5} />}
                {trendUp === false && <TrendingDown size={8} strokeWidth={2.5} />}
                {trend}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500
                          mt-1 leading-snug font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon */}
        <div className={cn(
          'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center',
          'justify-center shrink-0 shadow-sm',
          'transition-transform duration-300',
          'group-hover:scale-110 group-hover:rotate-3',
          c.bg, c.icon,
        )}>
          {Icon && <Icon size={16} strokeWidth={2} />}
        </div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';
export default StatsCard;