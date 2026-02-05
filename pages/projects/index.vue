<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Projects</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        Real-world projects with code examples, architecture decisions, and lessons learned.
      </p>
    </div>

    <div v-if="projects && projects.length > 0" class="grid md:grid-cols-2 gap-6">
      <article 
        v-for="project in projects" 
        :key="project._path"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
      >
        <NuxtLink :to="project._path" class="block">
          <div class="flex justify-between items-start mb-3">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(project.date) }}
            </div>
            <div v-if="project.status" class="px-2 py-1 text-xs rounded" :class="{
              'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300': project.status === 'completed',
              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300': project.status === 'in-progress',
              'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300': project.status === 'archived'
            }">
              {{ project.status }}
            </div>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {{ project.title }}
          </h2>
          
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            {{ project.description }}
          </p>
          
          <div v-if="project.technologies" class="flex flex-wrap gap-2">
            <span 
              v-for="tech in project.technologies" 
              :key="tech"
              class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
            >
              {{ tech }}
            </span>
          </div>
        </NuxtLink>
      </article>
    </div>
    
    <div v-else class="text-center py-20">
      <div class="text-gray-400 dark:text-gray-600 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No projects yet</h3>
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
