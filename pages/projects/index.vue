<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="px-6 md:px-10 pt-10 pb-6">
      <div class="max-w-5xl">
        <h1 class="text-apple-hero text-apple-text dark:text-apple-dark-text mb-1">
          Projects
        </h1>
        <p class="text-apple-title3 text-apple-text-secondary dark:text-apple-dark-text-secondary">
          Real-world projects with architecture decisions and lessons learned.
        </p>
      </div>
    </div>

    <div class="h-px bg-apple-border dark:bg-apple-dark-border mx-6 md:mx-10" />

    <div class="px-6 md:px-10 py-8">
      <div class="max-w-5xl">
        <div v-if="projects && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NuxtLink 
            v-for="project in projects" 
            :key="project.path"
            :to="project.path"
            class="group bg-apple-card dark:bg-apple-dark-card rounded-apple-lg p-6 shadow-apple-card hover:shadow-apple-card-hover transition-all duration-200"
          >
            <!-- Icon + Status -->
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-apple bg-gradient-to-br from-apple-accent/15 to-apple-purple/15 dark:from-apple-dark-accent/15 dark:to-apple-purple/15 flex items-center justify-center">
                <svg class="w-5 h-5 text-apple-accent dark:text-apple-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
              <span v-if="project.status" class="text-apple-caption1 font-medium px-2 py-0.5 rounded-full" :class="statusClasses(project.status)">
                {{ project.status }}
              </span>
            </div>

            <h2 class="text-apple-headline text-apple-text dark:text-apple-dark-text mb-1.5 group-hover:text-apple-accent dark:group-hover:text-apple-dark-accent transition-colors">
              {{ project.title }}
            </h2>
            
            <p class="text-apple-footnote text-apple-text-secondary dark:text-apple-dark-text-secondary mb-3 line-clamp-2">
              {{ project.description }}
            </p>

            <div class="flex items-center justify-between">
              <div v-if="project.technologies" class="flex flex-wrap gap-1.5">
                <span 
                  v-for="tech in project.technologies.slice(0, 3)" 
                  :key="tech"
                  class="px-2 py-0.5 text-apple-caption2 font-medium bg-black/[0.04] dark:bg-white/[0.06] text-apple-text-tertiary dark:text-apple-dark-text-tertiary rounded-md"
                >
                  {{ tech }}
                </span>
              </div>
              <time v-if="project.date" class="text-apple-caption1 text-apple-text-tertiary dark:text-apple-dark-text-tertiary">
                {{ formatDate(project.date) }}
              </time>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="bg-apple-card dark:bg-apple-dark-card rounded-apple-xl p-16 text-center shadow-apple-card">
          <div class="w-16 h-16 rounded-full bg-apple-accent/10 dark:bg-apple-dark-accent/15 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-apple-accent dark:text-apple-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <h3 class="text-apple-title3 text-apple-text dark:text-apple-dark-text mb-2">No projects yet</h3>
          <p class="text-apple-callout text-apple-text-secondary dark:text-apple-dark-text-secondary">Check back soon for new projects!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Projects',
  description: 'Real-world projects with architecture decisions and lessons learned',
  ogTitle: 'Projects',
  ogDescription: 'Real-world projects with architecture decisions and lessons learned'
})

const { data: projects } = await useAsyncData('projects', async () => {
  try {
    return await queryCollection('projects').order('date', 'DESC').all()
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
})

const statusClasses = (status) => ({
  'bg-apple-green/10 text-apple-green': status === 'completed',
  'bg-apple-orange/10 text-apple-orange': status === 'in-progress',
  'bg-black/[0.04] dark:bg-white/[0.06] text-apple-text-tertiary dark:text-apple-dark-text-tertiary': status === 'archived'
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  })
}
</script>
