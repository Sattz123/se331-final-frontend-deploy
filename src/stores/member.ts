import { ref } from 'vue'
import { defineStore } from 'pinia'
import CatalogService from '@/services/CatalogService'
import type { Overview } from '@/types'
export const useMemberStore = defineStore('member-overview', () => {
  const overview = ref<Overview | null>(null)
  let requestId = 0
  async function load() {
    const request = ++requestId
    const response = await CatalogService.getOverview()
    if (request === requestId) overview.value = response.data
  }
  function clear() {
    requestId++
    overview.value = null
  }
  return { overview, load, clear }
})
