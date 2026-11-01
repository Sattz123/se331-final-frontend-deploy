<script setup lang="ts">
import type { Attempt } from '@/types'
defineProps<{ attempts: Attempt[] }>()
const time = (value: string) =>
  new Date(value).toLocaleString('en-GB', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
</script>
<template>
  <div class="overflow-x-auto rounded border bg-white">
    <table class="w-full min-w-[760px] text-left">
      <thead>
        <tr class="border-b">
          <th class="p-3">Date and time</th>
          <th class="p-3">Exam</th>
          <th class="p-3">Score</th>
          <th class="p-3">Required</th>
          <th class="p-3">Result</th>
          <th class="p-3">Earned badge</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in attempts" :key="a.id" class="border-b">
          <td class="p-3">{{ time(a.attemptedAt) }}</td>
          <td class="p-3">Level {{ a.sourceLevel }} to {{ a.targetLevel }}</td>
          <td class="p-3">{{ a.score }}/{{ a.total }}</td>
          <td class="p-3">{{ a.passingScore }}</td>
          <td class="p-3" :class="a.passed ? 'text-green-800' : 'text-red-700'">
            {{ a.passed ? 'Passed' : 'Failed' }}
          </td>
          <td class="p-3">
            <template v-if="a.passed">
              <ul v-if="a.earnedBadges?.length" class="grid gap-3">
                <li v-for="badge in a.earnedBadges" :key="badge.id" class="flex items-center gap-3">
                  <img
                    v-if="badge.url"
                    :src="badge.url"
                    :alt="badge.title"
                    class="h-12 w-12 shrink-0 object-contain"
                  />
                  <div>
                    <p class="font-semibold">{{ badge.title }}</p>
                    <p v-if="!badge.url" class="text-sm text-gray-600">No image uploaded</p>
                  </div>
                </li>
              </ul>
              <p v-else>Level {{ a.targetLevel }} reached</p>
            </template>
            <span v-else>—</span>
          </td>
        </tr>
        <tr v-if="!attempts.length">
          <td colspan="6" class="p-5">No completed exams yet.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
