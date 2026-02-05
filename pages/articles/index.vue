<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Articles</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        Technical articles, tutorials, and insights from the world of software engineering.
      </p>
    </div>

    <div v-if="articles && articles.length > 0" class="space-y-6">
      <article 
        v-for="article in articles" 
        :key="article._path"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
      >
        <NuxtLink :to="article._path" class="block">
          <div class="flex justify-between items-start mb-3">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(article.date) }}
            </div>
            <div v-if="article.readingTime" class="text-sm text-gray-500 dark:text-gray-400">
              {{ article.readingTime }} min read
            </div>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {{ article.title }}
          </h2>
          
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            {{ article.description }}
          </p>
          
          <div v-if="article.tags" class="flex flex-wrap gap-2">
            <span 
              v-for="tag in article.tags" 
              :key="tag"
              class="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </NuxtLink>
      </article>
    </div>
    
    <div v-else class="text-center py-20">
      <div class="text-gray-400 dark:text-gray-600 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No articles yet</h3>
      <p class="text-gray-500 dark:text-gray-400">Check back soon for new content!</p>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Articles',
  description: 'Technical articles, tutorials, and insights from the world of software engineering',
  ogTitle: 'Articles - Engineering Knowledge Base',
  ogDescription: 'Technical articles, tutorials, and insights from the world of software engineering'
})

const { data: articles } = await useAsyncData('articles', () =>
  queryContent('/articles')
    .sort({ date: -1 })
    .find()
)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
