<script setup lang="ts">
import type { PageResult, Attempt } from '@/types'
import axios from 'axios'
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExamService from '@/services/ExamService'
import ExamHistoryTable from '@/components/ExamHistoryTable.vue'
import Pagination from '@/components/AppPagination.vue'
const route = useRoute()
const router = useRouter()
const page = computed(() => Math.max(1, Number.parseInt(String(route.query.page || 1)) || 1))
const adminId = computed(() => (route.path.startsWith('/admin/') ? Number(route.params.id) : null))
const data = ref<PageResult<Attempt> | null>(null)
const error = ref('')
const loading = ref(false)
let requestId = 0
onBeforeUnmount(() => requestId++)
async function load() {
  const request = ++requestId
  const requestedPage = page.value
  loading.value = true
  error.value = ''
  data.value = null
  try {
    const response = await ExamService.getHistory(adminId.value, requestedPage)
    if (request !== requestId) return
    const total = Number(response.headers['x-total-count'] || 0)
    data.value = {
      content: response.data,
      page: requestedPage,
      size: 5,
      totalElements: total,
      totalPages: Math.ceil(total / 5),
    }
    if (requestedPage > Math.max(1, data.value.totalPages))
      await change(Math.max(1, data.value.totalPages))
  } catch (e) {
    if (request !== requestId) return
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    if (request === requestId) loading.value = false
  }
}
function change(value: number) {
  return router.push({ query: { ...route.query, page: String(value) } })
}
watch(
  () => route.fullPath,
  async () => {
    await load()
  },
  { immediate: true },
)
</script>
<template>
  <h2 class="mb-5 text-2xl font-bold">Exam history</h2>
  <p v-if="loading">Loading attempts...</p>
  <p v-if="error" role="alert">
    {{ error }}
    <button @click="load" class="action-button">Retry</button>
  </p>
  <template v-if="data && !loading">
    <ExamHistoryTable :attempts="data.content" />
    <Pagination
      :page="page"
      :total="data.totalElements"
      :total-pages="data.totalPages"
      @change="change"
    />
  </template>
</template>
