import apiClient from './AxiosClient'
import type { User, ProfileInput, UserFilters } from '@/types'
export default {
  getUsers(params: UserFilters) {
    return apiClient.get<User[]>('/api/v1/admin/users', { params })
  },
  getUser(id: number) {
    return apiClient.get<User>(`/api/v1/admin/users/${id}`)
  },
  setStatus(id: number, active: boolean) {
    return apiClient.patch<User>(`/api/v1/admin/users/${id}/status`, { active })
  },
  saveUser(id: number | null, body: ProfileInput) {
    return apiClient.patch<User>(id === null ? '/api/v1/me' : `/api/v1/admin/users/${id}`, body)
  },
}
