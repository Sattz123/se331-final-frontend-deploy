import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NProgress from 'nprogress'
NProgress.configure({ showSpinner: false })
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/LoginView.vue') },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/AdminUsersView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/levels',
      name: 'admin-levels',
      component: () => import('@/views/admin/AdminLevelsView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/levels/:level',
      name: 'admin-level-details',
      component: () => import('@/views/admin/AdminLevelDetailsView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/levels/:level/edit',
      name: 'admin-level-edit',
      component: () => import('@/views/admin/AdminLevelEditView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/levels/:level/questions',
      name: 'admin-questions',
      component: () => import('@/views/admin/AdminQuestionsView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/app',
      name: 'user-dashboard',
      component: () => import('@/views/user/UserDashboardView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/app/services',
      name: 'user-services',
      component: () => import('@/views/user/UserServicesView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/app/services/:level',
      name: 'user-service-details',
      component: () => import('@/views/user/UserServiceDetailsView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/app/elearning',
      name: 'user-elearning',
      component: () => import('@/views/user/UserELearningView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/app/exam',
      name: 'user-exam',
      component: () => import('@/views/user/UserExamView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/app/exam/result/:id',
      name: 'user-exam-result',
      component: () => import('@/views/user/UserExamResultView.vue'),
      meta: { requiresAuth: true, role: 'user' },
    },
    {
      path: '/admin/users/:id',
      component: () => import('@/views/admin/AdminUserLayoutView.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          name: 'admin-user-information',
          component: () => import('@/views/admin/AdminUserInformationView.vue'),
        },
        {
          path: 'edit',
          name: 'admin-user-edit',
          component: () => import('@/views/user/UserProfileEditView.vue'),
        },
        {
          path: 'history',
          name: 'admin-user-history',
          component: () => import('@/views/user/UserProfileHistoryView.vue'),
        },
      ],
    },
    {
      path: '/app/profile',
      component: () => import('@/views/user/UserProfileLayoutView.vue'),
      meta: { requiresAuth: true, role: 'user' },
      children: [
        { path: '', redirect: { name: 'user-profile-details' } },
        {
          path: 'details',
          name: 'user-profile-details',
          component: () => import('@/views/user/UserProfileDetailsView.vue'),
        },
        {
          path: 'edit',
          name: 'user-profile-edit',
          component: () => import('@/views/user/UserProfileEditView.vue'),
        },
        {
          path: 'history',
          name: 'user-profile-history',
          component: () => import('@/views/user/UserProfileHistoryView.vue'),
        },
        {
          path: 'badges',
          name: 'user-profile-badges',
          component: () => import('@/views/user/UserServicesView.vue'),
        },
        {
          path: 'services',
          name: 'user-profile-services',
          component: () => import('@/views/user/UserServicesView.vue'),
        },
      ],
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: () => import('@/views/UnauthorizedView.vue'),
    },
    {
      path: '/connection-error',
      name: 'connection-error',
      component: () => import('@/views/NetworkErrorView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return to.path === from.path ? false : { top: 0 }
  },
})
router.beforeEach(async (to) => {
  NProgress.start()
  const session = useAuthStore()
  if (to.name === 'connection-error') return
  try {
    await session.restore()
  } catch {
    return { name: 'connection-error', query: { retry: to.fullPath } }
  }
  if (to.meta.requiresAuth && !session.user)
    return { name: 'home', query: { redirect: to.fullPath } }
  if (to.meta.role && to.meta.role !== session.role) return { name: 'unauthorized' }
})
router.afterEach(() => NProgress.done())
router.onError(() => NProgress.done())
export default router
