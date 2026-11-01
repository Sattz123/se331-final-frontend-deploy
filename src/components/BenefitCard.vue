<script setup lang="ts">
import type { CatalogItem, Level } from '@/types'
defineProps<{ benefit: CatalogItem; level: Level; locked?: boolean }>()
</script>
<template>
  <article
    class="rounded border bg-white p-4"
    :class="locked ? 'border-dashed border-[var(--color-bg-brand)]' : ''"
  >
    <p class="mb-2 text-sm text-gray-600">
      Level {{ level.number }} · {{ locked ? 'Next level' : 'Earned' }}
    </p>
    <img
      v-if="benefit.url"
      :src="benefit.url"
      :alt="benefit.title"
      class="mb-3 h-24 w-24 object-contain"
      :class="locked ? 'opacity-60' : ''"
    />
    <p
      v-else
      class="mb-3 flex h-24 w-24 items-center justify-center rounded border border-dashed p-2 text-center text-sm text-gray-600"
    >
      No image uploaded
    </p>
    <h3 class="font-bold">{{ benefit.title }}</h3>
    <p>{{ locked ? `Reach Level ${level.number} to unlock this badge.` : benefit.description }}</p>
  </article>
</template>
