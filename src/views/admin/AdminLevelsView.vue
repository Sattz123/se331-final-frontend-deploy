<script setup lang="ts">
import type { Level } from '@/types'
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import CatalogService from '@/services/CatalogService'
const data = ref<Level[] | null>(null)
const error = ref('')
const loading = ref(false)
async function load() {
  loading.value = true
  error.value = ''
  data.value = null
  try {
    data.value = (await CatalogService.getLevels()).data
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
  <h1 class="mb-5 text-3xl font-bold">Passport levels</h1>
  <p v-if="loading" role="status">Loading levels...</p>
  <p v-if="error" role="alert" class="text-red-700">
    {{ error }}
    <button @click="load" class="action-button">Retry</button>
  </p>
  <div class="grid gap-4 md:grid-cols-2">
    <article v-for="level in data" :key="level.number" class="rounded border bg-white p-5">
      <h2 class="text-xl font-bold">Level {{ level.number }}: {{ level.name }}</h2>
      <p>{{ level.description }}</p>
      <p>{{ level.benefits.length }} benefits; {{ level.services.length }} services</p>
      <RouterLink
        :to="{ name: 'admin-level-details', params: { level: level.number } }"
        class="action-button mt-3"
      >
        View and edit level
      </RouterLink>
    </article>
  </div>
</template>
