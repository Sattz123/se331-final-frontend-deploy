<script setup lang="ts">
import axios from 'axios'
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useMemberStore } from '@/stores/member'
import { useAuthStore } from '@/stores/auth'
import BenefitCard from '@/components/BenefitCard.vue'
const overview = useMemberStore()
const session = useAuthStore()
const data = computed(() => overview.overview)
const catalog = computed(() => data.value?.catalog ?? data.value?.reached ?? [])
const visibleBenefits = computed(() =>
  catalog.value.filter((level) => level.number <= (data.value?.user.level ?? 0) + 1),
)
const allServices = computed(() => catalog.value.flatMap((level) => level.services))
const error = ref('')
const loading = ref(false)
async function load() {
  loading.value = true
  error.value = ''
  try {
    await overview.load()
  } catch (e) {
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    loading.value = false
  }
}
watch([() => session.user?.id, () => session.user?.level], load, { immediate: true })
</script>
<template>
  <p v-if="loading" role="status">Loading your Passport...</p>
  <p v-if="error" role="alert">
    {{ error }}
    <button @click="load" class="action-button">Retry</button>
  </p>
  <template v-if="data && !loading && !error">
    <h1 class="mb-3 text-3xl font-bold">
      Level {{ data.current.number }}: {{ data.current.name }}
    </h1>
    <p>{{ data.current.description }}</p>
    <div class="my-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      <div
        v-for="n in 4"
        :key="n"
        class="rounded border bg-white p-4"
        :aria-current="n === data.user.level ? 'step' : undefined"
      >
        Level {{ n }}:
        {{ n === data.user.level ? 'Current' : n < data.user.level ? 'Reached' : 'Not reached' }}
      </div>
    </div>
    <div v-if="data.user.level < 4" class="my-5 flex flex-wrap gap-5">
      <RouterLink to="/app/elearning" class="action-button">Study lesson</RouterLink>
      <RouterLink to="/app/exam" class="action-button action-button--primary">Take exam</RouterLink>
    </div>
    <p v-else class="my-5">You reached the highest level.</p>
    <h2 class="mb-3 text-2xl font-bold">Benefits</h2>
    <p v-if="data.user.level < 4" class="mb-4">
      Your earned badges and a preview of the next level.
    </p>
    <section v-for="level in visibleBenefits" :key="level.number" class="mb-5">
      <h3 class="mb-2 text-lg font-bold">Level {{ level.number }}: {{ level.name }}</h3>
      <BenefitCard
        v-for="benefit in level.benefits"
        :key="benefit.id"
        :benefit="benefit"
        :level="level"
        :locked="level.number > data.user.level"
        class="mb-3"
      />
      <p v-if="!level.benefits.length">No benefits have been added for this level.</p>
    </section>
    <h2 class="my-4 text-2xl font-bold">All services</h2>
    <article v-for="item in allServices" :key="item.id" class="mb-3 rounded border bg-white p-4">
      <h3 class="font-bold">{{ item.title }}</h3>
      <p class="text-sm text-gray-600">Level {{ item.level }}</p>
      <p>
        {{
          item.level <= data.user.level
            ? item.description
            : `Reach Level ${item.level} to unlock this service.`
        }}
      </p>
      <p class="my-2 font-semibold">{{ item.level <= data.user.level ? 'Available' : 'Locked' }}</p>
      <RouterLink
        v-if="item.level <= data.user.level"
        :to="{ name: 'user-service-details', params: { level: item.level } }"
        class="action-button mt-3"
        >View service details</RouterLink
      >
    </article>
    <RouterLink to="/app/services" class="action-button">All unlocked services</RouterLink>
  </template>
</template>
