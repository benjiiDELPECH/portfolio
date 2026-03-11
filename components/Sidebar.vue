<template>
  <aside class="sidebar">
    <!-- Profile -->
    <div class="px-4 pt-6 pb-4">
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-apple-accent to-apple-purple flex items-center justify-center text-white text-sm font-bold shadow-apple">
          {{ initials }}
        </div>
        <div class="min-w-0">
          <p class="text-apple-headline text-apple-text dark:text-apple-dark-text truncate">{{ basics.name }}</p>
          <p class="text-apple-caption1 text-apple-text-secondary dark:text-apple-dark-text-secondary truncate">{{ basics.headline }}</p>
        </div>
      </NuxtLink>
    </div>

    <!-- Search -->
    <div class="px-3 pb-3">
      <div class="relative">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-apple-text-tertiary dark:text-apple-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          :placeholder="$t('nav.search') || 'Search'" 
          class="w-full h-7 pl-8 pr-3 text-apple-caption1 bg-black/[0.04] dark:bg-white/[0.06] rounded-md border-0 text-apple-text dark:text-apple-dark-text placeholder-apple-text-tertiary dark:placeholder-apple-dark-text-tertiary focus:outline-none focus:ring-1 focus:ring-apple-accent/40"
          readonly
        />
      </div>
    </div>

    <!-- Divider -->
    <div class="h-px bg-apple-border dark:bg-apple-dark-border mx-3" />

    <!-- Navigation -->
    <nav class="px-2 py-2 flex-1">
      <ul class="space-y-0.5">
        <li v-for="item in navigation" :key="item.path">
          <NuxtLink 
            :to="item.path"
            class="sidebar-item"
            :class="{ 'sidebar-item-active': isActive(item.path) }"
          >
            <component :is="item.icon" class="sidebar-icon" />
            <span>{{ $t(item.name) }}</span>
          </NuxtLink>
        </li>
      </ul>

      <!-- Section: Connect -->
      <div class="mt-6 px-2">
        <p class="text-apple-caption2 font-semibold text-apple-text-tertiary dark:text-apple-dark-text-tertiary uppercase tracking-wider mb-2">
          {{ $t('footer.connect') || 'Connect' }}
        </p>
      </div>
      <ul class="space-y-0.5">
        <li v-if="getProfile('github')">
          <a 
            :href="getProfile('github')?.url" 
            target="_blank" 
            rel="noopener noreferrer"
            class="sidebar-item"
          >
            <svg class="sidebar-icon" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
            <span>GitHub</span>
          </a>
        </li>
        <li v-if="getProfile('linkedin')">
          <a 
            :href="getProfile('linkedin')?.url" 
            target="_blank" 
            rel="noopener noreferrer"
            class="sidebar-item"
          >
            <svg class="sidebar-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span>LinkedIn</span>
          </a>
        </li>
        <li>
          <a 
            :href="'mailto:' + basics.email"
            class="sidebar-item"
          >
            <svg class="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Email</span>
          </a>
        </li>
      </ul>
    </nav>

    <!-- Bottom Controls -->
    <div class="px-3 py-3 border-t border-apple-border dark:border-apple-dark-border">
      <div class="flex items-center justify-between">
        <!-- Language -->
        <div ref="langMenuRef" class="relative">
          <button 
            @click="langMenuOpen = !langMenuOpen"
            class="flex items-center gap-1.5 px-2 py-1 rounded-md text-apple-caption1 text-apple-text-secondary dark:text-apple-dark-text-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span class="uppercase font-medium">{{ locale }}</span>
          </button>
          <div v-if="langMenuOpen" class="absolute bottom-full left-0 mb-1 w-32 bg-white dark:bg-apple-dark-card rounded-apple shadow-apple-lg border border-apple-border dark:border-apple-dark-border overflow-hidden z-50">
            <button
              v-for="loc in availableLocales"
              :key="loc.code"
              @click="setLocale(loc.code); langMenuOpen = false"
              class="w-full text-left px-3 py-2 text-apple-footnote text-apple-text dark:text-apple-dark-text hover:bg-apple-accent-light dark:hover:bg-apple-dark-accent-light transition-colors"
            >
              {{ loc.name }}
            </button>
          </div>
        </div>

        <!-- Dark mode -->
        <button 
          @click="toggleDarkMode"
          class="p-1.5 rounded-md text-apple-text-secondary dark:text-apple-dark-text-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle dark mode"
        >
          <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import IconHome from './icons/IconHome.vue'
import IconArticles from './icons/IconArticles.vue'
import IconProjects from './icons/IconProjects.vue'
import IconLab from './icons/IconLab.vue'
import IconAbout from './icons/IconAbout.vue'

const route = useRoute()
const { locale, locales, setLocale } = useI18n()
const { basics, getProfile } = useResume()

const initials = computed(() => {
  const name = basics.value.name
  const parts = name.split(' ')
  return parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : name.substring(0, 2).toUpperCase()
})

const navigation = [
  { name: 'nav.home', path: '/', icon: IconHome },
  { name: 'nav.articles', path: '/articles', icon: IconArticles },
  { name: 'nav.projects', path: '/projects', icon: IconProjects },
  { name: 'nav.lab', path: '/lab', icon: IconLab },
  { name: 'nav.about', path: '/about', icon: IconAbout },
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const availableLocales = computed(() => locales.value.filter((loc) => loc.code !== locale.value))

const langMenuOpen = ref(false)
const langMenuRef = ref(null)
const isDark = ref(false)

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
  if (isDark.value) document.documentElement.classList.add('dark')

  document.addEventListener('click', (e) => {
    if (langMenuRef.value && !langMenuRef.value.contains(e.target)) langMenuOpen.value = false
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

<style scoped>
.sidebar {
  @apply fixed top-0 left-0 bottom-0 w-[240px] flex flex-col;
  @apply bg-[rgba(246,246,246,0.92)] dark:bg-[rgba(30,30,30,0.92)];
  @apply border-r border-apple-border dark:border-apple-dark-border;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  z-index: 40;
}

.sidebar-item {
  @apply flex items-center gap-2.5 px-2.5 py-[6px] rounded-lg;
  @apply text-apple-subhead text-apple-text dark:text-apple-dark-text;
  @apply transition-all duration-150 ease-out;
  @apply hover:bg-black/[0.04] dark:hover:bg-white/[0.06];
  @apply cursor-pointer select-none;
}

.sidebar-item-active {
  @apply bg-apple-accent/10 dark:bg-apple-dark-accent/15;
  @apply text-apple-accent dark:text-apple-dark-accent;
  @apply font-medium;
}

.sidebar-item-active .sidebar-icon {
  @apply text-apple-accent dark:text-apple-dark-accent;
}

.sidebar-icon {
  @apply w-[18px] h-[18px] flex-shrink-0;
  @apply text-apple-text-secondary dark:text-apple-dark-text-secondary;
}
</style>
