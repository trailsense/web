import type { TimeseriesBucket } from '~/lib/api/types.gen'
import type { DashboardGranularity, TimelineMarker } from './types'

const nowRoundedToHour = () => {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  return now
}

const clampWeeklyFromWithinYear = (from: Date, to: Date) => {
  const maxRangeMs = 365 * 24 * 60 * 60 * 1000
  const diff = to.getTime() - from.getTime()
  if (diff <= maxRangeMs) return from

  // Keep week alignment while ensuring range stays within 1 year.
  return addDays(from, 7)
}

const startOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const startOfWeek = (date: Date) => {
  const next = startOfDay(date)
  const day = next.getDay()
  const distanceFromMonday = (day + 6) % 7
  next.setDate(next.getDate() - distanceFromMonday)
  return next
}

const addDays = (date: Date, amount: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

const parseDate = (input: string): Date | null => {
  const parsed = new Date(input)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

const granularityLabel = (bucketStart: string, granularity: DashboardGranularity) => {
  const parsed = parseDate(bucketStart)
  if (!parsed) return ''

  if (granularity === 'week') {
    return `Week of ${new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(startOfWeek(parsed))}`
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(startOfDay(parsed))
}

export function useTrailDashboardTimelineState() {
  const granularity = useState<DashboardGranularity>('dashboard:timeline:granularity', () => 'day')
  const markers = useState<TimelineMarker[]>('dashboard:timeline:markers', () => [])
  const activeMarkerId = useState<string | null>('dashboard:timeline:activeMarkerId', () => null)

  const timelineBucket = computed<TimeseriesBucket>(() => granularity.value)
  const drilldownBucket = computed<TimeseriesBucket>(() => (granularity.value === 'week' ? 'day' : 'hour'))

  const timelineRange = computed(() => {
    const to = nowRoundedToHour()
    const fromBase = addDays(to, -364)
    const from = granularity.value === 'week'
      ? clampWeeklyFromWithinYear(startOfWeek(fromBase), to)
      : startOfDay(fromBase)

    return {
      from: from.toISOString(),
      to: to.toISOString()
    }
  })

  const selectedMarker = computed(() =>
    markers.value.find(marker => marker.id === activeMarkerId.value) ?? null
  )

  const selectedBucketRange = computed(() => {
    if (!selectedMarker.value) return null

    const parsed = parseDate(selectedMarker.value.bucketStart)
    if (!parsed) return null

    const from = granularity.value === 'week' ? startOfWeek(parsed) : startOfDay(parsed)
    const to = addDays(from, granularity.value === 'week' ? 7 : 1)

    return {
      from: from.toISOString(),
      to: to.toISOString()
    }
  })

  const selectedBucketLabel = computed(() => {
    if (!selectedMarker.value) return ''
    return granularityLabel(selectedMarker.value.bucketStart, granularity.value)
  })

  const setGranularity = (next: DashboardGranularity) => {
    if (granularity.value === next) return
    granularity.value = next

    // Marker set is derived from timeline query data and should be re-synced.
    markers.value = []
    activeMarkerId.value = null
  }

  const setTimelineBuckets = (bucketStarts: string[]) => {
    const nextMarkers = Array.from(new Set(bucketStarts))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(bucketStart => ({
        id: bucketStart,
        bucketStart
      }))

    markers.value = nextMarkers

    if (nextMarkers.length === 0) {
      activeMarkerId.value = null
      return
    }

    if (activeMarkerId.value && nextMarkers.some(marker => marker.id === activeMarkerId.value)) {
      return
    }

    const latestMarker = nextMarkers[nextMarkers.length - 1]
    if (!latestMarker) return
    activeMarkerId.value = latestMarker.id
  }

  const setActiveMarker = (markerId: string) => {
    if (!markers.value.some(marker => marker.id === markerId)) return
    activeMarkerId.value = markerId
  }

  return {
    activeMarkerId,
    drilldownBucket,
    granularity,
    markers,
    selectedBucketLabel,
    selectedBucketRange,
    setActiveMarker,
    setGranularity,
    setTimelineBuckets,
    timelineBucket,
    timelineRangeFrom: computed(() => timelineRange.value.from),
    timelineRangeTo: computed(() => timelineRange.value.to),
    selectedBucketRangeFrom: computed(() => selectedBucketRange.value?.from ?? null),
    selectedBucketRangeTo: computed(() => selectedBucketRange.value?.to ?? null)
  }
}
