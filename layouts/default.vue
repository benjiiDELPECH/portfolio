<template>
  <div class="min-h-screen bg-apple-bg dark:bg-apple-dark-bg">
    <!-- Desktop Sidebar -->
    <Sidebar class="hidden md:flex" />
    
    <!-- Main Content Area -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Mobile Bottom Navigation -->
    <MobileNav />
  </div>
</template>

<style scoped>
.main-content {
  @apply min-h-screen;
  /* Offset for sidebar on desktop */
  @apply md:ml-[240px];
  /* Bottom padding for mobile nav */
  @apply pb-[82px] md:pb-0;
}
</style>
