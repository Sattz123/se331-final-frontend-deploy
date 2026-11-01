<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import PersonalInformation from '@/components/PersonalInformation.vue'
const session = useAuthStore()
</script>
<template>
  <section
    v-if="session.user"
    class="rounded-lg border border-[var(--color-border-default)] bg-white p-6 sm:p-8"
  >
    <PersonalInformation :user="session.user" />
  </section>
</template>
