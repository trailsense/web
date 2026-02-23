<template>
  <div class="p-4 space-y-4">
    <UButton
      icon="i-lucide-arrow-left"
      size="xs"
      variant="ghost"
      @click="$emit('back')"
    >
      Back to trails
    </UButton>

    <div>
      <h2 class="text-lg font-semibold">
        {{ trail.name }}
      </h2>
      <p class="text-sm text-gray-500">
        Average activity: {{ trail.averageActivity }}%
      </p>
    </div>

    <div>
      <p class="text-sm font-medium mb-2">
        Included Nodes
      </p>
      <ul class="text-sm text-gray-600 space-y-1">
        <li
          v-for="n in trail.nodes"
          :key="n.id"
        >
          {{ n.id }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrailDto } from '../composables/trail-dashboard/types'

defineProps<{
  trail: TrailDto
}>()

defineEmits<{
  (e: 'back'): void
}>()
</script>
