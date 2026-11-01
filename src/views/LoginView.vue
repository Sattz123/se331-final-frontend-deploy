<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import InputText from '@/components/InputText.vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
const session = useAuthStore()
const router = useRouter()
const route = useRoute()
const error = ref('')
const { errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: yup.object({
    username: yup.string().trim().required('Enter your username'),
    password: yup
      .string()
      .test(
        'password-size',
        'Password is too long. Use fewer characters.',
        (value) => !value || new TextEncoder().encode(value).length <= 72,
      )
      .required('Enter your password'),
  }),
  initialValues: { username: '', password: '' },
})
const { value: username } = useField<string>('username')
const { value: password } = useField<string>('password')
const submit = handleSubmit(async (values) => {
  error.value = ''
  try {
    await session.login(values.username, values.password)
    const home = session.role === 'admin' ? '/admin/users' : '/app'
    const target = String(route.query.redirect || '')
    const allowed = session.role === 'admin' ? '/admin/' : '/app'
    await router.push(target.startsWith(allowed) ? target : home)
  } catch (e) {
    error.value = axios.isAxiosError(e)
      ? (e.response?.data?.detail ?? 'Request failed. Please try again.')
      : 'Request failed. Please try again.'
  }
})
</script>
<template>
  <div
    class="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16"
  >
    <section class="py-3 lg:py-10">
      <h1 class="mb-4 text-3xl font-bold sm:text-4xl">Your CA?T Passport</h1>
      <p class="max-w-lg text-lg">Learn, take an exam and unlock the next level.</p>
      <p class="mt-4 max-w-lg text-[var(--color-text-secondary)]">
        Check your level, study the lessons, and take an exam to move to the next level. Each level
        gives you a new badge and access to more services.
      </p>
    </section>
    <section class="w-full">
      <h2 class="mb-4 text-2xl font-bold">Sign in</h2>
      <p v-if="route.query.registered === '1'" role="status" class="mb-4 text-green-800">
        Account created. You can now log in.
      </p>
      <p v-if="route.query.expired" role="status">Your session ended. Please log in again.</p>
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
        <p v-if="error" role="alert" class="mb-3 text-red-700">{{ error }}</p>
        <button :disabled="isSubmitting" class="action-button action-button--primary">
          {{ isSubmitting ? 'Logging in...' : 'Log in' }}
        </button>
      </form>
      <RouterLink to="/register" class="action-button mt-4"> Create an account </RouterLink>
    </section>
  </div>
</template>
