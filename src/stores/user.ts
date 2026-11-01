import { ref } from 'vue'
import { defineStore } from 'pinia'
import UserService from '@/services/UserService'
import axios from 'axios'
import type { User } from '@/types'
export const useUserStore = defineStore('selected-user', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref('')
  let requestId = 0
  async function load(id: number) {
    const request = ++requestId
    user.value = null
    error.value = ''
    loading.value = true
    try {
      const response = await UserService.getUser(id)
      if (request !== requestId) return
      user.value = response.data
    } catch (e) {
      if (request !== requestId) return
      error.value = axios.isAxiosError(e)
        ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
        : 'Request failed. Please try again.'
    } finally {
      if (request === requestId) loading.value = false
    }
  }
  function clear() {
    requestId++
    user.value = null
    error.value = ''
    loading.value = false
  }
  return { user, error, loading, load, clear }
})
