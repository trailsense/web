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
let renderFrameId: number | null = null

const MIN_CHART_DIMENSION_PX = 40
const MAX_RENDER_ATTEMPTS = 10

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

const hasMeaningfulData = computed(() =>
  chartData.value.some(item => item.count > 0)
)

const showLoadingState = computed(() =>
  props.isLoading && !hasMeaningfulData.value
)

const showErrorState = computed(() =>
  Boolean(props.errorText) && !hasMeaningfulData.value
)

const showEmptyState = computed(() =>
  !props.isLoading
  && !props.errorText
  && !hasMeaningfulData.value
)

const shouldRenderChart = computed(() =>
  hasMeaningfulData.value
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

const disposeChart = () => {
  chart?.dispose()
  chart = null
}

const disconnectResizeObserver = () => {
  resizeObserver?.disconnect()
  resizeObserver = null
}

const cancelRenderFrame = () => {
  if (renderFrameId === null || typeof window === 'undefined') return
  window.cancelAnimationFrame(renderFrameId)
  renderFrameId = null
}

const hasUsableChartSize = (element: HTMLDivElement) => {
  const { width, height } = element.getBoundingClientRect()
  return width >= MIN_CHART_DIMENSION_PX && height >= MIN_CHART_DIMENSION_PX
}

const renderChart = () => {
  if (!shouldRenderChart.value || !chartEl.value) return false
  if (!hasUsableChartSize(chartEl.value)) return false
  ensureChart()
  chart?.resize({ animation: { duration: 0 } })
  chart?.setOption(chartOption.value, true)
  chart?.resize()
  return true
}

const scheduleRenderChart = async () => {
  if (!shouldRenderChart.value) return
  await nextTick()

  if (typeof window === 'undefined') {
    renderChart()
    return
  }

  cancelRenderFrame()

  let attempts = 0
  const tryRender = () => {
    renderFrameId = null

    if (renderChart()) {
      return
    }

    if (attempts >= MAX_RENDER_ATTEMPTS) {
      return
    }

    attempts += 1
    renderFrameId = window.requestAnimationFrame(tryRender)
  }

  renderFrameId = window.requestAnimationFrame(tryRender)
}

watch(shouldRenderChart, async (next) => {
  if (!next) {
    cancelRenderFrame()
    return
  }
  await scheduleRenderChart()
}, { immediate: true })

watch(chartOption, () => {
  scheduleRenderChart()
})

watch(chartEl, (element) => {
  cancelRenderFrame()
  disconnectResizeObserver()

  if (!element) {
    disposeChart()
    return
  }

  resizeObserver = new ResizeObserver(() => {
    if (shouldRenderChart.value) {
      scheduleRenderChart()
    }
  })

  resizeObserver.observe(element)
  scheduleRenderChart()
}, { immediate: true })

onBeforeUnmount(() => {
  cancelRenderFrame()
  disconnectResizeObserver()
  disposeChart()
})
</script>

<template>
  <div class="space-y-2 rounded-lg border border-default p-3">
    <div class="h-[17.5rem] w-full">
      <p
        v-if="showLoadingState"
        class="flex h-full items-center justify-center"
      >
        <span class="flex items-center gap-2 text-sm text-muted">
          <UIcon
            name="i-lucide-loader-2"
            class="size-4 animate-spin"
          />
          <span>Loading measurements...</span>
        </span>
      </p>

      <div
        v-else-if="showErrorState"
        class="flex h-full items-center justify-center"
      >
        <UAlert
          color="error"
          variant="soft"
          title="Failed to load measurements"
          :description="errorText"
          class="max-w-md"
        />
      </div>

      <div
        v-else-if="showEmptyState"
        class="flex h-full items-center justify-center"
      >
        <UEmpty
          icon="i-lucide-radio"
          variant="naked"
          title="No measurements"
          description="No activity in the selected range."
        />
      </div>

      <ClientOnly>
        <div
          v-if="shouldRenderChart"
          ref="chartEl"
          aria-label="Activity measurements chart"
          class="h-full w-full"
        />
      </ClientOnly>
    </div>
  </div>
</template>
