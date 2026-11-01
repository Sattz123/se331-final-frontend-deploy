<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, onBeforeRouteLeave, RouterLink } from 'vue-router'
import ExamService from '@/services/ExamService'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useMemberStore } from '@/stores/member'
import type { Paper, Level } from '@/types'
const session = useAuthStore()
const overview = useMemberStore()
const router = useRouter()
const paper = ref<Paper | null>(null)
const answers = reactive<Record<number, number>>({})
const intro = ref<Level | null>(null)
const introBusy = ref(false)
const attempted = ref(false)
let alive = true
async function loadIntro() {
  introBusy.value = true
  error.value = ''
  try {
    await overview.load()
    if (alive) intro.value = overview.overview?.current ?? null
  } catch (e) {
    if (alive)
      error.value = axios.isAxiosError(e)
        ? (e.response?.data?.detail ?? 'Could not load exam information. Please retry.')
        : 'Could not load exam information. Please retry.'
  } finally {
    if (alive) introBusy.value = false
  }
}
const error = ref('')
const busy = ref(false)
const done = ref(false)
const incomplete = computed(
  () => paper.value?.questions.filter((q) => answers[q.id] === undefined) || [],
)
async function start() {
  if (busy.value || !intro.value) return
  if (
    !confirm(
      `Start ${intro.value.examTitle}? Answer ${intro.value.questionCount} questions. You need ${intro.value.passingScore} correct answers to pass.`,
    )
  )
    return
  error.value = ''
  busy.value = true
  try {
    const response = await ExamService.startExam()
    if (!alive) return
    paper.value = response.data
    attempted.value = false
    done.value = false
  } catch (e) {
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    busy.value = false
  }
}
async function submit() {
  if (!paper.value || busy.value) return
  attempted.value = true
  if (incomplete.value.length) {
    error.value = `Answer ${incomplete.value.length} remaining question(s)`
    document.getElementById(`question-${incomplete.value[0]!.id}`)?.focus()
    return
  }
  if (!confirm('Submit these answers for grading?')) return
  busy.value = true
  error.value = ''
  try {
    const result = (await ExamService.submitExam(paper.value.id, answers)).data
    session.user = result.user
    overview.clear()
    // Refresh immediately; a separate content fetch failure cannot undo grading.
    try {
      await overview.load()
    } catch {
      /* Next member page retries its fetch. */
    }
    done.value = true
    await router.push({ name: 'user-exam-result', params: { id: result.attempt.id } })
  } catch (e) {
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    busy.value = false
  }
}
function exit() {
  if (busy.value || !confirm('Exit exam? Your selected answers will be cleared.')) return
  for (const id of Object.keys(answers)) delete answers[Number(id)]
  paper.value = null
  attempted.value = false
  error.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
  void loadIntro()
}
function beforeUnload(e: BeforeUnloadEvent) {
  if (paper.value && !done.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onMounted(loadIntro)
onBeforeUnmount(() => {
  alive = false
  window.removeEventListener('beforeunload', beforeUnload)
})
onBeforeRouteLeave(() => !paper.value || done.value || confirm('Leave this unfinished exam?'))
</script>
<template>
  <h1 class="mb-4 text-3xl font-bold">Upgrade exam</h1>
  <p v-if="session.user?.level === 4">You reached the highest level.</p>
  <template v-else>
    <p>You can take the exam without watching the learning video.</p>
    <section v-if="!paper" class="my-5 rounded border bg-white p-5">
      <p v-if="introBusy" role="status">Loading exam information...</p>
      <template v-if="intro">
        <p>Level {{ intro.number }} → Level {{ intro.number + 1 }}</p>
        <h2 class="my-3 text-2xl font-bold">{{ intro.examTitle }}</h2>
        <p>
          {{ intro.questionCount }} multiple-choice questions; {{ intro.passingScore }} correct
          answers to pass.
        </p>
      </template>
      <button v-if="!intro && !introBusy" class="action-button mt-3" @click="loadIntro">
        Retry exam information
      </button>
    </section>
    <button
      v-if="!paper"
      :disabled="busy || introBusy || !intro"
      @click="start"
      class="action-button action-button--primary my-5"
    >
      {{ busy ? 'Starting...' : 'Start current-level exam' }}
    </button>
    <form v-if="paper" @submit.prevent="submit">
      <h2 class="my-4 text-2xl font-bold">{{ paper.title }} exam</h2>
      <p class="my-5">
        {{ paper.questions.length }} questions; pass with {{ paper.passingScore }} correct.
        {{ paper.questions.length - incomplete.length }} answered.
      </p>
      <fieldset
        v-for="(q, index) in paper.questions"
        :key="q.id"
        :id="`question-${q.id}`"
        tabindex="-1"
        :disabled="busy"
        class="mb-4 rounded border bg-white p-5"
        :class="attempted && answers[q.id] === undefined ? 'border-red-700' : ''"
      >
        <legend class="px-1 font-bold">{{ index + 1 }}. {{ q.prompt }}</legend>
        <label v-for="(choice, i) in q.choices" :key="i" class="my-3 flex items-start gap-3">
          <input v-model="answers[q.id]" type="radio" :name="`question-${q.id}`" :value="i" />
          {{ choice }}
        </label>
        <p v-if="attempted && answers[q.id] === undefined" class="text-red-700">
          Select one answer.
        </p>
      </fieldset>
      <button :disabled="busy" class="action-button action-button--primary">
        {{ busy ? 'Grading...' : 'Submit exam' }}
      </button>
      <button type="button" :disabled="busy" class="action-button ml-3" @click="exit">
        Exit exam
      </button>
    </form>
    <p v-if="error" role="alert" class="my-4 text-red-700">{{ error }}</p>
  </template>
  <RouterLink to="/app" class="action-button mt-5"> Back to dashboard </RouterLink>
</template>
