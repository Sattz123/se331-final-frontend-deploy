<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import InputText from '@/components/InputText.vue'
import ProvinceSelect from '@/components/ProvinceSelect.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import { provinces } from '@/data/provinces'
import axios from 'axios'
import AuthenticationService from '@/services/AuthenticationService'
const router = useRouter()
const error = ref('')
const imageError = ref('')
const images = ref<string[]>([])
const uploading = ref(false)
const { errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: yup.object({
    username: yup
      .string()
      .matches(/^[A-Za-z0-9._-]{3,40}$/, 'Use 3-40 letters, numbers, dots, underscores or hyphens')
      .required(),
    password: yup
      .string()
      .min(10)
      .max(64)
      .test(
        'password-size',
        'Password is too long. Use fewer characters.',
        (value) => !value || new TextEncoder().encode(value).length <= 72,
      )
      .required(),
    firstName: yup.string().trim().max(80).required(),
    lastName: yup.string().trim().max(80).required(),
    email: yup.string().trim().email().max(200).required(),
    province: yup.string().oneOf(provinces, 'Select a province').required(),
  }),
  initialValues: {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    province: '',
  },
})
const { value: username } = useField<string>('username')
const { value: password } = useField<string>('password')
const { value: firstName } = useField<string>('firstName')
const { value: lastName } = useField<string>('lastName')
const { value: email } = useField<string>('email')
const { value: province } = useField<string>('province')
const submit = handleSubmit(async (values) => {
  if (imageError.value || uploading.value) return
  error.value = ''
  const { username, password, ...profile } = values
  try {
    await AuthenticationService.register({
      username,
      password,
      profile,
      imageName: images.value[0],
    })
    await router.push({ name: 'home', query: { registered: '1' } })
  } catch (e) {
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  }
})
</script>
<template>
  <section class="mx-auto max-w-xl">
    <h1 class="mb-5 text-3xl font-bold">Create your Passport</h1>
    <form @submit="submit" class="rounded border bg-white p-6">
      <div class="mb-4">
        <label for="username" class="block font-medium">Username</label>
        <InputText
          id="username"
          name="username"
          v-model="username"
          :error="errors.username"
          placeholder="Username"
        />
      </div>
      <div class="mb-4">
        <label for="password" class="block font-medium">Password</label>
        <InputText
          id="password"
          name="password"
          v-model="password"
          :error="errors.password"
          placeholder="Password"
          type="password"
        />
      </div>
      <div class="mb-4">
        <label for="firstName" class="block font-medium">First name</label>
        <InputText
          id="firstName"
          name="firstName"
          v-model="firstName"
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
          :disabled="isSubmitting"
        />
      </div>
      <h2 class="mb-2 font-medium">Profile image (optional)</h2>
      <ImageUpload
        v-model="images"
        v-model:error="imageError"
        purpose="registration"
        :disabled="isSubmitting"
        @pending="uploading = $event"
      />
      <p class="my-3 text-sm text-gray-600">
        You can upload or change your photo later in Edit profile.
      </p>
      <p role="alert" class="my-3 text-red-700">{{ error }}</p>
      <button :disabled="isSubmitting || uploading" class="action-button action-button--primary">
        {{ isSubmitting ? 'Registering...' : 'Register' }}
      </button>
    </form>
    <RouterLink to="/" class="action-button mt-4">Back to login</RouterLink>
  </section>
</template>
