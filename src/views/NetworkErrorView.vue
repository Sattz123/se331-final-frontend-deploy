<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
function retry() {
  const target = String(route.query.retry || '/')
  location.assign(target.startsWith('/') && !target.startsWith('//') ? target : '/')
}
</script>
<template>
  <h1 class="text-2xl font-bold">Connection unavailable</h1>
  <p>Your saved session has not been discarded. Check the backend and retry.</p>
  <button class="action-button mt-4" @click="retry">Retry</button>
</template>
