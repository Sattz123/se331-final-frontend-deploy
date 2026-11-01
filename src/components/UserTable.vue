<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { User } from '@/types'
import avatar from '@/assets/default-profile-avatar.svg'
defineProps<{ users: User[] }>()
</script>
<template>
  <div class="overflow-x-auto rounded border bg-white">
    <table class="w-full min-w-[620px] text-left">
      <thead>
        <tr class="border-b">
          <th class="p-3">Member</th>
          <th>Province</th>
          <th>Level</th>
          <th>Status</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id" class="border-b">
          <td class="flex items-center gap-3 p-3">
            <img :src="u.imageUrl || avatar" alt="" class="h-10 w-10 rounded-full object-cover" />
            {{ u.firstName }} {{ u.lastName }}
          </td>
          <td>{{ u.province }}</td>
          <td>{{ u.level }}</td>
          <td>{{ u.active ? 'Active' : 'Inactive' }}</td>
          <td>
            <RouterLink
              :to="{ name: 'admin-user-information', params: { id: u.id } }"
              class="action-button"
            >
              View profile
            </RouterLink>
          </td>
        </tr>
        <tr v-if="!users.length">
          <td colspan="5" class="p-5">No matching users.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
