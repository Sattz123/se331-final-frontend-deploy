<script setup lang="ts">
import { ref, watch, useId } from 'vue'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import InputText from './InputText.vue'
import ImageUpload from './ImageUpload.vue'
import type { CatalogItem } from '@/types'
const props = defineProps<{ item?: CatalogItem; busy?: boolean; allowImage?: boolean }>()
const emit = defineEmits<{
  save: [body: { title: string; description: string; imageName?: string }]
  remove: []
}>()
const imageError = ref('')
const images = ref<string[]>([])
const uploading = ref(false)
watch(
  () => props.item?.url,
  () => {
    images.value = []
    imageError.value = ''
  },
)
const fieldId = useId()
const { errors, handleSubmit, resetForm, isSubmitting } = useForm({
  validationSchema: yup.object({
    title: yup.string().trim().max(100).required(),
    description: yup.string().trim().max(1500).required(),
  }),
  initialValues: { title: '', description: '' },
})
const { value: title } = useField<string>('title')
const { value: description } = useField<string>('description')
watch(
  () => props.item,
  (item) =>
    resetForm({
      values: {
        title: item?.title ?? '',
        description: item?.description ?? '',
      },
    }),
  { immediate: true },
)
const saveItem = handleSubmit((value) => {
  if (!imageError.value && !uploading.value) emit('save', { ...value, imageName: images.value[0] })
})
function submit(event: Event) {
  if (props.busy || isSubmitting.value || uploading.value) {
    event.preventDefault()
    return
  }
  return saveItem(event)
}
</script>
<template>
  <form @submit="submit" class="mt-3 rounded border bg-white p-4">
    <fieldset :disabled="busy || isSubmitting">
      <div class="mb-4">
        <label :for="`${fieldId}-title`" class="block font-medium">Title</label>
        <InputText
          :id="`${fieldId}-title`"
          name="title"
          v-model="title"
          :error="errors.title"
          :disabled="busy"
          placeholder="Title"
        />
      </div>
      <div class="mb-4">
        <label :for="`${fieldId}-description`" class="block font-medium">Description</label>
        <InputText
          :id="`${fieldId}-description`"
          name="description"
          v-model="description"
          :error="errors.description"
          :disabled="busy"
          placeholder="Description"
        />
      </div>
      <button :disabled="busy || uploading" class="action-button action-button--primary">
        Save item
      </button>
      <button
        v-if="item"
        type="button"
        :disabled="busy"
        class="action-button action-button--danger ml-3"
        @click="emit('remove')"
      >
        Delete {{ allowImage ? 'benefit' : 'service' }}
      </button>
      <section v-if="allowImage" class="mt-5 border-t pt-4">
        <img
          v-if="item?.url"
          :src="item?.url || ''"
          :alt="item?.title || 'New benefit image preview'"
          class="mb-3 h-24 w-24 object-contain"
        />
        <p v-else class="mb-3 text-sm text-gray-600">No image uploaded.</p>
        <h3 class="mb-2 font-medium">New benefit image (optional)</h3>
        <ImageUpload
          :key="item?.url || 'new'"
          v-model="images"
          v-model:error="imageError"
          purpose="benefit"
          :disabled="busy || isSubmitting"
          @pending="uploading = $event"
        />
        <p class="mt-2 text-sm text-gray-600">
          Choose an image, then select Save item to save the benefit and image together.
        </p>
      </section>
    </fieldset>
  </form>
</template>
