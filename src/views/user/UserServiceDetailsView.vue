<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import CatalogService from '@/services/CatalogService'
import type { Overview, CatalogItem } from '@/types'
import { useMessageStore } from '@/stores/message'

const route = useRoute()
const router = useRouter()
const messages = useMessageStore()
async function useService(item: CatalogItem) {
  if (!allowed.value || !services.value.some((service) => service.id === item.id)) return
  messages.updateMessage(`Used ${item.title} service.`)
  await router.push({ name: 'user-services' })
}
const data = ref<Overview | null>(null)
const loading = ref(false)
const error = ref('')
let requestId = 0
onBeforeUnmount(() => requestId++)
const number = computed(() => Number(route.params.level))
const allowed = computed(
  () =>
    data.value &&
    Number.isInteger(number.value) &&
    number.value >= 1 &&
    number.value <= data.value.user.level,
)
const services = computed(
  () => data.value?.services.filter((item) => item.level === number.value) ?? [],
)
async function load() {
  const request = ++requestId
  loading.value = true
  error.value = ''
  data.value = null
  try {
    const response = await CatalogService.getOverview()
    if (request === requestId) data.value = response.data
  } catch (e) {
    if (request !== requestId) return
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    if (request === requestId) loading.value = false
  }
}
watch(() => route.params.level, load, { immediate: true })
</script>
<template>
  <RouterLink to="/app/services" class="action-button">Back to services</RouterLink>
  <p v-if="loading" role="status" class="my-4">Loading services...</p>
  <p v-if="error" role="alert" class="my-4 text-red-700">
    {{ error }}
    <button @click="load" class="action-button">Retry</button>
  </p>
  <p v-if="data && !allowed" class="my-4">This level is not available.</p>
  <template v-if="data && allowed">
    <h1 class="my-5 text-3xl font-bold">Level {{ number }} services</h1>
    <article v-for="item in services" :key="item.id" class="mb-4 rounded border bg-white p-5">
      <h2 class="mb-3 text-2xl font-bold">{{ item.title }}</h2>
      <p>{{ item.description }}</p>
      <button
        type="button"
        class="action-button action-button--primary mt-5"
        @click="useService(item)"
      >
        Use service
      </button>
    </article>
    <p v-if="!services.length">No services have been added for this level.</p>
  </template>
</template>
