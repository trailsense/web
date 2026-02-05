<template>
  <div class="p-4 space-y-4">
    <UButton
      icon="i-lucide-arrow-left"
      variant="ghost"
      size="xs"
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
        class="h-2.5 w-2.5 rounded-full"
        :class="statusClass"
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

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">
          Measurements
        </p>
        <UTabs
          v-model="selectedBucket"
          :items="bucketItems"
          :content="false"
          color="primary"
          variant="pill"
          size="xs"
          class="w-44"
        />
      </div>

      <UInputDate
        ref="inputDate"
        v-model="selectedRange"
        range
        color="primary"
        variant="outline"
        granularity="day"
        :hide-time-zone="true"
        :disabled="isTimeseriesLoading"
        class="w-full"
      >
        <template #trailing>
          <UPopover :reference="inputDate?.inputsRef[0]?.$el">
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-calendar"
              aria-label="Select a date range"
              class="px-0"
            />

            <template #content>
              <UCalendar
                v-model="selectedRange"
                class="p-2"
                :number-of-months="2"
                range
                color="primary"
              />
            </template>
          </UPopover>
        </template>
      </UInputDate>

      <p class="text-xs text-gray-500">
        Max range: {{ maxRangeDays }} days for {{ bucket === 'hour' ? 'hourly' : 'daily' }} buckets.
      </p>
    </div>

    <NodeActivityChart
      :points="points"
      :bucket="bucket"
      :is-loading="isTimeseriesLoading"
      :error-text="timeseriesErrorText"
    />
  </div>
</template>

<script setup lang="ts">
import { fromDate, getLocalTimeZone } from '@internationalized/date'
import type { DateRange } from 'reka-ui'
import { TRAIL_DASHBOARD_KEY } from '~/composables/useTrailDashboard'
import type { TrailDashboardState } from '~/composables/useTrailDashboard'
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

const { bucket, maxRangeDays, points, rangeFrom, rangeTo, setBucket, setRangeFrom, setRangeTo, timeseriesQuery } = dashboard

const bucketItems = [
  { label: 'Hourly', value: 'hour' },
  { label: 'Daily', value: 'day' }
]
const inputDate = useTemplateRef('inputDate')

const localTimeZone = getLocalTimeZone()

const parseIsoDate = (iso: string) => {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

const toDateValue = (date: Date) => fromDate(date, localTimeZone)

const selectedBucket = computed<string | number>({
  get: () => bucket.value,
  set: (value) => {
    if (value === 'hour' || value === 'day') {
      setBucket(value as TimeseriesBucket)
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

    setRangeFrom(startDate.toISOString())
    setRangeTo(endDate.toISOString())
  }
})

const statusClass = computed(() => getNodeStatusClass(props.node.status))
const statusLabel = computed(() => getNodeStatusLabel(props.node.status))
const isTimeseriesLoading = computed(() => timeseriesQuery.isLoading.value || timeseriesQuery.isPending.value)
const timeseriesErrorText = computed(() => (timeseriesQuery.error.value ? 'Failed to load measurements for this range.' : ''))

const formatDate = (iso: string) => new Date(iso).toLocaleString()
</script>
