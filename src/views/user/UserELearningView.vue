<script setup lang="ts">
import type { CatalogItem } from '@/types'
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import CatalogService from '@/services/CatalogService'
import { useAuthStore } from '@/stores/auth'
const session = useAuthStore()
const data = ref<CatalogItem[] | null>(null)
const error = ref('')
const loading = ref(false)
async function load() {
  loading.value = true
  error.value = ''
  data.value = null
  try {
    data.value = (await CatalogService.getLearning()).data
  } catch (e) {
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
<template>
  <h1 class="mb-5 text-3xl font-bold">eLearning</h1>
  <p v-if="loading">Loading learning content...</p>
  <p v-if="error" role="alert">
    {{ error }}
    <button @click="load" class="action-button">Retry</button>
  </p>
  <article v-for="lesson in data" :key="lesson.id" class="mb-5 rounded border bg-white p-5">
    <h2 class="text-2xl font-bold">{{ lesson.title }}</h2>
    <p class="my-3">{{ lesson.description }}</p>
    <video
      v-if="lesson.url"
      :key="lesson.url"
      :src="lesson.url"
      controls
      preload="metadata"
      class="aspect-video w-full rounded bg-black"
    >
      Your browser cannot play this video.
    </video>
  </article>
  <p v-if="data && !data.length">No lesson has been configured for this level.</p>
  <div v-if="session.user && session.user.level < 4">
    <RouterLink to="/app/exam" class="action-button action-button--primary"
      >Take the exam</RouterLink
    >
    <p class="mt-2 text-sm text-[var(--color-text-secondary)]">Watching the lesson is optional.</p>
  </div>
  <p v-else-if="session.user?.level === 4">
    You reached the final level; no further exam is required.
  </p>
</template>
