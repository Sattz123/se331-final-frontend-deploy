<script setup lang="ts">
import type { Level, CatalogItem, CatalogItemInput } from '@/types'
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import InputText from '@/components/InputText.vue'
import CatalogItemForm from '@/components/CatalogItemForm.vue'
import CatalogService from '@/services/CatalogService'
import axios from 'axios'
const route = useRoute()
const saving = ref(false)
const message = ref('')
const getLevelNumber = () => Number(route.params.level)
const levelDetails = ref<Level | null>(null)
const addFormKeys = ref({ benefits: 0, services: 0 })
const error = ref('')
const loading = ref(false)
let requestId = 0
onBeforeUnmount(() => requestId++)
async function load() {
  const request = ++requestId
  const levelNumber = getLevelNumber()
  loading.value = true
  error.value = ''
  try {
    const level = (await CatalogService.getLevel(levelNumber)).data
    if (getLevelNumber() !== levelNumber || request !== requestId) return
    levelDetails.value = level
    initialiseForm(level)
  } catch (e) {
    if (getLevelNumber() !== levelNumber || request !== requestId) return
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    if (getLevelNumber() === levelNumber && request === requestId) loading.value = false
  }
}
const { errors, handleSubmit, resetForm, isSubmitting } = useForm({
  validationSchema: yup.object({
    name: yup.string().trim().max(100).required(),
    description: yup.string().trim().max(1000).required(),
    examTitle: yup
      .string()
      .trim()
      .max(100)
      .test('required', 'Enter the exam title', (value) => getLevelNumber() === 4 || !!value),
    passingScore: yup
      .number()
      .transform((v, original) => (original === '' ? null : v))
      .nullable()
      .typeError('Enter a whole number.')
      .integer('Enter a whole number.')
      .min(1, 'Enter at least 1 correct answer.')
      .test(
        'required',
        'Enter the passing score.',
        (value) => getLevelNumber() === 4 || value != null,
      )
      .test('question-count', function (value) {
        if (
          getLevelNumber() === 4 ||
          value == null ||
          value <= (levelDetails.value?.questionCount ?? 0)
        )
          return true
        return this.createError({
          message: `Enter no more than ${levelDetails.value?.questionCount ?? 0} correct answers.`,
        })
      }),
  }),
  initialValues: { name: '', description: '', examTitle: '', passingScore: null as number | null },
})
const { value: name } = useField<string>('name')
const { value: description } = useField<string>('description')
const { value: examTitle } = useField<string>('examTitle')
const { value: passingScore } = useField<number | null>('passingScore')
function initialiseForm(level: Level) {
  resetForm({
    values: {
      name: level.name,
      description: level.description,
      examTitle: level.examTitle ?? '',
      passingScore: level.passingScore,
    },
  })
}
watch(
  () => route.params.level,
  async () => {
    message.value = ''
    levelDetails.value = null
    await load()
  },
  { immediate: true },
)
const saveLevel = handleSubmit(async (value) => {
  const levelNumber = getLevelNumber()
  saving.value = true
  message.value = ''
  try {
    const saved = (
      await CatalogService.saveLevel(levelNumber, {
        ...value,
        passingScore: levelNumber === 4 ? null : value.passingScore,
      })
    ).data
    if (getLevelNumber() !== levelNumber || !levelDetails.value) return
    // Keep the existing item objects so their editors retain unsaved drafts.
    Object.assign(levelDetails.value, {
      name: saved.name,
      description: saved.description,
      examTitle: saved.examTitle,
      questionCount: saved.questionCount,
      passingScore: saved.passingScore,
    })
    initialiseForm(saved)
    message.value = 'Level saved'
  } catch (e) {
    message.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    saving.value = false
  }
})
function submit(event: Event) {
  if (saving.value || isSubmitting.value) {
    event.preventDefault()
    return
  }
  return saveLevel(event)
}
async function saveItem(kind: 'benefits' | 'services', id: number | null, body: CatalogItemInput) {
  if (saving.value) return
  const levelNumber = getLevelNumber()
  saving.value = true
  message.value = ''
  try {
    const saved = (await CatalogService.saveItem(levelNumber, kind, id, body)).data
    if (getLevelNumber() !== levelNumber || !levelDetails.value) return
    const items = levelDetails.value[kind]
    const index = items.findIndex((item) => item.id === saved.id)
    if (index === -1) items.push(saved)
    else items.splice(index, 1, saved)
    // Reset only the Add form that successfully created this item.
    if (id === null) addFormKeys.value[kind]++
    message.value = 'Item saved'
  } catch (e) {
    message.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  } finally {
    saving.value = false
  }
}
async function deleteItem(kind: 'benefits' | 'services', item: CatalogItem) {
  if (saving.value || !confirm(`Delete "${item.title}" from this level?`)) return
  const levelNumber = getLevelNumber()
  saving.value = true
  message.value = ''
  try {
    await CatalogService.deleteItem(levelNumber, kind, item.id)
    if (getLevelNumber() !== levelNumber || !levelDetails.value) return
    levelDetails.value[kind] = levelDetails.value[kind].filter((entry) => entry.id !== item.id)
    message.value = kind === 'benefits' ? 'Benefit deleted' : 'Service deleted'
  } catch (e) {
    if (getLevelNumber() !== levelNumber) return
    message.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Delete failed. Please try again.')
      : 'Delete failed. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>
<template>
  <RouterLink
    :to="{ name: 'admin-level-details', params: { level: getLevelNumber() } }"
    class="action-button"
    >Back to Level {{ getLevelNumber() }}</RouterLink
  >
  <h1 class="my-5 text-3xl font-bold">Level {{ getLevelNumber() }} details and editing</h1>
  <p v-if="loading" role="status">Loading...</p>
  <p v-if="error" role="alert">
    {{ error }}
    <button @click="load" class="action-button">Retry</button>
  </p>
  <p role="status" class="my-3">{{ message }}</p>
  <template v-if="levelDetails">
    <form @submit="submit" class="rounded border bg-white p-5">
      <fieldset :disabled="saving || isSubmitting">
        <div class="mb-4">
          <label for="name" class="block font-medium">Level name</label>
          <InputText
            id="name"
            name="name"
            v-model="name"
            :error="errors.name"
            placeholder="Level name"
          />
        </div>
        <div class="mb-4">
          <label for="description" class="block font-medium">Description</label>
          <InputText
            id="description"
            name="description"
            v-model="description"
            :error="errors.description"
            placeholder="Description"
          />
        </div>
        <div v-if="getLevelNumber() < 4" class="mb-4">
          <label for="examTitle" class="block font-medium">Exam title</label>
          <InputText
            id="examTitle"
            name="examTitle"
            v-model="examTitle"
            :error="errors.examTitle"
            placeholder="Exam title"
          />
        </div>
        <div v-if="getLevelNumber() < 4" class="mb-4">
          <label for="passingScore" class="block font-medium"
            >Correct answers required to pass</label
          >
          <InputText
            id="passingScore"
            name="passingScore"
            v-model="passingScore"
            :error="errors.passingScore"
            placeholder="Correct answers required to pass"
            type="number"
          />
        </div>
        <p v-else>Level 4 is final and has no upgrade exam.</p>
        <button :disabled="saving || isSubmitting" class="action-button action-button--primary">
          Save level
        </button>
      </fieldset>
    </form>
    <RouterLink
      v-if="getLevelNumber() < 4"
      :to="{ name: 'admin-questions', params: { level: getLevelNumber() } }"
      class="action-button my-5"
    >
      Manage questions
    </RouterLink>
    <section v-for="kind in ['benefits', 'services'] as const" :key="kind" class="my-8">
      <h2 class="text-2xl font-bold">
        {{ kind === 'benefits' ? 'Benefits' : 'Services' }}
      </h2>
      <CatalogItemForm
        v-for="item in levelDetails[kind]"
        :key="item.id"
        :item="item"
        :busy="saving"
        :allow-image="kind === 'benefits'"
        @save="(body) => saveItem(kind, item.id, body)"
        @remove="deleteItem(kind, item)"
      />
      <h3 class="mt-5 font-bold">Add an item</h3>
      <CatalogItemForm
        :key="`${kind}-${addFormKeys[kind]}`"
        :busy="saving"
        :allow-image="kind === 'benefits'"
        @save="(body) => saveItem(kind, null, body)"
      />
    </section>
  </template>
</template>
