<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
    <div class="mb-12 border-b border-primary-border pb-8">
      <h1 class="text-4xl font-bold text-primary-DEFAULT mb-4">Projects</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        Real-world projects with code examples, architecture decisions, and lessons learned.
      </p>
    </div>

    <div v-if="projects && projects.length > 0" class="space-y-6">
      <article 
        v-for="project in projects" 
        :key="project._path"
        class="border border-primary-border p-6 hover:border-primary-accent transition-colors"
      >
        <NuxtLink :to="project._path" class="block">
          <div class="flex justify-between items-start mb-3">
            <time class="text-sm text-gray-500 dark:text-gray-400 font-mono">
              {{ formatDate(project.date) }}
            </time>
            <span v-if="project.status" class="px-2 py-0.5 text-xs font-mono border" :class="{
              'border-primary-accent text-primary-accent': project.status === 'completed',
              'border-primary-border text-gray-600 dark:text-gray-400': project.status === 'in-progress',
              'border-primary-border text-gray-500 dark:text-gray-500': project.status === 'archived'
            }">
              {{ project.status }}
            </span>
          </div>
          
          <h2 class="text-2xl font-bold text-primary-DEFAULT mb-3 hover:text-primary-accent transition-colors">
            {{ project.title }}
          </h2>
          
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ project.description }}
          </p>
          
          <div v-if="project.technologies" class="flex flex-wrap gap-2">
            <span 
              v-for="tech in project.technologies" 
              :key="tech"
              class="px-2 py-0.5 text-xs font-mono border border-primary-border text-gray-600 dark:text-gray-400"
            >
              {{ tech }}
            </span>
          </div>
        </NuxtLink>
      </article>
    </div>
    
    <div v-else class="text-center py-20 border border-primary-border p-12">
      <div class="text-gray-400 dark:text-gray-600 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-primary-DEFAULT mb-2">No projects yet</h3>
      <p class="text-gray-500 dark:text-gray-400">Check back soon for new projects!</p>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Projects',
  description: 'Real-world projects with code examples, architecture decisions, and lessons learned',
  ogTitle: 'Projects - Engineering Knowledge Base',
  ogDescription: 'Real-world projects with code examples, architecture decisions, and lessons learned'
})

const { data: projects } = await useAsyncData('projects', async () => {
  try {
    return await queryContent('/projects')
      .sort({ date: -1 })
      .find()
  } catch (error) {
    console.error('Error fetching projects:', error)
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
