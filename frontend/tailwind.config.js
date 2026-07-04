/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ── Design tokens ─────────────────────────────────────────────────────
      colors: {
        surface:  '#111118',
        elevated: '#1a1a26',
        border:   '#2a2a3a',
        muted:    '#4a4a6a',
        subtle:   '#8b8baa',
        primary:  '#f0f0f8',

        // ── Glow variant accent colours (used by GlowCard) ─────────────────
        glow: {
          violet:  'rgba(139, 92, 246, 0.45)',
          emerald: 'rgba(52, 211, 153, 0.40)',
          amber:   'rgba(251, 191, 36,  0.40)',
          red:     'rgba(248, 113, 113, 0.40)',
          blue:    'rgba(96,  165, 250, 0.40)',
        },
      },

      // ── Milestone 1: named animation tokens ───────────────────────────────
      animation: {
        // Existing
        'fade-in':    'fadeIn 0.25s ease-out',
        'pulse-dot':  'pulseDot 2s ease-in-out infinite',
        'spin-slow':  'spin 1.5s linear infinite',

        // M1 — entrance animations
        'fade-up':     'm1-fade-up   0.35s ease-out both',
        'fade-down':   'm1-fade-down 0.35s ease-out both',
        'fade-left':   'm1-fade-left 0.35s ease-out both',
        'fade-right':  'm1-fade-right 0.35s ease-out both',
        'scale-in':    'm1-scale-in  0.30s ease-out both',

        // M1 — continuous / ambient
        'glow-pulse':  'm1-glow-pulse  2.5s ease-in-out infinite',
        'caret-blink': 'm1-caret-blink 1s   step-end    infinite',
        'shimmer':     'm1-shimmer     1.6s ease-in-out  infinite',
        'orbit':       'm1-orbit       8s   linear       infinite',

        // M1 — component-specific
        'count-enter': 'm1-count-enter 0.40s ease-out both',
        'step-reveal': 'm1-step-reveal 0.25s ease-out both',
      },

      // ── Milestone 1: keyframe definitions ─────────────────────────────────
      keyframes: {
        // Existing
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'   },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1'   },
          '50%':      { opacity: '0.3' },
        },

        // M1
        'm1-fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        'm1-fade-down': {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)'     },
        },
        'm1-fade-left': {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to:   { opacity: '1', transform: 'translateX(0)'    },
        },
        'm1-fade-right': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)'     },
        },
        'm1-scale-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)'    },
        },
        'm1-shimmer': {
          from: { backgroundPosition: '-200% center' },
          to:   { backgroundPosition:  '200% center' },
        },
        'm1-glow-pulse': {
          '0%, 100%': { boxShadow: '0 0  8px 2px rgba(139, 92, 246, 0.30)' },
          '50%':      { boxShadow: '0 0 20px 6px rgba(139, 92, 246, 0.55)' },
        },
        'm1-caret-blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        'm1-orbit': {
          from: { transform: 'rotate(0deg)   translateX(48px) rotate(0deg)'   },
          to:   { transform: 'rotate(360deg) translateX(48px) rotate(-360deg)' },
        },
        'm1-count-enter': {
          from: { opacity: '0', transform: 'translateY(6px) scale(0.96)' },
          to:   { opacity: '1', transform: 'translateY(0)   scale(1)'    },
        },
        'm1-step-reveal': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)'    },
        },
      },

      // ── Milestone 1: transitionDuration extras ────────────────────────────
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '450': '450ms',
      },

      // ── Milestone 1: box-shadow tokens (glow variants) ────────────────────
      boxShadow: {
        'glow-violet':  '0 0 16px 4px rgba(139, 92, 246, 0.30)',
        'glow-emerald': '0 0 16px 4px rgba(52, 211, 153, 0.30)',
        'glow-amber':   '0 0 16px 4px rgba(251, 191, 36,  0.30)',
        'glow-red':     '0 0 16px 4px rgba(248, 113, 113, 0.30)',
        'glow-blue':    '0 0 16px 4px rgba(96, 165, 250, 0.30)',
      },
    },
  },
  plugins: [],
};

