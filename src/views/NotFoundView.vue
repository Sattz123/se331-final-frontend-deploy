<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="mx-auto max-w-[560px] px-4 py-20 text-center">
    <p class="text-sm font-semibold text-[var(--color-bg-accent)]">404</p>
    <h1 class="mt-3 text-4xl font-bold text-[var(--color-text-primary)]">Page not found</h1>
    <p class="mt-4 text-[var(--color-text-secondary)]">
      The page you requested does not exist or may have moved.
    </p>
    <RouterLink to="/" class="action-button action-button--primary mt-7"> Back to home </RouterLink>
  </section>
</template>
