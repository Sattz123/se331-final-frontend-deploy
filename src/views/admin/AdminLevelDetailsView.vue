<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import axios from 'axios'
import CatalogService from '@/services/CatalogService'
import type { Level, Question, CatalogItem } from '@/types'

const route = useRoute()
const level = ref<Level | null>(null)
const loading = ref(false)
const error = ref('')
const questions = ref<Question[]>([])
const learning = ref<CatalogItem[]>([])
let requestId = 0
onBeforeUnmount(() => requestId++)
async function load() {
  const request = ++requestId
  const number = Number(route.params.level)
  loading.value = true
  error.value = ''
  level.value = null
  try {
    const [response, bank, lessons] = await Promise.all([
      CatalogService.getLevel(number),
      CatalogService.getQuestions(number),
      CatalogService.getLevelLearning(number),
    ])
    if (request !== requestId) return
    level.value = response.data
    questions.value = bank.data
    learning.value = lessons.data
  } catch (e) {
    if (request !== requestId) return
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    if (request === requestId) loading.value = false
  }
}
watch(() => route.params.level, load, { immediate: true })
</script>
<template>
  <RouterLink to="/admin/levels" class="action-button">Back to levels</RouterLink>
  <p v-if="loading" role="status">Loading level...</p>
  <p v-if="error" role="alert" class="my-4 text-red-700">
    {{ error }}
    <button @click="load" class="action-button">Retry</button>
  </p>
  <template v-if="level">
    <h1 class="my-5 text-3xl font-bold">Level {{ level.number }}: {{ level.name }}</h1>
    <p>{{ level.description }}</p>
    <p v-if="level.number < 4" class="my-4">
      Correct answers required to pass: {{ level.passingScore }} / {{ level.questionCount }}
    </p>
    <p v-else class="my-4">Level 4 is final and has no upgrade exam.</p>
    <nav class="my-5 flex flex-wrap gap-5">
      <RouterLink
        :to="{ name: 'admin-level-edit', params: { level: level.number } }"
        class="action-button"
        >Edit level</RouterLink
      >
      <RouterLink
        v-if="level.number < 4"
        :to="{ name: 'admin-questions', params: { level: level.number } }"
        class="action-button"
        >Manage questions</RouterLink
      >
    </nav>
    <section v-for="kind in ['benefits', 'services'] as const" :key="kind" class="my-8">
      <h2 class="mb-4 text-2xl font-bold">{{ kind === 'benefits' ? 'Benefits' : 'Services' }}</h2>
      <article v-for="item in level[kind]" :key="item.id" class="mb-3 rounded border bg-white p-5">
        <img
          v-if="kind === 'benefits' && item.url"
          :src="item.url"
          :alt="item.title"
          class="mb-3 h-24 w-24 object-contain"
        />
        <h3 class="text-xl font-bold">{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </article>
      <p v-if="!level[kind].length">No {{ kind }} have been added.</p>
    </section>
    <template v-if="level.number < 4">
      <section class="my-8 rounded border bg-white p-5">
        <h2 class="mb-3 text-2xl font-bold">Upgrade to Level {{ level.number + 1 }}</h2>
        <p class="font-semibold">Exam: {{ level.examTitle }}</p>
        <p>
          {{ level.questionCount }} questions; {{ level.passingScore }} correct answers to pass.
        </p>
        <div v-for="lesson in learning" :key="lesson.id" class="mt-4">
          <h3 class="font-bold">eLearning: {{ lesson.title }}</h3>
          <p>{{ lesson.description }}</p>
        </div>
      </section>
      <section class="my-8">
        <h2 class="mb-4 text-2xl font-bold">Exam questions</h2>
        <details
          v-for="(question, index) in questions"
          :key="question.id"
          class="mb-3 rounded border bg-white"
        >
          <summary class="cursor-pointer p-4 font-semibold text-[var(--color-text-brand)]">
            {{ index + 1 }}. {{ question.prompt }}
          </summary>
          <div class="border-t p-4">
            <ul class="grid gap-3 sm:grid-cols-2">
              <li
                v-for="(choice, i) in question.choices"
                :key="i"
                class="rounded border p-3"
                :class="
                  i === question.correctIndex ? 'border-green-700 bg-green-50 text-green-900' : ''
                "
              >
                {{ 'ABCD'[i] }}. {{ choice }}
              </li>
            </ul>
            <p class="mt-3 font-semibold text-green-800">
              Correct answer: {{ 'ABCD'[question.correctIndex] }}.
              {{ question.choices[question.correctIndex] }}
            </p>
          </div>
        </details>
      </section>
    </template>
  </template>
</template>
