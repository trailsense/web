<template>
  <div class="py-1 lg:py-2">
    <p class="px-3 pb-2 text-xs text-muted lg:px-4 lg:pb-4 lg:font-body-small">
      Trails
    </p>

    <div
      v-if="isLoading"
      class="px-4 py-2"
    >
      <div class="flex items-center gap-2 text-sm text-muted">
        <UIcon
          name="i-lucide-loader-2"
          class="size-4 animate-spin"
        />
        <span>Loading trails...</span>
      </div>
    </div>

    <div
      v-else-if="errorText"
      class="px-4 py-2"
    >
      <UAlert
        color="error"
        variant="soft"
        title="Failed to load trails"
        :description="errorText"
      />
    </div>

    <div
      v-else-if="trails.length === 0"
      class="px-4 py-2"
    >
      <UEmpty
        icon="i-lucide-waypoints"
        variant="naked"
        title="No trails"
        description="No trails near the current map center."
      />
    </div>

    <div
      v-else
      class="space-y-2 lg:space-y-3"
    >
      <SidebarListCard
        v-for="trail in trails"
        :id="trail.id"
        :key="trail.id"
        :activation-count="trail.activation_count"
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
  isLoading?: boolean
  errorText?: string
}>()

defineEmits<{
  (e: 'select' | 'hover', trailId: string): void
  (e: 'leave'): void
}>()
</script>
