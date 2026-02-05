<template>
  <div class="giscus-wrapper mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
    <div 
      ref="giscusContainer"
      class="giscus"
    />
  </div>
</template>

<script setup>
const giscusContainer = ref(null)
const colorMode = useColorMode()

onMounted(() => {
  if (!giscusContainer.value) return
  
  // Create script element for Giscus
  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', 'benjiiDELPECH/portfolio') // Update with your repo
  script.setAttribute('data-repo-id', '') // Add your repo ID from giscus.app
  script.setAttribute('data-category', 'Comments')
  script.setAttribute('data-category-id', '') // Add your category ID from giscus.app
  script.setAttribute('data-mapping', 'pathname')
  script.setAttribute('data-strict', '0')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'top')
  script.setAttribute('data-theme', colorMode.value === 'dark' ? 'dark' : 'light')
  script.setAttribute('data-lang', 'en')
  script.setAttribute('data-loading', 'lazy')
  script.crossOrigin = 'anonymous'
  script.async = true
  
  giscusContainer.value.appendChild(script)
})

// Watch for theme changes and update Giscus
watch(() => colorMode.value, (newTheme) => {
  const iframe = document.querySelector('iframe.giscus-frame')
  if (iframe) {
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: newTheme === 'dark' ? 'dark' : 'light' } } },
      'https://giscus.app'
    )
  }
})
</script>

<style scoped>
.giscus-wrapper {
  width: 100%;
}
</style>
