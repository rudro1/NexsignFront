import React from 'react';
import { Link } from 'react-router-dom';

const cn = (...c) => c.filter(Boolean).join(' ');

const SIZES = {
  sm: { box: 'w-7 h-7', letter: 'text-[11px]', word: 'text-base', radius: 'rounded-[6px]' },
  md: { box: 'w-9 h-9', letter: 'text-[13px]', word: 'text-xl',   radius: 'rounded-[7px]' },
  lg: { box: 'w-10 h-10', letter: 'text-[15px]', word: 'text-2xl', radius: 'rounded-lg' },
};

/**
 * NexSign brand mark — blue gradient box with white "N" (matches email footer).
 */
export function NexSignLogo({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  asLink = true,
  tone = 'default',
  className,
}) {
  const s = SIZES[size] || SIZES.md;
  const wordClass = tone === 'light'
    ? 'font-bold text-white tracking-tight leading-none'
    : 'font-bold text-slate-900 dark:text-white tracking-tight leading-none';

  const content = (
    <div className={cn('flex items-center gap-2.5 shrink-0 group', className)}>
      <div
        className={cn(
          s.box,
          s.radius,
          'bg-gradient-to-br from-[#28ABDF] to-[#1d6fa8]',
          'flex items-center justify-center',
          'shadow-md shadow-sky-500/30',
          'group-hover:shadow-sky-500/45 transition-shadow',
        )}
      >
        <span className={cn('font-black text-white leading-none select-none', s.letter)}>N</span>
      </div>
      {showWordmark && (
        <div className="flex flex-col min-w-0">
          <span className={cn(wordClass, s.word)}>
            NexSign
          </span>
          {showTagline && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
              Trusted eSigning
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}

export default NexSignLogo;
