<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import UserService from '@/services/UserService'
import axios from 'axios'
import ProfileEditForm from '@/components/ProfileEditForm.vue'
import type { ProfileInput, User } from '@/types'
const route = useRoute()
const session = useAuthStore()
const selected = useUserStore()
const admin = computed(() => route.path.startsWith('/admin/'))
const user = computed(() =>
  admin.value
    ? !selected.loading && !selected.error && selected.user?.id === Number(route.params.id)
      ? selected.user
      : null
    : session.user,
)
const busy = ref(false)
const message = ref('')
function updated(value: User) {
  if (admin.value) selected.user = value
  if (session.user?.id === value.id) session.user = value
}
async function save(body: ProfileInput) {
  if (busy.value || !user.value) return
  const targetId = admin.value ? Number(route.params.id) : null
  const ownerId = user.value.id
  const requestPath = route.path
  if (targetId !== null && targetId !== selected.user?.id) return
  busy.value = true
  message.value = ''
  try {
    const response =
      targetId === null
        ? await UserService.saveUser(null, body)
        : await UserService.saveUser(targetId, body)
    if (route.path !== requestPath || user.value?.id !== ownerId) return
    updated(response.data)
    message.value = 'Details saved'
  } catch (e) {
    if (route.path !== requestPath || user.value?.id !== ownerId) return
    message.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <h2 class="mb-4 text-2xl font-bold">Edit details</h2>
  <p role="status" class="mb-4">{{ message }}</p>
  <ProfileEditForm
    v-if="user"
    :key="`${admin ? 'admin' : 'own'}-${user.id}`"
    :user="user"
    :busy="busy"
    :allow-image="!admin"
    @save="save"
  />
  <RouterLink
    :to="
      admin
        ? { name: 'admin-user-information', params: { id: route.params.id } }
        : { name: 'user-profile-details' }
    "
    class="action-button mt-4"
  >
    Cancel and return
  </RouterLink>
</template>
