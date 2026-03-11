export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
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
            primary: {
              DEFAULT: '#1a2233', // bleu foncé
              light: '#f8fafc',   // blanc cassé
              dark: '#111827',    // gris très foncé
              accent: '#2563eb',  // bleu accent
              border: '#e5e7eb',  // gris clair
            },
          },
          borderRadius: {
            DEFAULT: '0.125rem', // très peu arrondi
            lg: '0.25rem',
            xl: '0.375rem',
          },
          fontFamily: {
            sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
          },
          typography: (theme) => ({
            DEFAULT: {
              css: {
                maxWidth: '65ch',
                color: theme('colors.primary.dark'),
                fontFamily: theme('fontFamily.sans').join(','),
                h1: {
                  color: theme('colors.primary.DEFAULT'),
                  fontWeight: '700',
                  fontSize: '2.25rem',
                  letterSpacing: '-0.02em',
                  marginTop: '2.5rem',
                  marginBottom: '1.5rem',
                },
                h2: {
                  color: theme('colors.primary.DEFAULT'),
                  fontWeight: '600',
                  fontSize: '1.5rem',
                  marginTop: '2rem',
                  marginBottom: '1rem',
                },
                h3: {
                  color: theme('colors.primary.DEFAULT'),
                  fontWeight: '500',
                  fontSize: '1.125rem',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem',
                },
                h4: {
                  color: theme('colors.primary.DEFAULT'),
                  fontWeight: '500',
                  marginTop: '1rem',
                  marginBottom: '0.5rem',
                },
                p: {
                  marginTop: '0.5em',
                  marginBottom: '0.5em',
                },
                ul: {
                  marginTop: '0.5em',
                  marginBottom: '0.5em',
                  listStyleType: 'disc',
                },
                ol: {
                  marginTop: '0.5em',
                  marginBottom: '0.5em',
                },
                li: {
                  marginTop: '0.15em',
                  marginBottom: '0.15em',
                },
                a: {
                  color: theme('colors.primary.accent'),
                  fontWeight: '500',
                  textDecoration: 'underline',
                  '&:hover': {
                    color: theme('colors.primary.DEFAULT'),
                  },
                },
                code: {
                  backgroundColor: theme('colors.primary.light'),
                  color: theme('colors.primary.DEFAULT'),
                  padding: '0.1em 0.3em',
                  borderRadius: '0.125rem',
                },
                blockquote: {
                  borderLeft: '4px solid ' + theme('colors.primary.accent'),
                  color: theme('colors.primary.dark'),
                  fontStyle: 'italic',
                },
                table: {
                  borderCollapse: 'collapse',
                  width: '100%',
                },
                th: {
                  border: '1px solid ' + theme('colors.primary.border'),
                  backgroundColor: theme('colors.primary.light'),
                  color: theme('colors.primary.DEFAULT'),
                  fontWeight: '700',
                },
                td: {
                  border: '1px solid ' + theme('colors.primary.border'),
                },
              },
            },
          }),
        },
      },
      plugins: [require('@tailwindcss/typography')],
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
