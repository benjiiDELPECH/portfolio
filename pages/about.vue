<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6">About</h1>
    </div>

    <div class="prose prose-lg dark:prose-invert max-w-none">
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Welcome to the Engineering Knowledge Base</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          This knowledge base is a comprehensive collection of technical articles, project documentation, 
          and experimental work covering various aspects of software engineering and development.
        </p>
        <p class="text-gray-600 dark:text-gray-300">
          Whether you're looking for in-depth tutorials, architectural insights, or inspiration for your 
          next project, you'll find valuable content here that spans multiple technologies and domains.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg class="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Articles
          </h3>
          <p class="text-gray-700 dark:text-gray-300">
            Technical articles covering best practices, tutorials, and deep dives into various 
            engineering topics. Learn from real-world experiences and practical examples.
          </p>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg class="w-6 h-6 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Projects
          </h3>
          <p class="text-gray-700 dark:text-gray-300">
            Detailed project documentation including architecture decisions, implementation details, 
            and lessons learned from building real applications.
          </p>
        </div>

        <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg class="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Lab
          </h3>
          <p class="text-gray-700 dark:text-gray-300">
            Experimental work, prototypes, and explorations of cutting-edge technologies. 
            A space for innovation and trying new ideas.
          </p>
        </div>

        <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg class="w-6 h-6 mr-2 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Community
          </h3>
          <p class="text-gray-700 dark:text-gray-300">
            Join the conversation with Giscus comments on articles and projects. Share insights, 
            ask questions, and contribute to the community.
          </p>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Technologies</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          This site is built with modern web technologies:
        </p>
        <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
          <li><strong>Nuxt 3</strong> - The Intuitive Vue Framework for building modern web applications</li>
          <li><strong>Nuxt Content</strong> - File-based CMS for creating content with Markdown</li>
          <li><strong>Tailwind CSS</strong> - Utility-first CSS framework for rapid UI development</li>
          <li><strong>Giscus</strong> - Comments powered by GitHub Discussions</li>
          <li><strong>Static Site Generation</strong> - Pre-rendered for optimal performance and SEO</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'About',
  description: 'Learn about the Engineering Knowledge Base - a comprehensive collection of technical articles, projects, and experiments',
  ogTitle: 'About - Engineering Knowledge Base',
  ogDescription: 'Learn about the Engineering Knowledge Base - a comprehensive collection of technical articles, projects, and experiments'
})
</script>
