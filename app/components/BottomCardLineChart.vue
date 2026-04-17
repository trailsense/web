<template>
  <ClientOnly>
    <div class="h-22 w-full">
      <div
        v-if="showTimelineLoadingState"
        class="flex h-22 w-full items-center justify-center"
      >
        <span class="flex items-center gap-2 text-sm text-muted">
          <UIcon
            name="i-lucide-loader-2"
            class="size-4 animate-spin"
          />
          <span>Loading timeline...</span>
        </span>
      </div>

      <div
        v-else-if="showTimelineErrorState"
        class="flex h-22 w-full items-center justify-center"
      >
        <UAlert
          color="error"
          variant="soft"
          title="Failed to load timeline"
          :description="timelineErrorText"
          class="mx-2 w-full max-w-lg"
        />
      </div>

      <div
        ref="chartEl"
        :class="shouldShowTimeline ? 'opacity-100' : 'pointer-events-none opacity-0'"
        aria-label="Bottom card timeline"
        class="h-22 w-full transition-opacity duration-150"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import {
  type ComposeOption,
  init,
  use,
  type EChartsType
} from 'echarts/core'
import { LineChart, type LineSeriesOption } from 'echarts/charts'
import {
  GraphicComponent,
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
  type GraphicComponentOption,
  type GridComponentOption,
  type TooltipComponentOption
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { TrailDashboardState } from '~/composables/useTrailDashboard'
import { TRAIL_DASHBOARD_KEY } from '~/composables/useTrailDashboard'

type EChartsOption = ComposeOption<
  | LineSeriesOption
  | GridComponentOption
  | GraphicComponentOption
  | TooltipComponentOption
>

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, GraphicComponent, MarkLineComponent])

const dashboard = inject<TrailDashboardState>(TRAIL_DASHBOARD_KEY)

if (!dashboard) {
  throw new Error('Trail dashboard state is not available.')
}

const {
  activeMarkerId,
  setActiveMarker,
  granularity,
  timelinePoints,
  timelineQuery
} = dashboard

const chartEl = ref<HTMLDivElement | null>(null)
let chart: EChartsType | null = null
let resizeObserver: ResizeObserver | null = null
let isDraggingSelection = false
let scrubDebounceTimer: ReturnType<typeof setTimeout> | null = null
let pendingMarkerId: string | null = null

const SCRUB_DEBOUNCE_MS = 120

const isTimelineLoading = computed(() =>
  timelineQuery.isLoading.value || timelineQuery.isPending.value
)
const timelineErrorText = computed(() =>
  timelineQuery.error.value ? 'Failed to load timeline.' : ''
)
const showTimelineLoadingState = computed(() =>
  isTimelineLoading.value && sortedPoints.value.length === 0
)
const showTimelineErrorState = computed(() =>
  Boolean(timelineErrorText.value) && sortedPoints.value.length === 0
)
const shouldShowTimeline = computed(() =>
  sortedPoints.value.length > 0
)

const sortedPoints = computed(() =>
  [...timelinePoints.value].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
)
const dateList = computed(() => sortedPoints.value.map(point => point.timestamp))
const valueList = computed(() => sortedPoints.value.map(point => point.value))

const selectedIndex = computed(() => {
  if (!activeMarkerId.value) return -1
  return dateList.value.findIndex(date => date === activeMarkerId.value)
})

const grid = {
  left: 8,
  right: 8,
  top: 4,
  bottom: 10
}

