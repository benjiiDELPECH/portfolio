export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#f5f5f7',
          sidebar: 'rgba(246,246,246,0.72)',
          card: '#ffffff',
          border: 'rgba(0,0,0,0.06)',
          'border-strong': 'rgba(0,0,0,0.12)',
          text: '#1d1d1f',
          'text-secondary': '#86868b',
          'text-tertiary': '#aeaeb2',
          accent: '#0071e3',
          'accent-hover': '#0077ED',
          'accent-light': 'rgba(0,113,227,0.08)',
          purple: '#bf5af2',
          red: '#ff3b30',
          orange: '#ff9500',
          green: '#34c759',
          teal: '#5ac8fa',
        },
        'apple-dark': {
          bg: '#000000',
          sidebar: 'rgba(30,30,30,0.72)',
          card: '#1c1c1e',
          'card-hover': '#2c2c2e',
          border: 'rgba(255,255,255,0.08)',
          'border-strong': 'rgba(255,255,255,0.16)',
          text: '#f5f5f7',
          'text-secondary': '#98989d',
          'text-tertiary': '#636366',
          accent: '#0a84ff',
          'accent-hover': '#409CFF',
          'accent-light': 'rgba(10,132,255,0.12)',
        },
        // Keep old colors for old layout compat
        primary: {
          DEFAULT: '#1a2233',
          light: '#f8fafc',
          dark: '#111827',
          accent: '#2563eb',
          border: '#e5e7eb',
        },
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"',
          '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'
        ],
        mono: [
          '"SF Mono"', '"Fira Code"', '"Fira Mono"', '"Roboto Mono"', 'monospace'
        ],
      },
      fontSize: {
        'apple-hero': ['34px', { lineHeight: '1.12', fontWeight: '700', letterSpacing: '-0.003em' }],
        'apple-title1': ['28px', { lineHeight: '1.14', fontWeight: '700', letterSpacing: '-0.003em' }],
        'apple-title2': ['22px', { lineHeight: '1.18', fontWeight: '700', letterSpacing: '-0.002em' }],
        'apple-title3': ['20px', { lineHeight: '1.2', fontWeight: '600' }],
        'apple-headline': ['17px', { lineHeight: '1.24', fontWeight: '600' }],
        'apple-body': ['17px', { lineHeight: '1.47', fontWeight: '400' }],
        'apple-callout': ['16px', { lineHeight: '1.38', fontWeight: '400' }],
        'apple-subhead': ['15px', { lineHeight: '1.33', fontWeight: '400' }],
        'apple-footnote': ['13px', { lineHeight: '1.38', fontWeight: '400' }],
        'apple-caption1': ['12px', { lineHeight: '1.33', fontWeight: '400' }],
        'apple-caption2': ['11px', { lineHeight: '1.18', fontWeight: '400' }],
      },
      boxShadow: {
        'apple': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'apple-md': '0 4px 12px rgba(0,0,0,0.08)',
        'apple-lg': '0 8px 28px rgba(0,0,0,0.12)',
        'apple-card': '0 0.5px 1px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.04)',
        'apple-card-hover': '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#1d1d1f',
            fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'sans-serif'].join(','),
            h1: { color: '#1d1d1f', fontWeight: '700', fontSize: '2rem', letterSpacing: '-0.003em' },
            h2: { color: '#1d1d1f', fontWeight: '600', fontSize: '1.5rem' },
            h3: { color: '#1d1d1f', fontWeight: '600', fontSize: '1.17rem' },
            a: { color: '#0071e3', fontWeight: '500', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
            code: { backgroundColor: '#f5f5f7', color: '#1d1d1f', padding: '0.15em 0.4em', borderRadius: '6px', fontSize: '0.9em' },
            blockquote: { borderLeftColor: '#0071e3', color: '#86868b' },
          },
        },
        dark: {
          css: {
            color: '#f5f5f7',
            h1: { color: '#f5f5f7' }, h2: { color: '#f5f5f7' }, h3: { color: '#f5f5f7' }, strong: { color: '#f5f5f7' },
            a: { color: '#0a84ff', '&:hover': { color: '#409CFF' } },
            code: { backgroundColor: '#1c1c1e', color: '#f5f5f7' },
            blockquote: { borderLeftColor: '#0a84ff', color: '#98989d' },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'class',
}
