<template>
  <article class="animate-fade-in">
    <!-- Sticky header bar -->
    <div class="sticky top-0 z-30 bg-apple-bg/80 dark:bg-apple-dark-bg/80 backdrop-blur-xl border-b border-apple-border dark:border-apple-dark-border">
      <div class="px-6 md:px-10 py-3 max-w-4xl">
        <NuxtLink 
          to="/articles" 
          class="inline-flex items-center gap-1 text-apple-callout text-apple-accent dark:text-apple-dark-accent hover:underline font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Articles
        </NuxtLink>
      </div>
    </div>

    <!-- Article Header -->
    <header class="px-6 md:px-10 pt-8 pb-6 max-w-4xl">
      <h1 class="text-apple-hero text-apple-text dark:text-apple-dark-text mb-4">
        {{ page?.title }}
      </h1>
      
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <time v-if="page?.date" class="text-apple-footnote text-apple-text-secondary dark:text-apple-dark-text-secondary">
          {{ formatDate(page.date) }}
        </time>
        <span v-if="page?.readingTime" class="text-apple-footnote text-apple-text-tertiary dark:text-apple-dark-text-tertiary">
          · {{ page.readingTime }} min read
        </span>
      </div>
      
      <p v-if="page?.description" class="text-apple-title3 text-apple-text-secondary dark:text-apple-dark-text-secondary font-normal">
        {{ page.description }}
      </p>
      
      <div v-if="page?.tags" class="flex flex-wrap gap-1.5 mt-4">
        <span 
          v-for="tag in page.tags" 
          :key="tag"
          class="px-2.5 py-1 text-apple-caption1 font-medium bg-black/[0.04] dark:bg-white/[0.06] text-apple-text-secondary dark:text-apple-dark-text-secondary rounded-full"
        >
          {{ tag }}
        </span>
      </div>
    </header>

    <div class="h-px bg-apple-border dark:bg-apple-dark-border mx-6 md:mx-10 max-w-4xl" />

    <!-- Article Content -->
    <div class="px-6 md:px-10 py-8 max-w-4xl">
      <div class="prose dark:prose-dark max-w-none prose-headings:text-apple-text dark:prose-headings:text-apple-dark-text prose-a:text-apple-accent dark:prose-a:text-apple-dark-accent prose-a:no-underline hover:prose-a:underline prose-p:leading-relaxed prose-code:rounded-md [&_h2>a]:no-underline [&_h3>a]:no-underline [&_h2>a]:text-inherit [&_h3>a]:text-inherit">
        <ContentRenderer :value="page" />
      </div>
    </div>
  </article>
</template>

<script setup>
const route = useRoute()
const slug = route.params.slug ? (Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug) : ''

const { data: page } = await useAsyncData(`article-${slug}`, async () => {
  try {
    const result = await queryCollection('articles').path(`/articles/${slug}`).first()
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
