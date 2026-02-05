<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gray-900">
    <Header />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup>
</script>
