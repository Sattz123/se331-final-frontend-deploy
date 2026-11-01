import { defineStore } from 'pinia'
import AuthenticationService from '@/services/AuthenticationService'
import axios from 'axios'
import type { User } from '@/types'
import { useMemberStore } from '@/stores/member'
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') as string | null,
    user: null as User | null,
  }),
  getters: {
    role: (state) =>
      state.user?.roles.includes('ROLE_ADMIN') ? 'admin' : state.user ? 'user' : undefined,
    currentUserName: (state) => state.user?.firstName || '',
  },
  actions: {
    clear() {
      useMemberStore().clear()
      this.token = null
      this.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    },
    async refresh() {
      const response = await AuthenticationService.getCurrentUser()
      this.user = response.data
      localStorage.setItem('user', JSON.stringify(this.user))
      return this.user
    },
    async restore() {
      if (!this.token) {
        this.clear()
        return
      }
      try {
        await this.refresh()
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) this.clear()
        else throw error
      }
    },
    login(username: string, password: string) {
      return AuthenticationService.authenticate(username, password).then((response) => {
        this.token = response.data.access_token
        this.user = response.data.user
        localStorage.setItem('access_token', this.token as string)
        localStorage.setItem('user', JSON.stringify(this.user))
        return response
      })
    },
    async logout() {
      try {
        await AuthenticationService.logout()
      } finally {
        this.clear()
      }
    },
  },
})
