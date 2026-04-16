<template>
  <ClientOnly>
    <div
      ref="chartEl"
      class="h-25 w-full"
      aria-label="Bottom card line chart"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import {
  type ComposeOption,
  init,
  use,
  type EChartsType
} from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, type LineSeriesOption } from 'echarts/charts'
import {
  GraphicComponent,
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
  VisualMapComponent,
  type GridComponentOption,
  type GraphicComponentOption,
  type TooltipComponentOption,
  type VisualMapComponentOption
} from 'echarts/components'
import { onBeforeUnmount, onMounted, nextTick, ref } from 'vue'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, VisualMapComponent, GraphicComponent, MarkLineComponent])

type EChartsOption = ComposeOption<
  | LineSeriesOption
  | GridComponentOption
  | GraphicComponentOption
  | TooltipComponentOption
  | VisualMapComponentOption
>

const chartEl = ref<HTMLDivElement | null>(null)
let chart: EChartsType | null = null
let resizeObserver: ResizeObserver | null = null
let rafId: number | null = null
let isDraggingSelection = false

type DayPoint = {
  value: [string, number]
  displayDate: string
}

const dayPoints: DayPoint[] = (() => {
  const points: DayPoint[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 365; i += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - (364 - i))

    const isoDate = date.toISOString().slice(0, 10)
    const displayDate = date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

    const baseline = 10
    const trend = (i / 364) * 6
    const seasonal = Math.sin(i / 14) * 2 + Math.cos(i / 33) * 1.2
    const value = Number((baseline + trend + seasonal).toFixed(2))

    points.push({
      value: [isoDate, value],
      displayDate
    })
  }

  return points
})()

const dateList = dayPoints.map(point => point.value[0])
const valueList = dayPoints.map(point => point.value[1])
let selectedDayIndex = dateList.length - 1

const minValue = Math.min(...valueList)
const maxValue = Math.max(...valueList)

const grid = {
  left: 16,
  right: 16,
  top: 10,
  bottom: 10
}

const onWindowResize = () => {
  chart?.resize()
}

const getSeries = (): LineSeriesOption => ({
  id: 'activity-series',
  name: 'Activity',
  type: 'line',
  smooth: false,
  data: valueList,
  showAllSymbol: true,
  showSymbol: true,
  symbol: 'circle',
  symbolSize: 3,
  lineStyle: {
    width: 2
  },
  markLine: {
    silent: true,
    symbol: ['none', 'none'],
    lineStyle: {
      color: '#1c1c1c',
      width: 1,
      opacity: 0.7
    },
    label: { show: false },
    data: [{ xAxis: dateList[selectedDayIndex] }]
  }
})

const option: EChartsOption = {
  animationDuration: 500,
  visualMap: [
    {
      show: false,
      type: 'continuous',
      seriesIndex: 0,
      min: minValue,
      max: maxValue,
      inRange: {
        color: ['#9ca3af', '#10b981']
      }
    },
    {
      show: false,
      type: 'continuous',
      seriesIndex: 0,
      dimension: 0,
      min: 0,
      max: dateList.length - 1,
      inRange: {
        color: ['#10b981', '#047857']
      }
    }
  ],
  grid: {
    left: grid.left,
    right: grid.right,
    top: grid.top,
    bottom: grid.bottom,
    containLabel: false
  },
  xAxis: {
    type: 'category',
    data: dateList,
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
      return dayPoints[dataIndex]?.displayDate ?? ''
    },
    position: (point, _params, _dom, _rect, size) => {
      const x = point[0] - size.contentSize[0] / 2
      const y = size.viewSize[1] - size.contentSize[1] - 6
      return [x, y]
    },
    extraCssText: 'border-radius: 9999px; line-height: 1.2; pointer-events: none;'
  },
  series: [getSeries()]
}

function getSelectedDayX() {
  if (!chartEl.value) return null
  const width = chartEl.value.clientWidth
  const left = grid.left
  const right = width - grid.right
  if (right <= left || dateList.length <= 1) return null
  const ratio = selectedDayIndex / (dateList.length - 1)
  return left + ratio * (right - left)
}

function indexFromPixelX(pixelX: number) {
  if (!chartEl.value) return selectedDayIndex

  const width = chartEl.value.clientWidth
  const left = grid.left
  const right = width - grid.right
  if (right <= left) return selectedDayIndex

  const clampedX = Math.min(right, Math.max(left, pixelX))
  const ratio = (clampedX - left) / (right - left)
  const index = Math.round(ratio * (dateList.length - 1))
  return Math.min(dateList.length - 1, Math.max(0, index))
}

function isWithinInteractiveBand(pixelY: number) {
  const height = chartEl.value?.clientHeight
  if (!height) return false

  const top = grid.top - 8
  const bottom = height - grid.bottom + 8

  return pixelY >= top && pixelY <= bottom
}

function selectDayFromPixel(pixelX: number) {
  const nextIndex = indexFromPixelX(pixelX)
  if (nextIndex === selectedDayIndex) return

  selectedDayIndex = nextIndex
  updateFixedSelectionVisuals()
}

function updateFixedSelectionVisuals() {
  if (!chart) return

  const x = getSelectedDayX()
  if (x === null) return

  const height = chartEl.value?.clientHeight ?? 100
  const lineBottom = height - grid.bottom

  chart.setOption({
    series: [getSeries()],
    graphic: [
      {
        id: 'selected-day-handle',
        type: 'circle',
        shape: {
          cx: x,
          cy: lineBottom,
          r: 5
        },
        style: {
          fill: '#1c1c1c'
        },
        silent: true,
        z: 110
      },
      {
        id: 'selected-day-bubble',
        type: 'text',
        x,
        y: lineBottom,
        style: {
          text: dayPoints[selectedDayIndex]?.displayDate ?? '',
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

function ensureChartInitialized() {
  if (!chartEl.value || chart) return

  const { clientWidth, clientHeight } = chartEl.value

  if (clientWidth === 0 || clientHeight === 0) {
    rafId = window.requestAnimationFrame(ensureChartInitialized)
    return
  }

  chart = init(chartEl.value, undefined, { renderer: 'canvas' })
  chart.setOption(option)
  updateFixedSelectionVisuals()

  const zr = chart.getZr()

  zr.on('click', (event) => {
    if (!isWithinInteractiveBand(event.offsetY)) return
    selectDayFromPixel(event.offsetX)
  })

  zr.on('mousedown', (event) => {
    if (!isWithinInteractiveBand(event.offsetY)) return
    const x = getSelectedDayX()
    if (x === null) return
    isDraggingSelection = Math.abs(event.offsetX - x) <= 10
  })

  zr.on('mousemove', (event) => {
    if (!isDraggingSelection) return
    const nextIndex = indexFromPixelX(event.offsetX)
    if (nextIndex === selectedDayIndex) return
    selectedDayIndex = nextIndex
    updateFixedSelectionVisuals()
  })

  zr.on('mouseup', () => {
    isDraggingSelection = false
  })

  zr.on('globalout', () => {
    isDraggingSelection = false
  })
}

onMounted(() => {
  nextTick(() => {
    ensureChartInitialized()

    if (!chartEl.value) return

    resizeObserver = new ResizeObserver(() => {
      chart?.resize()
      updateFixedSelectionVisuals()
    })

    resizeObserver.observe(chartEl.value)
    window.addEventListener('resize', onWindowResize)
  })
})

onBeforeUnmount(() => {
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId)
    rafId = null
  }

  resizeObserver?.disconnect()
  resizeObserver = null

  window.removeEventListener('resize', onWindowResize)

  chart?.dispose()
  chart = null
})
</script>
