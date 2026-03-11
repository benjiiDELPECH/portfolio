<template>
  <article class="animate-fade-in">
    <!-- Sticky header bar -->
    <div class="sticky top-0 z-30 bg-apple-bg/80 dark:bg-apple-dark-bg/80 backdrop-blur-xl border-b border-apple-border dark:border-apple-dark-border">
      <div class="px-6 md:px-10 py-3 max-w-4xl">
        <NuxtLink 
          to="/projects" 
          class="inline-flex items-center gap-1 text-apple-callout text-apple-accent dark:text-apple-dark-accent hover:underline font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Projects
        </NuxtLink>
      </div>
    </div>

    <!-- Project Header -->
    <header class="px-6 md:px-10 pt-8 pb-6 max-w-4xl">
      <h1 class="text-apple-hero text-apple-text dark:text-apple-dark-text mb-4">
        {{ page?.title }}
      </h1>

      <div class="flex flex-wrap items-center gap-3 mb-4">
        <time v-if="page?.date" class="text-apple-footnote text-apple-text-secondary dark:text-apple-dark-text-secondary">
          {{ formatDate(page.date) }}
        </time>
        <span v-if="page?.status" class="text-apple-caption1 font-medium px-2.5 py-0.5 rounded-full" :class="{
          'bg-apple-green/10 text-apple-green': page.status === 'completed',
          'bg-apple-orange/10 text-apple-orange': page.status === 'in-progress',
          'bg-black/[0.04] text-apple-text-tertiary': page.status === 'archived'
        }">
          {{ page.status }}
        </span>
      </div>

      <p v-if="page?.description" class="text-apple-title3 text-apple-text-secondary dark:text-apple-dark-text-secondary font-normal">
        {{ page.description }}
      </p>

      <div v-if="page?.technologies" class="flex flex-wrap gap-1.5 mt-4">
        <span 
          v-for="tech in page.technologies" 
          :key="tech"
          class="px-2.5 py-1 text-apple-caption1 font-medium bg-black/[0.04] dark:bg-white/[0.06] text-apple-text-secondary dark:text-apple-dark-text-secondary rounded-full"
        >
          {{ tech }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div v-if="page?.github || page?.demo" class="flex gap-3 mt-5">
        <a 
          v-if="page.github"
          :href="page.github"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-black/[0.05] dark:bg-white/[0.1] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-apple-text dark:text-apple-dark-text rounded-full text-apple-subhead font-medium transition-colors duration-150"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
          View Source
        </a>
        <a 
          v-if="page.demo"
          :href="page.demo"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-apple-accent hover:bg-apple-accent-hover text-white rounded-full text-apple-subhead font-medium transition-colors duration-150 shadow-apple"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          Live Demo
        </a>
      </div>
    </header>

    <div class="h-px bg-apple-border dark:bg-apple-dark-border mx-6 md:mx-10 max-w-4xl" />

    <!-- Project Content -->
    <div class="px-6 md:px-10 py-8 max-w-4xl">
      <div class="prose dark:prose-dark max-w-none prose-headings:text-apple-text dark:prose-headings:text-apple-dark-text prose-a:text-apple-accent dark:prose-a:text-apple-dark-accent prose-a:no-underline hover:prose-a:underline prose-p:leading-relaxed prose-code:rounded-md">
        <ContentRenderer :value="page" />
      </div>
    </div>

    <!-- Giscus Comments -->
    <div class="px-6 md:px-10 pb-8 max-w-4xl">
      <Giscus />
    </div>
  </article>
</template>

<script setup>
const route = useRoute()
const slug = route.params.slug ? (Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug) : ''

const { data: page } = await useAsyncData(`project-${slug}`, async () => {
  try {
    const result = await queryCollection('projects').path(`/projects/${slug}`).first()
    return result
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
})

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
