<template>
  <!-- Mobile bottom nav bar - visible only on small screens -->
  <nav class="mobile-nav md:hidden">
    <NuxtLink 
      v-for="item in navigation" 
      :key="item.path"
      :to="item.path"
      class="mobile-nav-item"
      :class="{ 'mobile-nav-item-active': isActive(item.path) }"
    >
      <component :is="item.icon" class="w-5 h-5" />
      <span class="text-[10px] mt-0.5">{{ $t(item.name) }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup>
import IconHome from './icons/IconHome.vue'
import IconArticles from './icons/IconArticles.vue'
import IconLab from './icons/IconLab.vue'
import IconAbout from './icons/IconAbout.vue'

const route = useRoute()

const navigation = [
  { name: 'nav.home', path: '/', icon: IconHome },
  { name: 'nav.articles', path: '/articles', icon: IconArticles },
  { name: 'nav.lab', path: '/lab', icon: IconLab },
  { name: 'nav.about', path: '/about', icon: IconAbout },
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.mobile-nav {
  @apply fixed bottom-0 left-0 right-0 z-50;
  @apply flex items-center justify-around;
  @apply h-[82px] pb-5 pt-2;
  @apply border-t border-apple-border dark:border-apple-dark-border;
  background-color: rgba(235, 231, 222, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

:global(.dark) .mobile-nav {
  background-color: rgba(17, 17, 17, 0.96);
}

.mobile-nav-item {
  @apply flex flex-col items-center justify-center;
  @apply text-apple-text-secondary dark:text-apple-dark-text-secondary;
  @apply transition-colors duration-150;
  @apply min-w-[56px];
}

.mobile-nav-item span {
  @apply text-[12px];
}

.mobile-nav-item-active {
  @apply text-apple-text dark:text-apple-dark-text;
}
</style>
