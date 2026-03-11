<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="px-6 md:px-10 pt-10 pb-6">
      <div class="max-w-5xl">
        <h1 class="text-apple-hero text-apple-text dark:text-apple-dark-text mb-1">
          Articles
        </h1>
        <p class="text-apple-title3 text-apple-text-secondary dark:text-apple-dark-text-secondary">
          Technical articles, tutorials, and insights from the world of software engineering.
        </p>
      </div>
    </div>

    <div class="h-px bg-apple-border dark:bg-apple-dark-border mx-6 md:mx-10" />

    <div class="px-6 md:px-10 py-8">
      <div class="max-w-5xl">
        <div v-if="articles && articles.length > 0" class="space-y-3">
          <NuxtLink 
            v-for="article in articles" 
            :key="article.path"
            :to="article.path"
            class="group flex items-center gap-5 bg-apple-card dark:bg-apple-dark-card rounded-apple-lg px-5 py-4 shadow-apple-card hover:shadow-apple-card-hover transition-all duration-200"
          >
            <!-- Article Icon -->
            <div class="w-10 h-10 rounded-apple bg-gradient-to-br from-apple-accent/15 to-apple-teal/15 dark:from-apple-dark-accent/15 dark:to-apple-teal/15 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-apple-accent dark:text-apple-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h2 class="text-apple-headline text-apple-text dark:text-apple-dark-text mb-0.5 group-hover:text-apple-accent dark:group-hover:text-apple-dark-accent transition-colors">
                {{ article.title }}
              </h2>
              <p class="text-apple-footnote text-apple-text-secondary dark:text-apple-dark-text-secondary truncate">
                {{ article.description }}
              </p>
              <div v-if="article.tags" class="flex flex-wrap gap-1.5 mt-2">
                <span 
                  v-for="tag in article.tags.slice(0, 3)" 
                  :key="tag"
                  class="px-2 py-0.5 text-apple-caption2 font-medium bg-black/[0.04] dark:bg-white/[0.06] text-apple-text-tertiary dark:text-apple-dark-text-tertiary rounded-md"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Meta -->
            <div class="flex-shrink-0 flex items-center gap-3">
              <div class="text-right">
                <time class="text-apple-caption1 text-apple-text-tertiary dark:text-apple-dark-text-tertiary block">
                  {{ formatDate(article.date) }}
                </time>
                <span v-if="article.readingTime" class="text-apple-caption2 text-apple-text-tertiary dark:text-apple-dark-text-tertiary">
                  {{ article.readingTime }} min
                </span>
              </div>
              <svg class="w-4 h-4 text-apple-text-tertiary dark:text-apple-dark-text-tertiary group-hover:text-apple-accent dark:group-hover:text-apple-dark-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="bg-apple-card dark:bg-apple-dark-card rounded-apple-xl p-16 text-center shadow-apple-card">
          <div class="w-16 h-16 rounded-full bg-apple-accent/10 dark:bg-apple-dark-accent/15 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-apple-accent dark:text-apple-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 class="text-apple-title3 text-apple-text dark:text-apple-dark-text mb-2">No articles yet</h3>
          <p class="text-apple-callout text-apple-text-secondary dark:text-apple-dark-text-secondary">Check back soon for new content!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Articles',
  description: 'Technical articles, tutorials, and insights from the world of software engineering',
  ogTitle: 'Articles',
  ogDescription: 'Technical articles, tutorials, and insights from the world of software engineering'
})

const { data: articles } = await useAsyncData('articles', async () => {
  try {
    const result = await queryCollection('articles').order('date', 'DESC').all()
    return result
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>
