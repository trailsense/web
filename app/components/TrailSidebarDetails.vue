<template>
  <div class="space-y-4 p-4">
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
      <p class="text-sm text-muted">
        Source: {{ trail.source }}
      </p>

      <p
        v-if="trail.source_id"
        class="text-xs text-dimmed"
      >
        Source ID: {{ trail.source_id }}
      </p>
    </div>

    <div class="text-xs text-dimmed">
      ID: {{ trail.id }}
    </div>

    <div class="space-y-3 pt-8">
      <div class="flex items-baseline justify-between gap-2">
        <p class="text-sm font-medium">
          Activity Measurements
        </p>
        <p class="text-xs text-toned">
          {{ selectedBucketLabel || 'Pick a bucket in the bottom timeline' }}
        </p>
      </div>

      <NodeActivityChart
        :bucket="drilldownBucket"
        :error-text="timeseriesErrorText"
        :is-loading="isTimeseriesLoading"
        :points="activityPoints"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrailDashboardState } from '~/composables/useTrailDashboard'
import { TRAIL_DASHBOARD_KEY } from '~/composables/useTrailDashboard'
import type { TrailListItemDto } from '~/lib/api/types.gen'

defineProps<{
  trail: TrailListItemDto
}>()

defineEmits<{
  (e: 'back'): void
}>()

const dashboard = inject<TrailDashboardState>(TRAIL_DASHBOARD_KEY)

if (!dashboard) {
  throw new Error('Trail dashboard state is not available.')
}

const {
  activityPoints,
  activityQuery,
  drilldownBucket,
  selectedBucketLabel
} = dashboard

const isTimeseriesLoading = computed(() => activityQuery.isLoading.value || activityQuery.isPending.value)
const timeseriesErrorText = computed(() => (activityQuery.error.value ? 'Failed to load measurements for this range.' : ''))
</script>
