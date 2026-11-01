<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, RouterView, useRouter, isNavigationFailure } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'
import axios from 'axios'
import avatar from '@/assets/default-profile-avatar.svg'
const session = useAuthStore()
const messages = useMessageStore()
let messageTimer: ReturnType<typeof setTimeout> | undefined
watch(
  () => messages.message,
  (value) => {
    clearTimeout(messageTimer)
    if (value) messageTimer = setTimeout(() => messages.resetMessage(), 3000)
  },
)
onBeforeUnmount(() => clearTimeout(messageTimer))
const router = useRouter()
const error = ref('')
const accountMenu = ref<HTMLDetailsElement | null>(null)
function closeAccountMenu() {
  if (accountMenu.value) accountMenu.value.open = false
}
function closeAccountMenuOutside(event: PointerEvent) {
  if (event.target instanceof Node && !accountMenu.value?.contains(event.target)) closeAccountMenu()
}
function closeAccountMenuOnEscape() {
  closeAccountMenu()
  accountMenu.value?.querySelector('summary')?.focus()
}
onMounted(() => document.addEventListener('pointerdown', closeAccountMenuOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeAccountMenuOutside))
const links = computed(() =>
  session.role === 'admin'
    ? [
        ['Users', '/admin/users'],
        ['Levels', '/admin/levels'],
      ]
    : [
        ['Dashboard', '/app'],
        ['Services', '/app/services'],
        ['eLearning', '/app/elearning'],
        ['Exam', '/app/exam'],
      ],
)
function isSectionActive(path: string) {
  const current = router.currentRoute.value.path
  return current === path || (path !== '/app' && current.startsWith(`${path}/`))
}
async function logout() {
  closeAccountMenu()
  if (router.currentRoute.value.path !== '/') {
    const navigation = await router.push('/')
    if (isNavigationFailure(navigation)) return
  }
  try {
    await session.logout()
  } catch (e) {
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  }
}
</script>
<template>
  <header class="border-b border-gray-200 bg-white">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-5 px-5 py-4">
      <RouterLink
        :to="session.user ? (session.role === 'admin' ? '/admin/users' : '/app') : '/'"
        class="text-lg font-bold whitespace-nowrap text-[var(--color-text-brand)] sm:text-xl"
        aria-label="CA?T Passport home"
      >
        CA?T PASSPORT
      </RouterLink>
      <nav v-if="session.user" class="order-3 flex w-full flex-wrap gap-4 md:order-none md:w-auto">
        <RouterLink
          v-for="link in links"
          :key="link[1]"
          :to="link[1]!"
          class="border-b-2 py-1"
          :class="
            isSectionActive(link[1]!)
              ? 'border-[var(--color-bg-brand)] text-[var(--color-text-brand)]'
              : 'border-transparent'
          "
          :aria-current="isSectionActive(link[1]!) ? 'page' : undefined"
        >
          {{ link[0] }}
        </RouterLink>
      </nav>
      <details
        v-if="session.user"
        ref="accountMenu"
        class="group relative ml-auto"
        @keydown.esc.prevent="closeAccountMenuOnEscape"
      >
        <summary
          class="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg border border-[var(--color-bg-brand)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text-brand)] hover:bg-[var(--color-bg-brand-soft)] [&::-webkit-details-marker]:hidden"
          :aria-label="`Account options for ${session.user.firstName} ${session.user.lastName}`"
        >
          <img
            :src="session.user.imageUrl || avatar"
            alt="Profile"
            class="h-8 w-8 shrink-0 rounded-full border border-[var(--color-border-default)] object-cover"
          />
          <span class="hidden max-w-40 truncate sm:inline"
            >{{ session.user.firstName }} {{ session.user.lastName }}</span
          >
          <svg
            class="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="m5 7.5 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </summary>
        <div
          class="absolute top-full right-0 z-30 mt-2 grid w-56 max-w-[calc(100vw-2.5rem)] gap-2 rounded-lg border border-[var(--color-border-default)] bg-white p-2 shadow-lg"
        >
          <RouterLink
            v-if="session.role === 'user'"
            to="/app/profile"
            class="action-button w-full justify-start"
            @click="closeAccountMenu"
          >
            Profile
          </RouterLink>
          <button type="button" class="action-button w-full justify-start" @click="logout">
            Log out
          </button>
        </div>
      </details>
    </div>
  </header>
  <main class="mx-auto max-w-6xl px-5 py-8">
    <p
      v-if="messages.message"
      role="status"
      class="mb-4 rounded border border-green-700 bg-green-50 p-4 text-green-900"
    >
      {{ messages.message }}
    </p>
    <p v-if="error" role="alert" class="mb-4 text-red-700">{{ error }}</p>
    <RouterView />
  </main>
</template>
