<script setup lang="ts">
import type { Result, Level } from '@/types'
import axios from 'axios'
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import ExamService from '@/services/ExamService'
import { useAuthStore } from '@/stores/auth'
import CatalogService from '@/services/CatalogService'
import BenefitCard from '@/components/BenefitCard.vue'
const route = useRoute()
const session = useAuthStore()
const data = ref<Result | null>(null)
const reward = ref<Level | null>(null)
const rewardError = ref('')
const rewardsBusy = ref(false)
let requestId = 0
onBeforeUnmount(() => requestId++)
async function loadReward() {
  if (!data.value?.attempt.passed) return
  const request = requestId
  const target = data.value.attempt.targetLevel
  rewardsBusy.value = true
  rewardError.value = ''
  try {
    const response = await CatalogService.getOverview()
    if (request !== requestId) return
    reward.value =
      (response.data.catalog ?? response.data.reached).find((level) => level.number === target) ??
      null
    if (!reward.value)
      rewardError.value = 'The result is saved. The reward details are not available yet.'
  } catch {
    if (request === requestId)
      rewardError.value = 'The result is saved. Could not load the reward details.'
  } finally {
    if (request === requestId) rewardsBusy.value = false
  }
}
const error = ref('')
const loading = ref(false)
async function load() {
  const request = ++requestId
  const ownerId = session.user?.id
  loading.value = true
  error.value = ''
  data.value = null
  reward.value = null
  rewardError.value = ''
  try {
    const result = (await ExamService.getResult(Number(route.params.id))).data
    if (request !== requestId || session.user?.id !== ownerId) return
    session.user = result.user
    data.value = result
    loading.value = false
    await loadReward()
  } catch (e) {
    if (request !== requestId) return
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    if (request === requestId) loading.value = false
  }
}
watch(() => route.params.id, load, { immediate: true })
</script>
<template>
  <h1 class="mb-5 text-3xl font-bold">Exam result</h1>
  <p v-if="loading">Loading result...</p>
  <p v-if="error" role="alert">
    {{ error }}
    <button @click="load" class="action-button">Retry</button>
  </p>
  <section v-if="data" class="rounded border bg-white p-6">
    <h2 class="text-2xl font-bold" :class="data.attempt.passed ? 'text-green-800' : 'text-red-700'">
      {{ data.attempt.passed ? 'Passed' : 'Not passed yet' }}
    </h2>
    <p class="my-4 text-xl">{{ data.attempt.score }} / {{ data.attempt.total }}</p>
    <p>Passing score for this attempt: {{ data.attempt.passingScore }}</p>
    <p>Current level: {{ data.user.level }}</p>
    <p v-if="data.attempt.passed" class="my-3 font-semibold">
      You reached Level {{ data.attempt.targetLevel }}.
    </p>
    <p>
      {{
        new Date(data.attempt.attemptedAt).toLocaleString('en-GB', {
          timeZone: 'Asia/Bangkok',
        })
      }}
      (Bangkok)
    </p>
    <RouterLink v-if="!data.attempt.passed" to="/app/elearning" class="action-button mt-4">
      Study lesson
    </RouterLink>
    <RouterLink
      v-if="!data.attempt.passed"
      to="/app/exam"
      class="action-button action-button--primary mt-4 ml-3"
      >Retry exam</RouterLink
    >
    <p v-if="rewardsBusy" class="my-4" role="status">Loading your new rewards...</p>
    <p v-if="rewardError" class="my-4" role="alert">
      {{ rewardError }} <button class="action-button" @click="loadReward">Retry rewards</button>
    </p>
    <div v-if="reward" class="mt-6 grid gap-5 md:grid-cols-2">
      <section>
        <h3 class="mb-3 text-xl font-bold">New badge</h3>
        <BenefitCard
          v-for="benefit in reward.benefits"
          :key="benefit.id"
          :benefit="benefit"
          :level="reward"
          class="mb-3"
        />
      </section>
      <section>
        <h3 class="mb-3 text-xl font-bold">New service</h3>
        <article
          v-for="service in reward.services"
          :key="service.id"
          class="mb-3 rounded border p-4"
        >
          <h4 class="font-bold">{{ service.title }}</h4>
          <p>{{ service.description }}</p>
          <RouterLink
            :to="{ name: 'user-service-details', params: { level: reward.number } }"
            class="action-button mt-3"
            >View service details</RouterLink
          >
        </article>
      </section>
    </div>
  </section>
  <nav class="mt-5 flex flex-wrap gap-5">
    <RouterLink to="/app" class="action-button">Back to dashboard</RouterLink>
    <RouterLink to="/app/profile/history" class="action-button">Exam history</RouterLink>
    <RouterLink to="/app/profile/badges" class="action-button">Your badges</RouterLink>
  </nav>
</template>
