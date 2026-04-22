<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="px-6 md:px-10 pt-10 pb-6">
      <div class="max-w-5xl">
        <h1 class="text-apple-hero text-apple-text dark:text-apple-dark-text mb-1">
          {{ $t('about.title') }}
        </h1>
        <p class="text-apple-title3 text-apple-text-secondary dark:text-apple-dark-text-secondary">
          {{ $t('about.subtitle') }}
        </p>
      </div>
    </div>

    <div class="h-px bg-apple-border dark:bg-apple-dark-border mx-6 md:mx-10" />

    <div class="px-6 md:px-10 py-8">
      <div class="max-w-5xl">
        <div class="grid md:grid-cols-[1fr_300px] gap-8">
          <!-- Main Content -->
          <div class="space-y-8">
            <!-- Introduction -->
            <section>
              <h2 class="text-apple-title2 text-apple-text dark:text-apple-dark-text mb-4">
                {{ $t('about.intro.title') }}
              </h2>
              <div class="space-y-3">
                <p v-for="(item, index) in introParagraphs" :key="index" class="text-apple-body text-apple-text-secondary dark:text-apple-dark-text-secondary leading-relaxed">
                  {{ item }}
                </p>
              </div>
            </section>

            <!-- Experience -->
            <section>
              <h2 class="text-apple-title2 text-apple-text dark:text-apple-dark-text mb-6">
                {{ $t('about.experience.title') }}
              </h2>
              <div class="space-y-4">
                <div 
                  v-for="(job, index) in work" 
                  :key="index" 
                  class="bg-apple-card dark:bg-apple-dark-card rounded-apple-lg p-5 shadow-apple-card"
                >
                  <div class="flex flex-wrap items-start justify-between mb-2">
                    <h3 class="text-apple-headline text-apple-text dark:text-apple-dark-text">
                      {{ job.position }}
                    </h3>
                    <span class="text-apple-caption1 text-apple-accent dark:text-apple-dark-accent font-medium bg-apple-accent/8 dark:bg-apple-dark-accent/12 px-2 py-0.5 rounded-md">
                      {{ formatDateRange(job.startDate, job.endDate) }}
                    </span>
                  </div>
                  <p class="text-apple-subhead text-apple-text-secondary dark:text-apple-dark-text-secondary font-medium mb-3">
                    <a v-if="job.url" :href="job.url" target="_blank" rel="noopener noreferrer" class="hover:text-apple-accent dark:hover:text-apple-dark-accent transition-colors">
                      {{ job.name }}
                    </a>
                    <span v-else>{{ job.name }}</span>
                  </p>
                  <ul class="space-y-1.5 mb-3">
                    <li v-for="(item, i) in job.summary" :key="i" class="text-apple-footnote text-apple-text-secondary dark:text-apple-dark-text-secondary flex gap-2">
                      <span class="text-apple-text-tertiary dark:text-apple-dark-text-tertiary mt-px">•</span>
                      <span>{{ item }}</span>
                    </li>
                  </ul>
                  <div v-if="job.keywords" class="flex flex-wrap gap-1.5">
                    <span 
                      v-for="tech in job.keywords" 
                      :key="tech"
                      class="px-2 py-0.5 text-apple-caption1 font-medium bg-black/[0.04] dark:bg-white/[0.06] text-apple-text-secondary dark:text-apple-dark-text-secondary rounded-md"
                    >
                      {{ tech }}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Education -->
            <section>
              <h2 class="text-apple-title2 text-apple-text dark:text-apple-dark-text mb-6">
                {{ $t('about.education.title') }}
              </h2>
              <div class="space-y-3">
                <div 
                  v-for="(edu, index) in education" 
                  :key="index" 
                  class="bg-apple-card dark:bg-apple-dark-card rounded-apple-lg p-5 shadow-apple-card"
                >
                  <div class="flex flex-wrap items-start justify-between mb-2">
                    <h3 class="text-apple-headline text-apple-text dark:text-apple-dark-text">
                      {{ edu.degree }} — {{ edu.area }}
                    </h3>
                    <span class="text-apple-caption1 text-apple-text-tertiary dark:text-apple-dark-text-tertiary font-mono">
                      {{ formatDateRange(edu.startDate, edu.endDate) }}
                    </span>
                  </div>
                  <p class="text-apple-subhead text-apple-text-secondary dark:text-apple-dark-text-secondary">
                    <a v-if="edu.url" :href="edu.url" target="_blank" rel="noopener noreferrer" class="hover:text-apple-accent dark:hover:text-apple-dark-accent transition-colors">
                      {{ edu.institution }}
                    </a>
                    <span v-else>{{ edu.institution }}</span>
                  </p>
                  <ul v-if="edu.summary" class="mt-2 space-y-1">
                    <li v-for="(item, i) in edu.summary" :key="i" class="text-apple-footnote text-apple-text-secondary dark:text-apple-dark-text-secondary flex gap-2">
                      <span class="text-apple-text-tertiary dark:text-apple-dark-text-tertiary">•</span>
                      <span>{{ item }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Profile Card -->
            <div class="bg-apple-card dark:bg-apple-dark-card rounded-apple-lg p-6 shadow-apple-card text-center sticky top-6">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-apple-accent to-apple-purple flex items-center justify-center text-white text-xl font-bold shadow-apple-md mx-auto mb-3">
                {{ initials }}
              </div>
              <h3 class="text-apple-headline text-apple-text dark:text-apple-dark-text mb-0.5">
                {{ basics.name }}
              </h3>
              <p class="text-apple-footnote text-apple-text-secondary dark:text-apple-dark-text-secondary mb-1">
                {{ basics.headline }}
              </p>
              <p v-if="basics.location" class="text-apple-caption1 text-apple-text-tertiary dark:text-apple-dark-text-tertiary mb-4">
                📍 {{ basics.location.city }}, {{ basics.location.country }}
              </p>
              <div class="flex justify-center gap-2">
                <a 
                  v-if="getProfile('github')"
                  :href="getProfile('github')?.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="p-2 rounded-apple bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-apple-text-secondary dark:text-apple-dark-text-secondary transition-colors"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" /></svg>
                </a>
                <a 
                  v-if="getProfile('linkedin')"
                  :href="getProfile('linkedin')?.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="p-2 rounded-apple bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-apple-text-secondary dark:text-apple-dark-text-secondary transition-colors"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a 
                  :href="'mailto:' + basics.email"
                  class="p-2 rounded-apple bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-apple-text-secondary dark:text-apple-dark-text-secondary transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </a>
              </div>

              <!-- Download CV -->
              <a 
                href="/resume.pdf" 
                target="_blank"
                class="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-apple-accent hover:bg-apple-accent-hover text-white rounded-full text-apple-footnote font-medium transition-colors duration-150 shadow-apple"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {{ $t('about.downloadCV') }}
              </a>
            </div>

            <!-- Skills -->
            <div class="bg-apple-card dark:bg-apple-dark-card rounded-apple-lg p-5 shadow-apple-card">
              <h3 class="text-apple-headline text-apple-text dark:text-apple-dark-text mb-4">
                {{ $t('about.skills.title') }}
              </h3>
              <div class="space-y-3">
                <div v-for="skill in skills" :key="skill.name">
                  <div class="flex justify-between text-apple-footnote mb-1">
                    <span class="text-apple-text dark:text-apple-dark-text font-medium">{{ skill.name }}</span>
                    <span class="text-apple-text-tertiary dark:text-apple-dark-text-tertiary">{{ skill.level }}</span>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <span 
                      v-for="keyword in skill.keywords?.slice(0, 5)" 
                      :key="keyword"
                      class="px-1.5 py-0.5 text-apple-caption2 bg-black/[0.04] dark:bg-white/[0.06] text-apple-text-secondary dark:text-apple-dark-text-secondary rounded"
                    >
                      {{ keyword }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Certifications -->
            <div v-if="certificates.length > 0" class="bg-apple-card dark:bg-apple-dark-card rounded-apple-lg p-5 shadow-apple-card">
              <h3 class="text-apple-headline text-apple-text dark:text-apple-dark-text mb-4">
                {{ $t('about.certifications.title') }}
              </h3>
              <div class="space-y-3">
                <div v-for="cert in certificates" :key="cert.name" class="border-l-2 border-apple-accent dark:border-apple-dark-accent pl-3">
                  <p class="text-apple-footnote font-medium text-apple-text dark:text-apple-dark-text">{{ cert.name }}</p>
                  <p class="text-apple-caption1 text-apple-text-tertiary dark:text-apple-dark-text-tertiary">{{ cert.issuer }} · {{ cert.date }}</p>
                </div>
              </div>
            </div>

            <!-- Languages -->
            <div class="bg-apple-card dark:bg-apple-dark-card rounded-apple-lg p-5 shadow-apple-card">
              <h3 class="text-apple-headline text-apple-text dark:text-apple-dark-text mb-4">
                {{ $t('about.languages.title') }}
              </h3>
              <div class="space-y-2">
                <div v-for="lang in languages" :key="lang.language" class="flex items-center justify-between">
                  <span class="text-apple-footnote text-apple-text dark:text-apple-dark-text">{{ lang.language }}</span>
                  <span class="text-apple-caption1 text-apple-text-tertiary dark:text-apple-dark-text-tertiary bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-md">
                    {{ formatFluency(lang.fluency) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { t, tm, locale } = useI18n()
const { basics, work, education, skills, languages, certificates, getProfile, formatDateRange } = useResume()

const introParagraphs = computed(() => {
  const translatedParagraphs = tm('about.intro.paragraphs')
  return Array.isArray(translatedParagraphs) && translatedParagraphs.length > 0
    ? translatedParagraphs
    : (basics.value.summary ?? [])
})

const initials = computed(() => {
  const name = basics.value.name
  const parts = name.split(' ')
  return parts.length >= 2 ? (parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '') : name.substring(0, 2).toUpperCase()
})

useSeoMeta({
  title: t('about.title'),
  description: basics.value.summary?.[0] || t('about.subtitle'),
  ogTitle: t('about.title'),
  ogDescription: basics.value.summary?.[0] || t('about.subtitle')
})

const formatFluency = (fluency: string) => {
  const map: Record<string, string> = {
    'Native or Bilingual Proficiency': locale.value === 'fr' ? 'Natif' : 'Native',
    'Full Professional Proficiency': locale.value === 'fr' ? 'Courant' : 'Fluent',
    'Minimum Professional Proficiency': locale.value === 'fr' ? 'Professionnel' : 'Professional',
    'Limited Working Proficiency': locale.value === 'fr' ? 'Intermédiaire' : 'Intermediate',
    'Elementary Proficiency': locale.value === 'fr' ? 'Élémentaire' : 'Elementary'
  }
  return map[fluency] || fluency
}
</script>
