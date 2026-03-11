<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="px-6 md:px-10 pt-10 pb-6">
      <div class="max-w-5xl">
        <h1 class="text-apple-hero text-apple-text dark:text-apple-dark-text mb-1">Lab</h1>
        <p class="text-apple-title3 text-apple-text-secondary dark:text-apple-dark-text-secondary">
          Experimental features, prototypes, and explorations of new technologies.
        </p>
      </div>
    </div>

    <div class="h-px bg-apple-border dark:bg-apple-dark-border mx-6 md:mx-10" />

    <div class="px-6 md:px-10 py-8">
      <div class="max-w-5xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="(item, index) in labItems" 
            :key="item.title"
            class="bg-apple-card dark:bg-apple-dark-card rounded-apple-lg p-6 shadow-apple-card hover:shadow-apple-card-hover transition-all duration-200 group"
          >
            <div class="w-10 h-10 rounded-apple flex items-center justify-center mb-4" :class="item.bgColor">
              <svg class="w-5 h-5" :class="item.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
              </svg>
            </div>
            <h3 class="text-apple-headline text-apple-text dark:text-apple-dark-text mb-1.5">
              {{ item.title }}
            </h3>
            <p class="text-apple-footnote text-apple-text-secondary dark:text-apple-dark-text-secondary mb-4">
              {{ item.description }}
            </p>
            <span class="inline-flex items-center gap-1 text-apple-caption1 font-medium text-apple-accent dark:text-apple-dark-accent bg-apple-accent/8 dark:bg-apple-dark-accent/12 px-2.5 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>

        <!-- About the Lab -->
        <div class="mt-8 bg-gradient-to-r from-apple-accent/5 to-apple-purple/5 dark:from-apple-dark-accent/10 dark:to-apple-purple/10 rounded-apple-xl p-6 md:p-8">
          <h3 class="text-apple-title3 text-apple-text dark:text-apple-dark-text mb-2">About the Lab</h3>
          <p class="text-apple-callout text-apple-text-secondary dark:text-apple-dark-text-secondary leading-relaxed">
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
  ogTitle: 'Lab',
  ogDescription: 'Experimental features, prototypes, and explorations of new technologies'
})

const labItems = [
  {
    title: 'Experiments',
    description: 'Quick experiments and proof-of-concepts testing new ideas and technologies.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    bgColor: 'bg-apple-accent/10 dark:bg-apple-dark-accent/15',
    iconColor: 'text-apple-accent dark:text-apple-dark-accent',
  },
  {
    title: 'Prototypes',
    description: 'Working prototypes and demos exploring innovative solutions and patterns.',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    bgColor: 'bg-apple-orange/10',
    iconColor: 'text-apple-orange',
  },
  {
    title: 'Tech Demos',
    description: 'Demonstrations of cutting-edge technologies and their practical applications.',
    icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    bgColor: 'bg-apple-purple/10',
    iconColor: 'text-apple-purple',
  },
  {
    title: 'Open Source',
    description: 'Public experiments and contributions to the open-source community.',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    bgColor: 'bg-apple-green/10',
    iconColor: 'text-apple-green',
  },
]
</script>
