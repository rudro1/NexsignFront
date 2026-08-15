import React from 'react';
import { Link } from 'react-router-dom';

const cn = (...c) => c.filter(Boolean).join(' ');

const SIZES = {
  sm: { img: 'w-7 h-7 rounded-lg',   word: 'text-sm font-bold' },
  md: { img: 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl', word: 'text-base sm:text-lg font-bold' },
  lg: { img: 'w-10 h-10 rounded-xl', word: 'text-xl font-bold' },
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
    <div className={cn('flex items-center gap-2.5 shrink-0 group', className)}>
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Light mode logo */}
        <img
          src="/nexsign-logo-light.png"
          alt="NexSign"
          className={cn(
            s.img,
            'object-cover select-none transition-transform duration-200 group-hover:scale-105 shadow-sm border border-slate-200/80',
            isDarkTone ? 'hidden' : 'block dark:hidden',
          )}
        />
        {/* Dark mode logo */}
        <img
          src="/nexsign-logo-dark.png"
          alt="NexSign"
          className={cn(
            s.img,
            'object-cover select-none transition-transform duration-200 group-hover:scale-105 shadow-sm border border-slate-800',
            isDarkTone ? 'block' : 'hidden dark:block',
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

