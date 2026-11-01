<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types'
import avatar from '@/assets/default-profile-avatar.svg'

const props = defineProps<{ user: User; admin?: boolean }>()
const rows = computed(() => [
  { label: 'Full name', value: `${props.user.firstName} ${props.user.lastName}` },
  ...(props.admin ? [{ label: 'Username', value: `@${props.user.username}` }] : []),
  { label: 'Email', value: props.user.email },
  { label: 'Province', value: props.user.province || '-' },
  ...(props.admin
    ? [
        { label: 'Current level', value: `Level ${props.user.level}` },
        { label: 'Status', value: props.user.active ? 'Active' : 'Inactive' },
      ]
    : []),
])
</script>

<template>
  <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
    <img
      :src="user.imageUrl || avatar"
      :alt="`${user.firstName} ${user.lastName} profile`"
      class="h-28 w-28 shrink-0 rounded-full border border-[var(--color-border-default)] object-cover"
    />
    <div class="min-w-0 text-center sm:pt-2 sm:text-left">
      <h2 class="break-words text-2xl font-bold">{{ user.firstName }} {{ user.lastName }}</h2>
      <p class="mt-1 break-words text-[var(--color-text-secondary)]">@{{ user.username }}</p>
      <p class="mt-2 font-semibold text-[var(--color-text-brand)]">Level {{ user.level }}</p>
    </div>
  </div>
  <hr class="my-7 border-[var(--color-border-default)]" />
  <h2 class="text-lg font-bold text-[var(--color-text-primary)]">Personal information</h2>
  <dl
    class="mt-4 divide-y divide-[var(--color-border-default)] border-y border-[var(--color-border-default)]"
  >
    <div
      v-for="row in rows"
      :key="row.label"
      class="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-5"
    >
      <dt class="font-semibold text-[var(--color-text-secondary)]">{{ row.label }}</dt>
      <dd
        class="min-w-0 break-words"
        :class="
          row.label === 'Status'
            ? user.active
              ? 'font-semibold text-green-800'
              : 'font-semibold text-red-700'
            : 'text-[var(--color-text-primary)]'
        "
      >
        {{ row.value }}
      </dd>
    </div>
  </dl>
</template>
