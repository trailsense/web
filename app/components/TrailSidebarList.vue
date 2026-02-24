<template>
  <div class="py-2">
    <p class="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
      Trails
    </p>

    <div
      v-if="trails.length === 0"
      class="px-3 py-6 text-sm text-gray-500"
    >
      No trails in current map view.
    </div>

    <div
      v-else
      class="space-y-1"
    >
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
          Source: {{ trail.source }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrailListItemDto } from '~/lib/api/types.gen'

defineProps<{
  trails: TrailListItemDto[]
}>()

defineEmits<{
  (e: 'select', trailId: string): void
}>()
</script>
