<script setup lang="ts">
import { watch, ref } from 'vue'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import InputText from './InputText.vue'
import ProvinceSelect from './ProvinceSelect.vue'
import ImageUpload from './ImageUpload.vue'
import type { User, ProfileInput } from '@/types'
import avatar from '@/assets/default-profile-avatar.svg'
const props = defineProps<{ user: User; busy: boolean; allowImage?: boolean }>()
const emit = defineEmits<{ save: [body: ProfileInput] }>()
const imageError = ref('')
const images = ref<string[]>([])
const uploading = ref(false)
watch(
  () => props.user.imageUrl,
  () => {
    images.value = []
    imageError.value = ''
  },
)
const { errors, handleSubmit, resetForm, isSubmitting } = useForm({
  validationSchema: yup.object({
    firstName: yup.string().trim().max(80).required(),
    lastName: yup.string().trim().max(80).required(),
    email: yup.string().trim().email().max(200).required(),
    province: yup.string().trim().max(100).required(),
  }),
  initialValues: { firstName: '', lastName: '', email: '', province: '' },
})
const { value: firstName } = useField<string>('firstName')
const { value: lastName } = useField<string>('lastName')
const { value: email } = useField<string>('email')
const { value: province } = useField<string>('province')
watch(
  [
    () => props.user.id,
    () => props.user.firstName,
    () => props.user.lastName,
    () => props.user.email,
    () => props.user.province,
  ],
  () => {
    const user = props.user
    resetForm({
      values: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        province: user.province,
      },
    })
  },
  { immediate: true },
)
const saveDetails = handleSubmit((values) => {
  if (!imageError.value && !uploading.value) emit('save', { ...values, imageName: images.value[0] })
})
function submit(event: Event) {
  if (props.busy || isSubmitting.value || uploading.value) {
    event.preventDefault()
    return
  }
  return saveDetails(event)
}
</script>
<template>
  <form @submit="submit" class="rounded border bg-white p-5">
    <fieldset :disabled="busy || isSubmitting">
      <div class="mb-4">
        <label for="firstName" class="block font-medium">First name</label>
        <InputText
          id="firstName"
          name="firstName"
          v-model="firstName"
          :disabled="busy"
          :error="errors.firstName"
          placeholder="First name"
        />
      </div>
      <div class="mb-4">
        <label for="lastName" class="block font-medium">Surname</label>
        <InputText
          id="lastName"
          name="lastName"
          v-model="lastName"
          :disabled="busy"
          :error="errors.lastName"
          placeholder="Surname"
        />
      </div>
      <div class="mb-4">
        <label for="email" class="block font-medium">Email</label>
        <InputText
          id="email"
          name="email"
          v-model="email"
          :disabled="busy"
          :error="errors.email"
          placeholder="Email"
          type="email"
        />
      </div>
      <div class="mb-4">
        <label for="province" class="block font-medium">Province</label>
        <ProvinceSelect
          id="province"
          v-model="province"
          :error="errors.province"
          :disabled="busy"
        />
      </div>
      <section v-if="allowImage" class="my-5 border-t pt-5">
        <img
          :src="user.imageUrl || avatar"
          alt="Profile preview"
          class="mb-3 h-24 w-24 rounded-full object-cover"
        />
        <h3 class="mb-2 font-medium">New profile image (optional)</h3>
        <ImageUpload
          :key="user.imageUrl || 'new'"
          v-model="images"
          v-model:error="imageError"
          purpose="profile"
          :disabled="busy || isSubmitting"
          @pending="uploading = $event"
        />
        <p class="mt-2 text-sm text-gray-600">
          Your photo and details change only when you select Save details. Cancel leaves your saved
          profile unchanged.
        </p>
      </section>
      <button :disabled="busy || uploading" class="action-button action-button--primary">
        Save details
      </button>
    </fieldset>
  </form>
</template>
