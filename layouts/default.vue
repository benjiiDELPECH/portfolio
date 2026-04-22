<template>
  <div class="min-h-screen bg-[#f3f1ec] text-apple-text dark:bg-[#161616] dark:text-apple-dark-text">
    <!-- Desktop Sidebar -->
    <Sidebar class="hidden md:flex" />
    
    <!-- Main Content Area -->
    <main class="main-content">
      <div class="hidden md:flex items-center justify-between px-8 lg:px-10 py-4 border-b border-black/6 dark:border-white/8 text-[12px] tracking-[0.14em] uppercase text-apple-text-tertiary dark:text-apple-dark-text-tertiary">
        <p>{{ $t('layout.eyebrow') }}</p>
        <a href="mailto:benjamin.delpech@proton.me" class="hover:text-apple-text dark:hover:text-apple-dark-text transition-colors">
          {{ $t('layout.contact') }}
        </a>
      </div>

      <div class="min-h-screen md:mr-6 lg:mr-8 md:my-6 md:rounded-[28px] md:border md:border-black/6 md:dark:border-white/8 md:bg-white/70 md:dark:bg-[#1d1d1d]/88 md:shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:overflow-hidden">
        <slot />
      </div>
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
