<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p class="text-blue-600 dark:text-blue-400 font-medium mb-4">
              {{ $t('hero.greeting') }}
            </p>
            <h1 class="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              {{ basics.name }}
            </h1>
            <h2 class="text-2xl lg:text-3xl font-semibold text-gray-600 dark:text-gray-300 mb-6">
              {{ basics.headline }}
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl">
              {{ basics.summary?.[0] || $t('hero.description') }}
            </p>
            <div class="flex flex-wrap gap-4">
              <NuxtLink 
                to="/projects" 
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {{ $t('hero.viewProjects') }}
              </NuxtLink>
              <NuxtLink 
                to="/about" 
                class="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg font-medium transition-colors"
              >
                {{ $t('hero.aboutMe') }}
              </NuxtLink>
            </div>
          </div>
          <div class="hidden lg:flex justify-center">
            <div class="w-72 h-72 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 blur-3xl absolute"></div>
            <div class="relative w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
              <span class="text-6xl">👨‍💻</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ $t('skills.title') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {{ $t('skills.subtitle') }}
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Backend/Development Skills -->
          <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {{ skills[0]?.name || $t('skills.development.title') }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              {{ $t('skills.development.description') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="skill in skills[0]?.keywords || []" 
                :key="skill" 
                class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <!-- Frontend Skills -->
          <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {{ skills[1]?.name || $t('skills.infrastructure.title') }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              {{ $t('skills.infrastructure.description') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="skill in skills[1]?.keywords || []" 
                :key="skill" 
                class="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <!-- DevOps/Infrastructure Skills -->
          <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {{ skills[2]?.name || $t('skills.other.title') }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              {{ $t('skills.other.description') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="skill in skills[2]?.keywords || []" 
                :key="skill" 
                class="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Projects Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-12">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ $t('projects.featuredTitle') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              {{ $t('projects.featuredSubtitle') }}
            </p>
          </div>
          <NuxtLink to="/projects" class="hidden sm:flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium">
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
            class="group block p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {{ project.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {{ project.description }}
            </p>
            <div v-if="project.tags" class="flex flex-wrap gap-2">
              <span 
                v-for="tag in project.tags.slice(0, 4)" 
                :key="tag"
                class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
              >
                {{ tag }}
              </span>
            </div>
          </NuxtLink>
        </div>
        
        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          {{ $t('projects.noProjects') }}
        </div>

        <div class="mt-8 text-center sm:hidden">
          <NuxtLink to="/projects" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            {{ $t('common.viewAll') }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Recent Articles Section -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-12">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ $t('articles.recentTitle') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              {{ $t('articles.recentSubtitle') }}
            </p>
          </div>
          <NuxtLink to="/articles" class="hidden sm:flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium">
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
            class="group block p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="text-sm text-blue-600 dark:text-blue-400 mb-2 font-medium">
              {{ formatDate(article.date) }}
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {{ article.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {{ article.description }}
            </p>
            <div v-if="article.tags" class="flex flex-wrap gap-2">
              <span 
                v-for="tag in article.tags.slice(0, 3)" 
                :key="tag"
                class="px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded"
              >
                {{ tag }}
              </span>
            </div>
          </NuxtLink>
        </div>
        
        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          {{ $t('articles.noArticles') }}
        </div>

        <div class="mt-8 text-center sm:hidden">
          <NuxtLink to="/articles" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            {{ $t('common.viewAll') }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Contact CTA Section -->
    <section class="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">
          {{ $t('contact.title') }}
        </h2>
        <p class="text-xl text-blue-100 mb-8">
          {{ $t('contact.subtitle') }}
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a 
            :href="'mailto:' + basics.email" 
            class="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            {{ $t('contact.email') }}
          </a>
          <a 
            v-if="getProfile('linkedin')"
            :href="getProfile('linkedin')?.url" 
            target="_blank"
            rel="noopener noreferrer"
            class="px-6 py-3 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const { t, locale } = useI18n()
const { basics, skills, getProfile } = useResume()

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
