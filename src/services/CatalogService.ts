import apiClient from './AxiosClient'
import type {
  Level,
  Question,
  Overview,
  CatalogItem,
  LevelInput,
  CatalogItemInput,
  QuestionInput,
  QuestionBatchInput,
} from '@/types'
export default {
  getLevels() {
    return apiClient.get<Level[]>('/api/v1/admin/levels')
  },
  getLevel(number: number) {
    return apiClient.get<Level>(`/api/v1/admin/levels/${number}`)
  },
  saveLevel(number: number, body: LevelInput) {
    return apiClient.patch<Level>(`/api/v1/admin/levels/${number}`, body)
  },
  saveItem(
    number: number,
    kind: 'benefits' | 'services',
    id: number | null,
    body: CatalogItemInput,
  ) {
    return id === null
      ? apiClient.post<CatalogItem>(`/api/v1/admin/levels/${number}/${kind}`, body)
      : apiClient.patch<CatalogItem>(`/api/v1/admin/levels/${number}/${kind}/${id}`, body)
  },
  deleteItem(number: number, kind: 'benefits' | 'services', id: number) {
    return apiClient.delete(`/api/v1/admin/levels/${number}/${kind}/${id}`)
  },
  getQuestions(number: number) {
    return apiClient.get<Question[]>(`/api/v1/admin/levels/${number}/questions`)
  },
  saveQuestions(number: number, body: QuestionBatchInput) {
    return apiClient.patch<Question[]>(`/api/v1/admin/levels/${number}/questions`, body)
  },
  getLevelLearning(number: number) {
    return apiClient.get<CatalogItem[]>(`/api/v1/admin/levels/${number}/learning`)
  },
  saveQuestion(number: number, id: number | null, body: QuestionInput) {
    return id === null
      ? apiClient.post(`/api/v1/admin/levels/${number}/questions`, body)
      : apiClient.patch(`/api/v1/admin/levels/${number}/questions/${id}`, body)
  },
  deleteQuestion(number: number, id: number) {
    return apiClient.delete(`/api/v1/admin/levels/${number}/questions/${id}`)
  },
  getOverview() {
    return apiClient.get<Overview>('/api/v1/member/overview')
  },
  getLearning() {
    return apiClient.get<CatalogItem[]>('/api/v1/member/learning')
  },
}
