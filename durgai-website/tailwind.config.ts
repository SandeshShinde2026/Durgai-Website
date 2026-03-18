import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E53935',
        'primary-dark': '#C62828',
        'primary-light': '#EF9A9A',
        secondary: '#FFCDD2',
        'bg-warm': '#FFF5F5',
        'bg-muted': '#FAFAFA',
        'text-base': '#1E293B',
        'text-muted': '#64748B',
        'border-soft': '#F1F5F9',
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        ui: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.08)', opacity: '0.9' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.12)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.08)' },
          '70%': { transform: 'scale(1)' },
        },
        floatUp: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'marquee-slow': 'marquee 40s linear infinite',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pulse-ring': 'pulseRing 2s ease-in-out infinite',
        heartbeat: 'heartbeat 1.5s ease-in-out infinite',
        'float-up': 'floatUp 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      backgroundImage: {
        'gradient-hero':
          'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 50%, #FFCDD2 100%)',
        'gradient-card':
          'linear-gradient(135deg, #FFF5F5 0%, #FFCDD2 100%)',
        'gradient-red':
          'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
      },
      boxShadow: {
        'red-glow': '0 8px 32px rgba(229, 57, 53, 0.25)',
        'red-glow-lg': '0 16px 48px rgba(229, 57, 53, 0.35)',
        premium: '0 20px 60px rgba(0, 0, 0, 0.08)',
        card: '0 4px 24px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}

export default config
