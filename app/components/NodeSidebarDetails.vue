<template>
  <div class="space-y-4 p-4">
    <UButton
      icon="i-lucide-arrow-left"
      size="xs"
      variant="ghost"
      @click="$emit('back')"
    >
      Back to nodes
    </UButton>

    <div>
      <h2 class="text-lg font-semibold">
        {{ node.name }}
      </h2>
    </div>

    <div class="flex items-center gap-2 text-sm">
      <span
        :class="statusClass"
        class="h-2.5 w-2.5 rounded-full"
      />
      <span>
        {{ statusLabel }}
      </span>
    </div>

    <div class="space-y-1 text-xs text-muted">
      <p><strong>Node ID:</strong> {{ node.id }}</p>
      <p><strong>Coordinates:</strong> {{ node.longitude }}, {{ node.latitude }}</p>
      <p><strong>Send frequency:</strong> Every {{ node.send_frequency_seconds }}s</p>
      <p><strong>Activations:</strong> {{ formatActivationCount(node.activation_count) }}</p>
      <p><strong>Created:</strong> {{ formatDate(node.created_at) }}</p>
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

<script lang="ts" setup>
import type { TrailDashboardState } from '~/composables/useTrailDashboard'
import { TRAIL_DASHBOARD_KEY } from '~/composables/useTrailDashboard'
import type { NodeDto } from '~/lib/api/types.gen'
import { getNodeStatusClass, getNodeStatusLabel } from '~/utils/node-status'

const props = defineProps<{
  node: NodeDto
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

const statusClass = computed(() => getNodeStatusClass(props.node.status))
const statusLabel = computed(() => getNodeStatusLabel(props.node.status))
const isTimeseriesLoading = computed(() => activityQuery.isLoading.value || activityQuery.isPending.value)
const timeseriesErrorText = computed(() => (activityQuery.error.value ? 'Failed to load measurements for this range.' : ''))

const formatDate = (iso: string) => new Date(iso).toLocaleString()
const formatActivationCount = (value: number | null | undefined) =>
  value === null || value === undefined
    ? 'No data'
    : new Intl.NumberFormat().format(value)
</script>
