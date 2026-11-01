<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="mx-auto max-w-[560px] px-4 py-20 text-center">
    <p class="text-sm font-semibold text-[var(--color-bg-accent)]">403</p>
    <h1 class="mt-3 text-4xl font-bold text-[var(--color-text-primary)]">Access denied</h1>
    <p class="mt-4 text-[var(--color-text-secondary)]">
      Your account does not have permission to open this page.
    </p>
    <RouterLink to="/" class="action-button action-button--primary mt-7"> Back to home </RouterLink>
  </section>
</template>
