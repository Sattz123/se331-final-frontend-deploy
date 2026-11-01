import apiClient from './AxiosClient'
import type { AuthenticationResponse, RegistrationInput, User } from '@/types'

export default {
  authenticate(username: string, password: string) {
    return apiClient.post<AuthenticationResponse>('/api/v1/auth/authenticate', {
      username,
      password,
    })
  },
  getCurrentUser() {
    return apiClient.get<User>('/api/v1/me')
  },
  logout() {
    return apiClient.post<void>('/api/v1/auth/logout')
  },
  register(details: RegistrationInput) {
    return apiClient.post<User>('/api/v1/auth/register', details)
  },
}
