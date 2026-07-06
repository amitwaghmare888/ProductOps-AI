/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Stitch Design System Colors
      colors: {
        // Primary Colors
        'primary': '#d0bcff',
        'primary-container': '#a078ff',
        'on-primary': '#3c0091',
        'on-primary-container': '#340080',
        'primary-fixed': '#e9ddff',
        'primary-fixed-dim': '#d0bcff',
        'on-primary-fixed': '#23005c',
        'on-primary-fixed-variant': '#5516be',
        'inverse-primary': '#6d3bd7',
        
        // Secondary Colors
        'secondary': '#c0c1ff',
        'secondary-container': '#3131c0',
        'on-secondary': '#1000a9',
        'secondary-fixed': '#e1e0ff',
        'secondary-fixed-dim': '#c0c1ff',
        'on-secondary-fixed': '#07006c',
        'on-secondary-fixed-variant': '#2f2ebe',
        'on-secondary-container': '#b0b2ff',
        
        // Tertiary Colors
        'tertiary': '#adc6ff',
        'tertiary-container': '#4d8eff',
        'on-tertiary': '#002e6a',
        'tertiary-fixed': '#d8e2ff',
        'tertiary-fixed-dim': '#adc6ff',
        'on-tertiary-fixed': '#001a42',
        'on-tertiary-fixed-variant': '#004395',
        'on-tertiary-container': '#00285d',
        
        // Surface Colors
        'background': '#0f131d',
        'surface': '#0f131d',
        'surface-dim': '#0f131d',
        'surface-bright': '#353944',
        'surface-container-lowest': '#0a0e17',
        'surface-container-low': '#171c25',
        'surface-container': '#1b2029',
        'surface-container-high': '#262a34',
        'surface-container-highest': '#31353f',
        'surface-variant': '#31353f',
        'surface-tint': '#d0bcff',
        
        // On-Surface Colors
        'on-surface': '#dfe2f0',
        'on-surface-variant': '#cbc3d7',
        'on-background': '#dfe2f0',
        'inverse-surface': '#dfe2f0',
        'inverse-on-surface': '#2c303b',
        
        // Outline Colors
        'outline': '#958ea0',
        'outline-variant': '#494454',
        
        // Error Colors
        'error': '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',
        
        // Legacy colors for backward compatibility
        elevated: '#1a1a26',
        border: '#2a2a3a',
        muted: '#4a4a6a',
        subtle: '#8b8baa',
      },
      
      // Stitch Typography
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        'body-bold': ['Geist', 'sans-serif'],
        'headline-lg-mobile': ['Geist', 'sans-serif'],
        'stat-lg': ['Geist', 'sans-serif'],
        'label-caps': ['JetBrains Mono', 'monospace'],
        'body-base': ['Geist', 'sans-serif'],
        'display-lg': ['Geist', 'sans-serif'],
        'headline-md': ['Geist', 'sans-serif'],
        'code-block': ['JetBrains Mono', 'monospace'],
      },
      
      fontSize: {
        'body-bold': ['14px', { lineHeight: '20px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['32px', { lineHeight: '40px', letterSpacing: '-0.03em', fontWeight: '700' }],
        'stat-lg': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'label-caps': ['11px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '700' }],
        'body-base': ['14px', { lineHeight: '20px', letterSpacing: '-0.01em', fontWeight: '400' }],
        'display-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.03em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'code-block': ['12px', { lineHeight: '18px', fontWeight: '400' }],
      },
      
      // Stitch Spacing
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'base': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'gutter': '24px',
        'margin-mobile': '16px',
        'margin-desktop': '32px',
      },
      
      // Stitch Border Radius
      borderRadius: {
        DEFAULT: '0.25rem',  // 4px
        'lg': '0.5rem',      // 8px
        'xl': '0.75rem',     // 12px
        'full': '9999px',
      },
      
      // Stitch Animations
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'pulse-cursor': 'pulseCursor 1s infinite',
        'spin-slow': 'spin 1.5s linear infinite',
        'blink': 'blink 1s step-end infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        pulseCursor: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blink: {
          '50%': { opacity: '0' },
        },
      },
      
      // Stitch Box Shadows
      boxShadow: {
        'glow-primary': '0 0 15px rgba(208, 188, 255, 0.3)',
        'glow-hover': '0 0 15px rgba(208, 188, 255, 0.1)',
        'inset-highlight': 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
      },
      
      // Backdrop Blur
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
  plugins: [
    // Motion-reduce support
    function({ addUtilities }) {
      addUtilities({
        '@media (prefers-reduced-motion: reduce)': {
          '.animate-fade-in': {
            animation: 'none',
            opacity: '1',
            transform: 'none',
          },
          '.animate-pulse-dot': {
            animation: 'none',
            opacity: '1',
          },
          '.animate-pulse-cursor': {
            animation: 'none',
            opacity: '1',
          },
          '.animate-spin-slow': {
            animation: 'none',
          },
          '.animate-blink': {
            animation: 'none',
            opacity: '1',
          },
        },
      });
    },
  ],
};
