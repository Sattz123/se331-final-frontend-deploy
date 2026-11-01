import apiClient from './AxiosClient'
import type { Paper, Result, Attempt } from '@/types'
export default {
  startExam() {
    return apiClient.post<Paper>('/api/v1/member/exam-sessions')
  },
  submitExam(id: string, answers: Record<number, number>) {
    return apiClient.post<Result>(`/api/v1/member/exam-sessions/${id}/submit`, { answers })
  },
  getResult(id: number) {
    return apiClient.get<Result>(`/api/v1/member/attempts/${id}`)
  },
  getHistory(adminId: number | null, page: number) {
    return apiClient.get<Attempt[]>(
      adminId === null ? '/api/v1/member/attempts' : `/api/v1/admin/users/${adminId}/attempts`,
      { params: { page, size: 5 } },
    )
  },
}
