import React from 'react';
import { Link } from 'react-router-dom';

const cn = (...c) => c.filter(Boolean).join(' ');

const SIZES = {
  sm: { img: 'w-6 h-6 sm:w-7 sm:h-7',       word: 'text-base' },
  md: { img: 'w-7.5 h-7.5 sm:w-8.5 sm:h-8.5', word: 'text-lg sm:text-xl' },
  lg: { img: 'w-9 h-9 sm:w-10 sm:h-10',     word: 'text-xl sm:text-2xl' },
};

/**
 * NexSign brand mark — official new NS pen logo mark with transparent background.
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
    ? 'font-extrabold text-white tracking-tight leading-none'
    : 'font-extrabold text-slate-900 dark:text-white tracking-tight leading-none';

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

