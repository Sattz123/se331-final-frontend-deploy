<script setup lang="ts">
import type { Overview } from '@/types'
import axios from 'axios'
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import CatalogService from '@/services/CatalogService'
import BenefitCard from '@/components/BenefitCard.vue'
const route = useRoute()
const data = ref<Overview | null>(null)
const error = ref('')
const loading = ref(false)
let requestId = 0
onBeforeUnmount(() => requestId++)
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
watch(() => route.fullPath, load, { immediate: true })
const badges = computed(() => route.name === 'user-profile-badges')
const requested = computed(() => (route.params.level ? Number(route.params.level) : null))
const allowed = computed(
  () =>
    requested.value === null ||
    (Number.isInteger(requested.value) &&
      requested.value >= 1 &&
      requested.value <= (data.value?.user.level || 0)),
)
const services = computed(() =>
  (data.value?.services || []).filter(
    (x) => requested.value === null || x.level === requested.value,
  ),
)
</script>
<template>
  <h2 class="mb-5 text-2xl font-bold">
    {{ badges ? 'Your badges' : 'Available services' }}
  </h2>
  <p v-if="loading">Loading...</p>
  <p v-if="error" role="alert">
    {{ error }} <button class="action-button" @click="load">Retry</button>
  </p>
  <p v-if="data && !allowed">This level is not available.</p>
  <div v-if="data && allowed" class="grid gap-4 sm:grid-cols-2">
    <template v-if="badges">
      <template v-for="level in data.reached" :key="level.number">
        <BenefitCard
          v-for="benefit in level.benefits"
          :key="benefit.id"
          :benefit="benefit"
          :level="level"
        />
      </template>
    </template>
    <template v-else>
      <article v-for="item in services" :key="item.id" class="rounded border bg-white p-5">
        <p class="text-sm text-gray-600">Level {{ item.level }}</p>
        <h3 class="font-bold">{{ item.title }}</h3>
        <p>{{ item.description }}</p>
        <RouterLink
          :to="{ name: 'user-service-details', params: { level: item.level } }"
          class="action-button mt-3"
          >View service details</RouterLink
        >
      </article>
    </template>
  </div>
</template>
