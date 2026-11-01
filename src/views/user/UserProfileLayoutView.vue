<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>
<template>
  <h1 class="mb-6 text-3xl font-bold">Profile</h1>
  <nav class="mb-6 flex flex-wrap gap-5 border-b pb-3">
    <RouterLink to="/app/profile/details">Details</RouterLink>
    <RouterLink to="/app/profile/edit">Edit</RouterLink>
    <RouterLink to="/app/profile/history">Exam history</RouterLink>
    <RouterLink to="/app/profile/badges">Badges</RouterLink>
    <RouterLink to="/app/profile/services">Services</RouterLink>
  </nav>
  <RouterView />
</template>
