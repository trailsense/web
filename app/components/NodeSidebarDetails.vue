<template>
  <div class="p-4 space-y-4">
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
      <p class="text-sm text-gray-500">
        Node ID: {{ node.id }}
      </p>
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

    <div class="text-xs space-y-1 text-gray-500">
      <p><strong>Coordinates:</strong> {{ node.longitude }}, {{ node.latitude }}</p>
      <p><strong>Send frequency:</strong> Every {{ node.send_frequency_seconds }}s</p>
      <p><strong>Created:</strong> {{ formatDate(node.created_at) }}</p>
    </div>

    <div class="space-y-3 pt-8">
      <p class="text-sm font-medium">
        Activity Measurements
      </p>

      <UTabs
        v-model="selectedPeriod"
        :content="false"
        :items="periodItems"
        class="w-full"
        color="primary"
        size="xs"
        variant="pill"
      />

      <div
        v-if="!isCustomMode"
        class="flex items-center gap-2"
      >
        <UButton
          :disabled="isTimeseriesLoading"
          color="primary"
          icon="i-lucide-chevron-left"
          size="xs"
          variant="soft"
          @click="shiftPeriod(-1)"
        />
        <p class="flex-1 text-center text-xs font-medium text-gray-700 truncate">
          {{ periodLabel }}
        </p>
        <UButton
          :disabled="isTimeseriesLoading || !canShiftForward"
          color="primary"
          icon="i-lucide-chevron-right"
          size="xs"
          variant="soft"
          @click="shiftPeriod(1)"
        />
      </div>

      <div
        v-else
        class="space-y-2"
      >
        <UTabs
          v-model="selectedCustomBucket"
          :content="false"
          :items="customBucketItems"
          class="w-full"
          color="primary"
          size="xs"
          variant="pill"
        />

        <UInputDate
          ref="inputDate"
          v-model="selectedRange"
          :disabled="isTimeseriesLoading"
          :hide-time-zone="true"
          class="w-full"
          color="primary"
          granularity="day"
          range
          variant="outline"
        >
          <template #trailing>
            <UPopover :reference="inputDate?.inputsRef[0]?.$el">
              <UButton
                aria-label="Select a date range"
                class="px-0"
                color="neutral"
                icon="i-lucide-calendar"
                size="sm"
                variant="link"
              />

              <template #content>
                <UCalendar
                  v-model="selectedRange"
                  :number-of-months="2"
                  class="p-2"
                  color="primary"
                  range
                />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </div>
    </div>

    <NodeActivityChart
      :bucket="bucket"
      :error-text="timeseriesErrorText"
      :is-loading="isTimeseriesLoading"
      :points="points"
    />
  </div>
</template>

<script lang="ts" setup>
import { fromDate, getLocalTimeZone } from '@internationalized/date'
import type { DateRange } from 'reka-ui'
import type { DashboardPeriod, TrailDashboardState } from '~/composables/useTrailDashboard'
import { TRAIL_DASHBOARD_KEY } from '~/composables/useTrailDashboard'
import type { NodeDto, TimeseriesBucket } from '~/lib/api/types.gen'
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
  bucket,
  canShiftForward,
  customBucket,
  period,
  periodLabel,
  points,
  rangeFrom,
  rangeTo,
  setCustomBucket,
  setCustomRangeFrom,
  setCustomRangeTo,
  setPeriod,
  shiftPeriod,
  timeseriesQuery
} = dashboard

const periodItems = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Custom', value: 'custom' }
]
const customBucketItems = [
  { label: 'Hourly', value: 'hour' },
  { label: 'Daily', value: 'day' },
  { label: 'Weekly', value: 'week' }
]
const inputDate = useTemplateRef('inputDate')
const localTimeZone = getLocalTimeZone()

const parseIsoDate = (iso: string) => {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

const toDateValue = (date: Date) => fromDate(date, localTimeZone)
const isCustomMode = computed(() => period.value === 'custom')

const selectedPeriod = computed<string | number>({
  get: () => period.value,
  set: (value) => {
    if (value === 'daily' || value === 'weekly' || value === 'monthly' || value === 'custom') {
      setPeriod(value as DashboardPeriod)
    }
  }
})
const selectedCustomBucket = computed<string | number>({
  get: () => {
    if (customBucket.value) return customBucket.value

    const from = parseIsoDate(rangeFrom.value)
    const to = parseIsoDate(rangeTo.value)

    if (!from || !to) return 'day'

    const days = (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)
    if (days <= 1) return 'hour'
    if (days <= 30) return 'day'
    return 'week'
  },
  set: (value) => {
    if (value === 'hour' || value === 'day' || value === 'week') {
      setCustomBucket(value as TimeseriesBucket)
    }
  }
})

const selectedRange = computed<DateRange | undefined>({
  get: () => {
    const start = parseIsoDate(rangeFrom.value)
    const endRaw = parseIsoDate(rangeTo.value)
    if (!start || !endRaw) {
      return undefined
    }

    const end = new Date(endRaw.getTime() - 1)
    return {
      start: toDateValue(start),
      end: toDateValue(end)
    }
  },
  set: (value) => {
    if (!value?.start || !value.end) {
      return
    }

    const startDate = value.start.toDate(localTimeZone)
    const endDate = value.end.toDate(localTimeZone)

    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)
    endDate.setDate(endDate.getDate() + 1)

    setCustomRangeFrom(startDate.toISOString())
    setCustomRangeTo(endDate.toISOString())
  }
})

const statusClass = computed(() => getNodeStatusClass(props.node.status))
const statusLabel = computed(() => getNodeStatusLabel(props.node.status))
const isTimeseriesLoading = computed(() => timeseriesQuery.isLoading.value || timeseriesQuery.isPending.value)
const timeseriesErrorText = computed(() => (timeseriesQuery.error.value ? 'Failed to load measurements for this range.' : ''))

const formatDate = (iso: string) => new Date(iso).toLocaleString()
</script>
