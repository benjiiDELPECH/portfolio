export const useColorMode = () => {
  const colorMode = useState('colorMode', () => 'light')

  if (process.client && !colorMode.value) {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    colorMode.value = savedTheme || (prefersDark ? 'dark' : 'light')
  }

  return colorMode
}
