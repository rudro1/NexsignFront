import React from 'react';
import { Link } from 'react-router-dom';

const cn = (...c) => c.filter(Boolean).join(' ');

const SIZES = {
  sm: {
    img:  'w-7 h-7 sm:w-8 sm:h-8',
    word: 'text-sm sm:text-base font-bold',
  },
  md: {
    img:  'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11',
    word: 'text-base sm:text-lg md:text-xl lg:text-2xl font-black',
  },
  lg: {
    img:  'w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 lg:w-16 lg:h-16',
    word: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black',
  },
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
    <div className={cn('flex items-center gap-2.5 sm:gap-3 shrink-0 group', className)}>
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src="/nexsign-logo.png"
          alt="NexSign"
          className={cn(
            s.img,
            'object-contain select-none transition-transform duration-200 group-hover:scale-105',
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

