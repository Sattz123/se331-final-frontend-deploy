<script setup lang="ts">
import type { PageResult, User } from '@/types'
import axios from 'axios'
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserService from '@/services/UserService'
import Pagination from '@/components/AppPagination.vue'
import UserTable from '@/components/UserTable.vue'
import ProvinceSelect from '@/components/ProvinceSelect.vue'
const route = useRoute()
const router = useRouter()
const q = ref('')
const level = ref('')
const province = ref('')
const status = ref('')
const page = computed(() => Math.max(1, Number.parseInt(String(route.query.page || 1)) || 1))
const data = ref<PageResult<User> | null>(null)
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
    const response = await UserService.getUsers({
      q: String(route.query.q || ''),
      level: route.query.level ? Number(route.query.level) : undefined,
      province: String(route.query.province || ''),
      active:
        route.query.active === 'true' ? true : route.query.active === 'false' ? false : undefined,
      page: requestedPage,
      size: 5,
    })
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
watch(
  () => route.fullPath,
  async () => {
    q.value = String(route.query.q || '')
    level.value = String(route.query.level || '')
    province.value = String(route.query.province || '')
    status.value = ['true', 'false'].includes(String(route.query.active))
      ? String(route.query.active)
      : ''
    await load()
  },
  { immediate: true },
)
function filter() {
  return router.push({
    query: {
      q: q.value.trim() || undefined,
      level: level.value || undefined,
      province: province.value.trim() || undefined,
      active: status.value || undefined,
      page: '1',
    },
  })
}
function change(value: number) {
  return router.push({ query: { ...route.query, page: String(value) } })
}
function clear() {
  return router.push({ query: {} })
}
</script>
<template>
  <h1 class="mb-5 text-3xl font-bold">Users</h1>
  <form @submit.prevent="filter" class="mb-5 flex flex-wrap items-end gap-3">
    <div class="grid flex-1 gap-1">
      <label for="user-name-filter">Name, username or email</label>
      <input
        id="user-name-filter"
        v-model="q"
        placeholder="Search name, username or email"
        class="rounded border bg-white p-2"
      />
    </div>
    <div class="grid gap-1">
      <label for="level-filter">Level</label>
      <select id="level-filter" v-model="level" class="rounded border bg-white p-2 pr-10">
        <option value="">All</option>
        <option v-for="n in 4" :key="n" :value="String(n)">{{ n }}</option>
      </select>
    </div>
    <div class="grid gap-1">
      <label for="province-filter">Province</label>
      <ProvinceSelect id="province-filter" v-model="province" all />
    </div>
    <div class="grid gap-1">
      <label for="status-filter">Status</label>
      <select id="status-filter" v-model="status" class="rounded border bg-white p-2 pr-10">
        <option value="">All</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>
    <button class="action-button action-button--primary">Apply filters</button>
    <button type="button" @click="clear" class="action-button">Clear</button>
  </form>
  <p v-if="loading" role="status">Loading users...</p>
  <p v-if="error" role="alert">
    {{ error }}
    <button @click="load" class="action-button">Retry</button>
  </p>
  <template v-if="data && !loading">
    <UserTable :users="data.content" />
    <Pagination
      :page="page"
      :total="data.totalElements"
      :total-pages="data.totalPages"
      @change="change"
    />
  </template>
</template>
