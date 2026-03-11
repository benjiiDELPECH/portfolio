<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
    <div class="mb-12 border-b border-primary-border pb-8">
      <h1 class="text-4xl font-bold text-primary-DEFAULT mb-4">Articles</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        Technical articles, tutorials, and insights from the world of software engineering.
      </p>
    </div>

    <div v-if="articles && articles.length > 0" class="space-y-6">
      <article 
        v-for="article in articles" 
        :key="article.path"
        class="border border-primary-border p-6 hover:border-primary-accent transition-colors"
      >
        <NuxtLink :to="article.path" class="block">
          <div class="flex justify-between items-start mb-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
            <time>{{ formatDate(article.date) }}</time>
            <span v-if="article.readingTime">{{ article.readingTime }} min</span>
          </div>
          
          <h2 class="text-2xl font-bold text-primary-DEFAULT mb-3 hover:text-primary-accent transition-colors">
            {{ article.title }}
          </h2>
          
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ article.description }}
          </p>
          
          <div v-if="article.tags" class="flex flex-wrap gap-2">
            <span 
              v-for="tag in article.tags" 
              :key="tag"
              class="px-2 py-0.5 text-xs font-mono border border-primary-border text-gray-600 dark:text-gray-400"
            >
              {{ tag }}
            </span>
          </div>
        </NuxtLink>
      </article>
    </div>
    
    <div v-else class="text-center py-20 border border-primary-border p-12">
      <div class="text-gray-400 dark:text-gray-600 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-primary-DEFAULT mb-2">No articles yet</h3>
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

const { data: articles } = await useAsyncData('articles', async () => {
  try {
    const result = await queryCollection('articles')
      .order('date', 'DESC')
      .all()
    return result
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
