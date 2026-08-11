// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],

  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {

      // ── Brand colors ─────────────────────────────────────────
      colors: {
        // NexSign primary
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // primary
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // shadcn CSS-var colors (backward compat)
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },

      // ── Border radius ─────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        lg:    'var(--radius)',
        md:    'calc(var(--radius) - 2px)',
        sm:    'calc(var(--radius) - 4px)',
      },

      // ── Font families ─────────────────────────────────────────
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
        sign:  ["'Brush Script MT'", "'Dancing Script'", 'cursive'],
      },

      // ── Spacing extras ────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // ── Box shadow ────────────────────────────────────────────
      boxShadow: {
        'brand-sm': '0 1px 3px 0 rgb(14 165 233 / 0.15)',
        'brand':    '0 4px 14px 0 rgb(14 165 233 / 0.25)',
        'brand-lg': '0 10px 30px 0 rgb(14 165 233 / 0.30)',
        'card':     '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 4px 12px 0 rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 20px 0 rgb(0 0 0 / 0.08), 0 8px 32px 0 rgb(0 0 0 / 0.06)',
      },

      // ── Keyframes ─────────────────────────────────────────────
      keyframes: {
        // shadcn accordion
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        // Custom
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to:   { opacity: '0', transform: 'translateY(8px)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        'draw': {
          from: { strokeDashoffset: '100' },
          to:   { strokeDashoffset: '0'   },
        },
      },

      // ── Animations ────────────────────────────────────────────
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'fade-in':         'fade-in 0.25s ease-out',
        'fade-out':        'fade-out 0.2s ease-in',
        'slide-in-right':  'slide-in-right 0.25s ease-out',
        'slide-in-left':   'slide-in-left 0.25s ease-out',
        'scale-in':        'scale-in 0.2s ease-out',
        'shimmer':         'shimmer 2s linear infinite',
        'pulse-soft':      'pulse-soft 2s ease-in-out infinite',
        'spin-slow':       'spin-slow 3s linear infinite',
        'bounce-sm':       'bounce-sm 1s ease-in-out infinite',
        'draw':            'draw 1s ease-out forwards',
      },

      // ── Transition timing ─────────────────────────────────────
      transitionTimingFunction: {
        'bounce-in':  'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ── Z-index scale ─────────────────────────────────────────
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // ── Backdrop blur ─────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },
    },
  },

  plugins: [
    require('tailwindcss-animate'),

    // ── Custom utilities plugin ───────────────────────────────
    function({ addUtilities, addComponents, theme }) {

      // Shimmer skeleton utility
      addUtilities({
        '.skeleton': {
          background:           'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
          backgroundSize:       '200% 100%',
          animation:            'shimmer 1.5s infinite',
          borderRadius:         theme('borderRadius.lg'),
        },
        '.skeleton-dark': {
          background:           'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
          backgroundSize:       '200% 100%',
          animation:            'shimmer 1.5s infinite',
        },
        // Scrollbar hide
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width':    'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        // Scrollbar thin
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar':       { width: '4px', height: '4px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background:    theme('colors.slate.300'),
            borderRadius:  '9999px',
          },
        },
        // Text balance
        '.text-balance': { 'text-wrap': 'balance' },
        // Glass morphism
        '.glass': {
          background:  'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
        },
        '.glass-dark': {
          background:  'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
        },
      });

      // Reusable card component
      addComponents({
        '.card-base': {
          backgroundColor: 'white',
          borderRadius:    theme('borderRadius.2xl'),
          border:          `1px solid ${theme('colors.slate.200')}`,
          boxShadow:       theme('boxShadow.card'),
          transition:      'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow:  theme('boxShadow.card-hover'),
            transform:  'translateY(-2px)',
          },
        },
      });
    },
  ],
};