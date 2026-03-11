<template>
  <article class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
    <header class="mb-12 pb-8 border-b border-primary-border">
      <div class="mb-4">
        <NuxtLink 
          to="/articles" 
          class="text-primary-accent hover:underline inline-flex items-center font-mono text-sm"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Articles
        </NuxtLink>
      </div>
      
      <h1 class="text-4xl md:text-5xl font-bold text-primary-DEFAULT mb-4">
        {{ page?.title }}
      </h1>
      
      <div class="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 mb-6 font-mono text-sm">
        <time v-if="page?.date">
          {{ formatDate(page.date) }}
        </time>
        <span v-if="page?.readingTime">
          {{ page.readingTime }} min
        </span>
      </div>
      
      <p v-if="page?.description" class="text-xl text-gray-600 dark:text-gray-400">
        {{ page.description }}
      </p>
      
      <div v-if="page?.tags" class="flex flex-wrap gap-2 mt-6">
        <span 
          v-for="tag in page.tags" 
          :key="tag"
          class="px-2 py-0.5 text-xs font-mono border border-primary-border text-gray-600 dark:text-gray-400"
        >
          {{ tag }}
        </span>
      </div>
    </header>

    <div class="prose dark:prose-invert max-w-none prose-headings:text-primary-DEFAULT prose-headings:no-underline prose-a:text-primary-accent prose-a:no-underline hover:prose-a:underline prose-p:my-2 prose-p:leading-normal prose-li:my-1 prose-h2:mt-6 prose-h2:mb-3 prose-h3:mt-4 prose-h3:mb-2 [&>p]:leading-7 [&>ul]:leading-7 [&>ol]:leading-7 [&_h2>a]:no-underline [&_h3>a]:no-underline [&_h2>a]:text-inherit [&_h3>a]:text-inherit">
      <ContentRenderer :value="page" />
    </div>
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
