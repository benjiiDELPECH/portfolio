export const useColorMode = () => {
  const colorMode = ref('light')

  if (process.client) {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    colorMode.value = savedTheme || (prefersDark ? 'dark' : 'light')
  }

  return colorMode
}
