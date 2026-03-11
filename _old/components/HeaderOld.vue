<template>
  <header class="sticky top-0 z-50 border-b border-primary-border bg-white dark:bg-primary-dark">
    <nav class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold tracking-tight text-primary-dark dark:text-primary-light hover:text-primary-accent dark:hover:text-primary-accent transition-colors">
            {{ initials }}
          </NuxtLink>
        </div>
        
        <div class="hidden md:flex items-center space-x-6">
          <NuxtLink 
            v-for="item in navigation" 
            :key="item.path"
            :to="item.path" 
            class="text-primary-dark dark:text-primary-light hover:text-primary-accent dark:hover:text-primary-accent font-medium px-2 py-1 transition-colors"
            active-class="text-primary-accent border-b-2 border-primary-accent"
          >
            {{ $t(item.name) }}
          </NuxtLink>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Language Switcher -->
          <div ref="langMenuRef" class="relative">
            <button 
              @click="langMenuOpen = !langMenuOpen"
              class="p-2 border border-primary-border bg-transparent hover:bg-primary-light dark:hover:bg-primary-dark transition-colors flex items-center gap-1"
              aria-label="Change language"
            >
              <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">{{ locale }}</span>
            </button>
            
            <div v-if="langMenuOpen" class="absolute right-0 mt-2 w-32 bg-white dark:bg-primary-dark border border-primary-border py-1 z-50">
              <button
                v-for="loc in availableLocales"
                :key="loc.code"
                @click="setLocale(loc.code)"
                class="w-full text-left px-4 py-2 text-sm text-primary-dark dark:text-primary-light hover:bg-primary-light dark:hover:bg-primary-dark transition-colors border-b border-primary-border last:border-b-0"
                :class="{ 'bg-primary-accent text-white': locale === loc.code }"
              >
                {{ loc.name }}
              </button>
            </div>
          </div>

          <button 
            @click="toggleDarkMode"
            class="p-2 border border-primary-border bg-transparent hover:bg-primary-light dark:hover:bg-primary-dark transition-colors"
            aria-label="Toggle dark mode"
          >
            <svg v-if="isDark" class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 border border-primary-border bg-transparent hover:bg-primary-light dark:hover:bg-primary-dark transition-colors"
            aria-label="Toggle menu"
          >
            <svg class="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-primary-border">
        <div class="flex flex-col space-y-2">
          <NuxtLink 
            v-for="item in navigation" 
            :key="item.path"
            :to="item.path" 
            class="text-primary-dark dark:text-primary-light hover:text-primary-accent dark:hover:text-primary-accent font-medium px-2 py-1 transition-colors"
            active-class="text-primary-accent border-b-2 border-primary-accent"
            @click="mobileMenuOpen = false"
          >
            {{ $t(item.name) }}
          </NuxtLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
const { locale, locales, setLocale } = useI18n()
const { basics } = useResume()

// Generate initials from name
const initials = computed(() => {
  const name = basics.value.name
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0]
  }
  return name.substring(0, 2).toUpperCase()
})

const navigation = [
  { name: 'nav.home', path: '/' },
  { name: 'nav.articles', path: '/articles' },
  { name: 'nav.projects', path: '/projects' },
  { name: 'nav.lab', path: '/lab' },
  { name: 'nav.about', path: '/about' }
]

const availableLocales = computed(() => {
  return locales.value.filter((loc) => loc.code !== locale.value)
})

const mobileMenuOpen = ref(false)
const langMenuOpen = ref(false)
const isDark = ref(false)
const langMenuRef = ref(null)

// Close language menu when clicking outside
onMounted(() => {
  // Check for saved theme preference or default to system preference
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
  
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }

  // Close language menu when clicking outside
  document.addEventListener('click', (e) => {
    if (langMenuRef.value && !langMenuRef.value.contains(e.target)) {
      langMenuOpen.value = false
    }
  })
})

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
</script>
