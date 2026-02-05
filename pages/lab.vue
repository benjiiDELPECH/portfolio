<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Lab</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        Experimental features, prototypes, and explorations of new technologies. This is where I test ideas and push boundaries.
      </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Experiments</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Quick experiments and proof-of-concepts testing new ideas and technologies.
        </p>
        <span class="text-sm text-purple-600 dark:text-purple-400 font-medium">Coming Soon</span>
      </div>

      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Prototypes</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Working prototypes and demos exploring innovative solutions and patterns.
        </p>
        <span class="text-sm text-blue-600 dark:text-blue-400 font-medium">Coming Soon</span>
      </div>

      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tech Demos</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Demonstrations of cutting-edge technologies and their practical applications.
        </p>
        <span class="text-sm text-green-600 dark:text-green-400 font-medium">Coming Soon</span>
      </div>
    </div>

    <div class="mt-16 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8">
      <div class="flex items-start">
        <svg class="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">About the Lab</h3>
          <p class="text-gray-700 dark:text-gray-300">
            The Lab is where experimental ideas come to life. These projects are works in progress, 
            exploring new technologies, patterns, and approaches. Some experiments may evolve into 
            full projects, while others serve as learning experiences.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Lab',
  description: 'Experimental features, prototypes, and explorations of new technologies',
  ogTitle: 'Lab - Engineering Knowledge Base',
  ogDescription: 'Experimental features, prototypes, and explorations of new technologies'
})
</script>
