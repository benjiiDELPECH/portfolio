<template>
  <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <header class="mb-12">
      <div class="mb-4">
        <NuxtLink 
          to="/projects" 
          class="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </NuxtLink>
      </div>
      
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        {{ page?.title }}
      </h1>
      
      <div class="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
        <time v-if="page?.date" class="text-sm">
          {{ formatDate(page.date) }}
        </time>
        <span v-if="page?.status" class="px-2 py-1 text-xs rounded" :class="{
          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300': page.status === 'completed',
          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300': page.status === 'in-progress',
          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300': page.status === 'archived'
        }">
          {{ page.status }}
        </span>
      </div>
      
      <p v-if="page?.description" class="text-xl text-gray-600 dark:text-gray-300">
        {{ page.description }}
      </p>
      
      <div v-if="page?.technologies" class="flex flex-wrap gap-2 mt-6">
        <span 
          v-for="tech in page.technologies" 
          :key="tech"
          class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
        >
          {{ tech }}
        </span>
      </div>
      
      <div v-if="page?.github || page?.demo" class="flex gap-4 mt-6">
        <a 
          v-if="page.github"
          :href="page.github"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
          </svg>
          View Source
        </a>
        <a 
          v-if="page.demo"
          :href="page.demo"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Live Demo
        </a>
      </div>
    </header>

    <div class="prose prose-lg dark:prose-invert max-w-none">
      <ContentRenderer :value="page" />
    </div>

    <!-- Giscus Comments -->
    <Giscus />
  </article>
</template>

<script setup>
const route = useRoute()
const { data: page } = await useAsyncData(`project-${route.path}`, () => 
  queryContent(route.path).findOne()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogTitle: page.value.title,
  ogDescription: page.value.description,
  ogType: 'article'
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
