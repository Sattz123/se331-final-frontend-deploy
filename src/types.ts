export interface User {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  province: string
  imageUrl: string | null
  roles: ('ROLE_ADMIN' | 'ROLE_USER')[]
  level: number
  active: boolean
}
export interface AuthenticationResponse {
  access_token: string
  user: User
}
export interface UploadMedia {
  name: string
  url?: string
  size?: number
  type?: string
}
export interface PageResult<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
export interface ProfileInput {
  imageName?: string
  firstName: string
  lastName: string
  email: string
  province: string
}
export interface RegistrationInput {
  imageName?: string
  username: string
  password: string
  profile: ProfileInput
}
export interface UserFilters {
  q: string
  level?: number
  province: string
  active?: boolean
  page: number
  size: number
}
export interface LevelInput {
  name: string
  description: string
  passingScore: number | null
  examTitle?: string | null
}
export interface CatalogItemInput {
  imageName?: string
  title: string
  description: string
}
export interface QuestionInput {
  id?: number | null
  prompt: string
  choices: string[]
  correctIndex: number
}
export interface QuestionBatchInput {
  questions: QuestionInput[]
  deletedIds: number[]
}
export interface CatalogItem {
  id: number
  level: number
  title: string
  description: string
  url: string | null
}
export interface Level {
  number: number
  name: string
  description: string
  badgeUrl: string
  passingScore: number | null
  examTitle: string | null
  questionCount: number
  benefits: CatalogItem[]
  services: CatalogItem[]
}
export interface Overview {
  user: User
  current: Level
  reached: Level[]
  services: CatalogItem[]
  catalog: Level[]
}
export interface Question {
  id: number
  level: number
  prompt: string
  choices: string[]
  correctIndex: number
}
export interface Paper {
  id: string
  sourceLevel: number
  passingScore: number
  title: string
  questions: { id: number; prompt: string; choices: string[] }[]
}
export interface Attempt {
  id: number
  sourceLevel: number
  targetLevel: number
  score: number
  total: number
  passingScore: number
  passed: boolean
  attemptedAt: string
  earnedBadges: CatalogItem[]
}
export interface Result {
  attempt: Attempt
  user: User
}
