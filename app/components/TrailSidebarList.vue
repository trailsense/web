<template>
  <div class="py-2">
    <p class="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
      Trails
    </p>

    <div class="space-y-1">
      <div
        v-for="trail in trails"
        :key="trail.id"
        class="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
        @click="$emit('select', trail.id)"
      >
        <p class="text-sm font-medium">
          {{ trail.name }}
        </p>
        <p class="text-xs text-gray-500">
          Avg activity: {{ trail.averageActivity }}%
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrailDto } from '../composables/trail-dashboard/types'

defineProps<{
  trails: TrailDto[]
}>()

defineEmits<{
  (e: 'select', trailId: string): void
}>()
</script>
