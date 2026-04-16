<template>
  <div class="flex justify-end">
    <USelect
      v-model="selectedGranularity"
      :items="granularityItems"
      class="w-28"
      color="neutral"
      size="xs"
      variant="outline"
    />
  </div>
</template>

<script setup lang="ts">
import type { TrailDashboardState } from '~/composables/useTrailDashboard'
import { TRAIL_DASHBOARD_KEY } from '~/composables/useTrailDashboard'
import type { DashboardGranularity } from '~/composables/trail-dashboard/types'

const dashboard = inject<TrailDashboardState>(TRAIL_DASHBOARD_KEY)

if (!dashboard) {
  throw new Error('Trail dashboard state is not available.')
}

const { granularity, setGranularity } = dashboard

const granularityItems = [
  { label: 'Daily', value: 'day' },
  { label: 'Weekly', value: 'week' }
]

const selectedGranularity = computed<string>({
  get: () => granularity.value,
  set: (value) => {
    if (value === 'day' || value === 'week') {
      setGranularity(value as DashboardGranularity)
    }
  }
})
</script>
