<script lang="ts" setup>
import {
  type ComposeOption,
  init,
  use,
  type EChartsType
} from 'echarts/core'
import { BarChart, type BarSeriesOption } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  type GridComponentOption,
  type TooltipComponentOption
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
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

type EChartsOption = ComposeOption<
  | BarSeriesOption
  | GridComponentOption
  | TooltipComponentOption
>

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

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

const chartEl = ref<HTMLDivElement | null>(null)
let chart: EChartsType | null = null
let resizeObserver: ResizeObserver | null = null

const chartData = computed<ChartDatum[]>(() =>
  props.points.map((point) => {
    const date = new Date(point.timestamp)
    const axisLabel = props.bucket === 'hour'
      ? date.toLocaleString([], { hour: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' })

    const hoverLabel = props.bucket === 'hour'
      ? date.toLocaleString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : props.bucket === 'week'
        ? `Week of ${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
        : date.toLocaleDateString([], {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })

    return {
      count: point.value,
      axisLabel,
      hoverLabel
    }
  })
)

const shouldRenderChart = computed(() =>
  !props.isLoading
  && !props.errorText
  && chartData.value.length > 0
)

const chartOption = computed<EChartsOption>(() => ({
  animationDuration: 250,
  grid: {
    left: 8,
    right: 8,
    top: 10,
    bottom: 28,
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    backgroundColor: '#1c1c1c',
    borderWidth: 0,
    textStyle: {
      color: '#ffffff',
      fontSize: 12
    },
    formatter: (params) => {
      const list = params as Array<{ dataIndex?: number }>
      const dataIndex = list?.[0]?.dataIndex
      if (typeof dataIndex !== 'number') return ''

      const item = chartData.value[dataIndex]
      if (!item) return ''

      return `${item.hoverLabel}<br/>${item.count} measurements`
    }
  },
  xAxis: {
    type: 'category',
    data: chartData.value.map(item => item.axisLabel),
    axisTick: { show: false },
    axisLine: { lineStyle: { color: '#d4d4d4' } },
    axisLabel: {
      color: '#929292',
      fontSize: 11,
      hideOverlap: true
    }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#929292',
      fontSize: 11
    },
    splitLine: {
      lineStyle: {
        color: '#e7e7e7'
      }
    }
  },
  series: [
    {
      type: 'bar',
      data: chartData.value.map(item => item.count),
      barMaxWidth: 18,
      itemStyle: {
        color: '#6a704c',
        borderRadius: [6, 6, 0, 0]
      }
    }
  ]
}))

const ensureChart = () => {
  if (!chartEl.value) return
  if (!chart) {
    chart = init(chartEl.value, undefined, { renderer: 'canvas' })
  }
}

const renderChart = () => {
  if (!shouldRenderChart.value) return
  ensureChart()
  chart?.setOption(chartOption.value, true)
}

watch(shouldRenderChart, async (next) => {
  if (!next) return
  await nextTick()
  renderChart()
}, { immediate: true })

watch(chartOption, () => {
  renderChart()
})

onMounted(() => {
  if (!chartEl.value) return

  resizeObserver = new ResizeObserver(() => {
    chart?.resize()
  })

  resizeObserver.observe(chartEl.value)
  renderChart()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null

  chart?.dispose()
  chart = null
})
</script>

<template>
  <div class="space-y-2 rounded-lg border border-default p-3">
    <p
      v-if="isLoading"
      class="text-sm text-muted"
    >
      Loading measurements...
    </p>

    <p
      v-else-if="errorText"
      class="text-sm text-error"
    >
      {{ errorText }}
    </p>

    <p
      v-else-if="chartData.length === 0"
      class="text-sm text-muted"
    >
      No measurements in the selected range.
    </p>

    <ClientOnly>
      <div
        v-show="shouldRenderChart"
        ref="chartEl"
        aria-label="Activity measurements chart"
        class="h-70 w-full"
      />
    </ClientOnly>
  </div>
</template>
