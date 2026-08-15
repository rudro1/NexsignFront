import React from 'react';
import { Link } from 'react-router-dom';

const cn = (...c) => c.filter(Boolean).join(' ');

const SIZES = {
  sm: { img: 'w-9 h-9 rounded-xl',                      word: 'text-base font-bold' },
  md: { img: 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl',   word: 'text-xl sm:text-2xl font-black' },
  lg: { img: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl',   word: 'text-2xl sm:text-3xl font-black' },
};

/**
 * NexSign brand mark — official logo artwork.
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
    ? 'text-white tracking-tight leading-none'
    : 'text-slate-900 dark:text-white tracking-tight leading-none';

  const isDarkTone = tone === 'light'; // tone='light' is used on dark backgrounds

  const content = (
    <div className={cn('flex items-center gap-3 shrink-0 group', className)}>
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src="/nexsign-logo.png"
          alt="NexSign"
          className={cn(
            s.img,
            'object-contain select-none transition-transform duration-200 group-hover:scale-105 shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5',
          )}
        />
      </div>
      {showWordmark && (
        <div className="flex flex-col min-w-0 justify-center">
          <span className={cn(wordClass, s.word)}>
            NexSign
          </span>
          {showTagline && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight mt-0.5">
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

