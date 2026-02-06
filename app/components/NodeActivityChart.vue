<script lang="ts" setup>
import type { TimeseriesBucket } from '~/lib/api/types.gen'

type TimeseriesPoint = {
  timestamp: string
  value: number
}

type ChartDatum = {
  count: number
  axisLabel: string
  hoverLabel: string
}

const props = withDefaults(
  defineProps<{
    bucket: TimeseriesBucket
    points: TimeseriesPoint[]
    isLoading?: boolean
    errorText?: string
  }>(),
  {
    isLoading: false,
    errorText: ''
  }
)

const chartData = computed<ChartDatum[]>(() =>
  props.points.map((point) => {
    const date = new Date(point.timestamp)
    const axisLabel = props.bucket === 'hour'
      ? date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit' })
      : props.bucket === 'week'
        ? date.toLocaleDateString([], { month: 'short', day: 'numeric' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' })

    const hoverLabel = props.bucket === 'hour'
      ? date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : props.bucket === 'week'
        ? `Week of ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`
        : date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

    return {
      count: point.value,
      axisLabel,
      hoverLabel
    }
  })
)

const chartCategories = computed(() => ({
  count: { name: 'Measurements', color: '#10b981' }
}))

const xFormatter = (index: number) => chartData.value[index]?.axisLabel || ''
const yFormatter = (tick: number) => tick.toString()
</script>

<template>
  <div class="space-y-2 rounded-lg border border-gray-200 p-3">
    <p
      v-if="isLoading"
      class="text-sm text-gray-500"
    >
      Loading measurements...
    </p>

    <p
      v-else-if="errorText"
      class="text-sm text-red-600"
    >
      {{ errorText }}
    </p>

    <p
      v-else-if="chartData.length === 0"
      class="text-sm text-gray-500"
    >
      No measurements in the selected range.
    </p>

    <BarChart
      v-else
      :categories="chartCategories"
      :data="chartData"
      :height="280"
      :hide-legend="true"
      :radius="8"
      :x-formatter="xFormatter"
      :x-num-ticks="8"
      :y-axis="['count']"
      :y-formatter="yFormatter"
      :y-grid-line="true"
    >
      <template #tooltip="{ values }">
        <div
          v-if="values"
          class="text-xs"
        >
          <p class="font-medium text-gray-800">
            {{ values.hoverLabel }}
          </p>
          <p class="text-gray-600">
            {{ values.count }} measurements
          </p>
        </div>
      </template>
    </BarChart>
  </div>
</template>