const formatBucketLabel = (timestamp: string) => {
  const date = new Date(timestamp)
  if (granularity.value === 'week') {
    return `Week of ${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getSeries = (): LineSeriesOption => ({
  id: 'timeline-series',
  type: 'line',
  smooth: false,
  data: valueList.value,
  areaStyle: {
    color: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: 'rgba(106, 112, 76, 0.42)' },
        { offset: 1, color: 'rgba(106, 112, 76, 0)' }
      ]
    }
  },
  showSymbol: true,
  symbol: 'circle',
  symbolSize: 3.5,
  lineStyle: {
    width: 2,
    color: '#6a704c'
  },
  itemStyle: {
    color: '#6a704c'
  },
  markLine: selectedIndex.value >= 0
    ? {
        silent: true,
        symbol: ['none', 'none'],
        lineStyle: {
          color: '#1c1c1c',
          width: 1,
          opacity: 0.6
        },
        label: { show: false },
        data: [{ xAxis: dateList.value[selectedIndex.value] }]
      }
    : undefined
})

const chartOption = computed<EChartsOption>(() => ({
  animationDuration: 200,
  grid: {
    left: grid.left,
    right: grid.right,
    top: grid.top,
    bottom: grid.bottom,
    containLabel: false
  },
  xAxis: {
    type: 'category',
    data: dateList.value,
    boundaryGap: false,
    axisLabel: { show: false },
    axisTick: { show: false },
    axisLine: { show: false }
  },
  yAxis: {
    type: 'value',
    axisLabel: { show: false },
    axisTick: { show: false },
    axisLine: { show: false },
    splitLine: { show: false }
  },
  tooltip: {
    trigger: 'axis',
    triggerOn: 'mousemove|click',
    appendToBody: true,
    padding: [4, 8],
    borderWidth: 0,
    backgroundColor: '#1c1c1c',
    textStyle: {
      color: '#ffffff',
      fontSize: 11
    },
    formatter: (params) => {
      const list = params as Array<{ dataIndex?: number }>
      const dataIndex = list?.[0]?.dataIndex
      if (typeof dataIndex !== 'number') return ''
      const timestamp = dateList.value[dataIndex]
      return timestamp ? formatBucketLabel(timestamp) : ''
    },
    position: (point, _params, _dom, _rect, size) => {
      const paddingX = 6
      const rawX = point[0] - size.contentSize[0] / 2
      const maxX = size.viewSize[0] - size.contentSize[0] - paddingX
      const x = Math.max(paddingX, Math.min(rawX, maxX))
      const y = size.viewSize[1] - size.contentSize[1] - 6
      return [x, y]
    },
    extraCssText: 'border-radius: 9999px; line-height: 1.2; pointer-events: none;'
  },
  series: [getSeries()]
}))

function getSelectedMarkerX() {
  if (!chartEl.value || selectedIndex.value < 0 || dateList.value.length <= 1) return null
  const width = chartEl.value.clientWidth
  const left = grid.left
  const right = width - grid.right
  if (right <= left) return null
  const ratio = selectedIndex.value / (dateList.value.length - 1)
  return left + ratio * (right - left)
}

function indexFromPixelX(pixelX: number) {
  if (!chartEl.value || dateList.value.length === 0) return -1
  if (dateList.value.length === 1) return 0

  const width = chartEl.value.clientWidth
  const left = grid.left
  const right = width - grid.right
  if (right <= left) return selectedIndex.value

  const clampedX = Math.min(right, Math.max(left, pixelX))
  const ratio = (clampedX - left) / (right - left)
  const index = Math.round(ratio * (dateList.value.length - 1))
  return Math.min(dateList.value.length - 1, Math.max(0, index))
}

function applyMarkerSelection(markerId: string) {
  if (!markerId || markerId === activeMarkerId.value) return
  setActiveMarker(markerId)
}

function queueMarkerSelection(markerId: string) {
  pendingMarkerId = markerId

  if (scrubDebounceTimer) {
    clearTimeout(scrubDebounceTimer)
  }

  scrubDebounceTimer = setTimeout(() => {
    scrubDebounceTimer = null
    if (!pendingMarkerId) return
    applyMarkerSelection(pendingMarkerId)
    pendingMarkerId = null
  }, SCRUB_DEBOUNCE_MS)
}

function flushQueuedMarkerSelection() {
  if (scrubDebounceTimer) {
    clearTimeout(scrubDebounceTimer)
    scrubDebounceTimer = null
  }

  if (!pendingMarkerId) return
  applyMarkerSelection(pendingMarkerId)
  pendingMarkerId = null
}

function selectMarkerFromPixel(pixelX: number, debounced = false) {
  const index = indexFromPixelX(pixelX)
  if (index < 0) return

  const markerId = dateList.value[index]
  if (!markerId || markerId === activeMarkerId.value) return

  if (debounced) {
    queueMarkerSelection(markerId)
    return
  }

  applyMarkerSelection(markerId)
}

function updateSelectionGraphics() {
  if (!chart) return
  const selectedX = getSelectedMarkerX()
  if (selectedX === null || selectedIndex.value < 0) {
    chart.setOption({ graphic: [] })
    return
  }

  const height = chartEl.value?.clientHeight ?? 100
  const lineBottom = height - grid.bottom
  const selectedTimestamp = dateList.value[selectedIndex.value]

  chart.setOption({
    graphic: [
      {
        id: 'selected-marker-handle',
        type: 'circle',
        shape: {
          cx: selectedX,
          cy: lineBottom,
          r: 4
        },
        style: {
          fill: '#1c1c1c'
        },
        silent: true,
        z: 110
      },
      {
        id: 'selected-marker-label',
        type: 'text',
        x: selectedX,
        y: lineBottom,
        style: {
          text: selectedTimestamp ? formatBucketLabel(selectedTimestamp) : '',
          fill: '#ffffff',
          backgroundColor: '#1c1c1c',
          padding: [4, 8],
          borderRadius: 9999,
          fontSize: 11,
          textAlign: 'center',
          textVerticalAlign: 'bottom'
        },
        silent: true,
        z: 109
      }
    ]
  })
}

function bindChartInteraction() {
  if (!chart) return
  const zr = chart.getZr()

  zr.off('click')
  zr.off('mousedown')
  zr.off('mousemove')
  zr.off('mouseup')
  zr.off('globalout')

  zr.on('click', (event) => {
    flushQueuedMarkerSelection()
    selectMarkerFromPixel(event.offsetX)
  })

  zr.on('mousedown', (event) => {
    const markerX = getSelectedMarkerX()
    if (markerX === null) return
    isDraggingSelection = Math.abs(event.offsetX - markerX) <= 10
  })

  zr.on('mousemove', (event) => {
    if (!isDraggingSelection) return
    selectMarkerFromPixel(event.offsetX, true)
  })

  zr.on('mouseup', () => {
    isDraggingSelection = false
    flushQueuedMarkerSelection()
  })

  zr.on('globalout', () => {
    isDraggingSelection = false
    flushQueuedMarkerSelection()
  })
}

function ensureChartInitialized() {
  if (!chartEl.value) return
  if (chart) return
  chart = init(chartEl.value, undefined, { renderer: 'canvas' })
  bindChartInteraction()
}

function renderChart() {
  if (!chartEl.value || !shouldShowTimeline.value) {
    return
  }

  ensureChartInitialized()
  chart?.setOption(chartOption.value, true)
  updateSelectionGraphics()
}

function setupResizeObserver() {
  if (!chartEl.value) return
  if (resizeObserver) return

  resizeObserver = new ResizeObserver(() => {
    chart?.resize()
    updateSelectionGraphics()
  })

  resizeObserver.observe(chartEl.value)
}

watch(
  () => [
    isTimelineLoading.value,
    timelineErrorText.value,
    sortedPoints.value.length,
    activeMarkerId.value,
    granularity.value
  ],
  async () => {
    await nextTick()
    renderChart()
  },
  { immediate: true }
)

watch(chartOption, () => {
  renderChart()
})

onMounted(() => {
  setupResizeObserver()
  renderChart()
})

watch(chartEl, () => {
  resizeObserver?.disconnect()
  resizeObserver = null
  setupResizeObserver()
  renderChart()
})

onBeforeUnmount(() => {
  flushQueuedMarkerSelection()
  resizeObserver?.disconnect()
  resizeObserver = null

  chart?.dispose()
  chart = null
})
</script>
