<script setup lang="ts">
import Uploader from 'vue-media-upload'
import { computed, onBeforeUnmount, onErrorCaptured, ref } from 'vue'
import axios from 'axios'
import type { UploadMedia } from '@/types'

const props = defineProps<{ purpose: 'registration' | 'profile' | 'benefit'; disabled?: boolean }>()
const modelValue = defineModel<string[]>({ default: () => [] })
const error = defineModel<string>('error', { default: '' })
const emit = defineEmits<{ pending: [value: boolean] }>()
const uploadId = ref(0)
const uploading = ref(false)
const media = ref<UploadMedia[]>([])
const token = localStorage.getItem('access_token')
const headers: Record<string, string> =
  props.purpose === 'registration' || !token ? {} : { Authorization: `Bearer ${token}` }
const path = computed(() =>
  props.purpose === 'registration'
    ? '/api/v1/auth/uploadImage'
    : props.purpose === 'profile'
      ? '/api/v1/me/uploadImage'
      : '/api/v1/admin/uploadImage',
)
const uploadUrl = computed(
  () => `${(import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')}${path.value}`,
)
const previews = new Set<string>()

function pending(value: boolean) {
  uploading.value = value
  emit('pending', value)
}
function reset() {
  for (const url of previews) URL.revokeObjectURL(url)
  previews.clear()
  modelValue.value = []
  media.value = []
  error.value = ''
  pending(false)
  uploadId.value++
}
function changed(files: UploadMedia[]) {
  for (const file of files) if (file.url?.startsWith('blob:')) previews.add(file.url)
  if (files.some((file) => !file.name)) {
    reset()
    error.value = 'Upload failed. Choose the image again.'
    return
  }
  modelValue.value = files.map((file) => file.name)
  error.value = ''
  pending(false)
}
// Check before the library sends the file. Its own picker accepts every image type.
function checkFile(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.type !== 'file') return
  const files = Array.from(input.files || [])
  const invalid =
    files.length !== 1 ||
    files.some(
      (file) =>
        !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2000000,
    )
  if (props.disabled || uploading.value || invalid || modelValue.value.length) {
    event.stopPropagation()
    input.value = ''
    if (invalid) error.value = 'Choose one PNG, JPEG or WebP no larger than 2 MB.'
    else if (modelValue.value.length)
      error.value = 'Remove the selected image before choosing another.'
    return
  }
  error.value = ''
  pending(true)
}
// Version 2.2.4 has no upload-error event. Reset its loader after a rejected request.
onErrorCaptured((failure) => {
  reset()
  error.value = axios.isAxiosError(failure)
    ? failure.response?.status === 401
      ? 'Your session expired. Log in again before uploading.'
      : (failure.response?.data?.detail ?? 'Image upload failed. Choose the image again to retry.')
    : 'Image upload failed. Choose the image again to retry.'
  return false
})
onBeforeUnmount(() => {
  for (const url of previews) URL.revokeObjectURL(url)
  emit('pending', false)
})
</script>
<template>
  <section class="image-upload" @change.capture="checkFile" :aria-busy="uploading">
    <fieldset :disabled="disabled || uploading">
      <legend class="mb-2 text-sm">Choose one image (PNG, JPEG or WebP, up to 2 MB).</legend>
      <Uploader
        :key="uploadId"
        :server="uploadUrl"
        :headers="headers"
        :media="media"
        :max="1"
        :max-filesize="2"
        :warnings="false"
        @change="changed"
      />
    </fieldset>
    <p v-if="uploading" role="status" class="mt-2">Uploading image...</p>
    <p v-if="error" role="alert" class="mt-2 text-red-700">{{ error }}</p>
    <button
      v-if="modelValue.length || error"
      type="button"
      class="action-button mt-3"
      :disabled="disabled || uploading"
      @click="reset"
    >
      Discard selected image
    </button>
  </section>
</template>
<style scoped>
.image-upload :deep(.mu-plus-icon) {
  color: var(--color-text-brand) !important;
}
.image-upload :deep(.mu-close-btn) {
  background: var(--color-bg-surface) !important;
  color: var(--color-text-danger) !important;
  border: 1px solid var(--color-text-danger) !important;
  border-radius: 4px;
  padding: 2px !important;
  min-height: 24px;
  min-width: 24px;
}
.image-upload :deep(.mu-times-icon) {
  filter: none;
}
.image-upload :deep(.velmld-spinner rect) {
  fill: var(--color-text-brand);
}
.image-upload fieldset:disabled {
  opacity: 0.65;
  pointer-events: none;
}
</style>
