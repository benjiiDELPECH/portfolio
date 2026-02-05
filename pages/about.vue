<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {{ $t('about.title') }}
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400">
        {{ $t('about.subtitle') }}
      </p>
    </div>

    <div class="grid lg:grid-cols-3 gap-12">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-12">
        <!-- Introduction -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {{ $t('about.intro.title') }}
          </h2>
          <div class="prose prose-lg dark:prose-invert">
            <p class="text-gray-600 dark:text-gray-300">
              {{ $t('about.intro.content') }}
            </p>
          </div>
        </section>

        <!-- Experience -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg class="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {{ $t('about.experience.title') }}
          </h2>
          
          <div class="space-y-6">
            <div v-for="(job, index) in experience" :key="index" class="relative pl-8 pb-6 border-l-2 border-blue-200 dark:border-blue-800 last:pb-0">
              <div class="absolute -left-2 top-0 w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-5">
                <div class="flex flex-wrap items-center justify-between mb-2">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ job.title }}
                  </h3>
                  <span class="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {{ job.period }}
                  </span>
                </div>
                <p class="text-gray-700 dark:text-gray-300 font-medium mb-2">
                  {{ job.company }}
                </p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  {{ job.description }}
                </p>
                <div v-if="job.technologies" class="mt-3 flex flex-wrap gap-2">
                  <span 
                    v-for="tech in job.technologies" 
                    :key="tech"
                    class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                  >
                    {{ tech }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Education -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg class="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
            {{ $t('about.education.title') }}
          </h2>
          
          <div class="space-y-4">
            <div v-for="(edu, index) in education" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-5">
              <div class="flex flex-wrap items-center justify-between mb-2">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ edu.degree }}
                </h3>
                <span class="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {{ edu.year }}
                </span>
              </div>
              <p class="text-gray-700 dark:text-gray-300">
                {{ edu.school }}
              </p>
              <p v-if="edu.description" class="text-gray-600 dark:text-gray-400 text-sm mt-2">
                {{ edu.description }}
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar -->
      <div class="space-y-8">
        <!-- Profile Card -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
          <div class="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-5xl">👨‍💻</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {{ $t('hero.name') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ $t('hero.title') }}
          </p>
          <div class="flex justify-center gap-3">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="GitHub"
            >
              <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="LinkedIn"
            >
              <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a 
              href="mailto:contact@example.com"
              class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Email"
            >
              <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Skills Summary -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {{ $t('about.skills.title') }}
          </h3>
          <div class="space-y-4">
            <div v-for="skill in skillCategories" :key="skill.name">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-700 dark:text-gray-300">{{ skill.name }}</span>
                <span class="text-gray-500 dark:text-gray-400">{{ skill.level }}%</span>
              </div>
              <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  :style="{ width: skill.level + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Languages -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {{ $t('about.languages.title') }}
          </h3>
          <div class="space-y-3">
            <div v-for="lang in languages" :key="lang.name" class="flex items-center justify-between">
              <span class="text-gray-700 dark:text-gray-300">{{ lang.name }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                {{ lang.level }}
              </span>
            </div>
          </div>
        </div>

        <!-- Download CV -->
        <a 
          href="#" 
          class="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ $t('about.downloadCV') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()

useSeoMeta({
  title: t('about.title'),
  description: t('about.subtitle'),
  ogTitle: t('about.title'),
  ogDescription: t('about.subtitle')
})

// Placeholder data - will be replaced with CV data
const experience = ref([
  {
    title: 'Poste à définir',
    company: 'Entreprise',
    period: '2023 - Présent',
    description: 'Description du poste et des responsabilités principales.',
    technologies: ['Tech1', 'Tech2', 'Tech3']
  },
  {
    title: 'Poste précédent',
    company: 'Autre entreprise',
    period: '2020 - 2023',
    description: 'Description du poste et des responsabilités principales.',
    technologies: ['Tech1', 'Tech2']
  }
])

const education = ref([
  {
    degree: 'Diplôme à définir',
    school: 'École / Université',
    year: '2020',
    description: 'Spécialisation ou mention'
  }
])

const skillCategories = ref([
  { name: 'Backend', level: 90 },
  { name: 'Frontend', level: 80 },
  { name: 'DevOps', level: 75 },
  { name: 'Architecture', level: 85 }
])

const languages = ref([
  { name: 'Français', level: 'Natif' },
  { name: 'Anglais', level: 'Courant' }
])
</script>
