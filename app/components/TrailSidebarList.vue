<template>
  <div class="py-2">
    <p class="px-3 pb-2 text-xs font-semibold text-muted uppercase tracking-wide">
      Trails
    </p>

    <div
      v-if="trails.length === 0"
      class="px-3 py-6 text-sm text-muted"
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
        class="cursor-pointer rounded-md px-3 py-2 hover:bg-muted"
        @click="$emit('select', trail.id)"
        @mouseenter="$emit('hover', trail.id)"
        @mouseleave="$emit('leave')"
      >
        <p class="text-sm font-medium">
          {{ trail.name }}
        </p>
        <p class="text-xs text-muted">
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
  (e: 'select' | 'hover', trailId: string): void
  (e: 'leave'): void
}>()
</script>
