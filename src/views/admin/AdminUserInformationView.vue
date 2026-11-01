<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import UserService from '@/services/UserService'
import axios from 'axios'
import PersonalInformation from '@/components/PersonalInformation.vue'
const selected = useUserStore()
const busy = ref(false)
const error = ref('')
async function toggle() {
  const u = selected.user
  if (busy.value || !u || !confirm(`${u.active ? 'Deactivate' : 'Reactivate'} this account?`))
    return
  busy.value = true
  error.value = ''
  try {
    const saved = (await UserService.setStatus(u.id, !u.active)).data
    if (selected.user?.id === u.id) selected.user = saved
  } catch (e) {
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <section
    v-if="selected.user"
    class="rounded-lg border border-[var(--color-border-default)] bg-white p-6 sm:p-8"
  >
    <PersonalInformation :user="selected.user" admin />
    <p v-if="error" role="alert" class="text-red-700">{{ error }}</p>
    <button
      v-if="selected.user.roles.includes('ROLE_USER')"
      :disabled="busy"
      @click="toggle"
      class="action-button mt-4"
      :class="selected.user.active ? 'action-button--danger' : 'action-button--primary'"
    >
      {{ selected.user.active ? 'Deactivate account' : 'Reactivate account' }}
    </button>
  </section>
</template>
