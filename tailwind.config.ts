import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Engineering color palette
        navy: {
          50: '#E8EDF5',
          100: '#C5D0E6',
          200: '#9BAFD4',
          300: '#7190C2',
          400: '#4A71B0',
          500: '#1B3A6B',
          600: '#162F56',
          700: '#0F2341',
          800: '#0B1A30',
          900: '#061020',
          950: '#030810',
        },
        engineering: {
          orange: '#FF6B35',
          amber: '#F59E0B',
          steel: '#4A90D9',
          gold: '#D4A017',
          concrete: '#8B9CB6',
          asphalt: '#1E293B',
          safety: '#22C55E',
          signal: '#EF4444',
          caution: '#FBBF24',
        },
      },
      backgroundImage: {
        'engineering-gradient': 'linear-gradient(135deg, #0B1A30 0%, #162F56 50%, #1B3A6B 100%)',
        'engineering-radial': 'radial-gradient(ellipse at top, #162F56 0%, #0B1A30 70%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)',
        'kpi-blue': 'linear-gradient(135deg, #1B3A6B 0%, #2563EB 100%)',
        'kpi-orange': 'linear-gradient(135deg, #9A3412 0%, #F97316 100%)',
        'kpi-green': 'linear-gradient(135deg, #14532D 0%, #22C55E 100%)',
        'kpi-amber': 'linear-gradient(135deg, #78350F 0%, #F59E0B 100%)',
        'kpi-gold': 'linear-gradient(135deg, #7A5C0B 0%, #D4A017 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #0B1A30 0%, #0F2341 40%, #162F56 100%)',
      },
      boxShadow: {
        'engineering': '0 4px 24px rgba(11, 26, 48, 0.12)',
        'engineering-lg': '0 8px 40px rgba(11, 26, 48, 0.18)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.3)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.3)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-gold': '0 0 20px rgba(212, 160, 23, 0.3)',
        'card-hover': '0 8px 32px rgba(11, 26, 48, 0.15), 0 2px 8px rgba(11, 26, 48, 0.08)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'count-up': 'count-up 1s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
