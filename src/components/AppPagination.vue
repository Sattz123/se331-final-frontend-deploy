<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ page: number; totalPages: number; total: number }>()
defineEmits<{ change: [page: number] }>()
const pages = computed(() => {
  const last = Math.max(1, props.totalPages)
  const visible =
    last <= 7
      ? Array.from({ length: last }, (_, i) => i + 1)
      : [
          ...new Set(
            props.page <= 4
              ? [1, 2, 3, 4, 5, last]
              : props.page >= last - 3
                ? [1, last - 4, last - 3, last - 2, last - 1, last]
                : [1, props.page - 1, props.page, props.page + 1, last],
          ),
        ]
          .filter((n) => n >= 1 && n <= last)
          .sort((a, b) => a - b)
  const result: (number | string)[] = []
  for (const n of visible) {
    const previous = result[result.length - 1]
    if (typeof previous === 'number' && n - previous > 1) result.push(`gap-${n}`)
    result.push(n)
  }
  return result
})
</script>
<template>
  <nav aria-label="Pagination" class="my-5 flex flex-wrap items-center gap-4">
    <button type="button" v-if="page > 1" @click="$emit('change', page - 1)" class="action-button">
      Previous
    </button>
    <span> {{ total }} matching records; page {{ page }} of {{ Math.max(1, totalPages) }} </span>
    <div v-if="totalPages > 1" class="flex flex-wrap gap-2" aria-label="Page numbers">
      <template v-for="n in pages" :key="n">
        <button
          v-if="typeof n === 'number'"
          type="button"
          class="action-button"
          :class="n === page ? 'action-button--primary' : ''"
          :aria-label="`Go to page ${n}`"
          :aria-current="n === page ? 'page' : undefined"
          @click="n !== page && $emit('change', n)"
        >
          {{ n }}
        </button>
        <span v-else class="px-2 py-2" aria-hidden="true">…</span>
      </template>
    </div>
    <button
      type="button"
      v-if="page < totalPages"
      @click="$emit('change', page + 1)"
      class="action-button"
    >
      Next
    </button>
  </nav>
</template>
