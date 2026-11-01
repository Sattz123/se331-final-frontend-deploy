<script setup lang="ts">
import { provinces } from '@/data/provinces'
const model = defineModel<string>({ required: true })
defineProps<{ id: string; error?: string; all?: boolean; disabled?: boolean }>()
</script>
<template>
  <select
    :id="id"
    v-model="model"
    :disabled="disabled"
    :aria-invalid="!!error"
    :aria-describedby="error ? `${id}-error` : undefined"
    class="block w-full rounded border bg-white p-2 pr-10"
  >
    <option value="">{{ all ? 'All provinces' : 'Select province' }}</option>
    <option v-if="model && !provinces.includes(model)" :value="model">{{ model }}</option>
    <option v-for="province in provinces" :key="province" :value="province">{{ province }}</option>
  </select>
  <p v-if="error" :id="`${id}-error`" class="text-sm text-red-700">{{ error }}</p>
</template>
