<script setup lang="ts">
import type { Question } from '@/types'
import { computed, ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, RouterLink, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { useForm, useFieldArray } from 'vee-validate'
import * as yup from 'yup'
import InputText from '@/components/InputText.vue'
import CatalogService from '@/services/CatalogService'
import axios from 'axios'

type QuestionDraft = { id: number | null; prompt: string; choices: string[]; correctIndex: number }
const route = useRoute()
const getLevelNumber = () => Number(route.params.level)
const loading = ref(false)
const loaded = ref(false)
const loadError = ref('')
const saveError = ref('')
const message = ref('')
const passingScore = ref(1)
const deletedIds = ref<number[]>([])
const savedDraft = ref('')
let requestId = 0

const { errors, values, resetForm, handleSubmit, isSubmitting } = useForm<{
  questions: QuestionDraft[]
}>({
  validationSchema: yup.object({
    questions: yup
      .array()
      .of(
        yup.object({
          prompt: yup
            .string()
            .trim()
            .required('Enter the question.')
            .max(1500, 'Use up to 1500 characters.'),
          choices: yup
            .array()
            .of(
              yup
                .string()
                .trim()
                .required('Enter this answer choice.')
                .max(500, 'Use up to 500 characters.'),
            )
            .length(4, 'Enter all four answer choices.')
            .test(
              'different',
              'Use four different answer choices.',
              (options) =>
                !options ||
                options.some((x) => !x?.trim()) ||
                new Set(options.map((x) => x?.trim())).size === 4,
            ),
          correctIndex: yup.number().required('Choose the correct answer.').integer().min(0).max(3),
        }),
      )
      .min(1, 'Add at least one question.')
      .test(
        'passing-score',
        () => `Keep at least ${passingScore.value} questions for the current passing score.`,
        (questions) => !questions || questions.length >= passingScore.value,
      ),
  }),
  initialValues: { questions: [] },
})
const { fields, push, remove } = useFieldArray<QuestionDraft>('questions')
const dirty = computed(
  () =>
    loaded.value &&
    (deletedIds.value.length > 0 || JSON.stringify(values.questions) !== savedDraft.value),
)
function initialise(questions: Question[]) {
  resetForm({
    values: {
      questions: questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        choices: [...q.choices],
        correctIndex: q.correctIndex,
      })),
    },
  })
  deletedIds.value = []
  savedDraft.value = JSON.stringify(values.questions)
}
function errorAt(index: number, field: string) {
  const messages: Record<string, string | undefined> = errors.value
  return messages[`questions[${index}].${field}`]
}
async function load() {
  const request = ++requestId
  const number = getLevelNumber()
  loading.value = true
  loaded.value = false
  loadError.value = ''
  saveError.value = ''
  message.value = ''
  try {
    const [bank, level] = await Promise.all([
      CatalogService.getQuestions(number),
      CatalogService.getLevel(number),
    ])
    if (request !== requestId) return
    passingScore.value = level.data.passingScore ?? 1
    initialise(bank.data)
    loaded.value = true
  } catch (e) {
    if (request !== requestId) return
    loadError.value = detail(e)
  } finally {
    if (request === requestId) loading.value = false
  }
}
function detail(e: unknown) {
  return axios.isAxiosError(e)
    ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
    : 'Request failed. Please try again.'
}
async function addQuestion() {
  if (isSubmitting.value) return
  message.value = ''
  push({ id: null, prompt: '', choices: ['', '', '', ''], correctIndex: 0 })
  await nextTick()
  const card = document.querySelector('main article:last-of-type')
  card?.scrollIntoView({ block: 'start' })
  card?.querySelector('input')?.focus({ preventScroll: true })
}
function removeQuestion(index: number) {
  if (
    isSubmitting.value ||
    !confirm(`Remove Question ${index + 1}? Select Save changes to apply this removal.`)
  )
    return
  const id = fields.value[index]?.value.id
  if (id !== null && id !== undefined) deletedIds.value.push(id)
  remove(index)
  saveError.value = ''
  message.value = ''
}
const save = handleSubmit(
  async (body) => {
    saveError.value = ''
    message.value = ''
    const number = getLevelNumber()
    try {
      const response = await CatalogService.saveQuestions(number, {
        questions: body.questions,
        deletedIds: [...deletedIds.value],
      })
      if (number !== getLevelNumber()) return
      initialise(response.data)
      message.value = 'Questions saved'
    } catch (e) {
      if (number === getLevelNumber()) saveError.value = detail(e)
    }
  },
  async () => {
    await nextTick()
    const invalid = document.querySelector<HTMLElement>(
      'main [aria-invalid="true"], main [role="alert"]',
    )
    invalid?.scrollIntoView({ block: 'center' })
    invalid?.focus({ preventScroll: true })
  },
)
function submit(event: Event) {
  if (isSubmitting.value) {
    event.preventDefault()
    return
  }
  return save(event)
}
function mayLeave() {
  if (isSubmitting.value) return false
  return !dirty.value || confirm('Discard unsaved question changes?')
}
onBeforeRouteLeave(mayLeave)
onBeforeRouteUpdate(mayLeave)
function beforeUnload(event: BeforeUnloadEvent) {
  if (dirty.value || isSubmitting.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
window.addEventListener('beforeunload', beforeUnload)
onBeforeUnmount(() => {
  requestId++
  window.removeEventListener('beforeunload', beforeUnload)
})
watch(() => route.params.level, load, { immediate: true })
</script>

<template>
  <RouterLink
    :to="{ name: 'admin-level-details', params: { level: getLevelNumber() } }"
    class="action-button"
  >
    Back to Level {{ getLevelNumber() }}
  </RouterLink>
  <h1 class="mt-5 text-3xl font-bold">Level {{ getLevelNumber() }} questions</h1>
  <p class="mt-2 mb-6 text-[var(--color-text-secondary)]">
    Edit the questions and answer choices below. Select Save changes to apply your changes.
  </p>
  <p v-if="loading" role="status">Loading questions...</p>
  <p v-if="loadError" role="alert" class="my-4 text-red-700">
    {{ loadError }} <button type="button" class="action-button" @click="load">Retry</button>
  </p>
  <p v-if="getLevelNumber() === 4" class="rounded border bg-white p-6">
    Level 4 is the highest level, so it has no further upgrade exam.
  </p>
  <form v-else-if="loaded" novalidate @submit="submit">
    <fieldset :disabled="isSubmitting" class="min-w-0">
      <section
        class="rounded-lg border border-[var(--color-border-default)] bg-white p-5 sm:p-8"
        aria-label="Questions"
      >
        <p class="mb-6 text-right text-sm font-semibold text-[var(--color-text-brand)]">
          {{ fields.length }} questions
        </p>
        <div class="space-y-5">
          <article
            v-for="(entry, index) in fields"
            :key="entry.key"
            class="scroll-mt-6 rounded-lg border border-[var(--color-border-default)] p-5"
          >
            <div class="mb-3 flex items-center justify-between gap-4">
              <h3 class="font-bold">
                Question {{ index + 1 }}{{ entry.value.id === null ? ' (new)' : '' }}
              </h3>
              <button
                type="button"
                class="action-button action-button--danger"
                @click="removeQuestion(index)"
              >
                Delete
              </button>
            </div>
            <label :for="`question-${entry.key}`" class="sr-only"
              >Question {{ index + 1 }} text</label
            >
            <InputText
              :id="`question-${entry.key}`"
              v-model="entry.value.prompt"
              :name="`questions[${index}].prompt`"
              :error="errorAt(index, 'prompt')"
              :aria-label="`Question ${index + 1} text`"
              placeholder="Question"
            />
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div
                v-for="(label, choiceIndex) in ['A', 'B', 'C', 'D']"
                :key="label"
                class="grid min-w-0 grid-cols-[28px_minmax(0,1fr)] items-start gap-2"
              >
                <label
                  :for="`question-${entry.key}-${label}`"
                  class="pt-4 text-sm font-semibold text-[var(--color-text-brand)]"
                  >{{ label }}.</label
                >
                <InputText
                  :id="`question-${entry.key}-${label}`"
                  v-model="entry.value.choices[choiceIndex]"
                  :name="`questions[${index}].choices[${choiceIndex}]`"
                  :aria-label="`Question ${index + 1} option ${label}`"
                  :error="errorAt(index, `choices[${choiceIndex}]`)"
                  :placeholder="`Choice ${label}`"
                />
              </div>
            </div>
            <p v-if="errorAt(index, 'choices')" role="alert" class="mt-3 text-sm text-red-700">
              {{ errorAt(index, 'choices') }}
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <label
                :for="`correct-answer-${entry.key}`"
                class="text-sm font-semibold text-[var(--color-text-secondary)]"
                >Correct answer</label
              >
              <select
                :id="`correct-answer-${entry.key}`"
                v-model.number="entry.value.correctIndex"
                :aria-label="`Question ${index + 1} correct answer`"
                class="h-11 rounded border border-[var(--color-border-default)] bg-white px-4 pr-10"
              >
                <option v-for="(label, i) in ['A', 'B', 'C', 'D']" :key="label" :value="i">
                  {{ label }}
                </option>
              </select>
            </div>
            <p v-if="errorAt(index, 'correctIndex')" role="alert" class="mt-2 text-sm text-red-700">
              {{ errorAt(index, 'correctIndex') }}
            </p>
          </article>
        </div>
        <p v-if="errors.questions" role="alert" class="mt-5 text-sm text-red-700">
          {{ errors.questions }}
        </p>
        <button type="button" class="action-button mt-6" @click="addQuestion">
          + Add question
        </button>
      </section>
      <p v-if="saveError" role="alert" class="mt-5 text-red-700">{{ saveError }}</p>
      <p v-if="message" role="status" class="mt-5 text-green-800">{{ message }}</p>
      <div class="my-6 flex flex-wrap gap-3">
        <button type="submit" class="action-button action-button--primary">
          {{ isSubmitting ? 'Saving...' : 'Save changes' }}
        </button>
        <RouterLink
          :to="{ name: 'admin-level-details', params: { level: getLevelNumber() } }"
          class="action-button"
          :aria-disabled="isSubmitting || undefined"
          @click="isSubmitting && $event.preventDefault()"
          >Cancel</RouterLink
        >
      </div>
    </fieldset>
  </form>
</template>
