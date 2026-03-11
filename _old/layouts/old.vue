
<template>
  <div class="min-h-screen flex flex-col bg-primary-light dark:bg-primary-dark">
    <Header />
    <main class="flex-1 border-x border-primary-border bg-white dark:bg-primary-dark max-w-3xl mx-auto w-full">
      <slot />
    </main>
    <Footer />
  </div>
</template>


<script setup>
// Rien à ajouter ici pour le layout principal
</script>
