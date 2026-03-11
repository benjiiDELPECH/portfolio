<template>
  <div>
    <!-- Hero Section minimaliste -->
    <section class="bg-white dark:bg-primary-dark border-b border-primary-border">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div class="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <!-- Bloc profil avec photo -->
          <div class="flex flex-col items-center justify-center border border-primary-border bg-white dark:bg-primary-dark p-8 w-full md:w-1/3">
            <img v-if="profileImage" :src="profileImage" alt="Photo de profil" class="w-28 h-28 object-cover border border-primary-border rounded-full mb-4" />
            <div v-else class="w-28 h-28 bg-primary-dark flex items-center justify-center text-white text-3xl font-bold rounded-full mb-4">
              {{ initials }}
            </div>
            <h1 class="text-2xl font-bold text-primary-dark dark:text-primary-light mb-1 text-center">{{ basics.name }}</h1>
            <h2 class="text-base font-medium text-primary-dark dark:text-primary-light mb-2 text-center">{{ basics.headline }}</h2>
            <p class="text-sm text-primary-dark dark:text-primary-light text-center">{{ basics.summary?.[0] || $t('hero.description') }}</p>
          </div>
          <!-- Bloc actions -->
          <div class="flex-1 flex flex-col justify-center items-start gap-6 w-full">
            <p class="text-primary-dark dark:text-primary-light font-semibold mb-2">
              {{ $t('hero.greeting') }}
            </p>
            <div class="flex flex-wrap gap-4">
              <NuxtLink 
                to="/projects" 
                class="px-6 py-3 bg-primary-accent text-white border border-primary-accent hover:bg-white hover:text-primary-accent dark:hover:bg-primary-dark dark:hover:text-primary-accent font-semibold rounded transition-colors"
              >
                {{ $t('hero.viewProjects') }}
              </NuxtLink>
              <NuxtLink 
                to="/about" 
                class="px-6 py-3 bg-white text-primary-accent border border-primary-accent hover:bg-primary-accent hover:text-white dark:bg-primary-dark dark:text-primary-accent dark:hover:bg-primary-accent dark:hover:text-white font-semibold rounded transition-colors"
              >
                {{ $t('hero.aboutMe') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills Section minimaliste -->
    <section class="py-12 bg-white dark:bg-primary-dark border-b border-primary-border">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <h2 class="text-xl font-bold text-primary-dark dark:text-primary-light mb-2">
            {{ $t('skills.title') }}
          </h2>
          <p class="text-primary-dark dark:text-primary-light max-w-2xl mx-auto">
            {{ $t('skills.subtitle') }}
          </p>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="p-4 border border-primary-border bg-white dark:bg-primary-dark">
            <h3 class="text-base font-semibold text-primary-dark dark:text-primary-light mb-2">
              {{ skills[0]?.name || $t('skills.development.title') }}
            </h3>
            <p class="text-sm text-primary-dark dark:text-primary-light mb-3">
              {{ $t('skills.development.description') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="skill in skills[0]?.keywords || []" 
                :key="skill" 
                class="px-2 py-1 text-xs bg-primary-light text-primary-dark border border-primary-border font-mono rounded"
              >
                {{ skill }}
              </span>
            </div>
          </div>
          <div class="p-4 border border-primary-border bg-white dark:bg-primary-dark">
            <h3 class="text-base font-semibold text-primary-dark dark:text-primary-light mb-2">
              {{ skills[1]?.name || $t('skills.infrastructure.title') }}
            </h3>
            <p class="text-sm text-primary-dark dark:text-primary-light mb-3">
              {{ $t('skills.infrastructure.description') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="skill in skills[1]?.keywords || []" 
                :key="skill" 
                class="px-2 py-1 text-xs bg-primary-light text-primary-dark border border-primary-border font-mono rounded"
              >
                {{ skill }}
              </span>
            </div>
          </div>
          <div class="p-4 border border-primary-border bg-white dark:bg-primary-dark">
            <h3 class="text-base font-semibold text-primary-dark dark:text-primary-light mb-2">
              {{ skills[2]?.name || $t('skills.other.title') }}
            </h3>
            <p class="text-sm text-primary-dark dark:text-primary-light mb-3">
              {{ $t('skills.other.description') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="skill in skills[2]?.keywords || []" 
                :key="skill" 
                class="px-2 py-1 text-xs bg-primary-light text-primary-dark border border-primary-border font-mono rounded"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Projects Section minimaliste -->
    <section class="py-12 bg-white dark:bg-primary-dark border-b border-primary-border">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-xl font-bold text-primary-dark dark:text-primary-light mb-2">
              {{ $t('projects.featuredTitle') }}
            </h2>
            <p class="text-primary-dark dark:text-primary-light">
              {{ $t('projects.featuredSubtitle') }}
            </p>
          </div>
          <NuxtLink to="/projects" class="hidden sm:flex items-center text-primary-accent dark:text-primary-accent hover:underline font-medium">
            {{ $t('common.viewAll') }} 
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
        
        <div v-if="contentProjects && contentProjects.length > 0" class="grid md:grid-cols-2 gap-6">
          <NuxtLink 
            v-for="project in contentProjects" 
            :key="project._path"
            :to="project._path"
            class="group block p-5 bg-white dark:bg-primary-dark border border-primary-border hover:border-primary-accent transition-colors"
          >
            <div class="flex items-start justify-between mb-3">
              <svg class="w-5 h-5 text-primary-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-primary-dark dark:text-primary-light mb-2 group-hover:text-primary-accent transition-colors">
              {{ project.title }}
            </h3>
            <p class="text-sm text-primary-dark dark:text-primary-light mb-3 line-clamp-2">
              {{ project.description }}
            </p>
            <div v-if="project.tags" class="flex flex-wrap gap-2">
              <span 
                v-for="tag in project.tags.slice(0, 4)" 
                :key="tag"
                class="px-2 py-1 text-xs bg-primary-light text-primary-dark border border-primary-border font-mono rounded"
              >
                {{ tag }}
              </span>
            </div>
          </NuxtLink>
        </div>
        
        <div v-else class="text-center py-12 text-primary-dark dark:text-primary-light">
          {{ $t('projects.noProjects') }}
        </div>

        <div class="mt-8 text-center sm:hidden">
          <NuxtLink to="/projects" class="text-primary-accent dark:text-primary-accent hover:underline font-medium">
            {{ $t('common.viewAll') }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Recent Articles Section minimaliste -->
    <section class="py-12 bg-white dark:bg-primary-dark border-b border-primary-border">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-xl font-bold text-primary-dark dark:text-primary-light mb-2">
              {{ $t('articles.recentTitle') }}
            </h2>
            <p class="text-primary-dark dark:text-primary-light">
              {{ $t('articles.recentSubtitle') }}
            </p>
          </div>
          <NuxtLink to="/articles" class="hidden sm:flex items-center text-primary-accent dark:text-primary-accent hover:underline font-medium">
            {{ $t('common.viewAll') }}
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
        
        <div v-if="articles && articles.length > 0" class="grid md:grid-cols-2 gap-6">
          <NuxtLink 
            v-for="article in articles" 
            :key="article._path"
            :to="article._path"
            class="group block p-5 bg-white dark:bg-primary-dark border border-primary-border hover:border-primary-accent transition-colors"
          >
            <div class="mb-2">
              <time class="text-xs text-primary-dark dark:text-primary-light">
                {{ formatDate(article.date) }}
              </time>
            </div>
            <h3 class="text-lg font-semibold text-primary-dark dark:text-primary-light mb-2 group-hover:text-primary-accent transition-colors">
              {{ article.title }}
            </h3>
            <p class="text-sm text-primary-dark dark:text-primary-light mb-3 line-clamp-2">
              {{ article.description }}
            </p>
            <div v-if="article.tags" class="flex flex-wrap gap-2">
              <span 
                v-for="tag in article.tags.slice(0, 3)" 
                :key="tag"
                class="px-2 py-1 text-xs bg-primary-light text-primary-dark border border-primary-border font-mono rounded"
              >
                {{ tag }}
              </span>
            </div>
          </NuxtLink>
        </div>
        
        <div v-else class="text-center py-12 text-primary-dark dark:text-primary-light">
          {{ $t('articles.noArticles') }}
        </div>

        <div class="mt-8 text-center sm:hidden">
          <NuxtLink to="/articles" class="text-primary-accent dark:text-primary-accent hover:underline font-medium">
            {{ $t('common.viewAll') }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Contact CTA Section minimaliste -->
    <section class="py-16 bg-white dark:bg-primary-dark">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center border border-primary-border p-12">
        <h2 class="text-2xl font-bold text-primary-dark dark:text-primary-light mb-4">
          {{ $t('contact.title') }}
        </h2>
        <p class="text-primary-dark dark:text-primary-light mb-8">
          {{ $t('contact.subtitle') }}
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a 
            :href="'mailto:' + basics.email" 
            class="px-8 py-4 bg-primary-accent text-white border border-primary-accent hover:bg-white hover:text-primary-accent dark:hover:bg-primary-dark dark:hover:text-primary-accent font-semibold rounded transition-colors"
          >
            {{ $t('contact.email') }}
          </a>
          <a 
            v-if="getProfile('linkedin')"
            :href="getProfile('linkedin')?.url" 
            target="_blank"
            rel="noopener noreferrer"
            class="px-8 py-4 bg-white text-primary-accent border border-primary-accent hover:bg-primary-accent hover:text-white dark:bg-primary-dark dark:text-primary-accent dark:hover:bg-primary-accent dark:hover:text-white font-semibold rounded transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { t, locale } = useI18n()
const { basics, skills, getProfile } = useResume()

const profileImage = '/profile.png'
const initials = computed(() => {
  const name = basics.value.name
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0]
  }
  return name.substring(0, 2).toUpperCase()
})

useSeoMeta({
  title: basics.value.name,
  description: basics.value.summary?.[0] || t('hero.description'),
  ogTitle: basics.value.name,
  ogDescription: basics.value.summary?.[0] || t('hero.description'),
  ogType: 'website'
})

const { data: contentProjects } = await useAsyncData('home-projects', async () => {
  try {
    return await queryContent('/projects')
      .sort({ date: -1 })
      .limit(4)
      .find()
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
})

const { data: articles } = await useAsyncData('home-articles', async () => {
  try {
    return await queryContent('/articles')
      .sort({ date: -1 })
      .limit(4)
      .find()
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
})

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
