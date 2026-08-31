import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ground: {
          paper: '#FCF8F3',
          sand: '#F5EDE1',
          card: '#FFFDFA',
          mist: '#EDF2F0',
        },
        ink: {
          espresso: '#2B211B',
          bark: '#5C4E44',
          stone: '#8A7D73',
          chalk: '#FFFDFA',
        },
        accent: {
          terracotta: '#D9663F',
          sage: '#3E6B5C',
          amber: '#EFA93C',
          sky: '#A9C9D6',
          clay: '#B0836A',
        },
        semantic: {
          danger: '#B3453A',
          success: '#3E6B5C',
          warn: '#EFA93C',
        },
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
        input: '16px',
        chip: '999px',
        panel: '28px',
      },
      boxShadow: {
        e1: '0 1px 2px rgba(74,55,42,.06), 0 8px 24px -12px rgba(74,55,42,.18)',
        e2: '0 2px 4px rgba(74,55,42,.06), 0 24px 48px -20px rgba(74,55,42,.28)',
        e3: '0 32px 64px -24px rgba(74,55,42,.35)',
      },
    },
  },
  plugins: [],
};

export default config;
