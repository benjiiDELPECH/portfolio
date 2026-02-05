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
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.blue.600'),
              '&:hover': {
                color: theme('colors.blue.800')
              }
            },
            code: {
              backgroundColor: theme('colors.gray.100'),
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '600'
            },
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            }
          }
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.blue.400'),
              '&:hover': {
                color: theme('colors.blue.300')
              }
            },
            code: {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.gray.200')
            },
            h1: { color: theme('colors.gray.100') },
            h2: { color: theme('colors.gray.100') },
            h3: { color: theme('colors.gray.100') },
            h4: { color: theme('colors.gray.100') },
            strong: { color: theme('colors.gray.100') },
            blockquote: {
              color: theme('colors.gray.300'),
              borderLeftColor: theme('colors.gray.700')
            }
          }
        }
      })
    }
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'class'
}
