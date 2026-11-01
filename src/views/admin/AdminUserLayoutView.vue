<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
const route = useRoute()
const selected = useUserStore()
onBeforeUnmount(() => selected.clear())
watch(
  () => route.params.id,
  (id) => selected.load(Number(id)),
  { immediate: true },
)
</script>
<template>
  <RouterLink to="/admin/users" class="action-button">Back to users</RouterLink>
  <p v-if="selected.loading" role="status">Loading profile...</p>
  <p v-if="selected.error" role="alert">{{ selected.error }}</p>
  <template v-if="selected.user">
    <h1 class="my-5 text-3xl font-bold">User information</h1>
    <nav class="mb-6 flex flex-wrap gap-5 border-b pb-3">
      <RouterLink :to="{ name: 'admin-user-information', params: { id: selected.user.id } }">
        Information
      </RouterLink>
      <RouterLink :to="{ name: 'admin-user-edit', params: { id: selected.user.id } }">
        Edit user
      </RouterLink>
      <RouterLink :to="{ name: 'admin-user-history', params: { id: selected.user.id } }">
        Exam history
      </RouterLink>
    </nav>
    <RouterView />
  </template>
</template>
