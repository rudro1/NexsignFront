import React from 'react';
import { Link } from 'react-router-dom';

const cn = (...c) => c.filter(Boolean).join(' ');

const SIZES = {
  sm: { img: 'w-5 h-5',             word: 'text-sm font-bold' },
  md: { img: 'w-6 h-6 sm:w-7 sm:h-7', word: 'text-sm sm:text-base font-bold' },
  lg: { img: 'w-8 h-8',             word: 'text-lg font-bold' },
};

/**
 * NexSign brand mark — sleek, compact official NS pen logo.
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

  const content = (
    <div className={cn('flex items-center gap-1.5 shrink-0 group', className)}>
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src="/nexsign-logo.png"
          alt="NexSign"
          className={cn(
            s.img,
            'object-contain select-none transition-transform duration-200 group-hover:scale-105',
            'drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_10px_rgba(40,171,223,0.3)]',
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

