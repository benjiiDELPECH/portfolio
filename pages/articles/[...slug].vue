<template>
  <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <header class="mb-12">
      <div class="mb-4">
        <NuxtLink 
          to="/articles" 
          class="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Articles
        </NuxtLink>
      </div>
      
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        {{ page?.title }}
      </h1>
      
      <div class="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
        <time v-if="page?.date" class="text-sm">
          {{ formatDate(page.date) }}
        </time>
        <span v-if="page?.readingTime" class="text-sm">
          {{ page.readingTime }} min read
        </span>
      </div>
      
      <p v-if="page?.description" class="text-xl text-gray-600 dark:text-gray-300">
        {{ page.description }}
      </p>
      
      <div v-if="page?.tags" class="flex flex-wrap gap-2 mt-6">
        <span 
          v-for="tag in page.tags" 
          :key="tag"
          class="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
        >
          {{ tag }}
        </span>
      </div>
    </header>

    <div class="prose dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:no-underline prose-a:text-blue-600 prose-p:my-2 prose-p:leading-normal prose-li:my-1 prose-h2:mt-6 prose-h2:mb-3 prose-h3:mt-4 prose-h3:mb-2 [&>p]:leading-7 [&>ul]:leading-7 [&>ol]:leading-7">
      <ContentRenderer :value="page" />
    </div>

    <!-- Giscus Comments -->
    <Giscus />
  </article>
</template>

<script setup>
const route = useRoute()
const slug = route.params.slug ? (Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug) : ''

const { data: page } = await useAsyncData(`article-${slug}`, async () => {
  try {
    const result = await queryCollection('articles')
      .path(`/articles/${slug}`)
      .first()
    return result
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found' })
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogTitle: page.value.title,
  ogDescription: page.value.description,
  ogType: 'article',
  articlePublishedTime: page.value.date,
  articleTag: page.value.tags
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
