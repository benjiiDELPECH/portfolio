<template>
  <div class="animate-fade-in">
    <!-- Hero Section -->
    <section class="px-6 md:px-10 pt-10 pb-8">
      <div class="max-w-5xl">
        <div class="flex items-start gap-6 mb-8">
          <div class="w-20 h-20 rounded-apple-lg bg-gradient-to-br from-apple-accent to-apple-purple flex items-center justify-center text-white text-2xl font-bold shadow-apple-md flex-shrink-0">
            {{ initials }}
          </div>
          <div>
            <h1 class="text-apple-hero text-apple-text dark:text-apple-dark-text mb-1">
              {{ basics.name }}
            </h1>
            <p class="text-apple-title3 text-apple-text-secondary dark:text-apple-dark-text-secondary mb-3">
              {{ basics.headline }}
            </p>
            <p class="text-apple-body text-apple-text-secondary dark:text-apple-dark-text-secondary max-w-2xl">
              {{ basics.summary?.[0] || $t('hero.description') }}
            </p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex gap-3">
          <NuxtLink 
            to="/projects"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-apple-accent hover:bg-apple-accent-hover text-white rounded-full text-apple-subhead font-medium transition-colors duration-150 shadow-apple"
          >
            {{ $t('hero.viewProjects') }}
          </NuxtLink>
          <NuxtLink 
            to="/about"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-black/[0.05] dark:bg-white/[0.1] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-apple-text dark:text-apple-dark-text rounded-full text-apple-subhead font-medium transition-colors duration-150"
          >
            {{ $t('hero.aboutMe') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Divider -->
    <div class="h-px bg-apple-border dark:bg-apple-dark-border mx-6 md:mx-10" />

    <!-- Skills Section -->
    <section class="px-6 md:px-10 py-8">
      <div class="max-w-5xl">
        <h2 class="text-apple-title1 text-apple-text dark:text-apple-dark-text mb-1">
          {{ $t('skills.title') }}
        </h2>
        <p class="text-apple-callout text-apple-text-secondary dark:text-apple-dark-text-secondary mb-6">
          {{ $t('skills.subtitle') }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            v-for="(skill, index) in skills.slice(0, 3)" 
            :key="skill.name"
            class="group bg-apple-card dark:bg-apple-dark-card rounded-apple-lg p-5 shadow-apple-card hover:shadow-apple-card-hover transition-shadow duration-200"
          >
            <div class="w-8 h-8 rounded-apple flex items-center justify-center mb-3" :class="skillColors[index]">
              <svg class="w-4 h-4" :class="skillIconColors[index]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="skillPaths[index]" />
              </svg>
            </div>
            <h3 class="text-apple-headline text-apple-text dark:text-apple-dark-text mb-1.5">
              {{ skill.name }}
            </h3>
            <p class="text-apple-footnote text-apple-text-secondary dark:text-apple-dark-text-secondary mb-3">
              {{ $t(`skills.${['development', 'infrastructure', 'other'][index]}.description`) }}
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span 
                v-for="keyword in skill.keywords?.slice(0, 6)" 
                :key="keyword"
                class="px-2 py-0.5 text-apple-caption1 font-medium bg-black/[0.04] dark:bg-white/[0.06] text-apple-text-secondary dark:text-apple-dark-text-secondary rounded-md"
              >
                {{ keyword }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Divider -->
    <div class="h-px bg-apple-border dark:bg-apple-dark-border mx-6 md:mx-10" />

    <!-- Projects Section -->
    <section class="px-6 md:px-10 py-8">
      <div class="max-w-5xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-apple-title1 text-apple-text dark:text-apple-dark-text">
            {{ $t('projects.featuredTitle') }}
          </h2>
          <NuxtLink 
            to="/projects" 
            class="text-apple-callout text-apple-accent dark:text-apple-dark-accent hover:underline font-medium"
          >
            {{ $t('common.viewAll') }}
          </NuxtLink>
        </div>

        <div v-if="contentProjects && contentProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NuxtLink 
            v-for="project in contentProjects" 
            :key="project.path"
            :to="project.path"
            class="group bg-apple-card dark:bg-apple-dark-card rounded-apple-lg p-5 shadow-apple-card hover:shadow-apple-card-hover transition-all duration-200"
          >
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-apple bg-gradient-to-br from-apple-accent/20 to-apple-purple/20 dark:from-apple-dark-accent/20 dark:to-apple-purple/20 flex items-center justify-center">
                <svg class="w-4 h-4 text-apple-accent dark:text-apple-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
            </div>
            <h3 class="text-apple-headline text-apple-text dark:text-apple-dark-text mb-1.5 group-hover:text-apple-accent dark:group-hover:text-apple-dark-accent transition-colors">
              {{ project.title }}
            </h3>
            <p class="text-apple-footnote text-apple-text-secondary dark:text-apple-dark-text-secondary mb-3 line-clamp-2">
              {{ project.description }}
            </p>
            <div v-if="project.technologies" class="flex flex-wrap gap-1.5">
              <span 
                v-for="tag in (project.technologies || []).slice(0, 4)" 
                :key="tag"
                class="px-2 py-0.5 text-apple-caption1 font-medium bg-black/[0.04] dark:bg-white/[0.06] text-apple-text-secondary dark:text-apple-dark-text-secondary rounded-md"
              >
                {{ tag }}
              </span>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="bg-apple-card dark:bg-apple-dark-card rounded-apple-lg p-10 text-center shadow-apple-card">
          <p class="text-apple-body text-apple-text-secondary dark:text-apple-dark-text-secondary">
            {{ $t('projects.noProjects') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Divider -->
    <div class="h-px bg-apple-border dark:bg-apple-dark-border mx-6 md:mx-10" />

    <!-- Articles Section -->
    <section class="px-6 md:px-10 py-8">
      <div class="max-w-5xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-apple-title1 text-apple-text dark:text-apple-dark-text">
            {{ $t('articles.recentTitle') }}
          </h2>
          <NuxtLink 
            to="/articles" 
            class="text-apple-callout text-apple-accent dark:text-apple-dark-accent hover:underline font-medium"
          >
            {{ $t('common.viewAll') }}
          </NuxtLink>
        </div>

        <div v-if="articles && articles.length > 0" class="space-y-2">
          <NuxtLink 
            v-for="article in articles" 
            :key="article.path"
            :to="article.path"
            class="group flex items-center gap-4 bg-apple-card dark:bg-apple-dark-card rounded-apple-lg px-5 py-4 shadow-apple-card hover:shadow-apple-card-hover transition-all duration-200"
          >
            <div class="flex-1 min-w-0">
              <h3 class="text-apple-headline text-apple-text dark:text-apple-dark-text mb-0.5 group-hover:text-apple-accent dark:group-hover:text-apple-dark-accent transition-colors truncate">
                {{ article.title }}
              </h3>
              <p class="text-apple-footnote text-apple-text-secondary dark:text-apple-dark-text-secondary truncate">
                {{ article.description }}
              </p>
            </div>
            <div class="flex-shrink-0 flex items-center gap-3">
              <time class="text-apple-caption1 text-apple-text-tertiary dark:text-apple-dark-text-tertiary whitespace-nowrap">
                {{ formatDate(article.date) }}
              </time>
              <svg class="w-4 h-4 text-apple-text-tertiary dark:text-apple-dark-text-tertiary group-hover:text-apple-accent dark:group-hover:text-apple-dark-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="bg-apple-card dark:bg-apple-dark-card rounded-apple-lg p-10 text-center shadow-apple-card">
          <p class="text-apple-body text-apple-text-secondary dark:text-apple-dark-text-secondary">
            {{ $t('articles.noArticles') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="px-6 md:px-10 py-10">
      <div class="max-w-5xl">
        <div class="bg-gradient-to-r from-apple-accent/5 to-apple-purple/5 dark:from-apple-dark-accent/10 dark:to-apple-purple/10 rounded-apple-xl p-8 md:p-10 text-center">
          <h2 class="text-apple-title2 text-apple-text dark:text-apple-dark-text mb-2">
            {{ $t('contact.title') }}
          </h2>
          <p class="text-apple-callout text-apple-text-secondary dark:text-apple-dark-text-secondary mb-6 max-w-lg mx-auto">
            {{ $t('contact.subtitle') }}
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <a 
              :href="'mailto:' + basics.email"
              class="inline-flex items-center gap-2 px-6 py-2.5 bg-apple-accent hover:bg-apple-accent-hover text-white rounded-full text-apple-subhead font-medium transition-colors duration-150 shadow-apple"
            >
              {{ $t('contact.email') }}
            </a>
            <a 
              v-if="getProfile('linkedin')"
              :href="getProfile('linkedin')?.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-6 py-2.5 bg-black/[0.05] dark:bg-white/[0.1] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-apple-text dark:text-apple-dark-text rounded-full text-apple-subhead font-medium transition-colors duration-150"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="px-6 md:px-10 pb-8">
      <div class="max-w-5xl">
        <p class="text-apple-caption1 text-apple-text-tertiary dark:text-apple-dark-text-tertiary text-center">
          © {{ new Date().getFullYear() }} {{ basics.name }} · {{ $t('footer.builtWith') }}
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { t, locale } = useI18n()
const { basics, skills, getProfile } = useResume()

const initials = computed(() => {
  const name = basics.value.name
  const parts = name.split(' ')
  return parts.length >= 2 ? (parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '') : name.substring(0, 2).toUpperCase()
})

const skillColors = [
  'bg-apple-accent/10 dark:bg-apple-dark-accent/15',
  'bg-apple-orange/10',
  'bg-apple-green/10',
]

const skillIconColors = [
  'text-apple-accent dark:text-apple-dark-accent',
  'text-apple-orange',
  'text-apple-green',
]

const skillPaths = [
  'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5',
  'M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z',
  'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342',
]

useSeoMeta({
  title: basics.value.name,
  description: basics.value.summary?.[0] || t('hero.description'),
  ogTitle: basics.value.name,
  ogDescription: basics.value.summary?.[0] || t('hero.description'),
  ogType: 'website'
})

const { data: contentProjects } = await useAsyncData('home-projects', async () => {
  try {
    return await queryCollection('projects').order('date', 'DESC').limit(4).all()
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
})

const { data: articles } = await useAsyncData('home-articles', async () => {
  try {
    return await queryCollection('articles').order('date', 'DESC').limit(4).all()
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
})

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>
