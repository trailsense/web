<template>
  <div class="py-2">
    <p class="px-4 pb-4 font-body-small text-muted">
      Trails
    </p>

    <div
      v-if="trails.length === 0"
      class="px-4 py-2 text-sm text-muted"
    >
      No trails in current map view.
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <SidebarListCard
        v-for="trail in trails"
        :id="trail.id"
        :key="trail.id"
        :subtitle="`Source: ${trail.source}`"
        :title="trail.name"
        @select="$emit('select', trail.id)"
        @hover="$emit('hover', trail.id)"
        @leave="$emit('leave')"
      />
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
