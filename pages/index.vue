<template>
  <div>
    <div class="bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Engineering Knowledge Base
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            A comprehensive collection of articles, projects, and experiments documenting engineering insights, best practices, and technical explorations.
          </p>
          <div class="flex justify-center gap-4">
            <NuxtLink 
              to="/articles" 
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse Articles
            </NuxtLink>
            <NuxtLink 
              to="/projects" 
              class="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg font-medium transition-colors"
            >
              View Projects
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center p-6">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Technical Articles</h3>
          <p class="text-gray-600 dark:text-gray-400">
            In-depth articles covering engineering concepts, tutorials, and best practices.
          </p>
        </div>

        <div class="text-center p-6">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Projects</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Real-world projects with code examples, architecture decisions, and lessons learned.
          </p>
        </div>

        <div class="text-center p-6">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Lab Experiments</h3>
          <p class="text-gray-600 dark:text-gray-400">
            Experimental features, prototypes, and explorations of new technologies.
          </p>
        </div>
      </div>

      <!-- Recent Articles Section -->
      <div class="mt-20">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Recent Articles</h2>
          <NuxtLink to="/articles" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            View all →
          </NuxtLink>
        </div>
        
        <div v-if="articles && articles.length > 0" class="grid md:grid-cols-2 gap-6">
          <NuxtLink 
            v-for="article in articles" 
            :key="article._path"
            :to="article._path"
            class="block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
          >
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {{ formatDate(article.date) }}
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {{ article.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              {{ article.description }}
            </p>
            <div v-if="article.tags" class="flex flex-wrap gap-2">
              <span 
                v-for="tag in article.tags" 
                :key="tag"
                class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                {{ tag }}
              </span>
            </div>
          </NuxtLink>
        </div>
        
        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          No articles yet. Check back soon!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Home',
  description: 'A comprehensive engineering knowledge base with articles, projects, and experiments',
  ogTitle: 'Engineering Knowledge Base',
  ogDescription: 'A comprehensive engineering knowledge base with articles, projects, and experiments',
  ogType: 'website'
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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
